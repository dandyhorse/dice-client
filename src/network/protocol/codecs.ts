// ⚠️ DUPLICATE — keep in sync with dice-server/src/net/protocol/codecs.ts
//
// Ручная бинарная упаковка через DataView. Без внешних зависимостей.
// Все многобайтовые числа — big-endian (DataView default).
// Строки кодируются как str16: u16 длины (BE) + UTF-8 bytes.
//
// Layout каждого пакета — см. dice-server/.claude/specs/network-physics.md.

import { OP } from './opcodes';
import { DEFAULT_ROOM_OPTIONS, ROOM_SCORING_RULESET, normalizeRoomOptions } from './types';

import type {
  AckErrorPayload,
  AckOkPayload,
  DieRestStateBin,
  DieStateBin,
  MatchBankCmd,
  MatchPhase,
  MatchRollResultPayload,
  MatchSelectDiceCmd,
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
  RoomStartCmd,
  RoomStatePayload,
  SnapshotPayload,
} from './types';

const enc = new TextEncoder();
const dec = new TextDecoder();

const SNAPSHOT_PER_DIE = 13 * 4; // 13 floats × 4 bytes
const REST_PER_DIE = 7 * 4 + 1; // 7 floats × 4 + u8 face
const ROOM_OPTIONS_BYTES = 6;
const ROOM_RULESET_BASE_D6 = 0;

const viewOf = (buf: Uint8Array): DataView =>
  new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

const writeStr16 = (view: DataView, buf: Uint8Array, off: number, bytes: Uint8Array): number => {
  view.setUint16(off, bytes.length);
  buf.set(bytes, off + 2);
  return off + 2 + bytes.length;
};

const readStr16 = (
  view: DataView,
  buf: Uint8Array,
  off: number,
): { value: string; next: number } => {
  const len = view.getUint16(off);
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
  view.setUint8(off + 4, normalized.allowHotDice ? 1 : 0);
  view.setUint8(off + 5, ROOM_RULESET_BASE_D6);
  return off + ROOM_OPTIONS_BYTES;
};

const readRoomOptions = (view: DataView, off: number): RoomOptionsPayload => {
  const ruleset = view.getUint8(off + 5);
  return normalizeRoomOptions({
    targetScore: view.getUint16(off) as RoomOptionsPayload['targetScore'],
    minBank: view.getUint16(off + 2) as RoomOptionsPayload['minBank'],
    allowHotDice: view.getUint8(off + 4) !== 0,
    scoringRuleset:
      ruleset === ROOM_RULESET_BASE_D6
        ? ROOM_SCORING_RULESET.BASE_D6
        : DEFAULT_ROOM_OPTIONS.scoringRuleset,
  });
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
  const view = viewOf(buf);
  const r = readStr16(view, buf, 1);
  const off = r.next;
  return {
    roomId: r.value,
    velocity: [view.getFloat32(off), view.getFloat32(off + 4), view.getFloat32(off + 8)],
    position: [view.getFloat32(off + 12), view.getFloat32(off + 16), view.getFloat32(off + 20)],
  };
};

// ──────────────────────────────────────────────────────────────
// ROOM_* commands (C→S, c requestId)
// ──────────────────────────────────────────────────────────────

export const packRoomCreate = (cmd: RoomCreateCmd): Uint8Array => {
  const nameBytes = enc.encode(cmd.gameName ?? '');
  const buf = new Uint8Array(6 + ROOM_OPTIONS_BYTES + 2 + nameBytes.length);
  const view = viewOf(buf);
  view.setUint8(0, OP.ROOM_CREATE);
  view.setUint32(1, cmd.requestId >>> 0);
  view.setUint8(5, (cmd.mode ?? 0) & 0xff);
  const off = writeRoomOptions(view, 6, cmd.options);
  writeStr16(view, buf, off, nameBytes);
  return buf;
};

