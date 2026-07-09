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
  RANKED: 2,
} as const;

export type RoomMode = (typeof ROOM_MODE)[keyof typeof ROOM_MODE];

export const ROOM_SCORING_RULESET = {
  BASE_D6: 'base-d6',
} as const;

export type RoomScoringRuleset = (typeof ROOM_SCORING_RULESET)[keyof typeof ROOM_SCORING_RULESET];

export type RoomTargetScore = number;
export type RoomMinBank = number;

export interface RoomOptionsPayload {
  targetScore: RoomTargetScore;
  minBank: RoomMinBank;
  allowHotDice: boolean;
  scoringRuleset: RoomScoringRuleset;
}

export const DEFAULT_ROOM_OPTIONS: RoomOptionsPayload = {
  targetScore: 4000,
  minBank: 0,
  allowHotDice: true,
  scoringRuleset: ROOM_SCORING_RULESET.BASE_D6,
};

export const ROOM_TARGET_SCORE_MIN = 1000;
export const ROOM_TARGET_SCORE_MAX = 10000;
export const ROOM_TARGET_SCORE_STEP = 500;
export const ROOM_MIN_BANK_MIN = 0;
export const ROOM_MIN_BANK_MAX = 1000;
export const ROOM_MIN_BANK_STEP = 50;
export const DEFAULT_AVATAR_INDEX = 0;
export const MAX_AVATAR_INDEX = 0xffff;
export const DICE_PRESET_IDS = ['classic-stone', 'ivory-glow'] as const;
export type DicePresetId = (typeof DICE_PRESET_IDS)[number];
export const DEFAULT_DICE_PRESET_ID: DicePresetId = 'classic-stone';

const isStepAligned = (value: number, min: number, step: number): boolean =>
  (value - min) % step === 0;

const normalizeBoundedStepValue = (
  value: unknown,
  fallback: number,
  min: number,
  max: number,
  step: number,
): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value)) {
    return fallback;
  }
  if (value < min || value > max || !isStepAligned(value, min, step)) return fallback;
  return value;
};

export const normalizeRoomOptions = (
  options: Partial<RoomOptionsPayload> | undefined,
): RoomOptionsPayload => {
  const targetScore = normalizeBoundedStepValue(
    options?.targetScore,
    DEFAULT_ROOM_OPTIONS.targetScore,
    ROOM_TARGET_SCORE_MIN,
    ROOM_TARGET_SCORE_MAX,
    ROOM_TARGET_SCORE_STEP,
  );
  const minBank = normalizeBoundedStepValue(
    options?.minBank,
    DEFAULT_ROOM_OPTIONS.minBank,
    ROOM_MIN_BANK_MIN,
    ROOM_MIN_BANK_MAX,
    ROOM_MIN_BANK_STEP,
  );
  return {
    targetScore,
    minBank,
    allowHotDice: options?.allowHotDice ?? DEFAULT_ROOM_OPTIONS.allowHotDice,
    scoringRuleset:
      options?.scoringRuleset === ROOM_SCORING_RULESET.BASE_D6
        ? ROOM_SCORING_RULESET.BASE_D6
        : DEFAULT_ROOM_OPTIONS.scoringRuleset,
  };
};

export const normalizeAvatarIndex = (value: unknown): number => {
  const index =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;
  if (!Number.isInteger(index) || index < 0 || index > MAX_AVATAR_INDEX) {
    return DEFAULT_AVATAR_INDEX;
  }
  return index;
};

export const normalizeDicePresetId = (value: unknown): DicePresetId =>
  typeof value === 'string' && (DICE_PRESET_IDS as readonly string[]).includes(value)
    ? (value as DicePresetId)
    : DEFAULT_DICE_PRESET_ID;

export interface RoomMember {
  userId: string;
  socketId: string;
  displayName: string;
  avatarIndex: number;
  dicePresetId: DicePresetId;
  role: RoomRole;
  online: boolean;
}

export interface RoomStatePayload {
  id: string;
  code: string;
  gameName: string;
  hasPassword: boolean;
  ownerId: string;
  status: RoomStatus;
  mode: RoomMode;
  options: RoomOptionsPayload;
  members: RoomMember[];
}

export interface RoomCreateCmd {
  requestId: number;
  mode?: RoomMode;
  gameName?: string;
  password?: string;
  options?: Partial<RoomOptionsPayload>;
}

export interface RoomListCmd {
  requestId: number;
}

export interface RoomListItemPayload {
  id: string;
  code: string;
  gameName: string;
  hasPassword: boolean;
  ownerId: string;
  ownerDisplayName: string;
  status: RoomStatus;
  mode: RoomMode;
  playerCount: number;
  spectatorCount: number;
  canJoinAsPlayer: boolean;
  canSpectate: boolean;
}

export interface RoomListPayload {
  rooms: RoomListItemPayload[];
}

export interface RoomJoinCmd {
  requestId: number;
  code: string;
  password?: string;
}

export interface RoomQuickMatchCmd {
  requestId: number;
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

export const MATCH_FINISH_REASON = {
  NONE: 0,
  SCORE: 1,
  FORFEIT: 2,
  DISCONNECT: 3,
  EXIT: 4,
} as const;

export type MatchFinishReason = (typeof MATCH_FINISH_REASON)[keyof typeof MATCH_FINISH_REASON];

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

/** C→S: сдаться и завершить матч победой другого игрока. */
export interface MatchForfeitCmd {
  requestId: number;
  roomId: string;
}

/** C→S: запросить реванш после завершения матча. */
export interface MatchRematchCmd {
  requestId: number;
  roomId: string;
}

/** C→S: realtime preview текущего локального выбора без изменения turn-state. */
export interface MatchSelectionPreviewCmd {
  roomId: string;
  indices: number[];
}

/** S→C broadcast: realtime preview выбора активного игрока. */
export interface MatchSelectionPreviewPayload {
  userId: string;
  indices: number[];
  valid: boolean;
  points: number;
}

/** S→C broadcast: кто уже запросил реванш в завершённом матче. */
export interface MatchRematchStatePayload {
  requestedBy: string[];
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
  /** Почему матч завершён; NONE если победителя ещё нет. */
  finishReason: MatchFinishReason;
  /** Unix timestamp ms for ranked SELECTING timeout; 0 when no timer is active. */
  turnDeadlineAt: number;
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
