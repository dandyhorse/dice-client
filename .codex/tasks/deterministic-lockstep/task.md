# Task: Deterministic lockstep (оба клиента крутят свою физику)

## Почему

Client-side prediction делает бросающему плавно, но observer видит рывки из-за snapshot-стриминга (jitter сети + дрейф Node setInterval, интерполяция по client-receive-time). Для физической игры с короткими event'ами (бросок 1-3 сек) правильно не стримить state, а отдать **параметры броска** обоим клиентам и дать им симулировать локально.

Это классический deterministic lockstep (Gaffer On Games). Cannon-es одна версия, оба на V8 — физика будет идентична до плавающих погрешностей. Расхождение на коротком броске незаметно, серверный `dice-rest` финально выравнивает.

## Протокол (что меняется)

### Новое событие: `match:throw-start` (server → room)
Сервер шлёт при любом release. Payload:
```ts
{
  initiatorUserId: string,
  velocity: [number, number, number],
  position: [number, number, number],
  dice: [{ q: [x,y,z,w], angVel: [x,y,z] }]  // по одному элементу на кость, порядок = DICE_COUNT
}
```

### Удаляется (точнее — сервер перестаёт слать)
- `match:dice-snapshot` — больше не нужен. Клиент может оставить пустой handler на всякий случай.

### Остаются без изменений
- `match:release` (client → server) — как сейчас, `{ roomId, velocity, position }`
- `match:dice-spawn` (server → socket, на join) — текущая раскладка костей для свежего наблюдателя
- `match:dice-rest` (server → room) — финальная авторитативная поза + face values

## Сервер

### `src/engine/classes/physics-world.class.ts`
- Экспорт нового типа `DieSpin { q: [x,y,z,w]; angVel: [x,y,z] }`
- `applyRelease(velocity, position, spins: DieSpin[])` — использует переданные spins, не генерирует Math.random. Сервер — единственный источник spin-параметров.
- `start(onTick: () => void)` — упрощённый callback, без снапшот-эмита. MatchService сам чекает `isAtRest` в callback'е.

### `src/domain/match.service.ts`
- `MatchCallbacks`: только `onRest` (убираем `onSnapshot`)
- `release(v, p)` возвращает `{ spins: DieSpin[]; velocity: [number, number, number] }` — net-слой возьмёт и разошлёт
- Приватный `generateSpins()` — per-die рандом quaternion + angular velocity

### `src/net/match-handlers.ts`
- Параметр `io: Server` теперь используется (было `_io`)
- На `match:release` после `room.match.release(...)` — `io.to('room:'+id).emit('match:throw-start', { initiatorUserId, velocity, position, dice: spins })`

### `src/net/socket-server.ts`
- `buildMatchCallbacks` теперь возвращает только `{ onRest }` (snapshot-emit удаляется)

## Клиент

### `src/engine/classes/_game-engine/services/dice.service.ts`
- `release(velocity, position, spins?: DieSpin[])`
  - Если `spins` есть — применяет серверные quaternion и angularVelocity per-die
  - Если `spins` нет (local mode или thrower до/независимо от server ack) — рандом как сейчас

### `src/engine/classes/_game-engine/services/network.service.ts`
- Добавить хендлер `match:throw-start` → emit `throw-start`
- Экспозишен `getUserId(): string | null` для GameEngine чтобы сравнить с `initiatorUserId`
- Удалить использование `SnapshotBuffer` и метод `sampleDiceState` (и `clearBuffer` — он больше не нужен, буфера нет)
- Тип `DieState` перенести в `network.service.ts` (был в `snapshot-buffer.class.ts`)
- Удалить файл `snapshot-buffer.class.ts`

### `src/engine/classes/_game-engine/game-engine.class.ts`
- Удалить флаг `isLocalThrow` — больше не нужен, оба клиента всегда степают свою физику
- `gameLoop` упрощается: всегда `physicsWorld.step` + `dice.syncMeshes` (как в local mode)
- Release-handler:
  - Local mode: `dice.release(v, p)` (как было)
  - Network mode: `dice.release(v, p)` (local prediction с local spin) + `network.sendRelease(v, p)` (серверу)
- Новый listener на `throw-start`:
  - Если `initiatorUserId === self.userId` → ignore (мы уже предсказали свой бросок с local spin)
  - Иначе → `dice.release(v, p, spins)` — observer запускает локальную симуляцию с серверным spin
- Listener на `dice-rest` остаётся — snap к авторитативной серверной позе (для обоих)
- Убрать observer snapshot-ветку в gameLoop (её просто нет больше)

## Acceptance criteria

- [ ] Оба клиента видят бросок плавно 60fps без network jitter в отрисовке
- [ ] У бросающего — мгновенная реакция на mouseup (local pred с local spin)
- [ ] У observer'а — задержка в RTT перед стартом броска, но дальше плавно (local sim с server spin)
- [ ] Финал (после `dice-rest`) — одинаковая поза у обоих, серверная
- [ ] Сервер больше не шлёт `match:dice-snapshot`
- [ ] Сервер остаётся source-of-truth для face values
- [ ] Local mode продолжает работать
- [ ] `npm run build` зелёный обеих сторон

## Out of scope

- Отображение face values в UI (приходят в rest payload, но рендер пока не делаем)
- Reconciliation во время броска (промежуточные server snapshots для коррекции) — у нас без них, trust cannon-es determinism на 1-3 сек
- Детерминированный RNG (seed) — не нужно, spin задаётся сервером и транспортируется к клиентам напрямую

## Конвенции
- Arrow functions only
- TypeScript strict
