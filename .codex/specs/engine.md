# Engine Core Specification

## GameEngine (`src/engine/classes/_game-engine/game-engine.class.ts`)

Главный оркестратор. Владеет сценой, физикой, рендерером, материалами и сервисами.

### Поля

- `scene: THREE.Scene` — сцена, фон `0x1a1a22`
- `camera: THREE.PerspectiveCamera` — fov `CAMERA_FOV` (45), near 0.1, far 200, **top-down**. X/Z из `CAMERA_X/Z`, **Y вычисляется** под текущий aspect (см. Camera fit). `up = (0, 0, -1)` чтобы избежать gimbal lock.
- `renderer: THREE.WebGLRenderer` — `pixelRatio = 1`; в network-mode antialias/shadows выключены ради FPS, в local-mode остаётся `PCFShadowMap`
- `physicsWorld: CANNON.World` — `SAPBroadphase`, GS solver 10 итераций, `allowSleep = true`
- `diceMaterial`, `tableMaterial: CANNON.Material` — для контактных пар

### Инициализация (constructor)

1. `createScene()` — фон + ambient + directional + point light; shadow map включается только в local-mode
2. `createCamera()` — `up = CAMERA_UP` → `position = (CAMERA_X, computeCameraY(aspect), CAMERA_Z)` → `lookAt(CAMERA_TARGET)` (порядок важен: `up` до `lookAt`)
3. `createRenderer()` — настройка теней и PR
4. `createPhysicsWorld()` — gravity `(0, WORLD_GRAVITY, 0)`, broadphase, sleep
5. `setupContactMaterials()`:
   - dice ↔ table: `friction 0.45, restitution 0.35, contactEquationStiffness 1e8, contactEquationRelaxation 3`
   - dice ↔ dice: `friction 0.25, restitution 0.25`
6. `createPlayArea()` — **один раз** создаёт стол `TABLE_WIDTH × TABLE_DEPTH`, 4 видимые стены (с `WALL_INSET` от кромки) и невидимый потолок на высоте `WALL_HEIGHT`
7. `new DiceService(...).spawn()` — спавн костей
8. `new ShakeInputService(...)` — подписка на `hold-start` → `dice.pickup()` и `release` → `dice.release(velocity, position)`. `hold-move` сервис эмитит, но движок его не слушает.
9. `addEventListener('resize', onResize)` — пересчёт aspect и Y камеры

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

- `start()` — фиксирует `lastTime` и стартует `rafId`
- `stop()` — `cancelAnimationFrame`, обнуляет `rafId`

## Play area (фиксированный стол + стены + потолок)

**Принципиально**: стол, стены и потолок имеют **фиксированные размеры в world units** и создаются один раз в `createPlayArea()`. Это требование мультиплеера: физическая площадка одинакова у всех игроков независимо от разрешения экрана.

- Стол: `TABLE_WIDTH × TABLE_DEPTH` (по умолчанию 16×9), толщина `TABLE_THICKNESS`. Mesh цвета `0x2c5530`, `mass = 0`.
- Стены: 4 видимые `CANNON.Body + THREE.Mesh` по периметру **внутренней** области `(TABLE_WIDTH - 2·WALL_INSET) × (TABLE_DEPTH - 2·WALL_INSET)`. Mesh цвета `0x5c4a3a` (тёплое дерево). Shadow flags включаются только в local-mode. Высота `WALL_HEIGHT`, толщина `WALL_THICKNESS`. `WALL_INSET` нужен чтобы стены попадали в frustum top-down камеры (при contain-fit без inset стены ровно на границе FOV) и оставлял зелёную "рамку" между стеной и кромкой стола.
- Потолок: невидимый `CANNON.Body` (без mesh) поверх стен на высоте `WALL_HEIGHT`, размером с внутреннюю область. Закрывает арену сверху, чтобы кости не вылетали при сильном броске. Mesh не нужен — top-down камера смотрит ровно сквозь, видимый потолок перекрыл бы вид.

## Camera fit (contain)

Камера подстраивается под viewport так, чтобы стол целиком был виден на любом аспекте.

```
tanHalf  = tan(CAMERA_FOV/2 in rad)
hForDepth = (TABLE_DEPTH/2) / tanHalf
hForWidth = (TABLE_WIDTH/2) / (tanHalf * camera.aspect)
camera.y  = max(hForDepth, hForWidth)   // contain — берём большую высоту
```

- На 16:9 viewport обе формулы дают одну Y, стол занимает экран впритык
- На ultrawide (aspect > 16/9) `hForDepth` побеждает → камера ниже, по бокам видны поля сцены (фон `0x1a1a22`)
- На portrait/square `hForWidth` побеждает → камера выше, поля сверху/снизу

