// ⚠️ DUPLICATE — keep in sync with dice-server/src/net/protocol/codecs.ts
//
// Ручная бинарная упаковка через DataView. Без внешних зависимостей.
// Все многобайтовые числа — big-endian (DataView default).
// Строки кодируются как str16: u16 длины (BE) + UTF-8 bytes.
//
// Layout каждого пакета — см. dice-server/.claude/specs/network-physics.md.

import { OP } from './opcodes';
import {
  DEFAULT_ROOM_OPTIONS,
  ROOM_SCORING_RULESET,
  normalizeAvatarIndex,
  normalizeDicePresetId,
  normalizeRoomOptions,
} from './types';

import type {
  AckErrorPayload,
  AckOkPayload,
  DieRestStateBin,
  DieStateBin,
  MatchBankCmd,
  MatchPhase,
  MatchRematchCmd,
  MatchRematchStatePayload,
  MatchRollResultPayload,
  MatchSelectDiceCmd,
  MatchSelectionPreviewCmd,
  MatchSelectionPreviewPayload,
  MatchStatePayload,
  MatchTotal,
  MatchTurnResultPayload,
  ReleasePayload,
  RestPayload,
  RoomCreateCmd,
  RoomJoinCmd,
  RoomLeaveCmd,
  RoomListCmd,
  RoomListItemPayload,
  RoomListPayload,
  RoomMember,
  RoomOptionsPayload,
  RoomQuickMatchCmd,
  RoomStartCmd,
  RoomStatePayload,
  SessionReadyPayload,
  SnapshotPayload,
} from './types';

const enc = new TextEncoder();
const dec = new TextDecoder();

const SNAPSHOT_PER_DIE = 13 * 4; // 13 floats × 4 bytes
const REST_PER_DIE = 7 * 4 + 1; // 7 floats × 4 + u8 face
const ROOM_OPTIONS_BYTES = 5;
const ROOM_RULESET_BASE_D6 = 0;

const viewOf = (buf: Uint8Array): DataView =>
  new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

const ensureAvailable = (buf: Uint8Array, off: number, bytes: number, label: string): void => {
  if (off < 0 || bytes < 0 || off + bytes > buf.length) {
    throw new RangeError(`${label} outside packet bounds`);
  }
};

const writeStr16 = (view: DataView, buf: Uint8Array, off: number, bytes: Uint8Array): number => {
  if (bytes.length > 0xffff) throw new RangeError(`str16 too long: ${bytes.length} > 65535`);
  ensureAvailable(buf, off, 2 + bytes.length, 'str16 write');
  view.setUint16(off, bytes.length);
  buf.set(bytes, off + 2);
  return off + 2 + bytes.length;
};

const readStr16 = (
  view: DataView,
  buf: Uint8Array,
  off: number,
): { value: string; next: number } => {
  ensureAvailable(buf, off, 2, 'str16 length');
  const len = view.getUint16(off);
  ensureAvailable(buf, off + 2, len, 'str16 body');
  const value = dec.decode(buf.subarray(off + 2, off + 2 + len));
  return { value, next: off + 2 + len };
};

const writeRoomOptions = (
  view: DataView,
  off: number,
  options: Partial<RoomOptionsPayload> | undefined,
): number => {
  const normalized = normalizeRoomOptions(options);
  view.setUint16(off, normalized.targetScore);
  view.setUint16(off + 2, normalized.minBank);
  view.setUint8(off + 4, ROOM_RULESET_BASE_D6);
  return off + ROOM_OPTIONS_BYTES;
};

const readRoomOptions = (view: DataView, off: number): RoomOptionsPayload => {
  const ruleset = view.getUint8(off + 4);
  return normalizeRoomOptions({
    targetScore: view.getUint16(off) as RoomOptionsPayload['targetScore'],
    minBank: view.getUint16(off + 2) as RoomOptionsPayload['minBank'],
    scoringRuleset:
      ruleset === ROOM_RULESET_BASE_D6
        ? ROOM_SCORING_RULESET.BASE_D6
        : DEFAULT_ROOM_OPTIONS.scoringRuleset,
  });
};

const ensureU16Count = (count: number, label: string): void => {
  if (!Number.isInteger(count) || count < 0 || count > 0xffff) {
    throw new RangeError(`${label} count outside u16 range: ${count}`);
  }
};

const ensureConsumed = (buf: Uint8Array, off: number, label: string): void => {
  if (off !== buf.length) throw new RangeError(`${label} has trailing or missing bytes`);
};

const ensureOpcode = (buf: Uint8Array, opcode: number, label: string): void => {
  ensureAvailable(buf, 0, 1, `${label} opcode`);
  if (buf[0] !== opcode) throw new Error(`invalid ${label} opcode`);
};

const ensureU8Value = (value: number, label: string): void => {
  if (!Number.isInteger(value) || value < 0 || value > 0xff) {
    throw new RangeError(`${label} outside u8 range: ${value}`);
  }
};

// ----------------------------------------------------------------
// SESSION_READY (S -> C)
// ----------------------------------------------------------------

export const packSessionReady = (payload: SessionReadyPayload): Uint8Array => {
  const userBytes = enc.encode(payload.userId);
  const buf = new Uint8Array(1 + 2 + userBytes.length);
  const view = viewOf(buf);
  view.setUint8(0, OP.SESSION_READY);
  writeStr16(view, buf, 1, userBytes);
  return buf;
};

export const unpackSessionReady = (buf: Uint8Array): SessionReadyPayload => {
  ensureOpcode(buf, OP.SESSION_READY, 'SESSION_READY');
  const view = viewOf(buf);
  const user = readStr16(view, buf, 1);
  ensureConsumed(buf, user.next, 'SESSION_READY');
  return { userId: user.value };
};

// ──────────────────────────────────────────────────────────────
// Snapshot / Spawn (одинаковый layout, отличается только opcode)
// ──────────────────────────────────────────────────────────────