export const unpackRoomCreate = (buf: Uint8Array): RoomCreateCmd => {
  const view = viewOf(buf);
  const options =
    buf.length >= 6 + ROOM_OPTIONS_BYTES ? readRoomOptions(view, 6) : DEFAULT_ROOM_OPTIONS;
  const nameOffset = 6 + (buf.length >= 6 + ROOM_OPTIONS_BYTES ? ROOM_OPTIONS_BYTES : 0);
  const gameName = nameOffset + 2 <= buf.length ? readStr16(view, buf, nameOffset).value : '';
  return {
    requestId: view.getUint32(1),
    mode: buf.length > 5 ? (view.getUint8(5) as RoomCreateCmd['mode']) : 0,
    options,
    gameName,
  };
};

export const packRoomJoin = (cmd: RoomJoinCmd): Uint8Array => {
  const codeBytes = enc.encode(cmd.code);
  const buf = new Uint8Array(5 + 2 + codeBytes.length);
  const view = viewOf(buf);
  view.setUint8(0, OP.ROOM_JOIN);
  view.setUint32(1, cmd.requestId >>> 0);
  writeStr16(view, buf, 5, codeBytes);
  return buf;
};

export const unpackRoomJoin = (buf: Uint8Array): RoomJoinCmd => {
  const view = viewOf(buf);
  const requestId = view.getUint32(1);
  const r = readStr16(view, buf, 5);
  return { requestId, code: r.value };
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
  const view = viewOf(buf);
  const requestId = view.getUint32(1);
  const r = readStr16(view, buf, 5);
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
  const view = viewOf(buf);
  const requestId = view.getUint32(1);
  const r = readStr16(view, buf, 5);
  return { requestId, roomId: r.value };
};

export const packRoomListRequest = (cmd: RoomListCmd): Uint8Array => {
  const buf = new Uint8Array(5);
  const view = viewOf(buf);
  view.setUint8(0, OP.ROOM_LIST);
  view.setUint32(1, cmd.requestId >>> 0);
  return buf;
};

