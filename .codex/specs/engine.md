# Engine Core Specification

## GameEngine (`src/engine/classes/_game-engine/game-engine.class.ts`)

Главный оркестратор. Владеет сценой, физикой, рендерером, материалами и сервисами.

### Поля

- `scene: THREE.Scene` — сцена, фон `0x1a1a22`
- `camera: THREE.PerspectiveCamera` — fov `CAMERA_FOV` (45), near 0.1, far 200, **top-down**. X/Z из `CAMERA_X/Z`, **Y вычисляется** под текущий aspect (см. Camera fit). `up = (0, 0, -1)` чтобы избежать gimbal lock.
- `renderer: THREE.WebGLRenderer` — `pixelRatio = 1`; в network-mode antialias/shadows выключены ради FPS, в local-mode остаётся `PCFSoftShadowMap`
- `physicsWorld: CANNON.World` — `SAPBroadphase`, GS solver 10 итераций, `allowSleep = true`
- `diceMaterial`, `tableMaterial: CANNON.Material` — для контактных пар

### Инициализация (constructor)

1. `createScene()` — фон + ambient + directional + point light; свет слегка смещён к дальнему краю стола, shadow map включается только в local-mode
2. `createCamera()` — `up = CAMERA_UP` → `position = (CAMERA_X, computeCameraY(aspect), CAMERA_Z)` → `lookAt(CAMERA_TARGET)` (порядок важен: `up` до `lookAt`)
3. `createRenderer()` — настройка теней и PR
4. `new GameplayLayoutService(renderer.domElement)` — central FHD reference-layer для gameplay DOM UI и resize-метрики
5. `createPhysicsWorld()` — gravity `(0, WORLD_GRAVITY, 0)`, broadphase, sleep
6. `setupContactMaterials()`:
   - dice ↔ table/walls: `friction 0.88, restitution 0.10, contactEquationStiffness 1e8, contactEquationRelaxation 2`
   - dice ↔ dice: `friction 0.34, restitution 0.46`
7. `createPlayArea()` — **один раз** создаёт стол `TABLE_WIDTH × TABLE_DEPTH`, 4 невидимые физические стены (с `WALL_INSET` от кромки) и невидимый потолок на высоте `WALL_HEIGHT`
8. `new DiceService(...).spawn()` — спавн костей
9. `new ShakeInputService(...)` — подписка на `hold-start` → `dice.pickup()` и `release` → `dice.release(velocity, position)`. `hold-move` сервис эмитит, но движок его не слушает.
10. `addEventListener('resize', onResize)` — пересчёт layout-метрик, aspect и Y камеры

### Game Loop (`gameLoop`)

```
requestAnimationFrame → gameLoop:
  1. Расчёт deltaTime; если > 0.1s или NaN — фолбэк 1/60
  2. input.update(currentTime)        — обрезка velocity-буфера
  3. local: physicsWorld.step(1/60, dt, 3) + dice.syncMeshes()
     network: DiceService.extrapolate(now) рендерит interpolation buffer
  4. renderer.render(scene, camera)
  5. debug perf stats обновляются, если включён ?perf или localStorage dice:perf=1
  6. requestAnimationFrame(gameLoop)
```

### Связи событий

```
ShakeInputService.events:
  'hold-start' (pos)               → dice.pickup()
  'hold-move'  (pos, speed)        — не используется
  'release'    (velocity, pos)     → dice.release(velocity, pos)
```

### Старт/стоп

- `start()` — после монтирования canvas обновляет layout/camera, фиксирует `lastTime` и стартует `rafId`
- `stop()` — `cancelAnimationFrame`, обнуляет `rafId`

## Play area (фиксированный стол + стены + потолок)

**Принципиально**: стол, стены и потолок имеют **фиксированные размеры в world units** и создаются один раз в `createPlayArea()`. Это требование мультиплеера: физическая площадка одинакова у всех игроков независимо от разрешения экрана.

- Стол: физический body `TABLE_WIDTH × TABLE_DEPTH` (по умолчанию 16×9), толщина `TABLE_THICKNESS`, `mass = 0`. Визуальный mesh использует активный 2K wood color/normal/roughness набор из `public/assets/table/wood-cabinet-worn-long-2k/`; 1K вариант подготовлен рядом для быстрой замены. Mesh масштабируется под viewport с запасом, чтобы дерево закрывало весь экран; физический размер арены от этого не меняется.
- Стены: 4 невидимых `CANNON.Body` по периметру **внутренней** области `(TABLE_WIDTH - 2·WALL_INSET) × (TABLE_DEPTH - 2·WALL_INSET)`. Высота `WALL_HEIGHT`, толщина `WALL_THICKNESS`. `WALL_INSET = WALL_THICKNESS`, чтобы внешняя грань стены совпадала с кромкой стола.
- Потолок: невидимый `CANNON.Body` (без mesh) поверх стен на высоте `WALL_HEIGHT`, размером с внутреннюю область. Закрывает арену сверху, чтобы кости не вылетали при сильном броске. Mesh не нужен — top-down камера смотрит ровно сквозь, видимый потолок перекрыл бы вид.