const writeDieFull = (view: DataView, off: number, d: DieStateBin): void => {
  view.setFloat32(off, d.p[0]);
  view.setFloat32(off + 4, d.p[1]);
  view.setFloat32(off + 8, d.p[2]);
  view.setFloat32(off + 12, d.q[0]);
  view.setFloat32(off + 16, d.q[1]);
  view.setFloat32(off + 20, d.q[2]);
  view.setFloat32(off + 24, d.q[3]);
  view.setFloat32(off + 28, d.v[0]);
  view.setFloat32(off + 32, d.v[1]);
  view.setFloat32(off + 36, d.v[2]);
  view.setFloat32(off + 40, d.w[0]);
  view.setFloat32(off + 44, d.w[1]);
  view.setFloat32(off + 48, d.w[2]);
};

const readDieFull = (view: DataView, off: number): DieStateBin => ({
  p: [view.getFloat32(off), view.getFloat32(off + 4), view.getFloat32(off + 8)],
  q: [
    view.getFloat32(off + 12),
    view.getFloat32(off + 16),
    view.getFloat32(off + 20),
    view.getFloat32(off + 24),
  ],
  v: [view.getFloat32(off + 28), view.getFloat32(off + 32), view.getFloat32(off + 36)],
  w: [view.getFloat32(off + 40), view.getFloat32(off + 44), view.getFloat32(off + 48)],
});

export const packSnapshot = (snap: SnapshotPayload, opcode: number): Uint8Array => {
  const n = snap.dice.length;
  if (opcode !== OP.MATCH_DICE_SNAPSHOT && opcode !== OP.MATCH_DICE_SPAWN) {
    throw new Error('invalid snapshot opcode');
  }
  const buf = new Uint8Array(5 + n * SNAPSHOT_PER_DIE);
  const view = viewOf(buf);
  view.setUint8(0, opcode);
  view.setUint32(1, snap.tick >>> 0);
  let off = 5;
  for (let i = 0; i < n; i++) {
    writeDieFull(view, off, snap.dice[i]!);
    off += SNAPSHOT_PER_DIE;
  }
  return buf;
};

export const unpackSnapshot = (buf: Uint8Array): SnapshotPayload => {
  ensureAvailable(buf, 0, 5, 'snapshot header');
  if (buf[0] !== OP.MATCH_DICE_SNAPSHOT && buf[0] !== OP.MATCH_DICE_SPAWN) {
    throw new Error('invalid snapshot opcode');
  }
  if ((buf.length - 5) % SNAPSHOT_PER_DIE !== 0) {
    throw new RangeError('snapshot has partial die state');
  }
  const view = viewOf(buf);
  const tick = view.getUint32(1);
  const n = (buf.length - 5) / SNAPSHOT_PER_DIE;
  const dice: DieStateBin[] = new Array(n);
  let off = 5;
  for (let i = 0; i < n; i++) {
    dice[i] = readDieFull(view, off);
    off += SNAPSHOT_PER_DIE;
  }
  return { tick, dice };
};

// ──────────────────────────────────────────────────────────────
// Rest snapshot (без v/w, с faceValue)
// ──────────────────────────────────────────────────────────────

export const packRest = (snap: RestPayload): Uint8Array => {
  const n = snap.dice.length;
  const buf = new Uint8Array(5 + n * REST_PER_DIE);
  const view = viewOf(buf);
  view.setUint8(0, OP.MATCH_DICE_REST);
  view.setUint32(1, snap.tick >>> 0);
  let off = 5;
  for (let i = 0; i < n; i++) {
    const d = snap.dice[i]!;
    view.setFloat32(off, d.p[0]);
    view.setFloat32(off + 4, d.p[1]);
    view.setFloat32(off + 8, d.p[2]);
    view.setFloat32(off + 12, d.q[0]);
    view.setFloat32(off + 16, d.q[1]);
    view.setFloat32(off + 20, d.q[2]);
    view.setFloat32(off + 24, d.q[3]);
    view.setUint8(off + 28, d.faceValue & 0xff);
    off += REST_PER_DIE;
  }
  return buf;
};

export const unpackRest = (buf: Uint8Array): RestPayload => {
  ensureOpcode(buf, OP.MATCH_DICE_REST, 'MATCH_DICE_REST');
  ensureAvailable(buf, 0, 5, 'rest header');
  if ((buf.length - 5) % REST_PER_DIE !== 0) {
    throw new RangeError('rest snapshot has partial die state');
  }
  const view = viewOf(buf);
  const tick = view.getUint32(1);
  const n = (buf.length - 5) / REST_PER_DIE;
  const dice: DieRestStateBin[] = new Array(n);
  let off = 5;
  for (let i = 0; i < n; i++) {
    dice[i] = {
      p: [view.getFloat32(off), view.getFloat32(off + 4), view.getFloat32(off + 8)],
      q: [
        view.getFloat32(off + 12),
        view.getFloat32(off + 16),
        view.getFloat32(off + 20),
        view.getFloat32(off + 24),
      ],
      faceValue: view.getUint8(off + 28),
    };
    off += REST_PER_DIE;
  }
  return { tick, dice };
};

// ──────────────────────────────────────────────────────────────
// MATCH_RELEASE (C→S)
// ──────────────────────────────────────────────────────────────

export const packRelease = (p: ReleasePayload): Uint8Array => {
  const roomBytes = enc.encode(p.roomId);
  const buf = new Uint8Array(1 + 2 + roomBytes.length + 12 + 12);
  const view = viewOf(buf);
  view.setUint8(0, OP.MATCH_RELEASE);
  const off = writeStr16(view, buf, 1, roomBytes);
  view.setFloat32(off, p.velocity[0]);
  view.setFloat32(off + 4, p.velocity[1]);
  view.setFloat32(off + 8, p.velocity[2]);
  view.setFloat32(off + 12, p.position[0]);
  view.setFloat32(off + 16, p.position[1]);
  view.setFloat32(off + 20, p.position[2]);
  return buf;
};