export const unpackRoomListRequest = (buf: Uint8Array): RoomListCmd => {
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
  if (rooms.length > 0xff) throw new Error(`room list too long: ${rooms.length} > 255`);

  let size = 1 + 1;
  for (const room of rooms) {
    size +=
      2 +
      room.id.length +
      2 +
      room.code.length +
      2 +
      room.gameName.length +
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
  view.setUint8(off, rooms.length & 0xff);
  off += 1;
  for (const room of rooms) {
    off = writeStr16(view, buf, off, room.id);
    off = writeStr16(view, buf, off, room.code);
    off = writeStr16(view, buf, off, room.gameName);
    off = writeStr16(view, buf, off, room.ownerId);
    off = writeStr16(view, buf, off, room.ownerDisplayName);
    view.setUint8(off, room.item.status & 0xff);
    off += 1;
    view.setUint8(off, room.item.mode & 0xff);
    off += 1;
    view.setUint16(off, room.item.playerCount & 0xffff);
    off += 2;
    view.setUint16(off, room.item.spectatorCount & 0xffff);
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
  let off = 1;
  const count = view.getUint8(off);
  off += 1;
  const rooms: RoomListItemPayload[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const id = readStr16(view, buf, off);
    off = id.next;
    const code = readStr16(view, buf, off);
    off = code.next;
    const gameName = readStr16(view, buf, off);
    off = gameName.next;
    const ownerId = readStr16(view, buf, off);
    off = ownerId.next;
    const ownerDisplayName = readStr16(view, buf, off);
    off = ownerDisplayName.next;
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
    socketId: Uint8Array;
    displayName: Uint8Array;
    role: number;
    online: boolean;
  }[] = state.members.map((m) => ({
    userId: enc.encode(m.userId),
    socketId: enc.encode(m.socketId),
    displayName: enc.encode(m.displayName),
    role: m.role,
    online: m.online,
  }));
  let size =
    1 + (2 + idBytes.length) + (2 + codeBytes.length) + (2 + ownerBytes.length) + 1 + 1 + 1;
  for (const m of memberBytes) {
    size += 2 + m.userId.length + 2 + m.socketId.length + 2 + m.displayName.length + 1 + 1;
  }
  size += ROOM_OPTIONS_BYTES + 2 + nameBytes.length;

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
  view.setUint8(off, memberBytes.length & 0xff);
  off += 1;
  for (const m of memberBytes) {
    off = writeStr16(view, buf, off, m.userId);
    off = writeStr16(view, buf, off, m.socketId);
    off = writeStr16(view, buf, off, m.displayName);
    view.setUint8(off, m.role & 0xff);
    off += 1;
    view.setUint8(off, m.online ? 1 : 0);
    off += 1;
  }
  off = writeRoomOptions(view, off, state.options);
  writeStr16(view, buf, off, nameBytes);
  return buf;
};

export const unpackRoomState = (buf: Uint8Array): RoomStatePayload => {
  const view = viewOf(buf);
  let off = 1; // skip opcode
  const idR = readStr16(view, buf, off);
  off = idR.next;
  const codeR = readStr16(view, buf, off);
  off = codeR.next;
  const ownerR = readStr16(view, buf, off);
  off = ownerR.next;
  const status = view.getUint8(off);
  off += 1;
  const mode = view.getUint8(off);
  off += 1;
  const memberCount = view.getUint8(off);
  off += 1;
  const members: RoomMember[] = new Array(memberCount);
  for (let i = 0; i < memberCount; i++) {
    const u = readStr16(view, buf, off);
    off = u.next;
    const s = readStr16(view, buf, off);
    off = s.next;
    const n = readStr16(view, buf, off);
    off = n.next;
    const role = view.getUint8(off) as RoomMember['role'];
    off += 1;
    const online = view.getUint8(off) !== 0;
    off += 1;
    members[i] = {
      userId: u.value,
      socketId: s.value,
      displayName: n.value,
      role,
      online,
    };
  }
  const options =
    off + ROOM_OPTIONS_BYTES <= buf.length ? readRoomOptions(view, off) : DEFAULT_ROOM_OPTIONS;
  off += off + ROOM_OPTIONS_BYTES <= buf.length ? ROOM_OPTIONS_BYTES : 0;
  const gameName = off + 2 <= buf.length ? readStr16(view, buf, off).value : codeR.value;
  return {
    id: idR.value,
    code: codeR.value,
    gameName,
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
  const view = viewOf(buf);
  const requestId = view.getUint32(1);
  let off = 5;
  const codeR = readStr16(view, buf, off);
  off = codeR.next;
  const msgR = readStr16(view, buf, off);
  return { requestId, code: codeR.value, message: msgR.value };
};

// ──────────────────────────────────────────────────────────────
// MATCH_SELECT_DICE / MATCH_BANK (C→S, одинаковый layout)
//
// Layout:
//   u8  op            (0x31 либо 0x32)
//   u32 requestId
//   str16 roomId
//   u8  indicesCount
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
  if (n > 0xff) throw new Error(`indices too long: ${n} > 255`);
  const buf = new Uint8Array(1 + 4 + 2 + roomBytes.length + 1 + n);
  const view = viewOf(buf);
  view.setUint8(0, opcode);
  view.setUint32(1, requestId >>> 0);
  let off = writeStr16(view, buf, 5, roomBytes);
  view.setUint8(off, n & 0xff);
  off += 1;
  for (let i = 0; i < n; i++) view.setUint8(off + i, indices[i]! & 0xff);
  return buf;
};

const unpackIndicesCmd = (
  buf: Uint8Array,
): { requestId: number; roomId: string; indices: number[] } => {
  const view = viewOf(buf);
  const requestId = view.getUint32(1);
  const r = readStr16(view, buf, 5);
  let off = r.next;
  const n = view.getUint8(off);
  off += 1;
  const indices: number[] = new Array(n);
  for (let i = 0; i < n; i++) indices[i] = view.getUint8(off + i);
  return { requestId, roomId: r.value, indices };
};

export const packMatchSelectDice = (cmd: MatchSelectDiceCmd): Uint8Array =>
  packIndicesCmd(OP.MATCH_SELECT_DICE, cmd.requestId, cmd.roomId, cmd.indices);

export const unpackMatchSelectDice = (buf: Uint8Array): MatchSelectDiceCmd => unpackIndicesCmd(buf);

export const packMatchBank = (cmd: MatchBankCmd): Uint8Array =>
  packIndicesCmd(OP.MATCH_BANK, cmd.requestId, cmd.roomId, cmd.indices);

export const unpackMatchBank = (buf: Uint8Array): MatchBankCmd => unpackIndicesCmd(buf);

// ──────────────────────────────────────────────────────────────
// MATCH_ROLL_RESULT (S→C broadcast)
//
// Layout:
//   u8  op = 0x44
//   u8  facesCount
//   u8[facesCount] rolledFaces (1..6)
//   u8  bust (0 | 1)
// ──────────────────────────────────────────────────────────────

export const packMatchRollResult = (p: MatchRollResultPayload): Uint8Array => {
  const n = p.rolledFaces.length;
  if (n > 0xff) throw new Error(`rolledFaces too long: ${n} > 255`);
  const buf = new Uint8Array(1 + 1 + n + 1);
  const view = viewOf(buf);
  view.setUint8(0, OP.MATCH_ROLL_RESULT);
  view.setUint8(1, n & 0xff);
  for (let i = 0; i < n; i++) view.setUint8(2 + i, p.rolledFaces[i]! & 0xff);
  view.setUint8(2 + n, p.bust ? 1 : 0);
  return buf;
};

export const unpackMatchRollResult = (buf: Uint8Array): MatchRollResultPayload => {
  const view = viewOf(buf);
  const n = view.getUint8(1);
  const rolledFaces: number[] = new Array(n);
  for (let i = 0; i < n; i++) rolledFaces[i] = view.getUint8(2 + i);
  const bust = view.getUint8(2 + n) !== 0;
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
  const view = viewOf(buf);
  const r = readStr16(view, buf, 1);
  let off = r.next;
  const bust = view.getUint8(off) !== 0;
  off += 1;
  const banked = view.getUint32(off);
  off += 4;
  const totalAfter = view.getUint32(off);
  return { userId: r.value, bust, banked, totalAfter };
};

// ──────────────────────────────────────────────────────────────
// MATCH_STATE (S→C broadcast)
//
// Layout:
//   u8  op = 0x43
//   u8  phase            (0 waiting | 1 rolling | 2 selecting | 3 finished)
//   str16 currentPlayer
//   u8  paused          (0 | 1)
//   str16 pauseReason
//   u8  onlinePlayersCount
//   onlinePlayersCount × str16 userId
//   u32 turnPoints
//   u8  remainingDice
//   u8  benchCount
//   u8[benchCount] bench (faces 1..6)
//   u8  totalsCount
//   totalsCount × { str16 userId, u32 total }
//   str16 winner         (пустая строка = ещё нет)
//   f64 turnDeadlineAt   (unix ms, 0 если таймера нет)
// ──────────────────────────────────────────────────────────────

export const packMatchState = (state: MatchStatePayload): Uint8Array => {
  const currentBytes = enc.encode(state.currentPlayer);
  const pauseReasonBytes = enc.encode(state.pauseReason);
  const onlinePlayerBytes = state.onlinePlayers.map((userId) => enc.encode(userId));
  const winnerBytes = enc.encode(state.winner);
  const totalsBytes: { userId: Uint8Array; total: number }[] = state.totals.map((t) => ({
    userId: enc.encode(t.userId),
    total: t.total,
  }));
  if (state.bench.length > 0xff) throw new Error(`bench too long: ${state.bench.length} > 255`);
  if (onlinePlayerBytes.length > 0xff) {
    throw new Error(`onlinePlayers too long: ${onlinePlayerBytes.length} > 255`);
  }
  if (totalsBytes.length > 0xff) throw new Error(`totals too long: ${totalsBytes.length} > 255`);

  let size =
    1 +
    1 +
    (2 + currentBytes.length) +
    1 +
    (2 + pauseReasonBytes.length) +
    1 +
    4 +
    1 +
    1 +
    state.bench.length +
    1;
  for (const userId of onlinePlayerBytes) size += 2 + userId.length;
  for (const t of totalsBytes) size += 2 + t.userId.length + 4;
  size += 2 + winnerBytes.length + 8;

  const buf = new Uint8Array(size);
  const view = viewOf(buf);
  let off = 0;
  view.setUint8(off, OP.MATCH_STATE);
  off += 1;
  view.setUint8(off, state.phase & 0xff);
  off += 1;
  off = writeStr16(view, buf, off, currentBytes);
  view.setUint8(off, state.paused ? 1 : 0);
  off += 1;
  off = writeStr16(view, buf, off, pauseReasonBytes);
  view.setUint8(off, onlinePlayerBytes.length & 0xff);
  off += 1;
  for (const userId of onlinePlayerBytes) {
    off = writeStr16(view, buf, off, userId);
  }
  view.setUint32(off, state.turnPoints >>> 0);
  off += 4;
  view.setUint8(off, state.remainingDice & 0xff);
  off += 1;
  view.setUint8(off, state.bench.length & 0xff);
  off += 1;
  for (let i = 0; i < state.bench.length; i++) {
    view.setUint8(off + i, state.bench[i]! & 0xff);
  }
  off += state.bench.length;
  view.setUint8(off, totalsBytes.length & 0xff);
  off += 1;
  for (const t of totalsBytes) {
    off = writeStr16(view, buf, off, t.userId);
    view.setUint32(off, t.total >>> 0);
    off += 4;
  }
  off = writeStr16(view, buf, off, winnerBytes);
  view.setFloat64(off, state.turnDeadlineAt || 0);
  return buf;
};

export const unpackMatchState = (buf: Uint8Array): MatchStatePayload => {
  const view = viewOf(buf);
  let off = 1; // skip opcode
  const phase = view.getUint8(off) as MatchPhase;
  off += 1;
  const currentR = readStr16(view, buf, off);
  off = currentR.next;
  const paused = view.getUint8(off) !== 0;
  off += 1;
  const pauseReasonR = readStr16(view, buf, off);
  off = pauseReasonR.next;
  const onlinePlayersCount = view.getUint8(off);
  off += 1;
  const onlinePlayers: string[] = new Array(onlinePlayersCount);
  for (let i = 0; i < onlinePlayersCount; i++) {
    const p = readStr16(view, buf, off);
    off = p.next;
    onlinePlayers[i] = p.value;
  }
  const turnPoints = view.getUint32(off);
  off += 4;
  const remainingDice = view.getUint8(off);
  off += 1;
  const benchCount = view.getUint8(off);
  off += 1;
  const bench: number[] = new Array(benchCount);
  for (let i = 0; i < benchCount; i++) bench[i] = view.getUint8(off + i);
  off += benchCount;
  const totalsCount = view.getUint8(off);
  off += 1;
  const totals: MatchTotal[] = new Array(totalsCount);
  for (let i = 0; i < totalsCount; i++) {
    const u = readStr16(view, buf, off);
    off = u.next;
    const total = view.getUint32(off);
    off += 4;
    totals[i] = { userId: u.value, total };
  }
  const winnerR = readStr16(view, buf, off);
  off = winnerR.next;
  const turnDeadlineAt = off + 8 <= buf.length ? view.getFloat64(off) : 0;
  return {
    phase,
    currentPlayer: currentR.value,
    paused,
    pauseReason: pauseReasonR.value,
    onlinePlayers,
    turnPoints,
    remainingDice,
    bench,
    totals,
    winner: winnerR.value,
    turnDeadlineAt,
  };
};
