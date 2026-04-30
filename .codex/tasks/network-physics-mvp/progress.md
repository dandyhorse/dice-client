# Progress: Network Physics MVP (client)

## Status: done (MVP код и билд; ручной two-window тест — за пользователем)

## Completed
- [x] `npm i socket.io-client`
- [x] `src/engine/config.ts` — `INTERPOLATION_DELAY_MS = 100`, `SERVER_URL` (через `import.meta.env.VITE_SERVER_URL`, fallback `http://localhost:3001`)
- [x] `src/engine/classes/_game-engine/services/snapshot-buffer.class.ts` — буфер снапшотов (до 12), `push/clear/sample(renderTime)` с lerp+slerp между соседними снапшотами
- [x] `src/engine/classes/_game-engine/services/network.service.ts` — socket.io-client wrapper, `connect/disconnect/createRoom/joinRoom/sendRelease/sampleDiceState`, эмитит `room-state`, `dice-spawn`, `dice-snapshot`, `dice-rest`
- [x] `DiceService` — поддержка `mode: 'local' | 'network'`, `applySnapshot()`; в network mode body не добавляется в world, меш скрыт до первого снапшота
- [x] `GameEngine` — `GameEngineOptions { mode, network }`; в network mode не создаём contact materials/ceiling body; gameLoop в network: `network.sampleDiceState(now) → dice.applySnapshot()`; release из input в network-mode уходит в `network.sendRelease`
- [x] `main.ts` — DOM-lobby с Create/Join/Play Local, userId из `localStorage`, badge с room code после join
- [x] `npm run build` зелёный

## Remaining
- [ ] Ручной тест: `cd dice-server && npm run dev` + открыть два окна клиента, в первом Create, во втором Join по коду → бросок в обоих окнах синхронный
- [ ] (опц.) Индикация статуса подключения, reconnect UI
- [ ] (опц.) `match:dice-rest` — показать face values в UI

## Notes
- В network mode `ShakeInputService` не менялся — `GameEngine` перехватывает событие `release` и в network-режиме маршрутизирует в `NetworkService`, иначе — в `DiceService` (так local-режим остаётся рабочим для регрессий).
- Spin костей генерирует сервер (см. `PhysicsWorld.applyRelease`), клиент свой spin не считает.
- При receive `match:dice-spawn` — применяем напрямую через `DiceService.applySnapshot` (минуя буфер; буфер только для движения).
- `SnapshotBuffer.sample(renderTime)` не экстраполирует за пределами буфера — возвращает ближайший снапшот. Это даёт небольшой фриз вместо улёта при пропаже пакетов.
- Local mode по-прежнему доступен через кнопку "Play local (no server)" в lobby — для регрессий физики без подключения.
