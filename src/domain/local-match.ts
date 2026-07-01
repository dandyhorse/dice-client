import type { RoomOptionsPayload } from '../network/protocol/types';

export type LocalMatchPlayerId = 'human' | 'bot';
export type LocalMatchStatus = 'active' | 'human-won' | 'bot-won';

export interface LocalMatchPlayerState {
  totalScore: number;
  bankCount: number;
  bustCount: number;
  hotDiceCount: number;
  bestSingleTurnBank: number;
}

export interface LocalMatchConfig {
  targetScore: number;
  minBank: number;
  allowHotDice: boolean;
}

export interface LocalMatchState {
  status: LocalMatchStatus;
  currentPlayer: LocalMatchPlayerId;
  turnIndex: number;
  turnPoints: number;
  activeDiceCount: number;
  players: Record<LocalMatchPlayerId, LocalMatchPlayerState>;
}

export const createLocalMatchConfig = (options: RoomOptionsPayload): LocalMatchConfig => ({
  targetScore: options.targetScore,
  minBank: options.minBank,
  allowHotDice: options.allowHotDice,
});

export const createLocalMatch = (): LocalMatchState => ({
  status: 'active',
  currentPlayer: 'human',
  turnIndex: 1,
  turnPoints: 0,
  activeDiceCount: 6,
  players: {
    human: createPlayerState(),
    bot: createPlayerState(),
  },
});

export const isLocalMatchEnded = (state: LocalMatchState): boolean =>
  state.status !== 'active';

export const recordLocalMatchContinue = (
  state: LocalMatchState,
  config: LocalMatchConfig,
  points: number,
  diceUsed: number,
): LocalMatchState => {
  if (isLocalMatchEnded(state)) return state;
  const used = clampDiceUsed(diceUsed, state.activeDiceCount);
  const hotDice = config.allowHotDice && used >= state.activeDiceCount;
  return {
    ...state,
    turnPoints: state.turnPoints + points,
    activeDiceCount: hotDice ? 6 : Math.max(1, state.activeDiceCount - used),
    players: hotDice
      ? updatePlayer(state.players, state.currentPlayer, (player) => ({
          ...player,
          hotDiceCount: player.hotDiceCount + 1,
        }))
      : state.players,
  };
};

export const recordLocalMatchBank = (
  state: LocalMatchState,
  config: LocalMatchConfig,
  points: number,
  diceUsed: number,
): LocalMatchState => {
  if (isLocalMatchEnded(state)) return state;
  const used = clampDiceUsed(diceUsed, state.activeDiceCount);
  const hotDice = config.allowHotDice && used >= state.activeDiceCount;
  const banked = state.turnPoints + points;
  const current = state.currentPlayer;
  const totalScore = state.players[current].totalScore + banked;
  const status =
    totalScore >= config.targetScore ? (`${current}-won` as LocalMatchStatus) : 'active';

  return {
    status,
    currentPlayer: status === 'active' ? nextPlayer(current) : current,
    turnIndex: state.turnIndex + 1,
    turnPoints: 0,
    activeDiceCount: 6,
    players: updatePlayer(state.players, current, (player) => ({
      ...player,
      totalScore,
      bankCount: player.bankCount + 1,
      hotDiceCount: hotDice ? player.hotDiceCount + 1 : player.hotDiceCount,
      bestSingleTurnBank: Math.max(player.bestSingleTurnBank, banked),
    })),
  };
};

export const recordLocalMatchBust = (state: LocalMatchState): LocalMatchState => {
  if (isLocalMatchEnded(state)) return state;
  const current = state.currentPlayer;
  return {
    ...state,
    currentPlayer: nextPlayer(current),
    turnIndex: state.turnIndex + 1,
    turnPoints: 0,
    activeDiceCount: 6,
    players: updatePlayer(state.players, current, (player) => ({
      ...player,
      bustCount: player.bustCount + 1,
    })),
  };
};

const createPlayerState = (): LocalMatchPlayerState => ({
  totalScore: 0,
  bankCount: 0,
  bustCount: 0,
  hotDiceCount: 0,
  bestSingleTurnBank: 0,
});

const nextPlayer = (player: LocalMatchPlayerId): LocalMatchPlayerId =>
  player === 'human' ? 'bot' : 'human';

const clampDiceUsed = (diceUsed: number, activeDiceCount: number): number =>
  Math.max(0, Math.min(activeDiceCount, diceUsed));

const updatePlayer = (
  players: Record<LocalMatchPlayerId, LocalMatchPlayerState>,
  playerId: LocalMatchPlayerId,
  update: (player: LocalMatchPlayerState) => LocalMatchPlayerState,
): Record<LocalMatchPlayerId, LocalMatchPlayerState> => ({
  ...players,
  [playerId]: update(players[playerId]),
});
