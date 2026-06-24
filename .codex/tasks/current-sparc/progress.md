# Progress: current-sparc client

## Status: done

## Completed
- [x] Farkle scoring client mirror updated in `src/domain/scorer.ts`: `scoreRoll()` exposes smaller valid N-of-a-kind choices from 4/5/6 same-face rolls, while preserving the shared score table.
- [x] Auth UX added to `src/main.ts`: top-left registration/login controls; guests choose a display name, authenticated users use their registered username as display name.
- [x] Production server URL fixed in `src/engine/config.ts`: production uses `window.location.origin`, avoiding hardcoded `:3002` and CORS/mixed-origin failures behind nginx.
- [x] Client PM2 setup added in `ecosystem.config.cjs`: `npm run preview -- --host 0.0.0.0 --port 5174`, watching `dist`.
- [x] Room protocol mirror extended with `ROOM_MODE.MATCH | ROOM_MODE.TEST` in `src/network/protocol/types.ts` and `src/network/protocol/codecs.ts`.
- [x] Lobby gained `Тестовая комната`: creates an active free-play test room for multi-screen physics checks.
- [x] `GameEngine` supports test rooms without turn HUD/selection: any player in a test room can throw while the room is active and not rolling.
- [x] Added bottom-right `Назад` button in lobby room screen, network game, and local game.
- [x] Added cleanup path for leaving game: `GameEngine.destroy()`, `ShakeInputService.destroy()`, `SelectionService.destroy()`, and WS disconnect via `NetworkService.disconnect()`.
- [x] Network dice rendering optimized: `DiceService` now buffers server snapshots and interpolates at `now - INTERPOLATION_DELAY_MS`, using extrapolation only as a short fallback.
- [x] Release-start latency reduced: interpolation delay now ramps from 0 to 50ms over 120ms after the first visible snapshot of a new roll.
- [x] Network render cost reduced for FPS: pixel ratio capped at 1, antialias disabled in network mode, and dynamic shadows disabled in network mode.
- [x] Dice face textures are shared across dice; face materials remain per-die so emissive selection highlights do not leak between dice.
- [x] Optional perf overlay added via `?perf` or `localStorage.setItem('dice:perf', '1')`, showing FPS/frame/render/snapshot gap stats.
- [x] Solo game flow added: `src/domain/solo-run.ts`, local solo HUD, dice selection/scoring, and game-engine local solo lifecycle.
- [x] Main lobby split into `Singleplayer` and `Multiplayer` creation screens; singleplayer selects solo mode, multiplayer keeps room creation/join controls.
- [x] Multiplayer room creation now sends room options (`targetScore`, `minBank`, hot-dice enabled) through the shared protocol mirror.
- [x] Local EN/RU UI dictionary added in `src/ui/i18n.ts`; language switcher is rendered top-right and strings are kept client-side for PWA/offline readiness.
- [x] Local UI fonts added under `public/fonts/`: Uncial Antiqua for logo/title/player name and EB Garamond for UI text.
- [x] UI scale/fonts centralized in `src/ui/theme.ts`; lobby, auth controls, room screens, multiplayer HUD, and solo HUD use shared font/size tokens instead of per-file hardcoded font sizes.
- [x] Auth player label restyled: top-left username uses the title/logo font, no leading `@`, and logout is a compact `×` icon button with tooltip/ARIA label.
- [x] Stable UI control sizing added: auth buttons, language buttons, menu buttons, form controls, and HUD buttons no longer resize based on label length.
- [x] Table/gameplay visual pass completed: invisible physical walls, fullscreen visual tabletop, wood texture/normal/roughness assets, shifted high-resolution shadows, and stone-textured dice faces with retained pips.
- [x] Throw release positions are clamped to a safe table zone before local/network release so dice cannot be spawned outside the physical arena or inside the wall.
- [x] Client-side local dice physics tuned to match server: heavier dice mass (`DICE_MASS = 0.6`) and calmer dice-to-dice contact (`friction 0.35`, `restitution 0.12`) while preserving previous flight damping (`0.1/0.1`).
- [x] Multiplayer social v1 UI added: named game creation, ranked mode selection, lobby/game browser modal, spectator join from active games, and homepage leaderboard panel.
- [x] Ranked client UX hides scoring-combination hints and dice highlights while keeping invalid dice clicks blocked and showing turn/banked score information.
- [x] Client protocol mirror now includes `ROOM_MODE.RANKED`, `gameName`, room-list payloads, and ranked turn deadline state.
- [x] Multiplayer table view constrained from fullscreen tabletop to a fixed square table footprint (`TABLE_WIDTH = 9`, `TABLE_DEPTH = 9`) with visible rim, leaving surrounding space for game labels and future table expansion.
- [x] Dice selection feedback moved from cube material emissive highlights to flat ring markers rendered under dice; local hints, local selected dice, and remote selected dice now share the same marker system.
- [x] Realtime selection preview added on the client: local selection changes send fire-and-forget `MATCH_SELECTION_PREVIEW_CMD`, and remote `MATCH_SELECTION_PREVIEW` broadcasts are rendered for the active opponent.
- [x] Turn bench display added with non-interactive 3D dice in world space next to the table, using the same dice mesh scale as table dice and matching the faces selected during the current turn.
- [x] 1v1 HUD layout updated: own score panel is top-left, opponent score panel is bottom-left; multi-player score layout remains a future case.
- [x] Finished-room handling added: when the server broadcasts `ROOM_STATUS.FINISHED`, the client returns players to the main lobby instead of leaving them in a stale game view.
- [x] Main menu v2 checkpoint added: quick game, create room, join room; singleplayer/ranked/login buttons are hidden on the frontend for now.
- [x] Player name entry moved to first-launch localStorage flow, with name/language/settings controls in the top menu.
- [x] Settings, create-room, and join-room views now replace the main menu and return via `ESC`.
- [x] Quick-search now keeps the loading overlay while waiting for a second player, hides the waiting lobby, and cancels via `ESC` by leaving the pseudo-room.
- [x] Game HUD controls, FARKLE overlay, turn banners, player panels, realtime selected-points display, and auto-reroll-after-continue were updated for the current multiplayer UI pass.
- [x] Background texture `public/assets/background/background_texture_2.png` is rendered behind the table without dither/vignette/color effects.
- [x] Table view was reduced back after the oversized pass; dice size is synced at `DICE_HALF_SIZE = 0.26` with spacing `0.71`, while wall collision thickness/inset remain reduced.
- [x] Current checkpoint intentionally preserves the overloaded quick-game/menu code as-is for a follow-up refactor pass.
- [x] Quick-match race note recorded: do not replay cached `MATCH_STATE`/`MATCH_DICE_SPAWN` into `GameEngine`; preload gameplay assets before sending `ROOM_QUICK_MATCH` so live server events arrive after listeners are installed.
- [x] End-of-match multiplayer UI added: table dice are hidden after `MATCH_TURN_RESULT`, finished games keep players in the game view, winner sees persistent `WIN`, loser sees persistent `FARKLE`, and final buttons emit exit/rematch actions.

