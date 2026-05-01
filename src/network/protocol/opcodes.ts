// ⚠️ DUPLICATE — keep in sync with dice-server/src/net/protocol/opcodes.ts
// Источник истины для бинарного протокола между сервером и клиентом.
// При изменении — править оба файла бит-в-бит.

export const OP = {
  // Client → Server (commands; ROOM_* содержат requestId u32 для match с ACK_*)
  ROOM_CREATE: 0x10,
  ROOM_JOIN: 0x11,
  ROOM_LEAVE: 0x12,
  ROOM_START: 0x13,
  ROOM_LIST: 0x14,
  MATCH_RELEASE: 0x30, // fire-and-forget, без requestId
  MATCH_SELECT_DICE: 0x31, // turn-based: отложить scoring-кости, перебросить остальные
  MATCH_BANK: 0x32, // turn-based: отложить scoring-кости и закрыть ход

  // Server → Client
  ROOM_STATE: 0x20, // broadcast в комнату при join/leave/disconnect
  MATCH_DICE_SPAWN: 0x40, // адресный, при join — стартовая раскладка
  MATCH_DICE_SNAPSHOT: 0x41, // broadcast, SNAPSHOT_HZ во время полёта
  MATCH_DICE_REST: 0x42, // broadcast, по rest-условию
  MATCH_STATE: 0x43, // broadcast, при каждом изменении turn-фазы
  MATCH_ROLL_RESULT: 0x44, // broadcast, после rest — что выпало + bust?
  MATCH_TURN_RESULT: 0x45, // broadcast, итог хода (bank или bust)
  ACK_OK: 0x80, // ответ на command по requestId
  ACK_ERROR: 0x81, // ошибка обработки command
} as const;

export type Opcode = (typeof OP)[keyof typeof OP];
