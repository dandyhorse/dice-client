export type SoloModeId =
  | 'practice'
  | 'score-attack-short'
  | 'score-attack-classic'
  | 'score-attack-long'
  | 'target-easy'
  | 'target-classic'
  | 'target-hard'
  | 'target-long';

export type SoloRunStatus = 'active' | 'won' | 'lost' | 'finished';
export type SoloScoringRuleset = 'base-d6';

export interface SoloModeConfig {
  id: SoloModeId;
  title: string;
  description: string;
  turnLimit?: number;
  targetScore?: number;
  allowHotDice: boolean;
  scoringRuleset: SoloScoringRuleset;
}

export interface SoloHistoryEntry {
  turnIndex: number;
  result: 'bank' | 'bust';
  banked: number;
  totalScore: number;
  burned: number;
}

export interface SoloRunState {
  modeId: SoloModeId;
  status: SoloRunStatus;
  totalScore: number;
  turnScore: number;
  turnIndex: number;
  activeDiceCount: number;
  bustCount: number;
  bankCount: number;
  hotDiceCount: number;
  bestSingleTurnBank: number;
  history: SoloHistoryEntry[];
}

const HISTORY_LIMIT = 12;

export const SOLO_MODE_CONFIGS: SoloModeConfig[] = [
  {
    id: 'practice',
    title: 'Practice',
    description: 'Свободная тренировка без победы и поражения.',
    allowHotDice: true,
    scoringRuleset: 'base-d6',
  },
  {
    id: 'score-attack-short',
    title: 'Score Attack Short',
    description: 'Максимум очков за 5 ходов.',
    turnLimit: 5,
    allowHotDice: true,
    scoringRuleset: 'base-d6',
  },
  {
    id: 'score-attack-classic',
    title: 'Score Attack Classic',
    description: 'Максимум очков за 10 ходов.',
    turnLimit: 10,
    allowHotDice: true,
    scoringRuleset: 'base-d6',
  },
  {
    id: 'score-attack-long',
    title: 'Score Attack Long',
    description: 'Максимум очков за 20 ходов.',
    turnLimit: 20,
    allowHotDice: true,
    scoringRuleset: 'base-d6',
  },
  {
    id: 'target-easy',
    title: 'Easy Target',
    description: 'Набрать 3000 за 10 ходов.',
    targetScore: 3000,
    turnLimit: 10,
    allowHotDice: true,
    scoringRuleset: 'base-d6',
  },
  {
    id: 'target-classic',
    title: 'Classic Target',
    description: 'Набрать 4000 за 8 ходов.',
    targetScore: 4000,
    turnLimit: 8,
    allowHotDice: true,
    scoringRuleset: 'base-d6',
  },
  {
    id: 'target-hard',
    title: 'Hard Target',
    description: 'Набрать 6000 за 10 ходов.',
    targetScore: 6000,
    turnLimit: 10,
    allowHotDice: true,
    scoringRuleset: 'base-d6',
  },
  {
    id: 'target-long',
    title: 'Long Target',
    description: 'Набрать 10000 за 15 ходов.',
    targetScore: 10000,
    turnLimit: 15,
    allowHotDice: true,
    scoringRuleset: 'base-d6',
  },
];

export const DEFAULT_SOLO_MODE = SOLO_MODE_CONFIGS[0]!;

export const getSoloModeConfig = (id: string): SoloModeConfig =>
  SOLO_MODE_CONFIGS.find((mode) => mode.id === id) ?? DEFAULT_SOLO_MODE;

export const createSoloRun = (config: SoloModeConfig): SoloRunState => ({
  modeId: config.id,
  status: 'active',
  totalScore: 0,
  turnScore: 0,
  turnIndex: 1,
  activeDiceCount: 6,
  bustCount: 0,
  bankCount: 0,
  hotDiceCount: 0,
  bestSingleTurnBank: 0,
  history: [],
});

export const isSoloRunEnded = (state: SoloRunState): boolean => state.status !== 'active';

export const recordSoloContinue = (
  state: SoloRunState,
  config: SoloModeConfig,
  points: number,
  diceUsed: number,
): SoloRunState => {
  if (isSoloRunEnded(state)) return state;
  const used = Math.max(0, Math.min(state.activeDiceCount, diceUsed));
  const hotDice = config.allowHotDice && used >= state.activeDiceCount;
  return {
    ...state,
    turnScore: state.turnScore + points,
    activeDiceCount: hotDice ? 6 : Math.max(1, state.activeDiceCount - used),
    hotDiceCount: hotDice ? state.hotDiceCount + 1 : state.hotDiceCount,
  };
};

export const recordSoloBank = (
  state: SoloRunState,
  config: SoloModeConfig,
  points: number,
  diceUsed = 0,
): SoloRunState => {
  if (isSoloRunEnded(state)) return state;
  const banked = state.turnScore + points;
  const totalScore = state.totalScore + banked;
  const hotDice = config.allowHotDice && diceUsed >= state.activeDiceCount;
  return finishSoloTurn(
    {
      ...state,
      totalScore,
      turnScore: 0,
      bankCount: state.bankCount + 1,
      hotDiceCount: hotDice ? state.hotDiceCount + 1 : state.hotDiceCount,
      bestSingleTurnBank: Math.max(state.bestSingleTurnBank, banked),
      history: appendHistory(state.history, {
        turnIndex: state.turnIndex,
        result: 'bank',
        banked,
        totalScore,
        burned: 0,
      }),
    },
    config,
  );
};

export const recordSoloBust = (state: SoloRunState, config: SoloModeConfig): SoloRunState => {
  if (isSoloRunEnded(state)) return state;
  return finishSoloTurn(
    {
      ...state,
      turnScore: 0,
      bustCount: state.bustCount + 1,
      history: appendHistory(state.history, {
        turnIndex: state.turnIndex,
        result: 'bust',
        banked: 0,
        totalScore: state.totalScore,
        burned: state.turnScore,
      }),
    },
    config,
  );
};

const finishSoloTurn = (state: SoloRunState, config: SoloModeConfig): SoloRunState => {
  if (config.targetScore !== undefined && state.totalScore >= config.targetScore) {
    return {
      ...state,
      status: 'won',
      activeDiceCount: 6,
    };
  }

  if (config.turnLimit !== undefined && state.turnIndex >= config.turnLimit) {
    return {
      ...state,
      status: config.targetScore === undefined ? 'finished' : 'lost',
      activeDiceCount: 6,
    };
  }

  return {
    ...state,
    turnIndex: state.turnIndex + 1,
    activeDiceCount: 6,
  };
};

const appendHistory = (
  history: SoloHistoryEntry[],
  entry: SoloHistoryEntry,
): SoloHistoryEntry[] => [entry, ...history].slice(0, HISTORY_LIMIT);