export const unpackRelease = (buf: Uint8Array): ReleasePayload => {
  ensureOpcode(buf, OP.MATCH_RELEASE, 'MATCH_RELEASE');
  const view = viewOf(buf);
  const r = readStr16(view, buf, 1);
  const off = r.next;
  ensureAvailable(buf, off, 24, 'release vectors');
  const payload: ReleasePayload = {
    roomId: r.value,
    velocity: [view.getFloat32(off), view.getFloat32(off + 4), view.getFloat32(off + 8)],
    position: [view.getFloat32(off + 12), view.getFloat32(off + 16), view.getFloat32(off + 20)],
  };
  ensureConsumed(buf, off + 24, 'MATCH_RELEASE');
  return payload;
};

// ──────────────────────────────────────────────────────────────
// ROOM_* commands (C→S, c requestId)
// ──────────────────────────────────────────────────────────────

export const packRoomCreate = (cmd: RoomCreateCmd): Uint8Array => {
  const nameBytes = enc.encode(cmd.gameName ?? '');
  const passwordBytes = enc.encode(cmd.password ?? '');
  const buf = new Uint8Array(
    6 + ROOM_OPTIONS_BYTES + 2 + nameBytes.length + 2 + passwordBytes.length,
  );
  const view = viewOf(buf);
  view.setUint8(0, OP.ROOM_CREATE);
  view.setUint32(1, cmd.requestId >>> 0);
  view.setUint8(5, (cmd.mode ?? 0) & 0xff);
  const off = writeRoomOptions(view, 6, cmd.options);
  const passwordOff = writeStr16(view, buf, off, nameBytes);
  writeStr16(view, buf, passwordOff, passwordBytes);
  return buf;
};

export const unpackRoomCreate = (buf: Uint8Array): RoomCreateCmd => {
  ensureOpcode(buf, OP.ROOM_CREATE, 'ROOM_CREATE');
  ensureAvailable(buf, 0, 6 + ROOM_OPTIONS_BYTES, 'ROOM_CREATE header');
  const view = viewOf(buf);
  const options = readRoomOptions(view, 6);
  const nameR = readStr16(view, buf, 6 + ROOM_OPTIONS_BYTES);
  const passwordR = readStr16(view, buf, nameR.next);
  ensureConsumed(buf, passwordR.next, 'ROOM_CREATE');
  return {
    requestId: view.getUint32(1),
    mode: view.getUint8(5) as RoomCreateCmd['mode'],
    options,
    gameName: nameR.value,
    password: passwordR.value,
  };
};

export const packRoomJoin = (cmd: RoomJoinCmd): Uint8Array => {
  const codeBytes = enc.encode(cmd.code);
  const passwordBytes = enc.encode(cmd.password ?? '');
  const buf = new Uint8Array(5 + 2 + codeBytes.length + 2 + passwordBytes.length);
  const view = viewOf(buf);
  view.setUint8(0, OP.ROOM_JOIN);
  view.setUint32(1, cmd.requestId >>> 0);
  const passwordOff = writeStr16(view, buf, 5, codeBytes);
  writeStr16(view, buf, passwordOff, passwordBytes);
  return buf;
};

export const unpackRoomJoin = (buf: Uint8Array): RoomJoinCmd => {
  ensureOpcode(buf, OP.ROOM_JOIN, 'ROOM_JOIN');
  ensureAvailable(buf, 0, 5, 'ROOM_JOIN header');
  const view = viewOf(buf);
  const requestId = view.getUint32(1);
  const r = readStr16(view, buf, 5);
  const passwordR = readStr16(view, buf, r.next);
  ensureConsumed(buf, passwordR.next, 'ROOM_JOIN');
  return { requestId, code: r.value, password: passwordR.value };
};

export const packRoomLeave = (cmd: RoomLeaveCmd): Uint8Array => {
  const idBytes = enc.encode(cmd.roomId);
  const buf = new Uint8Array(5 + 2 + idBytes.length);
  const view = viewOf(buf);
  view.setUint8(0, OP.ROOM_LEAVE);
  view.setUint32(1, cmd.requestId >>> 0);
  writeStr16(view, buf, 5, idBytes);
  return buf;
};

export const unpackRoomLeave = (buf: Uint8Array): RoomLeaveCmd => {
  ensureOpcode(buf, OP.ROOM_LEAVE, 'ROOM_LEAVE');
  ensureAvailable(buf, 0, 5, 'ROOM_LEAVE header');
  const view = viewOf(buf);
  const requestId = view.getUint32(1);
  const r = readStr16(view, buf, 5);
  ensureConsumed(buf, r.next, 'ROOM_LEAVE');
  return { requestId, roomId: r.value };
};

export const packRoomStart = (cmd: RoomStartCmd): Uint8Array => {
  const idBytes = enc.encode(cmd.roomId);
  const buf = new Uint8Array(5 + 2 + idBytes.length);
  const view = viewOf(buf);
  view.setUint8(0, OP.ROOM_START);
  view.setUint32(1, cmd.requestId >>> 0);
  writeStr16(view, buf, 5, idBytes);
  return buf;
};

export const unpackRoomStart = (buf: Uint8Array): RoomStartCmd => {
  ensureOpcode(buf, OP.ROOM_START, 'ROOM_START');
  ensureAvailable(buf, 0, 5, 'ROOM_START header');
  const view = viewOf(buf);
  const requestId = view.getUint32(1);
  const r = readStr16(view, buf, 5);
  ensureConsumed(buf, r.next, 'ROOM_START');
  return { requestId, roomId: r.value };
};

export const packRoomQuickMatch = (cmd: RoomQuickMatchCmd): Uint8Array => {
  const buf = new Uint8Array(5);
  const view = viewOf(buf);
  view.setUint8(0, OP.ROOM_QUICK_MATCH);
  view.setUint32(1, cmd.requestId >>> 0);
  return buf;
};

