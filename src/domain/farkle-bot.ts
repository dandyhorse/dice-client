import { validateSelection } from './scorer';

export type FarkleBotAction = 'bank' | 'continue';

export interface FarkleBotContext {
  rolledFaces: number[];
  activeDiceCount: number;
  turnPoints: number;
  botTotal: number;
  humanTotal: number;
  targetScore: number;
  minBank: number;
  allowHotDice: boolean;
}

export interface FarkleBotSelection {
  rollIndices: number[];
  points: number;
  nextActiveDiceCount: number;
}

export interface FarkleBotDecision extends FarkleBotSelection {
  action: FarkleBotAction;
}

interface EvaluatedSelection extends FarkleBotSelection {
  value: number;
  canBank: boolean;
  immediateWin: boolean;
}

const BASE_BANK_THRESHOLDS = [0, 300, 250, 450, 1050, 3400, 10000] as const;
const ROLL_POTENTIAL = [0, 20, 60, 160, 360, 720, 1000] as const;
const DEFAULT_TURN_TARGET_RATIO = 0.45;
const SCORE_LEAD_MARGIN = 500;
const SCORE_NEAR_TARGET_MARGIN = 700;

export const chooseFarkleBotMove = (context: FarkleBotContext): FarkleBotDecision | null => {
  const selections = enumerateValidBotSelections(
    context.rolledFaces,
    context.activeDiceCount,
    context.allowHotDice,
  );
  if (selections.length === 0) return null;

  let best: EvaluatedSelection | null = null;
  for (const selection of selections) {
    const evaluated = evaluateSelection(context, selection);
    if (!best || isBetterSelection(evaluated, best)) best = evaluated;
  }

  if (!best) return null;
  return {
    action: best.canBank ? 'bank' : 'continue',
    rollIndices: best.rollIndices,
    points: best.points,
    nextActiveDiceCount: best.nextActiveDiceCount,
  };
};

export const enumerateValidBotSelections = (
  rolledFaces: number[],
  activeDiceCount = rolledFaces.length,
  allowHotDice = true,
): FarkleBotSelection[] => {
  const out: FarkleBotSelection[] = [];
  const count = Math.min(rolledFaces.length, Math.max(1, activeDiceCount));

  for (let mask = 1; mask < 1 << rolledFaces.length; mask++) {
    const rollIndices: number[] = [];
    for (let i = 0; i < rolledFaces.length; i++) {
      if ((mask & (1 << i)) !== 0) rollIndices.push(i);
    }

    const validation = validateSelection(rolledFaces, rollIndices);
    if (validation.valid !== true) continue;
    out.push({
      rollIndices,
      points: validation.points,
      nextActiveDiceCount:
        allowHotDice && rollIndices.length >= count ? 6 : Math.max(1, count - rollIndices.length),
    });
  }

  return out;
};

export const adjustedBotBankThreshold = (
  nextActiveDiceCount: number,
  context: Pick<
    FarkleBotContext,
    'botTotal' | 'humanTotal' | 'targetScore' | 'minBank'
  >,
): number => {
  const diceCount = clampDiceCount(nextActiveDiceCount);
  const softTurnTarget = Math.max(
    context.minBank,
    roundToStep(context.targetScore * DEFAULT_TURN_TARGET_RATIO, 50),
  );
  let threshold = Math.min(BASE_BANK_THRESHOLDS[diceCount], softTurnTarget);
  const scoreDiff = context.botTotal - context.humanTotal;

  if (scoreDiff >= SCORE_LEAD_MARGIN) threshold -= 200;
  if (scoreDiff <= -SCORE_LEAD_MARGIN) threshold += 250;
  if (context.humanTotal >= context.targetScore - SCORE_NEAR_TARGET_MARGIN) threshold += 250;
  if (context.botTotal >= context.targetScore - SCORE_NEAR_TARGET_MARGIN) threshold -= 150;

  return Math.max(context.minBank, roundToStep(threshold, 50));
};

const evaluateSelection = (
  context: FarkleBotContext,
  selection: FarkleBotSelection,
): EvaluatedSelection => {
  const nextTurnPoints = context.turnPoints + selection.points;
  const immediateWin = context.botTotal + nextTurnPoints >= context.targetScore;
  const bankThreshold = adjustedBotBankThreshold(selection.nextActiveDiceCount, context);
  const canBank =
    immediateWin || (nextTurnPoints >= context.minBank && nextTurnPoints >= bankThreshold);
  const potential = canBank ? 40 : ROLL_POTENTIAL[clampDiceCount(selection.nextActiveDiceCount)];

  return {
    ...selection,
    canBank,
    immediateWin,
    value: (immediateWin ? 100000 : 0) + nextTurnPoints + potential,
  };
};

const isBetterSelection = (candidate: EvaluatedSelection, current: EvaluatedSelection): boolean => {
  if (candidate.value !== current.value) return candidate.value > current.value;
  if (candidate.immediateWin !== current.immediateWin) return candidate.immediateWin;
  if (candidate.canBank !== current.canBank) return candidate.canBank;
  if (candidate.nextActiveDiceCount !== current.nextActiveDiceCount) {
    return candidate.nextActiveDiceCount > current.nextActiveDiceCount;
  }
  if (candidate.points !== current.points) return candidate.points > current.points;
  return candidate.rollIndices.length > current.rollIndices.length;
};

const clampDiceCount = (count: number): 1 | 2 | 3 | 4 | 5 | 6 => {
  if (count <= 1) return 1;
  if (count >= 6) return 6;
  return Math.round(count) as 1 | 2 | 3 | 4 | 5 | 6;
};

const roundToStep = (value: number, step: number): number =>
  Math.round(value / step) * step;
