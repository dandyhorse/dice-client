# Progress: pivot → State sync with extrapolation

## Status: done (работает визуально хорошо; причесать код завтра)

## Что в итоге реализовано (финальная архитектура)

**НЕ** lockstep (как изначально задумывалось). После двух итераций выяснилось что
подход "оба клиента крутят свою физику с одинаковыми inputs" не даёт идентичной
картинки — cannon-es не bitwise-детерминистичен между Node и browser V8,
траектории расходятся за 1-2 сек.

Финальный подход — **classic server state sync** (Fiedler):
- Сервер крутит физику, source-of-truth
- Шлёт `match:dice-snapshot { tick, dice: [{p, q, v, w}] }` каждые ~16 мс (60 Гц)
- Клиент хранит последний state + **экстраполирует** между снапшотами через
  `p + v*dt` и поворот по `w*dt`
- Ноль локальной cannon-es симуляции на клиенте в network-mode
- Оба клиента зеркалят один и тот же серверный state → видят ровно одно и то же

## Completed
- [x] **Server** `physics-world.class.ts`: `Snapshot` включает `v` и `w`; `start(onTick, onSnapshot)` — physics + snapshot emit каждые `snapshotEvery` ticks
- [x] **Server** `match.service.ts`: `MatchCallbacks { onSnapshot, onRest }`; release запускает physics loop и шлёт первый снапшот сразу (без задержки первого тика)
- [x] **Server** `match-handlers.ts`: нет `match:throw-start` broadcast'а — чистый state sync
- [x] **Server** `socket-server.ts`: `buildMatchCallbacks` возвращает и `onSnapshot`, и `onRest`; эмитит `match:dice-snapshot` и `match:dice-rest`
- [x] **Client** `network.service.ts`: `DieStateFull` с `p/q/v/w`; handler на `match:dice-snapshot` → event `dice-snapshot`; убраны all throw-start / buffer / lockstep-шняги
- [x] **Client** `dice.service.ts`: в network-mode НЕТ cannon body, хранит `{p, q, v, w, lastUpdateMs}` per-die. `applySnapshot(dice, now)` — обновляет state + сразу рисует меш. `extrapolate(now)` — между снапшотами двигает меш по `p + v*dt` и поворачивает по `w*dt`. `MAX_EXTRAPOLATION_MS = 250` страхует от бесконечного улёта при droppe снапшотах.
- [x] **Client** `game-engine.class.ts`: в network-mode физ-мир не создаётся (только визуалы стола/стен). `gameLoop`: local → `world.step + syncMeshes`, network → `dice.extrapolate(now)`. Release handler: local → `dice.release`, network → `network.sendRelease` (ничего локально).
- [x] Builds зелёные, pm2 подхватил, юзер подтвердил что визуально хорошо

## Remaining (следующая сессия)
- [ ] **Причёска кода** — название задачи `deterministic-lockstep/` стало неточным после pivot'а (в итоге state sync). Переименовать папку в `network-physics-state-sync/` или что-то подобное, обновить ссылки.
- [ ] Закрыть старый task `client-prediction/` — там в progress есть ссылка на lockstep, тоже устарело.
- [ ] Удалить мёртвый код: `NetworkService.getUserId` больше не нужен — никто не сверяет initiatorUserId.
- [ ] Специфика клиента: `DiceService` разросся с разными ветками под mode. Подумать про split: `LocalDiceService` / `RemoteDiceService`, либо interface + две реализации.
- [ ] Обновить спеку `dice-server/.claude/specs/network-physics.md` — там в протоколе описаны `match:dice-spawn/snapshot/rest` как state sync, это совпадает с финалом. Но часть про spin генерацию на сервере / lockstep убрать.
- [ ] (опц.) UI для face values из `match:dice-rest`
- [ ] (опц.) Адаптивная экстраполяция: если снапшоты приходят неравномерно (drift Node `setInterval`), можно усреднять интервал и корректировать. Пока достаточно текущего наивного `p + v*dt`.

## Notes
- Bandwidth: 60 Hz × (тик:number + 2 кости × [p:3 + q:4 + v:3 + w:3] × 4 байта JSON + socket.io overhead) ≈ 6-8 KB/s на клиента. Норм.
- Server `setInterval` на 120 Hz физика + 60 Hz снапшот. Node не гарантирует точность — небольшой дрейф, но extrapolation на клиенте это гасит.
- Rest-snap: просто последний снапшот с `v=w=0`. Нет специальной логики "snap к серверу" — бесшовно вписывается в общий state-sync поток.
