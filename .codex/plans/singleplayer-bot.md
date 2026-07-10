# Singleplayer Bot Plan

## Goal

Add a first main-menu item, `Одиночная игра`, styled like `Быстрая игра`. Selecting it starts a client-only match immediately: human player versus a local bot. The server must not participate in this mode; dice physics, scoring, turn flow, and bot decisions all run in the browser.

## Current Local Context

- Local physics already exists in `GameEngine` local mode. `ShakeInputService.triggerKeyboardThrow()` can throw dice without mouse input, so the bot can roll using the same client-side Cannon-ES path as the player.
- The old single-player score attack/practice flow (`src/domain/solo-run.ts` + `SoloUiService`) has been removed. Singleplayer now means only the local human-vs-bot match.
- Scoring rules already live in `src/domain/scorer.ts`. The bot must use `scoreRoll()` and `validateSelection()` instead of duplicating Farkle rules.

## Research Notes

- Farkle is a stochastic push-your-luck game: after a scoring roll, the player chooses which dice to keep and whether to bank or roll again.
- Optimal two-player Farkle can be solved with dynamic programming/value iteration over score state, turn total, dice count, and roll result, but that state space is larger than we need for a first bot.
- A simpler expected-score strategy is enough for v1: define `T(n, t)` as the expected banked turn total from `n` active dice and current turn total `t`; after a roll, choose the valid scoring selection that maximizes the next state's value.
- The expected-score strategy can then be tweaked by match context: be more conservative when ahead, more aggressive when behind, and go for it near the target score.
- Generic AI vocabulary: this is an `expectimax`/expected-value problem, not minimax. Chance nodes are dice outcomes, and bot-controlled nodes are selection/bank decisions.
- Monte Carlo search/MCTS is not the right v1 default here. It is useful for broad game trees, but for six dice we can enumerate all roll outcomes and all scoring subsets cheaply.

Sources:

- Matt Busche, "Maximizing Win Probability in the Game of Farkle": https://www.mattbusche.org/blog/article/optimal_farkle/
- Todd W. Neller and Matthew Busche, "Optimal Play of the Farkle Dice Game": https://cs.gettysburg.edu/~tneller/papers/acg2017.pdf
- Berkeley CS188, "Expectimax": https://inst.eecs.berkeley.edu/~cs188/textbook/games/expectimax.html

## Cheap Bot Decision Model

Use two small pure modules:

1. `local-match.ts`
   - State: `targetScore`, `minBank`, `currentPlayer: 'human' | 'bot'`, player totals, turn points, active dice count, status. Hot dice are always enabled.
   - Actions: `startRoll`, `finishRoll`, `continueWithSelection`, `bankWithSelection`, `bust`, `surrender/reset`.

2. `farkle-bot.ts`
   - Input: rolled faces, active dice count, bot/human totals, bot turn points, room options.
   - Output:
     - selected roll indices;
     - selected points;
     - next action: `bank` or `continue`.

Selection can be brute-force:

- There are at most 6 dice, so only 63 non-empty subsets.
- For each subset, call `validateSelection(rolledFaces, subset)`.
- For each valid subset, compute:
  - `nextTurnPoints = turnPoints + points`;
  - `nextDiceCount = usedAllActiveDice ? 6 : activeDiceCount - usedCount`;
  - `value = expectedTurnValue(nextDiceCount, nextTurnPoints)`.
- Pick the subset with maximum value. Tie-breakers:
  - immediate win first;
  - banking state before non-banking state;
  - more remaining dice before fewer remaining dice;
  - higher immediate points last.

Banking can use a cached expected-value table:

```text
value(n, t) = max(t, average over all rolls of best next value)
```

For our current `src/domain/scorer.ts` rules, a quick exact enumeration produced these expected-score bank thresholds with no target-score cap:

| Active dice after selection | Bank threshold |
| --- | ---: |
| 1 | 150 |
| 2 | 250 |
| 3 | 450 |
| 4 | 1050 |
| 5 | 3400 |
| 6 | >10000 |

These numbers should not be hardcoded blindly as "perfect play". They are a baseline for v1 and should be capped by match context, especially because the default local/multiplayer target score is currently 4000.

## Bot Personality V1

Straightforward and readable:

- Always select the best scoring subset from the current roll.
- Always bank if the selected points immediately reach `targetScore`.
- Respect `minBank`.
- With one active die left, bank earlier than the exact expected-score baseline so the bot does not over-risk tiny single-die rerolls.
- If ahead by at least 500, bank about 150-250 points earlier than the baseline threshold.
- If behind by at least 500, bank about 150-250 points later than the baseline threshold.
- If the human is within one normal turn of winning, raise aggression rather than banking small safe totals.
- Add a small action delay, around 500-900 ms, so the bot feels like it is taking a turn and UI state changes are readable.
- No random bad moves in v1. If difficulty is added later, randomness should be explicit as a difficulty setting.

## Implementation Steps

1. Add a visible first lobby button: `Одиночная игра` / `Singleplayer`, same background color as quick game when quick search is not active.
2. Add a new local match config/option to `GameEngine`.
3. Add `local-match.ts` state transitions and focused tests for bust, continue, hot dice, bank, win, and turn handoff.
4. Add `farkle-bot.ts` with tests for:
   - brute-force best selection;
   - bank/continue thresholds;
   - immediate win;
   - min-bank handling;
   - ahead/behind aggression adjustment.
5. Add/extend a local 1v1 HUD so it shows human total, bot total, current player, turn points, active dice, selected points, and final win/loss actions.
6. Wire `GameEngine` local mode:
   - human turn uses existing input/selection flow;
   - bot turn disables human input, calls `triggerKeyboardThrow()`, waits for rest, chooses, then banks or continues.
7. Verify with `npm run build` from `dice-client/`.

## Non-Goals For V1

- No server connection, room creation, auth identity, persistent statistics, or network protocol.
- No ML, neural network, or MCTS.
- No perfect optimal two-player solver in the first implementation.
- No hidden server-side bot.

## Implementation Checkpoint

Implemented v1 client-only singleplayer bot mode:

- Added first lobby button `Одиночная игра` / `Singleplayer`, styled with the same teal as quick game.
- Added pure local 1v1 state in `src/domain/local-match.ts`.
- Added lightweight bot decision logic in `src/domain/farkle-bot.ts`.
- Reused the multiplayer `HudUiService` for singleplayer by adapting local state into
  `RoomStatePayload` / `MatchStatePayload`; local and network matches now share the same game UI.
- Removed the old `solo-run` / `SoloUiService` flow; `GameEngine` local singleplayer now runs only the human-vs-bot local match.
- Bot rolls through the same local `ShakeInputService.triggerKeyboardThrow()` path as the player.
- No server or protocol changes are required for this mode.

Verification:

- `npm run build` in `dice-client/` passed.
- `git diff --check` in `dice-client/` passed.

## Shared HUD Refactor Checkpoint

The temporary `LocalMatchUiService` was removed. Singleplayer now creates synthetic local players
(`local-human`, `local-bot`) and feeds the regular `HudUiService`, so score panels, action buttons,
turn banners, FARKLE/WIN overlay, surrender confirmation, and final exit UI come from one component
for both modes.
