# Farklepit Android TWA

This is the sideload Android wrapper for `https://www.farklepit.ru/`. It is a
TWA, not an offline WebView build: the game remains the deployed PWA and web
updates do not require a new APK.

## Runtime guarantees

- Package id: `ru.farklepit.game`.
- Starts `/?twa=1` in landscape.
- Uses sticky immersive display and explicitly requests `SHORT_EDGES` display
  cutout layout. `scripts/patch-twa-project.mjs` reapplies that override after
  every Bubblewrap project regeneration.
- Notification delegation is deliberately disabled for this first visual/gameplay
  build, so the APK does not request notification permission.
- Trusted fullscreen requires the signed package fingerprint published at
  `https://www.farklepit.ru/.well-known/assetlinks.json`.

## Build workflow

The release keystore and passwords live outside git in
`~/.config/farklepit/`; do not move them into this directory or commit them.
The local build host needs `~/.config/farklepit/twa.env` with:

```text
BUBBLEWRAP_KEYSTORE_PASSWORD=...
BUBBLEWRAP_KEY_PASSWORD=...
TWA_SIGNING_KEY_PATH=/absolute/path/to/release.jks
```

After modifying the web client, deploy it normally first. Then run from
`dice-client/`:

```bash
npm run twa:verify
npm run twa:build
```

The signed APK is copied outside the repository to
`~/projects/dice/builds/farklepit-twa-v<versionCode>.apk`; the same artifact is
also copied to `~/projects/dice/builds/farklepit-twa-latest.apk`.
It is then atomically published for direct Android downloads at
`https://www.farklepit.ru/downloads/farklepit-android.apk`. Nginx serves this
file statically from `/var/www/farklepit/downloads/`; its checked-in location
configuration is `deploy/nginx/farklepit-app-locations.conf`.

`npm run twa:release -- <versionName>` increments `versionCode`, regenerates
the wrapper and produces an Android upgrade APK. Use it only when the native
wrapper itself changes; ordinary game UI/asset changes use the normal web
build/deploy path.
