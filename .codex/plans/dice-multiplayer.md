# Dice Multiplayer (dice-client + dice-server)

## Контекст

dice-client готовится к онлайн-игре. Сервер `dice-server` создан как авторитативный backend (Express + socket.io + Prisma + cannon-es). Сейчас: scaffold готов, физического кода и сетевого слоя ещё нет.

Три блока работы:
1. **Сетевая физика** — детально, делаем сейчас
2. **Аккаунты** — заметка, отложено
3. **Комнаты** — заметка, отложено

---

## 1. Сетевая физика (сейчас)

**Стратегия**: server-authoritative + snapshot replication (см. `dice-server/.claude/specs/network-physics.md`).

### Сервер (`dice-server`)

#### 1.1 Зеркало физических констант
- Скопировать `dice-client/src/engine/config.ts` в `dice-server/src/engine/config.ts`
- Удалить из серверной копии input-domain константы (`THROW_LINEAR_SCALE`, `THROW_DOWNWARD_BIAS`, `THROW_MIN_SPEED`, `THROW_MAX_SPEED`) — они нужны только клиенту. Оставить `THROW_MAX_SPEED` для серверной валидации.
- Удалить камерные константы (`CAMERA_*`) — сервер без рендера

#### 1.2 PhysicsWorld класс
`src/engine/classes/physics-world.class.ts`:
- Конструктор: создаёт `CANNON.World` + materials + контактные пары + table body + 4 walls + ceiling + DICE_COUNT dice bodies
- Идентично `dice-client/src/engine/classes/_game-engine/game-engine.class.ts` createPlayArea + DiceService.spawn, но без Three.js
- Поля: `world`, `dice: CANNON.Body[]`, `tick: number`
- Методы:
  - `start(onSnapshot)` — `setInterval(step, 1000/60)`, инкремент tick, каждый второй tick вызывает `onSnapshot(buildSnapshot())`
  - `stop()`
  - `applyRelease(velocity, position)` — позиции по `position + DICE_SPACING * (i - center)`, скорость, рандомный spin (`THROW_ANGULAR_RANDOM`)
  - `buildSnapshot()` → `{ tick, dice: [{ id, p:[x,y,z], q:[x,y,z,w] }] }`
  - `isAtRest()` → `dice.every(d => d.sleeping)`
  - `getFaceValues()` → `[1..6, 1..6]` (анализ ориентации, можно по `body.quaternion.vmult([0,1,0])` и выбору ближайшей оси)

#### 1.3 MatchService (V1: turn-less)
`src/domain/match.service.ts`:
- Владеет PhysicsWorld
- Поля: `roomId`, `physics: PhysicsWorld`, `rolling: boolean`, `restTimeout: NodeJS.Timeout | null`
- `release(velocity, position)`: валидирует velocity (clamp на `THROW_MAX_SPEED`), сбрасывает мир (`physics.resetForRelease()`), применяет release, запускает snapshot loop. **Любой может слать в любой момент** — нет `activeUserId`. Если уже `rolling === true` — текущая симуляция отменяется, новая начинается с нуля
- Каждый tick проверяет rest. По rest или 5s таймауту → `match:dice-rest`, сброс `rolling`
- `dispose()` — physics.stop, clear timers

#### 1.4 RoomService (in-memory)
`src/domain/room.service.ts`:
- `Map<roomId, RoomState>`, `RoomState = { match: MatchService, members: Map<userId, socketId> }`
- `createRoom() → { id, code }` (короткий код типа `ABCD-1234`)
- `joinRoom(code, userId, socketId)` — добавить, если 2 игрока — спавнит match
- `leaveRoom(roomId, userId)` — если match идёт → forfeit
- При перезапуске сервера состояние теряется (V2 — Redis)

#### 1.5 Net layer (socket.io)
`src/net/socket-server.ts`:
- Создаёт `Server` поверх express http
- Middleware `io.use((socket, next) => { socket.data.userId = socket.handshake.auth.userId; next(); })` — пока без верификации (V1 без auth, userId — просто uuid из браузера)
- Регистрирует handlers

