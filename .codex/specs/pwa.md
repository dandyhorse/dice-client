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
- TWA запускает `/?twa=1` в sticky immersive с layout in the display cutout. Этот query marker добавляет `html.twa-runtime`: в TWA запрещено любое text selection/callout, пока отдельно не будет задан allowlist копируемого текста.

## Install, cache, offline

- Обычный Android browser/PWA не показывает game lobby, name flow, top menu или
  orientation prompt: единственный экран содержит «Установить игру» — нативную
  `<a download>` ссылку на signed APK `/downloads/farklepit-android.apk`.
  Workbox исключает `/downloads/` из `navigateFallback`, поэтому APK-запрос
  всегда доходит до nginx. Полный mobile game UI доступен только внутри TWA
  (`?twa=1`). iOS не получает Android APK landing.
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
- Панель занимает максимум `31dvh` снизу в landscape; Shift всегда сохраняет
  action-key flex width, поэтому keyboard не меняет общий размер между lower/
  uppercase. Шрифт всех клавиш на `3px` крупнее базовой mobile версии. Активная menu/modal
  композиция получает этот нижний inset и не сжимается системной клавиатурой.
- Mobile settings не показывают desktop key-binding rows: touch UI использует собственные A/B/C actions и swipe rules. Existing audio and auto-roll settings остаются.

## Mobile menu modals

- Settings, profile и room-password overlays используют общий mobile modal layer: он выше top menu, делает background inert, растягивает panel до доступной высоты и оставляет scroll внутри panel. Тап по backdrop закрывает только modal и не проходит в кнопку под ним.
- В mobile menu outer large button frames и top-menu controls увеличены на 20%; текст и внутренние отступы не масштабируются отдельно.
- В TWA home menu logo стоит сверху (`300×102px`), четыре game buttons образуют
  нижний stack: `362×63px`, `27px` text, `7px` gaps; нижняя кромка последней
  кнопки держит `20px` safe inset.
- В mobile top menu profile control вынесен влево: `48px` avatar frame, затем
  nickname. Nickname truncates with ellipsis до левой кромки центрированного
  `main-logo.svg`; settings/sound/language остаются справа.

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
