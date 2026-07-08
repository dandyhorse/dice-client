# Android Packaging Plan

## Goal

Package the existing Vite/Three.js client as an Android app in the future without rewriting the game.

## Preferred Path

Use Capacitor as the default Android wrapper:

- Keep `dice-client` as the source of truth.
- Build the web client with `npm run build`.
- Package `dice-client/dist` into an Android WebView shell.
- Produce APK/AAB from the generated Android project.

## Current Feasibility

The client is already a browser app, so Android packaging is practical. This is mostly packaging plus mobile-specific fixes, not a full native rewrite.

Current blockers before Android can run the actual game:

- `src/main.ts` detects mobile runtime and renders the mobile-soon screen instead of the game.
- Touch UX for throwing dice and menu controls needs real-device tuning.
- API/WebSocket URL must be explicit for native Android; `window.location.origin` is not enough inside a packaged WebView.
- Audio unlock, fullscreen, orientation, and WebGL performance need device checks.

## Implementation Notes

1. Add Capacitor dependencies and config:
   - `@capacitor/core`
   - `@capacitor/cli`
   - `@capacitor/android`
2. Add Android scripts after the web build is stable.
3. Replace the current mobile placeholder with a real mobile path or an Android-only runtime flag.
4. Configure production API/WS endpoints for packaged builds.
5. Add Android icon and splash assets.
6. Decide orientation lock after testing table framing.
7. Test touch controls, audio start, language switching, and local/online game flows on a real Android device.
8. Build and verify APK/AAB.

## Size Expectation

Capacitor should be much smaller than Electron because it uses the system WebView instead of shipping Chromium.

Rough expectation with current assets:

- APK/AAB: about 30-70 MB.
- Installed size: about 60-120 MB.

OST and UI image assets are the main client-side size drivers.
