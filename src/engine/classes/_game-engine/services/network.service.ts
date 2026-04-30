import * as THREE from 'three';

import { SERVER_URL } from '../../../config';
import { EventEmitter } from '../../event-emitter.class';

import {
  packMatchBank,
  packMatchSelectDice,
  packRelease,
  packRoomCreate,
  packRoomJoin,
  packRoomStart,
  unpackAckError,
  unpackAckOk,
  unpackMatchRollResult,
  unpackMatchState,
  unpackMatchTurnResult,
  unpackRest,
  unpackRoomState,
  unpackSnapshot,
} from '../../../../network/protocol/codecs';
import { OP } from '../../../../network/protocol/opcodes';
import { ROOM_MODE } from '../../../../network/protocol/types';

import type {
  DieRestStateBin,
  DieStateBin,
  MatchRollResultPayload,
  MatchStatePayload,
  MatchTurnResultPayload,
  RoomMode,
  RestPayload,
  RoomStatePayload,
} from '../../../../network/protocol/types';

// Reexport под старыми именами — потребители (DiceService, GameEngine, main)
// уже импортируют их с этих путей. Меняется внутренний транспорт, не контракт.
export type { RestPayload, RoomMember, SnapshotPayload } from '../../../../network/protocol/types';
export type {
  MatchPhase,
  MatchRollResultPayload,
  MatchStatePayload,
  MatchTotal,
  MatchTurnResultPayload,
  RoomRole,
  RoomMode,
  RoomStatus,
} from '../../../../network/protocol/types';
export { MATCH_PHASE, ROOM_MODE, ROOM_ROLE, ROOM_STATUS } from '../../../../network/protocol/types';
export type DieStateFull = DieStateBin;
export type RestDieState = DieRestStateBin;
export type RoomState = RoomStatePayload;

const RECONNECT_INITIAL_MS = 1000;
const RECONNECT_MAX_MS = 30000;

const wsUrlFor = (userId: string, displayName: string, accessToken?: string): string => {
  const base = SERVER_URL.replace(/^http/, 'ws');
  const qs = accessToken
    ? new URLSearchParams({ t: accessToken })
    : new URLSearchParams({ u: userId, n: displayName });
  return `${base}/ws?${qs.toString()}`;
};

interface PendingRequest {
  /** Тело ack (для ROOM_CREATE/JOIN — packed RoomState; для select/bank — undefined). */
  resolve: (body: Uint8Array | undefined) => void;
  reject: (err: Error) => void;
}

/**
 * Клиент state-sync на нативном WebSocket + бинарном протоколе.
 * Сервер — единственный source-of-truth для физики; клиент рендерит снапшоты
 * с extrapolation между ними. См. dice-server/.claude/specs/network-physics.md
 * для wire-формата.
 */
export class NetworkService {
  readonly events = new EventEmitter();
  private ws: WebSocket | null = null;
  private currentRoomId: string | null = null;
  private currentRoomCode: string | null = null;
  private currentRoomState: RoomStatePayload | null = null;
  private userId: string | null = null;
  private displayName = 'Player';
  private accessToken: string | undefined;

  private requestSeq = 1;
  private pending = new Map<number, PendingRequest>();

  private reconnectTimer: number | null = null;
  private reconnectDelay = RECONNECT_INITIAL_MS;
  private autoReconnect = true;

  connect = (userId: string, displayName: string, accessToken?: string): Promise<void> => {
    if (this.ws) return Promise.resolve();
    this.userId = userId;
    this.displayName = displayName.trim() || 'Player';
    this.accessToken = accessToken;
    this.autoReconnect = true;
    return new Promise<void>((resolve, reject) => {
      this.openSocket(resolve, reject);
    });
  };

  disconnect = (): void => {
    this.autoReconnect = false;
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
    this.currentRoomId = null;
    this.currentRoomCode = null;
    this.currentRoomState = null;
    this.userId = null;
    this.displayName = 'Player';
    this.accessToken = undefined;
    // Реджектим висящие — иначе UI промисы зависнут навсегда.
    for (const p of this.pending.values()) p.reject(new Error('disconnected'));
    this.pending.clear();
  };