`computeCameraY(aspect = camera.aspect)` — приватный метод. Вызывается из `createCamera` и `onResize`.

## Глобальные константы (`src/engine/config.ts`)

| Константа | Значение | Назначение |
|-----------|----------|------------|
| `WORLD_GRAVITY` | -25 | Сильнее реальной — кости резче падают |
| `TABLE_WIDTH` | 16 | Ширина стола в world-units (по X) |
| `TABLE_DEPTH` | 9 | Глубина стола в world-units (по Z), 16:9 |
| `TABLE_THICKNESS` | 0.4 | Толщина стола |
| `WALL_HEIGHT` | 4 | Высота стен (и потолка) |
| `WALL_THICKNESS` | 1.0 | Толщина стен и потолка (страховка от tunneling) |
| `WALL_INSET` | 1.0 | Сдвиг внутренней грани стены от кромки стола; равен WALL_THICKNESS — внешняя грань ровно на кромке |
| `DICE_COUNT` | 6 | Сколько костей спавнить |
| `DICE_HALF_SIZE` | 0.22 | Полуразмер ребра кости (куб 0.44×0.44×0.44) |
| `DICE_MASS` | 0.3 | Масса кости |
| `DICE_SPACING` | 0.6 | Разнос костей по X при release |
| `HOLD_HEIGHT` | 2.5 | Y-уровень hold-плоскости (куда проецируется мышь) |
| `HOLD_JITTER_SCALE` | 0.04 | (legacy, не используется в новом флоу pickup/release) |
| `VELOCITY_BUFFER_MS` | 90 | Окно сэмплов для расчёта скорости броска |
| `THROW_LINEAR_SCALE` | 0.8 | Масштаб линейной скорости броска (мышь → мир) |
| `THROW_DOWNWARD_BIAS` | -1.8 | Принудительная Y-составляющая вниз при release |
| `THROW_MIN_SPEED` | 0.4 | Минимальная скорость, иначе добавляется forward камеры |
| `THROW_MAX_SPEED` | 12 | Жёсткий потолок |velocity| перед emit — гарантия отсутствия tunneling сквозь стены |
| `THROW_ANGULAR_RANDOM` | 5 | Диапазон случайной угловой скорости при release |
| `CAMERA_FOV` | 45 | Vertical FOV перспективной камеры |
| `CAMERA_X`, `CAMERA_Z` | 0, 0 | Горизонтальная позиция камеры (по центру стола) |
| `CAMERA_TARGET` | `[0, 0, 0]` | Куда смотрит камера |
| `CAMERA_UP` | `[0, 0, -1]` | Up-вектор. Без него top-down даёт gimbal lock (look ‖ up) |

## Освещение

- Ambient `0xffffff @ 0.35` — общий фоновый
- Directional `0xffffff @ 0.8` из `(0.001, 18, 0.001)` — **строго сверху (90°)**. В local-mode отбрасывает тени; в network-mode тени выключены ради FPS. Микро-смещение по X/Z, чтобы shadow camera lookAt не совпал с up-вектором (иначе degenerate).
- PointLight `0xfff1d0 @ 1.4`, `distance = 14`, `decay = 1.2` — лампа под потолком в `(0, WALL_HEIGHT - 0.3, 0)`. Тёплый свет в центр арены, не кастует тени (избегаем кубемап-shadow от точки)
- Shadow camera (directional, local-mode only): map 1024×1024, квадрат `±20` (покрывает 16×9 стол с запасом), near 0.5, far 60, bias -0.0005

## Renderer

- `antialias: true` в local-mode, `false` в network-mode
- `powerPreference: 'high-performance'`
- `shadowMap.enabled = false` в network-mode; в local-mode `PCFShadowMap`
- `pixelRatio = 1` — приоритет smooth/FPS вместо ретина-рендера

## Perf diagnostics

Debug overlay включается через `?perf` в URL или `localStorage.setItem('dice:perf', '1')`. Показывает FPS/frame time, sim/render time, `renderer.info.render.calls/triangles` и gap между серверными snapshot'ами. В обычном production UI overlay отсутствует.

## Resize

`onResize` пересчитывает `camera.aspect`, обновляет `camera.position.y = computeCameraY()`, делает `lookAt(CAMERA_TARGET)` (после move — чтобы пересчитать ориентацию), `updateProjectionMatrix()` и `renderer.setSize(...)`. **Стол и стены НЕ пересоздаются** — они в фиксированных координатах.
