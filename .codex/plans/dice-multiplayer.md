# Casual Multiplayer

## Current design

- Native WebSocket with a mirrored binary protocol.
- Server-authoritative Cannon physics and scoring; online clients render snapshots.
- Server-issued guest identity per socket. Accounts are not part of the active runtime.
- Quick match is 1v1. Custom rooms start with 2-4 players.
- Participants joining after start are spectators.
- Room passwords are plaintext, in-memory convenience barriers over WSS.

## Lifecycle

1. Client connects and waits for `SESSION_READY`.
2. Create/join/quick operations are owned by a generation-scoped network flow.
3. The room owner starts a custom match and freezes the current player roster.
4. Leaving or disconnecting removes that player; the remaining turn order continues.
5. A target-score winner finishes with `SCORE`. The last remaining player finishes with `LAST_PLAYER`.
6. A score finish can be rematched unanimously. A last-player finish cannot.

## Client boundaries

- `NetworkService`: socket, handshake, pending requests and protocol caches.
- `NetworkFlowController`: ownership/cancellation of async menu flows.
- `GameEngine`: gameplay orchestration and service lifecycle.
- `DiceService`: local bodies and remote replicas.
- `DiceTrailRenderer`: distance-sampled, bounded instanced trails.
- `ShakeInputService`: input including explicit hold cancellation.
- `HudUiService`: duel layout for two players and compact list for three/four.

## Verification

- `npm run build`
- `npm run check:sync` when the sibling server repository is present
- Manual two/four-client gameplay checks through the existing built/PM2 environment
