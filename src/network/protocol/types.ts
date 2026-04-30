// ⚠️ DUPLICATE — keep in sync with dice-server/src/net/protocol/types.ts

export type Vec3 = [number, number, number];
export type Quat = [number, number, number, number];

/** Полный state одной кости в snapshot (включает velocity для extrapolation). */
export interface DieStateBin {
  p: Vec3;
  q: Quat;
  v: Vec3;
  w: Vec3;
}

/** Финальный state кости — без v/w (всегда нули в rest), с faceValue 1..6. */
export interface DieRestStateBin {
  p: Vec3;
  q: Quat;
  faceValue: number;
}

export interface SnapshotPayload {
  tick: number;
  dice: DieStateBin[];
}

export interface RestPayload {
  tick: number;
  dice: DieRestStateBin[];
}

export interface ReleasePayload {
  roomId: string;
  velocity: Vec3;
  position: Vec3;
}

export const ROOM_ROLE = {
  PLAYER: 0,
  SPECTATOR: 1,
} as const;

export type RoomRole = (typeof ROOM_ROLE)[keyof typeof ROOM_ROLE];

export const ROOM_STATUS = {
  WAITING: 0,
  ACTIVE: 1,
  PAUSED: 2,
  FINISHED: 3,
} as const;

export type RoomStatus = (typeof ROOM_STATUS)[keyof typeof ROOM_STATUS];

export const ROOM_MODE = {
  MATCH: 0,
  TEST: 1,
} as const;

export type RoomMode = (typeof ROOM_MODE)[keyof typeof ROOM_MODE];

export interface RoomMember {
  userId: string;
  socketId: string;
  displayName: string;
  role: RoomRole;
  online: boolean;
}

export interface RoomStatePayload {
  id: string;
  code: string;
  ownerId: string;
  status: RoomStatus;
  mode: RoomMode;
  members: RoomMember[];
}

export interface RoomCreateCmd {
  requestId: number;
  mode?: RoomMode;
}

export interface RoomJoinCmd {
  requestId: number;
  code: string;
}

export interface RoomLeaveCmd {
  requestId: number;
  roomId: string;
}

export interface RoomStartCmd {
  requestId: number;
  roomId: string;
}

export interface AckOkPayload {
  requestId: number;
  /** Опциональный body — для ROOM_CREATE/JOIN это упакованный RoomState. */
  body?: Uint8Array;
}

export interface AckErrorPayload {
  requestId: number;
  code: string;
  message: string;
}

// ──────────────────────────────────────────────────────────────
// Turn-based слой (см. .claude/specs/match-rules.md)
// ──────────────────────────────────────────────────────────────

/** Фаза turn-based state machine. Wire-кодируется как u8. */
export const MATCH_PHASE = {
  WAITING: 0, // ждём release от текущего игрока
  ROLLING: 1, // физика крутится
  SELECTING: 2, // rest дошёл, игрок выбирает scoring-кости
  FINISHED: 3, // победитель определён
} as const;

export type MatchPhase = (typeof MATCH_PHASE)[keyof typeof MATCH_PHASE];

/** C→S: отложить указанные кости и перебросить остальные. */
export interface MatchSelectDiceCmd {
  requestId: number;
  roomId: string;
  /** Индексы из последнего rolledFaces, которые игрок хочет отложить (1..255 штук). */
  indices: number[];
}

/** C→S: отложить указанные кости и закрыть ход. */
export interface MatchBankCmd {
  requestId: number;
  roomId: string;
  indices: number[];
}

/** Накопленный счёт одного игрока для broadcast'а в MATCH_STATE. */
export interface MatchTotal {
  userId: string;
  total: number;
}

/** S→C broadcast: полная картина turn-based state machine. */
export interface MatchStatePayload {
  phase: MatchPhase;
  /** userId игрока, чей сейчас ход (пустая строка допустима только если фаза = FINISHED). */
  currentPlayer: string;
  /** true если игра временно остановлена из-за отсутствующего игрока. */
  paused: boolean;
  /** Человекочитаемая причина паузы; пустая строка если paused=false. */
  pauseReason: string;
  /** userId игроков из frozen player-list, которые сейчас online. */
  onlinePlayers: string[];
  /** Накоплено в текущем ходу до банка. */
  turnPoints: number;
  /** Сколько кубиков ещё в активной зоне (1..6). */
  remainingDice: number;
  /** Отложенные scoring-кости (faces 1..6) в порядке откладывания. */
  bench: number[];
  /** Накопленные totals по всем игрокам. */
  totals: MatchTotal[];
  /** userId победителя; пустая строка если ещё нет. */
  winner: string;
}

/** S→C broadcast: что выпало после очередного броска. */
export interface MatchRollResultPayload {
  /** Faces 1..6 в порядке индексов активных костей. */
  rolledFaces: number[];
  /** true если ни одной scoring-комбинации (ход сгорает). */
  bust: boolean;
}

/** S→C broadcast: итог хода (bank или bust). */
export interface MatchTurnResultPayload {
  userId: string;
  bust: boolean;
  /** Очки, добавленные в total (0 при bust). */
  banked: number;
  /** Итоговый total игрока после засчёта. */
  totalAfter: number;
}