## Runtime Assets

Все ассеты, необходимые клиенту в runtime, должны лежать внутри `dice-client/`, чтобы git клиента видел полный набор файлов. Каноническое место для браузерных runtime-файлов — `dice-client/public/assets/`.

Корневая папка репозитория `assets/` считается черновой/source-папкой для экспериментов и исходников. Код клиента не должен импортировать или glob'ить файлы из корневой `assets/`; перед использованием в runtime нужный файл переносится/копируется в `dice-client/public/assets/` и подключается через `/assets/...`.

Текущие runtime-группы:

- `public/assets/ost/*.mp3` — OST URL-список в `src/engine/assets/asset-manifest.ts`.
- `public/assets/sounds/impactWood_medium_003.ogg` — звук столкновения.
- `public/assets/dices/*.svg` — иконки граней для rules board.
- `public/assets/rules.svg` — DOM rules board.
- `public/assets/avatars/*.png` — аватары игроков, список в `src/avatars.ts`.
- `public/assets/cursors/*.png` — базовый target-hand cursor и игровые open/close hand cursors, список URL в `asset-manifest.ts`.
- `public/assets/dice/`, `public/assets/table/`, `public/assets/background/`, `public/assets/lang/` — текстуры, фон и UI-иконки.

## Gameplay adaptive layout

- Ниже FHD gameplay DOM живёт в центрированном виртуальном холсте `1920×1080`, масштабируемом от `66.7%` на `1280×720`. На FHD и выше SVG/HUD остаются в исходном масштабе `100%`, а reference-layer занимает весь viewport, чтобы viewport-relative HUD-отступы оставались у краёв экрана на QHD/4K.
- На 21:9 и шире стол остаётся центральной FHD-композицией, а HUD использует свободные поля по бокам через исходные responsive-отступы; SVG и HUD не растягиваются.
- Menu-контент и все dialog-панели используют общий `--responsive-ui-scale`: от `66.7%` на `1280×720` до `100%` на FHD и выше. Back/top-menu controls масштабируются от закреплённого края, а backdrop не уменьшается.
- Mobile runtime требует landscape. В portrait поверх app показывается только prompt поворота и фоновые menu dice; в landscape открывается обычное меню без logo, но с верхним menu; desktop cursor отключён. Menu text/number fields используют собственную DOM-клавиатуру, поэтому Android IME не ужимает игровой viewport. У gameplay скрыты верхнее menu и правая player-панель, а квадратный стол занимает `84%` короткой стороны viewport по центру.
- Mobile PWA запускается из manifest в `fullscreen`/`landscape`; browser install и service-worker cache/update правила описаны в `pwa.md`. Это не меняет world units, camera physics или authoritative server simulation.
- В gameplay `#lang-controls` и `#hud-turn-stats` используют общую координату верхнего ряда с учётом compact reference-layer; `#hud-surrender` и `#hud-actions` имеют один нижний offset. Перемещаются внешние overlay-слои, не их внутренние элементы.
- `GameplayLayoutService` берёт CSS-размер canvas, поэтому browser zoom/resize меняют композицию без пересоздания физического мира. Полноэкранный `#gameplay-overlay-viewport` содержит только блокирующие игровые модалки; custom cursor остаётся вне этого слоя.
- Внутреннее WebGL-разрешение остаётся `PS1_RENDER_SCALE = 0.48`; layout не меняет quality/FPS-профиль.

## Camera fit (contain)

Камера подстраивается под viewport так, чтобы стол целиком был виден на любом аспекте.

```
tanHalf  = tan(CAMERA_FOV/2 in rad)
hForDepth = (TABLE_DEPTH/2) / tanHalf
hForWidth = (TABLE_WIDTH/2) / (tanHalf * camera.aspect)
camera.y  = max(hForDepth, hForWidth) / tableViewportFill
```

- `tableViewportFill` интерполируется от `0.58` на compact desktop до `0.72` на FHD и привязан к высоте reference-layer. На `1280×720` поле заметно компактнее, чтобы HUD помещался без растяжения.
- На 16:9 FHD обе формулы дают одну Y; визуальное поле занимает 72% reference-height.
- На ultrawide (aspect > 16/9) `hForDepth` побеждает → стол остаётся в центральной FHD-композиции, по бокам виден фон.
- На portrait/square `hForWidth` побеждает → камера выше, поля сверху/снизу