  getUserId = (): string | null => this.userId;
  getRoomId = (): string | null => this.currentRoomId;
  getRoomState = (): RoomStatePayload | null => this.currentRoomState;

  createRoom = (mode: RoomMode = ROOM_MODE.MATCH): Promise<RoomState> => {
    return this.sendCommand((requestId) => packRoomCreate({ requestId, mode })).then((body) => {
      if (!body) throw new Error('empty ROOM_CREATE response');
      const state = unpackRoomState(body);
      this.currentRoomId = state.id;
      this.currentRoomCode = state.code;
      this.currentRoomState = state;
      return state;
    });
  };

  joinRoom = (code: string): Promise<RoomState> => {
    return this.sendCommand((requestId) => packRoomJoin({ requestId, code })).then((body) => {
      if (!body) throw new Error('empty ROOM_JOIN response');
      const state = unpackRoomState(body);
      this.currentRoomId = state.id;
      this.currentRoomCode = state.code;
      this.currentRoomState = state;
      return state;
    });
  };

  startRoom = (): Promise<RoomState> => {
    const roomId = this.currentRoomId;
    if (!roomId) return Promise.reject(new Error('not in a room'));
    return this.sendCommand((requestId) => packRoomStart({ requestId, roomId })).then((body) => {
      if (!body) throw new Error('empty ROOM_START response');
      const state = unpackRoomState(body);
      this.currentRoomId = state.id;
      this.currentRoomCode = state.code;
      this.currentRoomState = state;
      return state;
    });
  };

  sendRelease = (velocity: THREE.Vector3, position: THREE.Vector3): void => {
    const sock = this.ws;
    const roomId = this.currentRoomId;
    if (!sock || sock.readyState !== WebSocket.OPEN || !roomId) return;
    sock.send(
      packRelease({
        roomId,
        velocity: [velocity.x, velocity.y, velocity.z],
        position: [position.x, position.y, position.z],
      }) as Uint8Array<ArrayBuffer>,
    );
  };

  /**
   * Turn-based: отложить выбранные scoring-кости и продолжить (перебросить остальные).
   * Резолвится при ACK_OK от сервера, реджектится при ACK_ERROR (например,
   * INVALID_SELECTION, NOT_YOUR_TURN, WRONG_PHASE).
   */
  sendSelectDice = (indices: number[]): Promise<void> => {
    const roomId = this.currentRoomId;
    if (!roomId) return Promise.reject(new Error('not in a room'));
    return this.sendCommand((requestId) =>
      packMatchSelectDice({ requestId, roomId, indices }),
    ).then(() => undefined);
  };

  /**
   * Turn-based: отложить выбранные scoring-кости и закрыть ход (turnPoints → total).
   */
  sendBank = (indices: number[]): Promise<void> => {
    const roomId = this.currentRoomId;
    if (!roomId) return Promise.reject(new Error('not in a room'));
    return this.sendCommand((requestId) =>
      packMatchBank({ requestId, roomId, indices }),
    ).then(() => undefined);
  };

  // ──────────────────────────────────────────────────────────────
  // Внутренние
  // ──────────────────────────────────────────────────────────────