export const unpackRoomQuickMatch = (buf: Uint8Array): RoomQuickMatchCmd => {
  ensureOpcode(buf, OP.ROOM_QUICK_MATCH, 'ROOM_QUICK_MATCH');
  ensureConsumed(buf, 5, 'ROOM_QUICK_MATCH');
  const view = viewOf(buf);
  return { requestId: view.getUint32(1) };
};

export const packRoomListRequest = (cmd: RoomListCmd): Uint8Array => {
  const buf = new Uint8Array(5);
  const view = viewOf(buf);
  view.setUint8(0, OP.ROOM_LIST);
  view.setUint32(1, cmd.requestId >>> 0);
  return buf;
};

export const unpackRoomListRequest = (buf: Uint8Array): RoomListCmd => {
  ensureOpcode(buf, OP.ROOM_LIST, 'ROOM_LIST request');
  ensureConsumed(buf, 5, 'ROOM_LIST request');
  const view = viewOf(buf);
  return { requestId: view.getUint32(1) };
};

// ──────────────────────────────────────────────────────────────
// ROOM_LIST (S→C ack body)
// ──────────────────────────────────────────────────────────────

export const packRoomList = (payload: RoomListPayload): Uint8Array => {
  const rooms: Array<{
    item: RoomListItemPayload;
    id: Uint8Array;
    code: Uint8Array;
    gameName: Uint8Array;
    ownerId: Uint8Array;
    ownerDisplayName: Uint8Array;
  }> = payload.rooms.map((item) => ({
    item,
    id: enc.encode(item.id),
    code: enc.encode(item.code),
    gameName: enc.encode(item.gameName),
    ownerId: enc.encode(item.ownerId),
    ownerDisplayName: enc.encode(item.ownerDisplayName),
  }));
  ensureU16Count(rooms.length, 'room list');
  for (const room of rooms) {
    ensureU16Count(room.item.playerCount, 'room player');
    ensureU16Count(room.item.spectatorCount, 'room spectator');
  }

  let size = 1 + 2;
  for (const room of rooms) {
    size +=
      2 +
      room.id.length +
      2 +
      room.code.length +
      2 +
      room.gameName.length +
      1 +
      2 +
      room.ownerId.length +
      2 +
      room.ownerDisplayName.length +
      1 +
      1 +
      2 +
      2 +
      1 +
      1;
  }

  const buf = new Uint8Array(size);
  const view = viewOf(buf);
  let off = 0;
  view.setUint8(off, OP.ROOM_LIST);
  off += 1;
  view.setUint16(off, rooms.length);
  off += 2;
  for (const room of rooms) {
    off = writeStr16(view, buf, off, room.id);
    off = writeStr16(view, buf, off, room.code);
    off = writeStr16(view, buf, off, room.gameName);
    view.setUint8(off, room.item.hasPassword ? 1 : 0);
    off += 1;
    off = writeStr16(view, buf, off, room.ownerId);
    off = writeStr16(view, buf, off, room.ownerDisplayName);
    view.setUint8(off, room.item.status & 0xff);
    off += 1;
    view.setUint8(off, room.item.mode & 0xff);
    off += 1;
    view.setUint16(off, room.item.playerCount);
    off += 2;
    view.setUint16(off, room.item.spectatorCount);
    off += 2;
    view.setUint8(off, room.item.canJoinAsPlayer ? 1 : 0);
    off += 1;
    view.setUint8(off, room.item.canSpectate ? 1 : 0);
    off += 1;
  }
  return buf;
};

export const unpackRoomList = (buf: Uint8Array): RoomListPayload => {
  const view = viewOf(buf);
  ensureOpcode(buf, OP.ROOM_LIST, 'ROOM_LIST');
  let off = 1;
  ensureAvailable(buf, off, 2, 'room list count');
  const count = view.getUint16(off);
  off += 2;
  ensureAvailable(buf, off, count * 19, 'minimum room list rows');
  const rooms: RoomListItemPayload[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const id = readStr16(view, buf, off);
    off = id.next;
    const code = readStr16(view, buf, off);
    off = code.next;
    const gameName = readStr16(view, buf, off);
    off = gameName.next;
    ensureAvailable(buf, off, 1, 'room password flag');
    const hasPassword = view.getUint8(off) !== 0;
    off += 1;
    const ownerId = readStr16(view, buf, off);
    off = ownerId.next;
    const ownerDisplayName = readStr16(view, buf, off);
    off = ownerDisplayName.next;
    ensureAvailable(buf, off, 8, 'room list row');
    const status = view.getUint8(off) as RoomListItemPayload['status'];
    off += 1;
    const mode = view.getUint8(off) as RoomListItemPayload['mode'];
    off += 1;
    const playerCount = view.getUint16(off);
    off += 2;
    const spectatorCount = view.getUint16(off);
    off += 2;
    const canJoinAsPlayer = view.getUint8(off) !== 0;
    off += 1;
    const canSpectate = view.getUint8(off) !== 0;
    off += 1;
    rooms[i] = {
      id: id.value,
      code: code.value,
      gameName: gameName.value,
      hasPassword,
      ownerId: ownerId.value,
      ownerDisplayName: ownerDisplayName.value,
      status,
      mode,
      playerCount,
      spectatorCount,
      canJoinAsPlayer,
      canSpectate,
    };
  }
  ensureConsumed(buf, off, 'ROOM_LIST');
  return { rooms };
};

// ──────────────────────────────────────────────────────────────
// ROOM_STATE (S→C broadcast)
// ──────────────────────────────────────────────────────────────