## Verification
- [x] `npm run build` in `dice-client` passed after test-room changes.
- [x] `npm run build` in `dice-client` passed after `Назад`/destroy changes.
- [x] Built frontend bundle contains `Тестовая комната` and `Назад`.
- [x] `pm2 list` showed `dice-client` online after `dist` rebuild and watch restart.
- [x] Local nginx check for `https://farklepit.online/` returned `200`.
- [x] `npm run build` in `dice-client` passed after online physics/render optimization.
- [x] `npm run build` in `dice-client` passed after solo/multiplayer split, i18n/fonts, centralized theme sizing, and compact logout button changes.
- [x] `npm run build` in `dice-client` passed after table/dice texture, safe throw bounds, shadow quality, and dice physics tuning.
- [x] `npm run build` in `dice-client` passed after multiplayer social v1/ranked UI changes.
- [x] `npm run build` in `dice-client` passed after table sizing, selection rings, realtime remote selection, turn bench dice, duel HUD layout, and finished-room return handling.
- [x] `npm run build` in `dice-client` passed after quick-search loading/cancel, table rollback, dice size sync, and raw background texture changes.
- [x] `npm run build` in `dice-client` passed after reverting quick-match cached-event replay and preloading gameplay assets before quick-match send.
- [x] `npm run build` in `dice-client` passed after end-of-match WIN/FARKLE, dice cleanup, and rematch UI wiring.
- [x] `git diff --check` in `dice-client` passed before checkpoint commit.

## Notes
- Public routing target is nginx on `80/443`; client preview remains internal on `127.0.0.1:5174`.
- For production, browser should call `/auth`, `/ws`, `/health` on the same origin, not `:3002`.
- `ecosystem.config.cjs` must be used instead of `.js` because `dice-client/package.json` has `"type": "module"`.
- Protocol files remain synced with server except the first marker comment.
- Hard refresh may be needed after rebuild because the Vite asset hash changes.
- Dev server and pm2 were intentionally not touched during the latest UI iterations; only production builds were run.
- Latest pushed client commit: `abd32d2 Update dice table visuals and physics`.
- Dev server and pm2 were intentionally not touched during social v1 work; only production build was run.
- Current UI batch keeps the 1v1 case primary; score placement for more than two players is intentionally left for a separate pass.
- Selection preview protocol files remain mirrored with the server protocol files except the optional first marker comment.
- Next cleanup target: split `src/main.ts` menu/quick-search flow into smaller stateful modules and remove race-prone coupling between loading overlay, lobby render, network callbacks, and `ESC`.
