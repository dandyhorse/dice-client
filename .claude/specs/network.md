# Network (Client) Specification

Клиент state-sync через нативный `WebSocket` + бинарный протокол. Транспорт и формат — см. `dice-server/.claude/specs/network-physics.md` (источник истины). Этот файл описывает только клиентскую обвязку.

## NetworkService

`src/engine/classes/_game-engine/services/network.service.ts` — единственный модуль, который говорит с сервером. Внешний API не зависит от транспорта; внутри — нативный `WebSocket` с `binaryType = 'arraybuffer'`.

### Публичный API

```ts
connect(userId: string): Promise<void>          // открыть сокет
disconnect(): void                               // закрыть и не реконнектить
createRoom(): Promise<RoomState>                 // ROOM_CREATE → ACK_OK
joinRoom(code: string): Promise<RoomState>      // ROOM_JOIN → ACK_OK
sendRelease(velocity, position): void           // MATCH_RELEASE (fire-and-forget)
getUserId(): string | null
getRoomId(): string | null
events: EventEmitter                            // 'room-state' | 'dice-spawn' | 'dice-snapshot' | 'dice-rest'
```

`RoomState`, `SnapshotPayload`, `RestPayload`, `DieStateFull` (alias на `DieStateBin`) реэкспортируются для `DiceService` и `GameEngine`.

### Pending requests / acks

ROOM_CREATE и ROOM_JOIN несут `requestId: u32`. Клиент кладёт `{resolve, reject}` в `Map<requestId, PendingRequest>` и ждёт `ACK_OK` (resolve с body=RoomState) или `ACK_ERROR` (reject с `code: message`). При close сокета все pending реджектятся ошибкой `socket closed`.

`MATCH_RELEASE` без requestId — fire-and-forget (как было и с socket.io: ack там не ожидался).

### Reconnect / rejoin

- `onclose` → exponential backoff: 1s → 2s → … → 30s, ресет при `onopen`.
- При `onopen` после реконнекта, если был сохранён `currentRoomCode`, клиент шлёт `ROOM_JOIN(code)` сам по себе. Сервер заменяет `socketId` участника в `RoomService.joinRoom`. Если комнаты больше нет (все вышли) — `ACK_ERROR { code: NO_ROOM }`, чистим локальный state и UI остаётся на лобби.

### URL

`SERVER_URL` из `src/engine/config.ts` (по умолчанию `http://hostname:3002`) превращается в `ws://hostname:3002/ws?u=<userId>`. Параметр `u` читает сервер в `upgrade` хуке.

## Shared protocol module

`src/network/protocol/{opcodes,types,codecs}.ts` — **бит-в-бит копия** `dice-server/src/net/protocol/`. При правке одного из шести файлов — параллельно править второй (как уже делается для `engine/config.ts`). Wire-формат (opcode'ы, offset'ы, layouts) описан в серверной спеке `network-physics.md`.

## Что делает GameEngine с приходящими снапшотами

Game engine в network-mode не запускает локальный cannon-step. Он:
- На `dice-spawn` / `dice-snapshot` → `DiceService.applySnapshot(snap.dice, now)` пишет state кости в внутренний буфер.
- На `dice-rest` → то же, но v/w принудительно зануляются (в бинарном формате они опущены, маппятся в `[0,0,0]` перед передачей в `applySnapshot`).
- Каждый кадр RAF → `DiceService.extrapolate(now)` двигает меш по последним известным `v` и `w`. Если сервер молчит >`MAX_EXTRAPOLATION_MS = 250` — кости застывают на последней позе.
- На `match-state` / `match-roll-result` / `match-turn-result` → передаёт в `HudUiService` для отрисовки turn-UI и переключает enabled у `ShakeInputService` / `SelectionService`. См. `turn-ui.md`.

## Безопасность

- Сообщения от сервера, отличные от описанных opcode'ов, молча игнорируются (нет alert'а, нет throw — клиент должен переживать неизвестные расширения протокола).
- `binaryType = 'arraybuffer'`; не-бинарные фреймы (которых сервер не шлёт) тоже игнорируются.
- `disconnect()` отменяет автореконнект и реджектит висящие requests.
