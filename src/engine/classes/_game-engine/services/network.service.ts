import type * as THREE from 'three';

import { SERVER_URL } from '../../../config';
import { EventEmitter } from '../../event-emitter.class';

import {
  packMatchBank,
  packMatchRematch,
  packMatchSelectionPreviewCmd,
  packMatchSelectDice,
  packRelease,
  packRoomCreate,
  packRoomJoin,
  packRoomLeave,
  packRoomListRequest,
  packRoomQuickMatch,
  packRoomStart,
  unpackAckError,
  unpackAckOk,
  unpackMatchRollResult,
  unpackMatchRematchState,
  unpackMatchSelectionPreview,
  unpackMatchState,
  unpackMatchTurnResult,
  unpackRoomList,
  unpackRest,
  unpackRoomState,
  unpackSessionReady,
  unpackSnapshot,
} from '../../../../network/protocol/codecs';
import { OP } from '../../../../network/protocol/opcodes';
import {
  MATCH_PHASE,
  ROOM_MODE,
  ROOM_STATUS,
  normalizeAvatarIndex,
  normalizeDicePresetId,
} from '../../../../network/protocol/types';

import type {
  DieRestStateBin,
  DieStateBin,
  MatchRollResultPayload,
  MatchRematchStatePayload,
  MatchSelectionPreviewPayload,
  MatchStatePayload,
  MatchTurnResultPayload,
  RoomMode,
  RoomOptionsPayload,
  RoomListItemPayload,
  RestPayload,
  RoomStatePayload,
  SnapshotPayload,
} from '../../../../network/protocol/types';

// Reexport под старыми именами — потребители (DiceService, GameEngine, main)
// уже импортируют их с этих путей. Меняется внутренний транспорт, не контракт.
export type { RestPayload, RoomMember, SnapshotPayload } from '../../../../network/protocol/types';
export type {
  MatchPhase,
  MatchRollResultPayload,
  MatchRematchStatePayload,
  MatchSelectionPreviewPayload,
  MatchStatePayload,
  MatchTotal,
  MatchTurnResultPayload,
  RoomRole,
  RoomMode,
  RoomOptionsPayload,
  RoomStatus,
  RoomListItemPayload,
} from '../../../../network/protocol/types';
export {
  DEFAULT_ROOM_OPTIONS,
  MATCH_FINISH_REASON,
  MATCH_PHASE,
  ROOM_MIN_BANK_MAX,
  ROOM_MIN_BANK_MIN,
  ROOM_MIN_BANK_STEP,
  ROOM_MODE,
  ROOM_ROLE,
  ROOM_STATUS,
  ROOM_TARGET_SCORE_MAX,
  ROOM_TARGET_SCORE_MIN,
  ROOM_TARGET_SCORE_STEP,
} from '../../../../network/protocol/types';
export type DieStateFull = DieStateBin;
export type RestDieState = DieRestStateBin;
export type RoomState = RoomStatePayload;
export type RoomListItem = RoomListItemPayload;

const REQUEST_TIMEOUT_MS = 8000;
const SESSION_READY_TIMEOUT_MS = 8000;

const wsUrlFor = (
  displayName: string,
  avatarIndex: number,
  dicePresetId: string,
): string => {
  const base = SERVER_URL.replace(/^http/, 'ws');
  const qs = new URLSearchParams({
    n: displayName,
    a: String(normalizeAvatarIndex(avatarIndex)),
    d: normalizeDicePresetId(dicePresetId),
  });
  return `${base}/ws?${qs.toString()}`;
};

interface PendingRequest {
  /** Тело ack (для ROOM_CREATE/JOIN — packed RoomState; для select/bank — undefined). */
  resolve: (body: Uint8Array | undefined) => void;
  reject: (err: Error) => void;
  timeoutId: number | null;
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
  private currentRoomState: RoomStatePayload | null = null;
  private currentDiceSnapshot: SnapshotPayload | null = null;
  private currentDiceSnapshotEvent: 'dice-spawn' | 'dice-snapshot' | null = null;
  private currentDiceRest: RestPayload | null = null;
  private currentMatchState: MatchStatePayload | null = null;
  private currentSelectionPreview: MatchSelectionPreviewPayload | null = null;
  private currentRematchState: MatchRematchStatePayload | null = null;
  private userId: string | null = null;
  private displayName = 'Player';
  private avatarIndex = 0;
  private dicePresetId = normalizeDicePresetId(undefined);