`src/net/room-handlers.ts` + `src/net/match-handlers.ts`:
- `room:create` → `room:state` обратно
- `room:join { code }` → `socket.join('room:'+id)` + `room:state` всем + `match:dice-spawn`
- `match:release { roomId, velocity, position }` → MatchService.release(...) — **без проверки `byUserId`**, любой в комнате может бросать
- Snapshot callback из MatchService → `io.to('room:'+id).emit('match:dice-snapshot', payload)`
- zod-схемы во всех C→S handlers

#### 1.6 deps + index.ts
- `npm i socket.io`
- `npm i -D @types/socket.io` (если не входят)
- `src/index.ts`: создать express app → http.Server → socket-server.init(server) → server.listen(PORT)
- PORT в `.env` (`SERVER_PORT=3001`)

### Клиент (`dice-client`)

#### 1.7 Network service
`src/engine/classes/_game-engine/services/network.service.ts`:
- Обёртка над `socket.io-client`
- Поля: `socket: Socket`, `events: EventEmitter` (наш собственный, для проброса в DiceService)
- Эмитит наружу: `dice-snapshot`, `dice-rest`, `dice-spawn`
- Шлёт на сервер: `match:release(velocity, position)`

#### 1.8 Snapshot interpolator
В `network.service.ts` или отдельный класс `SnapshotBuffer`:
- Хранит последние ~5 снапшотов с временными метками
- `sample(now)` → возвращает interpolated `{ id, p, q }[]` для рендера
- Render delay: `INTERPOLATION_DELAY_MS = 100` (рендерим состояние "now - 100ms")
- Между двумя соседними снапшотами: `lerp` для p, `slerp` для q

#### 1.9 GameEngine mode
- Добавить `mode: 'local' | 'network'` в `GameEngine` (флаг конструктора)
- В `gameLoop`:
  - `local`: всё как сейчас (physicsWorld.step + dice.syncMeshes)
  - `network`: пропустить physics.step, вместо этого `dice.applySnapshot(network.sample(now))`
- Контактные материалы и физический мир для `network` создавать НЕ нужно — клиент только рендерит

#### 1.10 DiceService.applySnapshot
- Новый метод: `applySnapshot(dice: { id, p:[x,y,z], q:[x,y,z,w] }[])`
- Пишет напрямую в `body.position` и `body.quaternion` (или сразу в `mesh`, минуя body — body не нужен в network mode)
- В network mode dice spawn также по серверной команде `dice-spawn`

#### 1.11 ShakeInputService
- В network mode: при `release` вместо `dice.release()` зовёт `network.sendRelease(velocity, position)`
- Кости остаются скрытыми пока не пришёл первый `dice-snapshot`

#### 1.12 Lobby UI (минимум)
- Простой DOM поверх canvas: input для room code + кнопка "Create" / "Join"
- При успешном join — старт `GameEngine` в network mode
- Без аккаунтов: userId = `crypto.randomUUID()` сохранённый в `localStorage`

### Verification
1. Поднять postgres через `docker-compose up -d` (если ещё не запущен)
2. `cd dice-server && npm run dev` — сервер на :3001
3. `cd dice-client && npm run dev` — клиент на :5174
4. Открыть в двух браузерах, в первом Create, скопировать код, во втором Join
5. Бросить кость в одном — оба видят синхронный полёт и финал
6. Сравнить face values между окнами — должны совпасть
7. `cd dice-server && npm run build` зелёный
8. `cd dice-client && npm run build` зелёный

### Критические файлы (новые/правленные)

**dice-server:**
- `src/engine/config.ts` (новый)
- `src/engine/classes/physics-world.class.ts` (новый)
- `src/domain/match.service.ts` (новый)
- `src/domain/room.service.ts` (новый)
- `src/net/socket-server.ts` (новый)
- `src/net/room-handlers.ts` (новый)
- `src/net/match-handlers.ts` (новый)
- `src/net/schemas.ts` (новый, zod)
- `src/index.ts` (правка)
- `package.json` (deps)
- `.env` (SERVER_PORT)

**dice-client:**
- `src/engine/classes/_game-engine/services/network.service.ts` (новый)
- `src/engine/classes/_game-engine/services/snapshot-buffer.ts` (новый)
- `src/engine/classes/_game-engine/services/dice.service.ts` (правка — applySnapshot)
- `src/engine/classes/_game-engine/services/shake-input.service.ts` (правка — release → network в network mode)
- `src/engine/classes/_game-engine/game-engine.class.ts` (правка — mode flag)
- `src/main.ts` (правка — простой lobby UI)
- `src/engine/config.ts` (добавить `INTERPOLATION_DELAY_MS`)
- `package.json` (`socket.io-client`)