`computeCameraY(aspect = camera.aspect)` — приватный метод. Вызывается из `createCamera` и `onResize`.

## Глобальные константы (`src/engine/config.ts`)

| Константа | Значение | Назначение |
|-----------|----------|------------|
| `WORLD_GRAVITY` | -30 | Сильнее реальной, но мягче прежнего профиля — кости летят спокойнее |
| `TABLE_WIDTH` | 9 | Ширина стола в world-units (по X) |
| `TABLE_DEPTH` | 9 | Глубина стола в world-units (по Z), 16:9 |
| `TABLE_THICKNESS` | 0.4 | Толщина стола |
| `WALL_HEIGHT` | 4 | Высота стен (и потолка) |
| `WALL_THICKNESS` | 0.10 | Толщина стен и потолка |
| `WALL_INSET` | 0.10 | Сдвиг внутренней грани стены от кромки стола |
| `DICE_COUNT` | 6 | Сколько костей спавнить |
| `DICE_HALF_SIZE` | 0.273 | Полуразмер ребра кости (куб 0.546×0.546×0.546) |
| `DICE_MASS` | 4.86 | Масса кости |
| `DICE_SPACING` | 0.76 | Разнос костей в release-row; сверху/снизу ряд идёт по X, слева/справа по Z |
| `DICE_LINEAR_DAMPING` / `DICE_ANGULAR_DAMPING` | 0.27 / 0.35 | Торможение полёта и вращения; более плотное и спокойное движение после контакта |
| `DICE_TABLE_FRICTION` / `DICE_TABLE_RESTITUTION` | 0.88 / 0.10 | Высокое сцепление и низкий отскок кости от стола |
| `DICE_DICE_FRICTION` / `DICE_DICE_RESTITUTION` | 0.34 / 0.46 | Трение и умеренный отскок кость ↔ кость |
| `DICE_CONTACT_MIN_HORIZONTAL_NORMAL` | 0.35 | Минимальная боковая составляющая normal для contact-kick от статичных стен; floor/ceiling не пинаем |
| `DICE_DICE_CONTACT_KICK_SPEED` / `DICE_DICE_CONTACT_KICK_MAX_DELTA` | 6 / 3.5 | Velocity kick по любому real Cannon contact кость ↔ кость |
| `DICE_EDGE_REPULSION_DISTANCE` / `DICE_EDGE_REPULSION_FORCE` / `DICE_EDGE_REPULSION_KICK_SPEED` | 0 / 12 / 4.2 | Inward kick/force от стен; дополнительно wall contacts отпинывают кость по real Cannon contact normal |
| `DICE_REROLL_FALL_Y` | `-DICE_HALF_SIZE` | Невидимая trigger-зона ниже стола; упавшая активная кость перебрасывается отдельно |
| `DICE_BOTTOM_MAGNET_TORQUE` / `DICE_BOTTOM_MAGNET_MAX_HEIGHT` | 0.11 / `DICE_HALF_SIZE * 3.1` | Лёгкий bottom-heavy torque возле стола, чтобы кости лучше ложились на грань |
| `HOLD_HEIGHT` | 2.85 | Y-уровень hold-плоскости (куда проецируется мышь) |
| `HOLD_JITTER_SCALE` | 0.04 | (legacy, не используется в новом флоу pickup/release) |
| `VELOCITY_BUFFER_MS` | 90 | Окно сэмплов для расчёта скорости броска |
| `THROW_LINEAR_SCALE` | 0.60 | Масштаб линейной скорости броска (мышь → мир) |
| `THROW_DOWNWARD_BIAS` | -2.8 | Принудительная Y-составляющая вниз при release |
| `THROW_MIN_SPEED` | 0.4 | Минимальная скорость, иначе добавляется forward камеры |
| `THROW_POSITION_PADDING` | 0.2 | Запас от внутренней грани стены при clamp release-позиции |
| `THROW_MAX_SPEED` | 9.3 | Жёсткий потолок \|velocity\| перед emit — гарантия отсутствия tunneling сквозь стены |
| `THROW_ANGULAR_RANDOM` / `THROW_SELF_SPIN_MIN` / `THROW_SELF_SPIN_MAX` / `THROW_ANGULAR_DIE_VARIATION` | 3.2 / 6.75 / 10.125 / 0.25 | Небольшой random tumble плюс доминирующий self-spin вокруг локальной оси каждой кости |
| `CAMERA_FOV` | 45 | Vertical FOV перспективной камеры |
| `CAMERA_X`, `CAMERA_Z` | 0, 0 | Горизонтальная позиция камеры (по центру стола) |
| `CAMERA_TARGET` | `[0, 0, 0]` | Куда смотрит камера |
| `CAMERA_UP` | `[0, 0, -1]` | Up-вектор. Без него top-down даёт gimbal lock (look ‖ up) |