  private requestSeq = 1;
  private pending = new Map<number, PendingRequest>();
  private connectPromise: Promise<void> | null = null;
  private connectResolve: (() => void) | null = null;
  private connectReject: ((error: Error) => void) | null = null;
  private connectTimeoutId: number | null = null;

  connect = (
    displayName: string,
    avatarIndex = 0,
    dicePresetId = normalizeDicePresetId(undefined),
  ): Promise<void> => {
    if (this.ws?.readyState === WebSocket.OPEN && this.userId) return Promise.resolve();
    if (this.connectPromise) return this.connectPromise;
    this.displayName = displayName.trim() || 'Player';
    this.avatarIndex = normalizeAvatarIndex(avatarIndex);
    this.dicePresetId = normalizeDicePresetId(dicePresetId);
    const promise = new Promise<void>((resolve, reject) => {
      this.connectResolve = resolve;
      this.connectReject = reject;
    });
    this.connectPromise = promise;
    void promise
      .finally(() => {
        if (this.connectPromise === promise) this.connectPromise = null;
      })
      .catch(() => undefined);
    try {
      this.openSocket();
    } catch (error) {
      this.resetSession(error instanceof Error ? error : new Error(String(error)));
    }
    return promise;
  };

  disconnect = (): void => {
    const ws = this.ws;
    this.ws = null;
    ws?.close();
    this.resetSession(new Error('disconnected'));
    this.displayName = 'Player';
    this.avatarIndex = 0;
    this.dicePresetId = normalizeDicePresetId(undefined);
  };

  getUserId = (): string | null => this.userId;
  getRoomId = (): string | null => this.currentRoomId;
  getRoomState = (): RoomStatePayload | null => this.currentRoomState;

  replayLatestMatchData = (): void => {
    if (this.currentDiceRest) {
      this.events.emit('dice-rest', this.currentDiceRest);
    } else if (this.currentDiceSnapshot && this.currentDiceSnapshotEvent) {
      this.events.emit(this.currentDiceSnapshotEvent, this.currentDiceSnapshot);
    }
    if (this.currentMatchState) this.events.emit('match-state', this.currentMatchState);
    if (this.currentSelectionPreview) {
      this.events.emit('match-selection-preview', this.currentSelectionPreview);
    }
    if (this.currentRematchState) {
      this.events.emit('match-rematch-state', this.currentRematchState);
    }
  };

  createRoom = (
    mode: RoomMode = ROOM_MODE.MATCH,
    options?: Partial<RoomOptionsPayload>,
    gameName?: string,
    password?: string,
  ): Promise<RoomState> => {
    return this.sendCommand((requestId) =>
      packRoomCreate({ requestId, mode, options, gameName, password }),
    ).then((body) => {
      if (!body) throw new Error('empty ROOM_CREATE response');
      const state = unpackRoomState(body);
      this.syncRoomStateCache(state);
      this.currentRoomId = state.id;
      return state;
    });
  };

  quickMatch = (): Promise<RoomState> => {
    return this.sendCommand((requestId) => packRoomQuickMatch({ requestId })).then((body) => {
      if (!body) throw new Error('empty ROOM_QUICK_MATCH response');
      const state = unpackRoomState(body);
      this.syncRoomStateCache(state);
      this.currentRoomId = state.id;
      return state;
    });
  };

  listRooms = (): Promise<RoomListItem[]> => {
    return this.sendCommand((requestId) => packRoomListRequest({ requestId })).then((body) => {
      if (!body) throw new Error('empty ROOM_LIST response');
      return unpackRoomList(body).rooms;
    });
  };

  joinRoom = (code: string, password?: string): Promise<RoomState> => {
    return this.sendCommand((requestId) => packRoomJoin({ requestId, code, password })).then((body) => {
      if (!body) throw new Error('empty ROOM_JOIN response');
      const state = unpackRoomState(body);
      this.syncRoomStateCache(state);
      this.currentRoomId = state.id;
      return state;
    });
  };

  leaveRoom = (): Promise<void> => {
    const roomId = this.currentRoomId;
    if (!roomId) return Promise.resolve();
    return this.sendCommand((requestId) => packRoomLeave({ requestId, roomId })).then(() => {
      this.currentRoomId = null;
      this.currentRoomState = null;
      this.clearCurrentMatchData();
    });
  };

  startRoom = (): Promise<RoomState> => {
    const roomId = this.currentRoomId;
    if (!roomId) return Promise.reject(new Error('not in a room'));
    return this.sendCommand((requestId) => packRoomStart({ requestId, roomId })).then((body) => {
      if (!body) throw new Error('empty ROOM_START response');
      const state = unpackRoomState(body);
      this.syncRoomStateCache(state);
      this.currentRoomId = state.id;
      return state;
    });
  };