export const packRoomState = (state: RoomStatePayload): Uint8Array => {
  const idBytes = enc.encode(state.id);
  const codeBytes = enc.encode(state.code);
  const nameBytes = enc.encode(state.gameName);
  const ownerBytes = enc.encode(state.ownerId);
  const memberBytes: {
    userId: Uint8Array;
    displayName: Uint8Array;
    avatarIndex: number;
    dicePresetId: Uint8Array;
    role: number;
  }[] = state.members.map((m) => ({
    userId: enc.encode(m.userId),
    displayName: enc.encode(m.displayName),
    avatarIndex: normalizeAvatarIndex(m.avatarIndex),
    dicePresetId: enc.encode(normalizeDicePresetId(m.dicePresetId)),
    role: m.role,
  }));
  ensureU16Count(memberBytes.length, 'room members');
  let size =
    1 + (2 + idBytes.length) + (2 + codeBytes.length) + (2 + ownerBytes.length) + 1 + 1 + 2;
  for (const m of memberBytes) {
    size += 2 + m.userId.length + 2 + m.displayName.length + 2 + (2 + m.dicePresetId.length) + 1;
  }
  size += ROOM_OPTIONS_BYTES + 2 + nameBytes.length + 1;

  const buf = new Uint8Array(size);
  const view = viewOf(buf);
  let off = 0;
  view.setUint8(off, OP.ROOM_STATE);
  off += 1;
  off = writeStr16(view, buf, off, idBytes);
  off = writeStr16(view, buf, off, codeBytes);
  off = writeStr16(view, buf, off, ownerBytes);
  view.setUint8(off, state.status & 0xff);
  off += 1;
  view.setUint8(off, state.mode & 0xff);
  off += 1;
  view.setUint16(off, memberBytes.length);
  off += 2;
  for (const m of memberBytes) {
    off = writeStr16(view, buf, off, m.userId);
    off = writeStr16(view, buf, off, m.displayName);
    view.setUint16(off, m.avatarIndex);
    off += 2;
    off = writeStr16(view, buf, off, m.dicePresetId);
    view.setUint8(off, m.role & 0xff);
    off += 1;
  }
  off = writeRoomOptions(view, off, state.options);
  off = writeStr16(view, buf, off, nameBytes);
  view.setUint8(off, state.hasPassword ? 1 : 0);
  return buf;
};

export const unpackRoomState = (buf: Uint8Array): RoomStatePayload => {
  ensureOpcode(buf, OP.ROOM_STATE, 'ROOM_STATE');
  const view = viewOf(buf);
  let off = 1; // skip opcode
  const idR = readStr16(view, buf, off);
  off = idR.next;
  const codeR = readStr16(view, buf, off);
  off = codeR.next;
  const ownerR = readStr16(view, buf, off);
  off = ownerR.next;
  ensureAvailable(buf, off, 4, 'room state header');
  const status = view.getUint8(off);
  off += 1;
  const mode = view.getUint8(off);
  off += 1;
  ensureAvailable(buf, off, 2, 'room member count');
  const memberCount = view.getUint16(off);
  off += 2;
  ensureAvailable(
    buf,
    off,
    memberCount * 9 + ROOM_OPTIONS_BYTES + 3,
    'minimum room members and tail',
  );
  const members: RoomMember[] = new Array(memberCount);
  for (let i = 0; i < memberCount; i++) {
    const u = readStr16(view, buf, off);
    off = u.next;
    const n = readStr16(view, buf, off);
    off = n.next;
    ensureAvailable(buf, off, 2, 'room member avatar');
    const avatarIndex = normalizeAvatarIndex(view.getUint16(off));
    off += 2;
    const dicePreset = readStr16(view, buf, off);
    off = dicePreset.next;
    ensureAvailable(buf, off, 1, 'room member role');
    const role = view.getUint8(off) as RoomMember['role'];
    off += 1;
    members[i] = {
      userId: u.value,
      displayName: n.value,
      avatarIndex,
      dicePresetId: normalizeDicePresetId(dicePreset.value),
      role,
    };
  }
  ensureAvailable(buf, off, ROOM_OPTIONS_BYTES, 'room options');
  const options = readRoomOptions(view, off);
  off += ROOM_OPTIONS_BYTES;
  const nameR = readStr16(view, buf, off);
  off = nameR.next;
  ensureAvailable(buf, off, 1, 'room password flag');
  const hasPassword = view.getUint8(off) !== 0;
  off += 1;
  ensureConsumed(buf, off, 'ROOM_STATE');
  return {
    id: idR.value,
    code: codeR.value,
    gameName: nameR.value,
    hasPassword,
    ownerId: ownerR.value,
    status: status as RoomStatePayload['status'],
    mode: mode as RoomStatePayload['mode'],
    options,
    members,
  };
};

// ──────────────────────────────────────────────────────────────
// ACK_OK / ACK_ERROR
// ──────────────────────────────────────────────────────────────

export const packAckOk = (requestId: number, body?: Uint8Array): Uint8Array => {
  const bodyLen = body?.length ?? 0;
  const buf = new Uint8Array(5 + bodyLen);
  const view = viewOf(buf);
  view.setUint8(0, OP.ACK_OK);
  view.setUint32(1, requestId >>> 0);
  if (body && bodyLen > 0) buf.set(body, 5);
  return buf;
};

export const unpackAckOk = (buf: Uint8Array): AckOkPayload => {
  ensureOpcode(buf, OP.ACK_OK, 'ACK_OK');
  ensureAvailable(buf, 0, 5, 'ACK_OK');
  const view = viewOf(buf);
  return {
    requestId: view.getUint32(1),
    body: buf.length > 5 ? buf.subarray(5) : undefined,
  };
};

export const packAckError = (requestId: number, code: string, message: string): Uint8Array => {
  const codeBytes = enc.encode(code);
  const msgBytes = enc.encode(message);
  const buf = new Uint8Array(5 + 2 + codeBytes.length + 2 + msgBytes.length);
  const view = viewOf(buf);
  view.setUint8(0, OP.ACK_ERROR);
  view.setUint32(1, requestId >>> 0);
  let off = 5;
  off = writeStr16(view, buf, off, codeBytes);
  writeStr16(view, buf, off, msgBytes);
  return buf;
};

export const unpackAckError = (buf: Uint8Array): AckErrorPayload => {
  ensureOpcode(buf, OP.ACK_ERROR, 'ACK_ERROR');
  ensureAvailable(buf, 0, 5, 'ACK_ERROR header');
  const view = viewOf(buf);
  const requestId = view.getUint32(1);
  let off = 5;
  const codeR = readStr16(view, buf, off);
  off = codeR.next;
  const msgR = readStr16(view, buf, off);
  ensureConsumed(buf, msgR.next, 'ACK_ERROR');
  return { requestId, code: codeR.value, message: msgR.value };
};

