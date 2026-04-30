# Progress: current-sparc client

## Status: done

## Completed
- [x] Farkle scoring client mirror updated in `src/domain/scorer.ts`: `scoreRoll()` exposes smaller valid N-of-a-kind choices from 4/5/6 same-face rolls, while preserving the shared score table.
- [x] Auth UX added to `src/main.ts`: top-left registration/login controls; guests choose a display name, authenticated users use `@username` as display name.
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

## Verification
- [x] `npm run build` in `dice-client` passed after test-room changes.
- [x] `npm run build` in `dice-client` passed after `Назад`/destroy changes.
- [x] Built frontend bundle contains `Тестовая комната` and `Назад`.
- [x] `pm2 list` showed `dice-client` online after `dist` rebuild and watch restart.
- [x] Local nginx check for `https://farklepit.online/` returned `200`.
- [x] `npm run build` in `dice-client` passed after online physics/render optimization.

## Notes
- Public routing target is nginx on `80/443`; client preview remains internal on `127.0.0.1:5174`.
- For production, browser should call `/auth`, `/ws`, `/health` on the same origin, not `:3002`.
- `ecosystem.config.cjs` must be used instead of `.js` because `dice-client/package.json` has `"type": "module"`.
- Protocol files remain synced with server except the first marker comment.
- Hard refresh may be needed after rebuild because the Vite asset hash changes.