  sendRelease = (velocity: THREE.Vector3, position: THREE.Vector3): boolean => {
    const sock = this.ws;
    const roomId = this.currentRoomId;
    if (!sock || sock.readyState !== WebSocket.OPEN || !roomId || !this.userId) return false;
    try {
      sock.send(
        packRelease({
          roomId,
          velocity: [velocity.x, velocity.y, velocity.z],
          position: [position.x, position.y, position.z],
        }) as Uint8Array<ArrayBuffer>,
      );
      return true;
    } catch {
      return false;
    }
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

  sendRematch = (): Promise<void> => {
    const roomId = this.currentRoomId;
    if (!roomId) return Promise.reject(new Error('not in a room'));
    return this.sendCommand((requestId) =>
      packMatchRematch({ requestId, roomId }),
    ).then(() => undefined);
  };

  /**
   * Realtime preview локального выбора. Это fire-and-forget UI signal:
   * сервер всё равно валидирует финальный выбор в sendSelectDice/sendBank.
   */
  sendSelectionPreview = (indices: number[]): void => {
    const sock = this.ws;
    const roomId = this.currentRoomId;
    if (!sock || sock.readyState !== WebSocket.OPEN || !roomId) return;
    sock.send(
      packMatchSelectionPreviewCmd({ roomId, indices }) as Uint8Array<ArrayBuffer>,
    );
  };

  // ──────────────────────────────────────────────────────────────
  // Внутренние
  // ──────────────────────────────────────────────────────────────

  private sendCommand = (
    build: (requestId: number) => Uint8Array,
    timeoutMs: number | null = REQUEST_TIMEOUT_MS,
  ): Promise<Uint8Array | undefined> => {
    const sock = this.ws;
    if (!sock || sock.readyState !== WebSocket.OPEN || !this.userId) {
      return Promise.reject(new Error('not connected'));
    }
    const requestId = this.requestSeq++;
    let payload: Uint8Array;
    try {
      payload = build(requestId);
    } catch (error) {
      return Promise.reject(error);
    }
    return new Promise<Uint8Array | undefined>((resolve, reject) => {
      const timeoutId =
        timeoutMs === null
          ? null
          : window.setTimeout(() => {
              const pending = this.pending.get(requestId);
              if (!pending) return;
              this.pending.delete(requestId);
              pending.reject(new Error('request timed out'));
            }, timeoutMs);
      this.pending.set(requestId, { resolve, reject, timeoutId });
      try {
        sock.send(payload as Uint8Array<ArrayBuffer>);
      } catch (error) {
        this.pending.delete(requestId);
        if (timeoutId !== null) clearTimeout(timeoutId);
        reject(error);
      }
    });
  };

  private openSocket = (): void => {
    const ws = new WebSocket(
      wsUrlFor(this.displayName, this.avatarIndex, this.dicePresetId),
    );
    ws.binaryType = 'arraybuffer';
    this.connectTimeoutId = window.setTimeout(() => {
      if (this.ws !== ws || this.userId) return;
      this.ws = null;
      ws.close();
      this.resetSession(new Error('session handshake timed out'));
    }, SESSION_READY_TIMEOUT_MS);

    ws.onerror = () => {
      if (this.ws !== ws || this.userId) return;
      this.ws = null;
      ws.close();
      this.resetSession(new Error('connection failed'));
    };

    ws.onclose = () => {
      if (this.ws !== ws) return;
      const hadSession = this.userId !== null;
      this.ws = null;
      this.resetSession(new Error(hadSession ? 'connection lost' : 'connection failed'));
      if (hadSession) this.events.emit('connection-lost');
    };

    ws.onmessage = (ev) => {
      if (this.ws !== ws || !(ev.data instanceof ArrayBuffer)) return;
      try {
        this.dispatch(new Uint8Array(ev.data));
      } catch {
        const hadSession = this.userId !== null;
        this.ws = null;
        ws.close(1002, 'invalid protocol message');
        this.resetSession(new Error('invalid server message'));
        if (hadSession) this.events.emit('connection-lost');
      }
    };

    this.ws = ws;
  };

  private dispatch = (buf: Uint8Array): void => {
    if (buf.length < 1) return;
    const op = buf[0];
    switch (op) {
      case OP.SESSION_READY: {
        const session = unpackSessionReady(buf);
        if (!session.userId) throw new Error('empty session userId');
        if (this.userId && this.userId !== session.userId) {
          throw new Error('session identity changed');
        }
        this.userId = session.userId;
        if (this.connectTimeoutId !== null) {
          clearTimeout(this.connectTimeoutId);
          this.connectTimeoutId = null;
        }
        const resolve = this.connectResolve;
        this.connectResolve = null;
        this.connectReject = null;
        resolve?.();
        this.events.emit('session-ready', session);
        return;
      }
      case OP.ROOM_STATE: {
        const state = unpackRoomState(buf);
        this.syncRoomStateCache(state);
        this.events.emit('room-state', state);
        return;
      }
      case OP.MATCH_DICE_SPAWN: {
        const snap = unpackSnapshot(buf);
        this.currentDiceSnapshot = snap;
        this.currentDiceSnapshotEvent = 'dice-spawn';
        this.currentDiceRest = null;
        this.events.emit('dice-spawn', snap);
        return;
      }
      case OP.MATCH_DICE_SNAPSHOT: {
        const snap = unpackSnapshot(buf);
        this.currentDiceSnapshot = snap;
        this.currentDiceSnapshotEvent = 'dice-snapshot';
        this.currentDiceRest = null;
        this.events.emit('dice-snapshot', snap);
        return;
      }
      case OP.MATCH_DICE_REST: {
        const rest: RestPayload = unpackRest(buf);
        this.currentDiceRest = rest;
        this.currentDiceSnapshot = null;
        this.currentDiceSnapshotEvent = null;
        this.events.emit('dice-rest', rest);
        return;
      }
      case OP.MATCH_STATE: {
        const state: MatchStatePayload = unpackMatchState(buf);
        this.currentMatchState = state;
        if (state.phase !== MATCH_PHASE.SELECTING) this.currentSelectionPreview = null;
        if (state.phase !== MATCH_PHASE.FINISHED) this.currentRematchState = null;
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
      case OP.MATCH_SELECTION_PREVIEW: {
        const payload: MatchSelectionPreviewPayload = unpackMatchSelectionPreview(buf);
        this.currentSelectionPreview = payload;
        this.events.emit('match-selection-preview', payload);
        return;
      }
      case OP.MATCH_REMATCH_STATE: {
        const payload: MatchRematchStatePayload = unpackMatchRematchState(buf);
        this.currentRematchState = payload;
        this.events.emit('match-rematch-state', payload);
        return;
      }
      case OP.ACK_OK: {
        const ack = unpackAckOk(buf);
        const pending = this.pending.get(ack.requestId);
        this.pending.delete(ack.requestId);
        if (!pending) return;
        if (pending.timeoutId !== null) clearTimeout(pending.timeoutId);
        // Тело ack — opaque, парсит вызывающий (createRoom/joinRoom разворачивают
        // RoomState; select/bank ничего не ждут в body).
        pending.resolve(ack.body && ack.body.length > 0 ? ack.body : undefined);
        return;
      }
      case OP.ACK_ERROR: {
        const err = unpackAckError(buf);
        const pending = this.pending.get(err.requestId);
        this.pending.delete(err.requestId);
        if (pending) {
          if (pending.timeoutId !== null) clearTimeout(pending.timeoutId);
          pending.reject(new Error(`${err.code}: ${err.message}`));
        }
        return;
      }
      default:
        // Неизвестный opcode — молча игнорируем, не валим клиент.
        return;
    }
  };

  private syncRoomStateCache(state: RoomStatePayload): void {
    if (this.currentRoomId !== state.id) this.clearCurrentMatchData();
    this.currentRoomId = state.id;
    this.currentRoomState = state;
    if (state.status === ROOM_STATUS.WAITING) this.clearCurrentMatchData();
  }

  private clearCurrentMatchData(): void {
    this.currentDiceSnapshot = null;
    this.currentDiceSnapshotEvent = null;
    this.currentDiceRest = null;
    this.currentMatchState = null;
    this.currentSelectionPreview = null;
    this.currentRematchState = null;
  }

  private resetSession(error: Error): void {
    if (this.connectTimeoutId !== null) {
      clearTimeout(this.connectTimeoutId);
      this.connectTimeoutId = null;
    }
    const rejectConnect = this.connectReject;
    this.connectPromise = null;
    this.connectResolve = null;
    this.connectReject = null;
    rejectConnect?.(error);

    for (const request of this.pending.values()) {
      if (request.timeoutId !== null) clearTimeout(request.timeoutId);
      request.reject(error);
    }
    this.pending.clear();
    this.requestSeq = 1;
    this.currentRoomId = null;
    this.currentRoomState = null;
    this.clearCurrentMatchData();
    this.userId = null;
  }
}