### Rules board

- `public/assets/ost/*.mp3` перечислены в URL-списке `asset-manifest.ts`. `MusicService` играет OST всю жизнь приложения через `HTMLAudioElement`, без `audioService.preloadGroup()`, но не пытается начать воспроизведение при boot: первый обычный UI-button без специального click sound запускает OST прямо в пользовательском жесте.
- Первый OST-трек всегда создаётся с нулевой громкостью и после успешного `play()` плавно входит в рабочую громкость за `420ms`; это исключает резкий стартовый импульс и наложение на первый `ui-click`.
- Первый трек выбирается random на клиенте. Текущий трек stream/range-грузится браузером; следующий random track (без повтора текущего) создаётся с `preload="auto"` только когда до конца текущего остаётся около 25 секунд. При нескольких треках переход идёт через короткий crossfade. Если отдельный `next.play()` блокируется или срывается на границе `ended`, `MusicService` переиспользует текущий `HTMLAudioElement`, переключает `src` на следующий трек и продолжает бесконечный OST loop.
- `public/assets/rules.svg` используется как обычный `/assets/rules.svg` URL и preloads as image. Текущий rules-board эксперимент отключает 3D-объект в runtime и показывает SVG как обычный DOM `<img>` поверх WebGL canvas, чтобы избежать WebGL texture inversion/filtering/pixelation.
- `RulesBoardService` сохраняет прежний lifecycle (`update`, `updateLayout`, `destroy`) и constructor-call из `GameEngine`, но scene/camera/canvas не используют для геометрии. Board и `Rules / Правила (<клавиша>)` монтируются в gameplay reference-layer и масштабируются вместе с HUD.
- Rules-board имеет дополнительный вертикальный scale: на FHD (`1080px` высоты) — `100%`; на QHD (`1440px`) — `75%` и этот минимум сохраняется на 4K. Ниже FHD собственный scale плавно идёт к `75%` на `720px`; вместе с общим gameplay scale это даёт `50%` итогового размера на `1280×720`. `Rules / Правила` Button_L использует тот же scale.
- Настраиваемая `showRules` клавиша (`KeyC` по умолчанию) или Button_L переключает DOM-плашку: overlay плавно едет из-за правого края reference-layer и обратно; shown-позиция держит правый отступ `168px`. Когда board показана, Button_L плавно скрыт и не принимает pointer events.
- На hover DOM-панель получает лёгкий Steam-card-style CSS tilt: cursor offset относительно центра маппится в `rotateX/rotateY` с clamp `±5deg`; при уходе курсора tilt возвращается в `0/0`. Постоянного `rotateZ`-наклона нет.

## Освещение

- Ambient `0xffffff @ 0.35` — общий фоновый
- Directional `0xffffff @ 0.8` из `(0.001, 9.5, -5.2)` — заметно смещён к дальнему краю стола и ниже, чтобы тени от кубиков были длиннее. В local-mode отбрасывает тени; в network-mode тени выключены ради FPS.
- PointLight `0xfff1d0 @ 1.4`, `distance = 14`, `decay = 1.2` — лампа под потолком в `(0, WALL_HEIGHT - 1.1, -5.2)`. Тёплый свет в сторону дальнего края арены, не кастует тени (избегаем кубемап-shadow от точки)
- Shadow camera (directional, local-mode only): map 4096×4096, область `left/right ±9.5`, `top/bottom ±6.5` вокруг физического стола, near 0.5, far 60, bias -0.0005, normalBias 0.02, radius 2

## Renderer

- `antialias: true` в local-mode, `false` в network-mode
- `powerPreference: 'high-performance'`
- `shadowMap.enabled = false` в network-mode; в local-mode `PCFSoftShadowMap`
- `pixelRatio = 1` — приоритет smooth/FPS вместо ретина-рендера

## Perf diagnostics

Debug overlay включается через `?perf` в URL или `localStorage.setItem('dice:perf', '1')`. Показывает FPS/frame time, sim/render time, `renderer.info.render.calls/triangles` и gap между серверными snapshot'ами. В обычном production UI overlay отсутствует.

## Resize

`onResize` берёт CSS-размер canvas из `GameplayLayoutService`, обновляет reference-layer, `camera.aspect`, `camera.position.y = computeCameraY()`, делает `lookAt(CAMERA_TARGET)` (после move — чтобы пересчитать ориентацию), `updateProjectionMatrix()` и backing size renderer c тем же `PS1_RENDER_SCALE`. **Стол и стены НЕ пересоздаются** — они в фиксированных координатах.