// ──────────────────────────────────────────────────────────────
// MATCH_SELECT_DICE / MATCH_BANK (C→S, одинаковый layout)
//
// Layout:
//   u8  op            (0x31 либо 0x32)
//   u32 requestId
//   str16 roomId
//   u16 indicesCount
//   u8[indicesCount] indices
// ──────────────────────────────────────────────────────────────

const packIndicesCmd = (
  opcode: number,
  requestId: number,
  roomId: string,
  indices: number[],
): Uint8Array => {
  const roomBytes = enc.encode(roomId);
  const n = indices.length;
  ensureU16Count(n, 'indices');
  const buf = new Uint8Array(1 + 4 + 2 + roomBytes.length + 2 + n);
  const view = viewOf(buf);
  view.setUint8(0, opcode);
  view.setUint32(1, requestId >>> 0);
  let off = writeStr16(view, buf, 5, roomBytes);
  view.setUint16(off, n);
  off += 2;
  for (let i = 0; i < n; i++) {
    ensureU8Value(indices[i]!, `indices[${i}]`);
    view.setUint8(off + i, indices[i]!);
  }
  return buf;
};

const unpackIndicesCmd = (
  buf: Uint8Array,
  opcode: number,
  label: string,
): { requestId: number; roomId: string; indices: number[] } => {
  ensureOpcode(buf, opcode, label);
  ensureAvailable(buf, 0, 5, `${label} header`);
  const view = viewOf(buf);
  const requestId = view.getUint32(1);
  const r = readStr16(view, buf, 5);
  let off = r.next;
  ensureAvailable(buf, off, 2, 'indices count');
  const n = view.getUint16(off);
  off += 2;
  ensureAvailable(buf, off, n, 'indices');
  const indices: number[] = new Array(n);
  for (let i = 0; i < n; i++) indices[i] = view.getUint8(off + i);
  off += n;
  ensureConsumed(buf, off, 'indices command');
  return { requestId, roomId: r.value, indices };
};

export const packMatchSelectDice = (cmd: MatchSelectDiceCmd): Uint8Array =>
  packIndicesCmd(OP.MATCH_SELECT_DICE, cmd.requestId, cmd.roomId, cmd.indices);

export const unpackMatchSelectDice = (buf: Uint8Array): MatchSelectDiceCmd =>
  unpackIndicesCmd(buf, OP.MATCH_SELECT_DICE, 'MATCH_SELECT_DICE');

export const packMatchBank = (cmd: MatchBankCmd): Uint8Array =>
  packIndicesCmd(OP.MATCH_BANK, cmd.requestId, cmd.roomId, cmd.indices);

export const unpackMatchBank = (buf: Uint8Array): MatchBankCmd =>
  unpackIndicesCmd(buf, OP.MATCH_BANK, 'MATCH_BANK');

// ──────────────────────────────────────────────────────────────
// MATCH_REMATCH (C→S command)
// MATCH_REMATCH_STATE (S→C broadcast)
//
// Command layout:
//   u8    op = 0x35
//   u32   requestId
//   str16 roomId
//
// Broadcast layout:
//   u8    op = 0x47
//   u16   requestedCount
//   requestedCount × str16 userId
// ──────────────────────────────────────────────────────────────

export const packMatchRematch = (cmd: MatchRematchCmd): Uint8Array => {
  const roomBytes = enc.encode(cmd.roomId);
  const buf = new Uint8Array(1 + 4 + 2 + roomBytes.length);
  const view = viewOf(buf);
  view.setUint8(0, OP.MATCH_REMATCH);
  view.setUint32(1, cmd.requestId >>> 0);
  writeStr16(view, buf, 5, roomBytes);
  return buf;
};

export const unpackMatchRematch = (buf: Uint8Array): MatchRematchCmd => {
  ensureOpcode(buf, OP.MATCH_REMATCH, 'MATCH_REMATCH');
  ensureAvailable(buf, 0, 5, 'MATCH_REMATCH header');
  const view = viewOf(buf);
  const requestId = view.getUint32(1);
  const r = readStr16(view, buf, 5);
  ensureConsumed(buf, r.next, 'MATCH_REMATCH');
  return { requestId, roomId: r.value };
};

export const packMatchRematchState = (payload: MatchRematchStatePayload): Uint8Array => {
  const requestedBytes = payload.requestedBy.map((userId) => enc.encode(userId));
  ensureU16Count(requestedBytes.length, 'requestedBy');
  let size = 1 + 2;
  for (const bytes of requestedBytes) size += 2 + bytes.length;
  const buf = new Uint8Array(size);
  const view = viewOf(buf);
  let off = 0;
  view.setUint8(off, OP.MATCH_REMATCH_STATE);
  off += 1;
  view.setUint16(off, requestedBytes.length);
  off += 2;
  for (const bytes of requestedBytes) {
    off = writeStr16(view, buf, off, bytes);
  }
  return buf;
};

export const unpackMatchRematchState = (buf: Uint8Array): MatchRematchStatePayload => {
  ensureOpcode(buf, OP.MATCH_REMATCH_STATE, 'MATCH_REMATCH_STATE');
  const view = viewOf(buf);
  let off = 1;
  ensureAvailable(buf, off, 2, 'requestedBy count');
  const n = view.getUint16(off);
  off += 2;
  ensureAvailable(buf, off, n * 2, 'minimum requestedBy entries');
  const requestedBy: string[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const r = readStr16(view, buf, off);
    requestedBy[i] = r.value;
    off = r.next;
  }
  ensureConsumed(buf, off, 'MATCH_REMATCH_STATE');
  return { requestedBy };
};

