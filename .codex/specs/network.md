# Network (Client) Specification

Клиент state-sync через нативный `WebSocket` + бинарный протокол. Транспорт и формат — см. `dice-server/.claude/specs/network-physics.md` (источник истины). Этот файл описывает только клиентскую обвязку.

## NetworkService

`src/engine/classes/_game-engine/services/network.service.ts` — единственный модуль, который говорит с сервером. Внешний API не зависит от транспорта; внутри — нативный `WebSocket` с `binaryType = 'arraybuffer'`.

### Публичный API

```ts
connect(userId: string, displayName: string, accessToken?: string): Promise<void>
disconnect(): void
createRoom(mode = ROOM_MODE.MATCH): Promise<RoomState>
joinRoom(code: string): Promise<RoomState>
startRoom(): Promise<RoomState>
sendRelease(velocity, position): void
sendSelectDice(indices: number[]): Promise<void>
sendBank(indices: number[]): Promise<void>
getUserId(): string | null
getRoomId(): string | null
getRoomState(): RoomState | null
events: EventEmitter
```

`RoomState`, `SnapshotPayload`, `RestPayload`, `DieStateFull` (alias на `DieStateBin`) реэкспортируются для `DiceService` и `GameEngine`.

### Pending requests / acks

ROOM_CREATE, ROOM_JOIN, ROOM_START, MATCH_SELECT_DICE и MATCH_BANK несут `requestId: u32`. Клиент кладёт `{resolve, reject}` в `Map<requestId, PendingRequest>` и ждёт `ACK_OK` (resolve с body=RoomState для room-команд) или `ACK_ERROR` (reject с `code: message`). При close сокета все pending реджектятся ошибкой `socket closed`.

`MATCH_RELEASE` без requestId — fire-and-forget (как было и с socket.io: ack там не ожидался).

### Reconnect / rejoin

- `onclose` → exponential backoff: 1s → 2s → … → 30s, ресет при `onopen`.
- При `onopen` после реконнекта, если был сохранён `currentRoomCode`, клиент шлёт `ROOM_JOIN(code)` сам по себе. Сервер заменяет `socketId` участника в `RoomService.joinRoom`. Если комнаты больше нет (все вышли) — `ACK_ERROR { code: NO_ROOM }`, чистим локальный state и UI остаётся на лобби.

### URL

`SERVER_URL` из `src/engine/config.ts`:
- production fallback: `window.location.origin` (nginx same-origin);
- dev fallback: `protocol//hostname:3002`.

WebSocket URL строится как:
- authenticated: `ws(s)://host/ws?t=<accessToken>`;
- guest: `ws(s)://host/ws?u=<uuid>&n=<displayName>`.

Это важно для production: фронт не должен ходить напрямую на `:3002`, когда работает за nginx.

## Shared protocol module

`src/network/protocol/{opcodes,types,codecs}.ts` — **бит-в-бит копия** `dice-server/src/net/protocol/`. При правке одного из шести файлов — параллельно править второй (как уже делается для `engine/config.ts`). Wire-формат (opcode'ы, offset'ы, layouts) описан в серверной спеке `network-physics.md`.

## Что делает GameEngine с приходящими снапшотами

Game engine в network-mode не запускает локальный cannon-step. Он:
- На `dice-spawn` / `dice-snapshot` → `DiceService.applySnapshot(snap.dice, now)` пишет state кости в короткий ring buffer.
- На `dice-rest` → v/w принудительно зануляются, `applySnapshot(..., { immediate: true })` сбрасывает буфер и фиксирует авторитативную позу.
- Каждый кадр RAF → `DiceService.extrapolate(now)` рендерит `now - INTERPOLATION_DELAY_MS` через interpolation между двумя snapshot'ами. После первого visible snapshot нового броска delay плавно нарастает от 0 до 50ms за 120ms, чтобы release не ощущался как пауза. Если следующий snapshot опаздывает, используется короткий extrapolation fallback; если gap >`MAX_EXTRAPOLATION_MS = 250`, кости застывают на последней позе.
- Bench/held кости не рендерятся и очищают interpolation buffer, чтобы не интерполироваться из/в `y=-1000`.
- На `match-state` / `match-roll-result` / `match-turn-result` → передаёт в `HudUiService` для отрисовки turn-UI и переключает enabled у `ShakeInputService` / `SelectionService`. См. `turn-ui.md`.
- В `ROOM_MODE.TEST` HUD/SelectionService не создаются; input включён для любого online player в active test-room, пока не идёт rolling.

## Room modes

- `ROOM_MODE.MATCH` — обычная Farkle-комната: WAITING → START → turn/scoring flow.
- `ROOM_MODE.TEST` — free-play комната для проверки server-authoritative физики на нескольких экранах. Создаётся активной сразу, без ходов и без HUD действий.

## Безопасность

- Сообщения от сервера, отличные от описанных opcode'ов, молча игнорируются (нет alert'а, нет throw — клиент должен переживать неизвестные расширения протокола).
- `binaryType = 'arraybuffer'`; не-бинарные фреймы (которых сервер не шлёт) тоже игнорируются.
- `disconnect()` отменяет автореконнект и реджектит висящие requests.
- UI пишет через DOM `textContent`/structured APIs, не через unsafe `innerHTML` в auth/lobby flow.
