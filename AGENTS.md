# Codex Notes: Dice Client

## Scope

`dice-client` is a non-commercial 3D dice physics simulator client. It renders dice with Three.js and simulates interaction with Cannon-ES. It is not a gambling or wagering client.

Read `.codex/specs/` before behavioral changes:
- `engine.md`: `GameEngine`, loop, scene, physics world.
- `dice.md`: `DiceService`, spawn, pickup, release, mesh sync.
- `input.md`: `ShakeInputService`, hold-plane raycast, velocity buffer.
- `network.md`: binary WebSocket protocol and `NetworkService`.
- `turn-ui.md`: selection and HUD coordination.

## Architecture

Main entry: `src/main.ts`

Core engine:
- `src/engine/config.ts`: all gameplay, physics, camera, timing constants.
- `src/engine/classes/_game-engine/game-engine.class.ts`: orchestration and game loop.
- `src/engine/classes/_game-engine/services/`: engine services.
- `src/engine/classes/event-emitter.class.ts`: loose service communication.

Keep the modular service architecture. Prefer EventEmitter communication between services instead of direct cross-service calls when that is the established pattern.

## Critical Rules

Do not casually change `gameLoop()`. Fixed-step physics, mesh sync, and rendering order are sensitive.

Keep gameplay entities independent of viewport size. The physical table and walls are fixed in world units; camera placement adapts to the viewport.

New constants belong in `src/engine/config.ts`. Avoid local magic numbers.

Respect the pickup/release contract:
- `pickup()` hides dice and parks bodies.
- `release(velocity, position)` restores dice and switches bodies to dynamic.
- `isHeld`/idempotency behavior matters.

## Synchronization With Server

Protocol files must match server protocol files except for an optional first-line marker comment:
- Client: `src/network/protocol/*.ts`
- Server: `../dice-server/src/net/protocol/*.ts`

Scorer must match server scorer except for an optional first-line marker comment:
- Client: `src/domain/scorer.ts`
- Server: `../dice-server/src/domain/scorer.ts`

Visual dice face mapping must agree with server face evaluation:
- Client: `src/engine/classes/_game-engine/services/dice.service.ts`
- Server: `../dice-server/src/engine/classes/physics-world.class.ts`

## Verification

Run `npm run build` in `dice-client/` after client changes when feasible.