// ──────────────────────────────────────────────────────────────
// MATCH_SELECTION_PREVIEW_CMD (C→S, fire-and-forget)
// MATCH_SELECTION_PREVIEW (S→C broadcast)
//
// Command layout:
//   u8  op = 0x33
//   str16 roomId
//   u16 indicesCount
//   u8[indicesCount] indices
//
// Broadcast layout:
//   u8  op = 0x46
//   str16 userId
//   u16 indicesCount
//   u8[indicesCount] indices
// ──────────────────────────────────────────────────────────────

export const packMatchSelectionPreviewCmd = (cmd: MatchSelectionPreviewCmd): Uint8Array => {
  const roomBytes = enc.encode(cmd.roomId);
  const n = cmd.indices.length;
  ensureU16Count(n, 'selection preview indices');
  const buf = new Uint8Array(1 + 2 + roomBytes.length + 2 + n);
  const view = viewOf(buf);
  view.setUint8(0, OP.MATCH_SELECTION_PREVIEW_CMD);
  let off = writeStr16(view, buf, 1, roomBytes);
  view.setUint16(off, n);
  off += 2;
  for (let i = 0; i < n; i++) {
    ensureU8Value(cmd.indices[i]!, `selection preview indices[${i}]`);
    view.setUint8(off + i, cmd.indices[i]!);
  }
  return buf;
};

export const unpackMatchSelectionPreviewCmd = (buf: Uint8Array): MatchSelectionPreviewCmd => {
  ensureOpcode(buf, OP.MATCH_SELECTION_PREVIEW_CMD, 'MATCH_SELECTION_PREVIEW_CMD');
  const view = viewOf(buf);
  const r = readStr16(view, buf, 1);
  let off = r.next;
  ensureAvailable(buf, off, 2, 'selection preview indices count');
  const n = view.getUint16(off);
  off += 2;
  ensureAvailable(buf, off, n, 'selection preview indices');
  const indices: number[] = new Array(n);
  for (let i = 0; i < n; i++) indices[i] = view.getUint8(off + i);
  off += n;
  ensureConsumed(buf, off, 'MATCH_SELECTION_PREVIEW_CMD');
  return { roomId: r.value, indices };
};

export const packMatchSelectionPreview = (payload: MatchSelectionPreviewPayload): Uint8Array => {
  const userBytes = enc.encode(payload.userId);
  const n = payload.indices.length;
  ensureU16Count(n, 'selection preview indices');
  const buf = new Uint8Array(1 + 2 + userBytes.length + 2 + n + 1 + 4);
  const view = viewOf(buf);
  view.setUint8(0, OP.MATCH_SELECTION_PREVIEW);
  let off = writeStr16(view, buf, 1, userBytes);
  view.setUint16(off, n);
  off += 2;
  for (let i = 0; i < n; i++) {
    ensureU8Value(payload.indices[i]!, `selection preview indices[${i}]`);
    view.setUint8(off + i, payload.indices[i]!);
  }
  off += n;
  view.setUint8(off, payload.valid ? 1 : 0);
  off += 1;
  view.setUint32(off, payload.points >>> 0);
  return buf;
};

export const unpackMatchSelectionPreview = (buf: Uint8Array): MatchSelectionPreviewPayload => {
  ensureOpcode(buf, OP.MATCH_SELECTION_PREVIEW, 'MATCH_SELECTION_PREVIEW');
  const view = viewOf(buf);
  const r = readStr16(view, buf, 1);
  let off = r.next;
  ensureAvailable(buf, off, 2, 'selection preview indices count');
  const n = view.getUint16(off);
  off += 2;
  ensureAvailable(buf, off, n + 5, 'selection preview payload');
  const indices: number[] = new Array(n);
  for (let i = 0; i < n; i++) indices[i] = view.getUint8(off + i);
  off += n;
  const valid = view.getUint8(off) !== 0;
  off += 1;
  const points = view.getUint32(off);
  off += 4;
  ensureConsumed(buf, off, 'MATCH_SELECTION_PREVIEW');
  return { userId: r.value, indices, valid, points };
};

// ──────────────────────────────────────────────────────────────
// MATCH_ROLL_RESULT (S→C broadcast)
//
// Layout:
//   u8  op = 0x44
//   u16 facesCount
//   u8[facesCount] rolledFaces (1..6)
//   u8  bust (0 | 1)
// ──────────────────────────────────────────────────────────────

export const packMatchRollResult = (p: MatchRollResultPayload): Uint8Array => {
  const n = p.rolledFaces.length;
  ensureU16Count(n, 'rolledFaces');
  const buf = new Uint8Array(1 + 2 + n + 1);
  const view = viewOf(buf);
  view.setUint8(0, OP.MATCH_ROLL_RESULT);
  view.setUint16(1, n);
  for (let i = 0; i < n; i++) {
    ensureU8Value(p.rolledFaces[i]!, `rolledFaces[${i}]`);
    view.setUint8(3 + i, p.rolledFaces[i]!);
  }
  view.setUint8(3 + n, p.bust ? 1 : 0);
  return buf;
};

export const unpackMatchRollResult = (buf: Uint8Array): MatchRollResultPayload => {
  ensureOpcode(buf, OP.MATCH_ROLL_RESULT, 'MATCH_ROLL_RESULT');
  const view = viewOf(buf);
  ensureAvailable(buf, 1, 2, 'rolledFaces count');
  const n = view.getUint16(1);
  ensureAvailable(buf, 3, n + 1, 'roll result payload');
  const rolledFaces: number[] = new Array(n);
  for (let i = 0; i < n; i++) rolledFaces[i] = view.getUint8(3 + i);
  const bust = view.getUint8(3 + n) !== 0;
  ensureConsumed(buf, 4 + n, 'MATCH_ROLL_RESULT');
  return { rolledFaces, bust };
};

// ──────────────────────────────────────────────────────────────
// MATCH_TURN_RESULT (S→C broadcast)
//
// Layout:
//   u8  op = 0x45
//   str16 userId
//   u8  bust (0 | 1)
//   u32 banked     (0 при bust)
//   u32 totalAfter
// ──────────────────────────────────────────────────────────────

