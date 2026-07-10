# Network Client

`NetworkService` is the sole owner of the browser WebSocket and the binary protocol. The server remains authoritative for online physics, turns and scoring.

## Session

```ts
connect(displayName: string, avatarIndex?: number, dicePresetId?: string): Promise<void>
disconnect(): void
```

The URL contains display/visual settings only. The server assigns a new guest id and sends `SESSION_READY`; `connect()` resolves after that packet, not merely after the TCP/WebSocket open event. Concurrent calls share one promise.

There is no automatic reconnect or room reservation. A close rejects all pending requests, clears every room/match/snapshot cache, emits `connection-lost`, and the application returns to the home screen.

## Commands

Room create/join/start/list/quick/leave and turn actions with `requestId` use a pending-request map and `ACK_OK`/`ACK_ERROR`. Pending entries have an eight-second timeout and are all rejected on disconnect.

`MATCH_RELEASE` and selection preview are fire-and-forget, but are sent only with an open socket and current room. Surrender uses `ROOM_LEAVE`; the local client exits while remaining players continue.

## Flow ownership

Menu network operations use a monotonically increasing generation and a tracked set of temporary networks. Starting another view invalidates the prior generation and disconnects its sockets. Create, join, list refresh and quick search must check the generation after every await before mutating UI or room state.

Only one network becomes `activeNetwork`. Game mounting is single-flight and associated with that network. A failed asset import/mount leaves the room, destroys partial state, restores the home view and displays the error.

## Match rendering

- Snapshots are cached in a bounded interpolation buffer.
- Rest packets immediately fix the final transform and clear extrapolation velocity.
- `ROOM_STATE` and `MATCH_STATE` drive HUD/input state.
- Two players use the duel layout; three or four use the compact score list.
- A `LAST_PLAYER` finish shows the winner without a rematch action.
- Late room joins are spectators and never become active players.

## Shared protocol

`src/network/protocol` mirrors `dice-server/src/net/protocol`. Files are identical except for an optional first marker line. Run `npm run check:sync` when both sibling repositories are present.

The wire format and exit semantics are documented in the server's `.codex/specs/network-physics.md` and `.codex/specs/rooms.md`.