---

## 2. Аккаунты (TODO, не сейчас)

См. `dice-server/.claude/specs/accounts.md`. Кратко:
- Prisma `User`, `Session`
- Auth flow: cookie session или JWT (выбор на этапе)
- Socket auth middleware: `socket.handshake.auth.token` → `socket.data.userId`
- НЕ делается в V1 сетевой физики (используем temporary userId из browser localStorage)

Когда понадобится — отдельный план + `.claude/tasks/accounts/`.

---

## 3. Комнаты (TODO, не сейчас)

См. `dice-server/.claude/specs/rooms.md`. Кратко:
- Prisma `Room`, `RoomMember` (для persistent rooms; in-memory достаточно для V1 физики)
- Lifecycle: create → join (по коду) → match → finished
- socket.io rooms (`socket.join('room:' + id)`)
- В V1 сетевой физики достаточно in-memory `Map<roomId, MatchService>` в `RoomService` — это покрывает MVP

Persistent rooms (в БД), spectators, chat — отдельный план + `.claude/tasks/rooms/`.

---

## 4. Checkpoint: menu/game UI + quick-match batch (2026-06-24)

Текущий скоуп был закоммичен как промежуточный as-is checkpoint перед отдельным проходом
по чистке quick-game и перегруженного frontend state-flow.

### Клиентское состояние
- Главное меню упрощено до `Быстрая игра`, `Создать комнату`, `Присоединиться к комнате`; одиночная и рейтинговая игра скрыты на фронте.
- Имя игрока запрашивается при первом старте, хранится в localStorage и меняется из верхней панели.
- Верхняя панель меню сейчас: имя, переключатель языка одной иконкой второго языка, настройки как `S`; вход скрыт на фронте.
- Настройки, создание комнаты и присоединение к комнате рисуются вместо главного меню; `ESC` возвращает обратно.
- Создание комнаты сохраняет текущий функционал кастомного лобби: название, пароль, банк/правила.
- Список комнат рисуется отдельной страницей с обновлением по кнопке, локальным фильтром по загруженным комнатам и входом по коду.
- Quick-game создаёт скрытую quick-комнату или присоединяется к ожидающей; waiting-lobby не показывается, остаётся loading до второго игрока.
- `ESC` во время quick-search вызывает `leaveRoom()`, отключает сеть и возвращает в меню.
- Игра не стартует в лобби при одном игроке; минимум два игрока.
- Игровой HUD переработан: кнопки управления справа снизу, переименованные действия, `FARKLE`, банкир/выбрано сверху, панель игрока без технического id.
- Продолжить/забрать кости в мультиплеере после выбора автоматически запускает следующий бросок.
- Realtime selection preview отображает выбранные очки другого игрока.
- 1v1 раскладка ориентирована на стол: противник сверху, локальный игрок снизу.
- Добавлен bench dice display для уже забранных за ход костей.
- Добавлен фон `public/assets/background/background_texture_2.png` за столом без дизеринга/виньетки/цветовой квантизации.
- Таблица возвращена ближе к прежнему визуальному размеру; кубики выставлены `DICE_HALF_SIZE = 0.26`, `DICE_SPACING = 0.71`.
- Физические борта уменьшены до `WALL_THICKNESS = 0.22`, `WALL_INSET = 0.22`.
- Параллакс кубиков в меню переведён на совместное смещение без изменения расстояния между кубиками.

### Known debt for next pass
- Quick-game и основные меню сейчас слишком плотно сидят в `src/main.ts`; нужен явный state-machine/flow split для `home/create/join/settings/quick-search/lobby/game`.
- `startQuickMatch()` и cancel path нужно вынести из общего lobby rendering path, чтобы не ловить гонки между сетевыми событиями, loading overlay и `ESC`.
- Protocol client/server остаётся зеркальным и должен оставаться таким при следующем рефакторинге.

## Что НЕ в скоупе вообще
- Client-side prediction (ждём первый снапшот, RTT задержка приемлема для дискретных бросков)
- Lockstep deterministic physics (cannon-es не подходит)
- Spectators
- ELO / счёт / история матчей
- Mobile клиент
- Anti-cheat за пределами серверной физики