  private sendCommand = (
    build: (requestId: number) => Uint8Array,
  ): Promise<Uint8Array | undefined> => {
    const sock = this.ws;
    if (!sock || sock.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('not connected'));
    }
    const requestId = this.requestSeq++;
    return new Promise<Uint8Array | undefined>((resolve, reject) => {
      this.pending.set(requestId, { resolve, reject });
      sock.send(build(requestId) as Uint8Array<ArrayBuffer>);
    });
  };

  private openSocket = (
    initialResolve?: () => void,
    initialReject?: (err: Error) => void,
  ): void => {
    if (!this.userId) {
      initialReject?.(new Error('userId required'));
      return;
    }
    const ws = new WebSocket(wsUrlFor(this.userId, this.displayName, this.accessToken));
    ws.binaryType = 'arraybuffer';
    let opened = false;

    ws.onopen = () => {
      opened = true;
      this.reconnectDelay = RECONNECT_INITIAL_MS;
      initialResolve?.();
      // Реконнект-rejoin: если до падения сидели в комнате — снова заходим
      // по сохранённому коду. Сервер заменит socketId старого участника.
      if (!initialResolve && this.currentRoomCode) {
        this.joinRoom(this.currentRoomCode).catch(() => {
          // Комнаты могло уже не быть — переходим в "лобби-state".
          this.currentRoomId = null;
          this.currentRoomCode = null;
        });
      }
    };

    ws.onerror = () => {
      if (!opened) initialReject?.(new Error('connection failed'));
    };

    ws.onclose = () => {
      this.ws = null;
      // Все висящие requests становятся undelivered — реджектим.
      for (const p of this.pending.values()) p.reject(new Error('socket closed'));
      this.pending.clear();
      if (this.autoReconnect) this.scheduleReconnect();
    };

    ws.onmessage = (ev) => {
      if (!(ev.data instanceof ArrayBuffer)) return;
      this.dispatch(new Uint8Array(ev.data));
    };

    this.ws = ws;
  };

  private scheduleReconnect = (): void => {
    if (this.reconnectTimer !== null) return;
    const delay = this.reconnectDelay;
    this.reconnectDelay = Math.min(RECONNECT_MAX_MS, this.reconnectDelay * 2);
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.autoReconnect) return;
      this.openSocket();
    }, delay);
  };

  private dispatch = (buf: Uint8Array): void => {
    if (buf.length < 1) return;
    const op = buf[0];
    switch (op) {
      case OP.ROOM_STATE: {
        const state = unpackRoomState(buf);
        this.currentRoomId = state.id;
        this.currentRoomCode = state.code;
        this.currentRoomState = state;
        this.events.emit('room-state', state);
        return;
      }
      case OP.MATCH_DICE_SPAWN: {
        const snap = unpackSnapshot(buf);
        this.events.emit('dice-spawn', snap);
        return;
      }
      case OP.MATCH_DICE_SNAPSHOT: {
        const snap = unpackSnapshot(buf);
        this.events.emit('dice-snapshot', snap);
        return;
      }
      case OP.MATCH_DICE_REST: {
        const rest: RestPayload = unpackRest(buf);
        this.events.emit('dice-rest', rest);
        return;
      }
      case OP.MATCH_STATE: {
        const state: MatchStatePayload = unpackMatchState(buf);
        this.events.emit('match-state', state);
        return;
      }
      case OP.MATCH_ROLL_RESULT: {
        const payload: MatchRollResultPayload = unpackMatchRollResult(buf);
        this.events.emit('match-roll-result', payload);
        return;
      }
      case OP.MATCH_TURN_RESULT: {
        const payload: MatchTurnResultPayload = unpackMatchTurnResult(buf);
        this.events.emit('match-turn-result', payload);
        return;
      }
      case OP.ACK_OK: {
        const ack = unpackAckOk(buf);
        const pending = this.pending.get(ack.requestId);
        this.pending.delete(ack.requestId);
        if (!pending) return;
        // Тело ack — opaque, парсит вызывающий (createRoom/joinRoom разворачивают
        // RoomState; select/bank ничего не ждут в body).
        pending.resolve(ack.body && ack.body.length > 0 ? ack.body : undefined);
        return;
      }
      case OP.ACK_ERROR: {
        const err = unpackAckError(buf);
        const pending = this.pending.get(err.requestId);
        this.pending.delete(err.requestId);
        pending?.reject(new Error(`${err.code}: ${err.message}`));
        return;
      }
      default:
        // Неизвестный opcode — молча игнорируем, не валим клиент.
        return;
    }
  };
}
