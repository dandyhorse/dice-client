# PWA Specification

`vite-plugin-pwa` генерирует `manifest.webmanifest` и `sw.js` во время
`npm run build`. PWA остаётся browser runtime. Android TWA находится в
`android-twa/`, открывает этот же production origin и не меняет PWA-путь.

## Manifest

- `name` / `short_name`: `Farklepit`; `start_url` / `scope`: `/`.
- `display: fullscreen`, `orientation: landscape`, тёмные `theme_color` и
  `background_color` (`#151414`). Если fullscreen не поддержан, браузер делает
  стандартный fallback display-mode.
- `public/pwa-icon-192.png` и `public/pwa-icon-512.png` — source icons с
  `purpose: any maskable`. Они сделаны из текущей иконки кубика с safe margin.
- `index.html` использует `viewport-fit=cover` и Apple standalone hint как
  fallback, но гарантированный immersive режим — только поддерживающий Android.
- Browser/PWA не пытается вызвать DOM `requestFullscreen()`: центральной
  кнопки «На весь экран» нет. Полноэкранный режим с областью выреза камеры
  является ответственностью native TWA shell.
- TWA запускает `/?twa=1` в sticky immersive с layout in the display cutout.

## Install, cache, offline

- В Android browser lobby кнопка «Установить игру» всегда загружает signed APK
  с `/downloads/farklepit-android.apk` через нативную `<a download>` ссылку, а
  не навигацию текущего PWA окна. Workbox исключает `/downloads/` из
  `navigateFallback`, поэтому APK-запрос всегда доходит до nginx. Внутри TWA
  кнопка скрыта: приложение уже установлено. iOS не получает Android APK кнопку.
- Precache содержит shell, JS/CSS, локальные fonts, UI/menu dice assets и PWA
  icons. OST, sound effects, `/auth`, `/ws` и игровые данные не кэшируются.
- После одного online launch сервис worker может открыть cache shell без сети.
  `main.ts` показывает offline screen и не запускает lobby/match до события
  `online`.
- Service worker обновляется автоматически (`skipWaiting` и `clientsClaim`),
  без кнопки «Обновить игру» и без отдельного UI действия.

## Mobile text input

- В mobile runtime все editable text/number поля используют встроенную DOM
  клавиатуру (`src/ui/mobile-keyboard.ts`), а не Android IME. Реальные inputs
  остаются source of truth для существующей form-валидации, но становятся
  `readonly` и получают value через keyboard controller с обычным `input` /
  `Enter` event.
- Клавиатура покрывает имя, комнатные text/password/code/filter поля и числовые
  настройки; desktop продолжает использовать обычные browser inputs. V1 даёт
  RU/EN, `123`/symbols, Shift, Backspace, Space, Done, password mask и лимиты
  полей; paste, autofill и emoji намеренно не реализованы.
- Панель занимает максимум `31dvh` снизу в landscape; активная menu/modal
  композиция получает этот нижний inset и не сжимается системной клавиатурой.

## Deploy verification

- Production origin обязан быть HTTPS и выдавать `/manifest.webmanifest` и
  `/sw.js` из root scope. Для worker/manifest нужен `Cache-Control: no-cache`.
- Для TWA production также обязан выдавать
  `/.well-known/assetlinks.json`. Содержимое генерируется из signing key через
  `npm run twa:assetlinks`, затем проверяется `npm run twa:verify` до APK build.
- Nginx статически отдаёт `/downloads/farklepit-android.apk` из
  `/var/www/farklepit/downloads/farklepit-android.apk`. `npm run twa:build`
  публикует туда latest signed APK атомарной заменой.
- Проверять Chrome Android: Manifest/Service Workers в DevTools, загрузку APK,
  fullscreen landscape, offline launch после online session и обновление worker.