export const packMatchTurnResult = (p: MatchTurnResultPayload): Uint8Array => {
  const userBytes = enc.encode(p.userId);
  const buf = new Uint8Array(1 + 2 + userBytes.length + 1 + 4 + 4);
  const view = viewOf(buf);
  view.setUint8(0, OP.MATCH_TURN_RESULT);
  let off = writeStr16(view, buf, 1, userBytes);
  view.setUint8(off, p.bust ? 1 : 0);
  off += 1;
  view.setUint32(off, p.banked >>> 0);
  off += 4;
  view.setUint32(off, p.totalAfter >>> 0);
  return buf;
};

export const unpackMatchTurnResult = (buf: Uint8Array): MatchTurnResultPayload => {
  ensureOpcode(buf, OP.MATCH_TURN_RESULT, 'MATCH_TURN_RESULT');
  const view = viewOf(buf);
  const r = readStr16(view, buf, 1);
  let off = r.next;
  ensureAvailable(buf, off, 9, 'MATCH_TURN_RESULT body');
  const bust = view.getUint8(off) !== 0;
  off += 1;
  const banked = view.getUint32(off);
  off += 4;
  const totalAfter = view.getUint32(off);
  off += 4;
  ensureConsumed(buf, off, 'MATCH_TURN_RESULT');
  return { userId: r.value, bust, banked, totalAfter };
};

// ──────────────────────────────────────────────────────────────
// MATCH_STATE (S→C broadcast)
//
// Layout:
//   u8  op = 0x43
//   u8  phase            (0 waiting | 1 rolling | 2 selecting | 3 finished)
//   str16 currentPlayer
//   u32 turnPoints
//   u8  remainingDice
//   u16 benchCount
//   u8[benchCount] bench (faces 1..6)
//   u16 totalsCount
//   totalsCount × { str16 userId, u32 total }
//   str16 winner         (пустая строка = ещё нет)
//   u8  finishReason     (0 none | 1 score | 2 last-player)
// ──────────────────────────────────────────────────────────────

export const packMatchState = (state: MatchStatePayload): Uint8Array => {
  const currentBytes = enc.encode(state.currentPlayer);
  const winnerBytes = enc.encode(state.winner);
  const totalsBytes: { userId: Uint8Array; total: number }[] = state.totals.map((t) => ({
    userId: enc.encode(t.userId),
    total: t.total,
  }));
  ensureU16Count(state.bench.length, 'bench');
  ensureU16Count(totalsBytes.length, 'totals');

  let size = 1 + 1 + (2 + currentBytes.length) + 4 + 1 + 2 + state.bench.length + 2;
  for (const t of totalsBytes) size += 2 + t.userId.length + 4;
  size += 2 + winnerBytes.length + 1;

  const buf = new Uint8Array(size);
  const view = viewOf(buf);
  let off = 0;
  view.setUint8(off, OP.MATCH_STATE);
  off += 1;
  view.setUint8(off, state.phase & 0xff);
  off += 1;
  off = writeStr16(view, buf, off, currentBytes);
  view.setUint32(off, state.turnPoints >>> 0);
  off += 4;
  view.setUint8(off, state.remainingDice & 0xff);
  off += 1;
  view.setUint16(off, state.bench.length);
  off += 2;
  for (let i = 0; i < state.bench.length; i++) {
    ensureU8Value(state.bench[i]!, `bench[${i}]`);
    view.setUint8(off + i, state.bench[i]!);
  }
  off += state.bench.length;
  view.setUint16(off, totalsBytes.length);
  off += 2;
  for (const t of totalsBytes) {
    off = writeStr16(view, buf, off, t.userId);
    view.setUint32(off, t.total >>> 0);
    off += 4;
  }
  off = writeStr16(view, buf, off, winnerBytes);
  view.setUint8(off, state.finishReason & 0xff);
  return buf;
};

export const unpackMatchState = (buf: Uint8Array): MatchStatePayload => {
  ensureOpcode(buf, OP.MATCH_STATE, 'MATCH_STATE');
  ensureAvailable(buf, 0, 2, 'MATCH_STATE header');
  const view = viewOf(buf);
  let off = 1; // skip opcode
  const phase = view.getUint8(off) as MatchPhase;
  off += 1;
  const currentR = readStr16(view, buf, off);
  off = currentR.next;
  ensureAvailable(buf, off, 5, 'match scalar state');
  const turnPoints = view.getUint32(off);
  off += 4;
  const remainingDice = view.getUint8(off);
  off += 1;
  ensureAvailable(buf, off, 2, 'bench count');
  const benchCount = view.getUint16(off);
  off += 2;
  ensureAvailable(buf, off, benchCount, 'bench');
  const bench: number[] = new Array(benchCount);
  for (let i = 0; i < benchCount; i++) bench[i] = view.getUint8(off + i);
  off += benchCount;
  ensureAvailable(buf, off, 2, 'totals count');
  const totalsCount = view.getUint16(off);
  off += 2;
  ensureAvailable(buf, off, totalsCount * 6 + 3, 'minimum totals and match tail');
  const totals: MatchTotal[] = new Array(totalsCount);
  for (let i = 0; i < totalsCount; i++) {
    const u = readStr16(view, buf, off);
    off = u.next;
    ensureAvailable(buf, off, 4, 'match total');
    const total = view.getUint32(off);
    off += 4;
    totals[i] = { userId: u.value, total };
  }
  const winnerR = readStr16(view, buf, off);
  off = winnerR.next;
  ensureAvailable(buf, off, 1, 'finish reason');
  const finishReason = view.getUint8(off) as MatchStatePayload['finishReason'];
  off += 1;
  ensureConsumed(buf, off, 'MATCH_STATE');
  return {
    phase,
    currentPlayer: currentR.value,
    turnPoints,
    remainingDice,
    bench,
    totals,
    winner: winnerR.value,
    finishReason,
  };
};
