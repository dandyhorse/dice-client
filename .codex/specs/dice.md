# Dice Specification

`src/engine/classes/_game-engine/services/dice.service.ts`

Сервис костей. Жизненный цикл: лежат на столе → игрок "берёт" (mousedown, кости исчезают) → "бросает" (mouseup, кости появляются на позиции курсора и летят с инерцией движения мыши).

## Структура

```ts
interface Die {
  mesh: THREE.Mesh;          // Куб с 6 разноцветными гранями
  body: CANNON.Body;         // Box-тело
  spawnOffset: THREE.Vector3; // Смещение по X для разнесения костей при release
}
```

`FACE_COLORS = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf1c40f, 0x9b59b6, 0xecf0f1]` — 6 цветов, по одному на грань. Каждая грань — отдельный `MeshStandardMaterial` (массив материалов в `Mesh`).

`PARKED_Y = -1000` — Y-координата для "парковки" тел при hold (чтобы не мешали рейкастам).

`isHeld: boolean` — флаг "игрок держит кости в воздухе невидимыми".

## Методы

### `spawn()`

Создаёт `DICE_COUNT` костей **DYNAMIC, лежащих на столе**:
- `BoxGeometry(1, 1, 1)`, 6 материалов (`roughness 0.4, metalness 0.05`)
- Тело: `Box(half=0.5)`, `mass = DICE_MASS`, `linearDamping/angularDamping = 0.1`
- **Стартовый тип: DYNAMIC** (не KINEMATIC). Кости лежат на столе и спят.
- `allowSleep = true`, `sleepSpeedLimit = 0.15`, `sleepTimeLimit = 0.5`
- `spawnOffset.x = (i - (count-1)/2) * DICE_SPACING` — расстановка по X
- Стартовая позиция: `(offsetX, DICE_HALF_SIZE + 0.05, 0)` — чуть выше стола, физика опустит и усыпит

### `pickup()`

Вызывается на `hold-start` (mousedown). Идемпотентен (если `isHeld` — выходит).

1. `isHeld = true`
2. Для каждой кости:
   - `mesh.visible = false` — скрыть из рендера
   - `body.type = KINEMATIC` — выйти из физики
   - Обнулить `velocity`, `angularVelocity`, `force`, `torque`
   - Переставить тело в `(0, PARKED_Y, 0)` — чтобы не мешало рейкастам/коллизиям
   - `body.sleep()`

### `release(velocity, position)`

Вызывается на `release` (mouseup). Идемпотентен (если `!isHeld` — выходит).

1. `isHeld = false`
2. Для каждой кости:
   - `mesh.visible = true`
   - `body.type = DYNAMIC`
   - Поставить тело в `position + spawnOffset` (XYZ от курсора, плюс разнос по X между костями)
   - Случайный начальный кватернион (ось `random.unit()`, угол `random * 2π`)
   - `body.wakeUp()`
   - `body.velocity = velocity` (одинаковая для всех)
   - `body.angularVelocity` — случайный в диапазоне `±THROW_ANGULAR_RANDOM` по каждой оси
   - Синхронизировать mesh с body немедленно (иначе один кадр визуала на старой позиции)

### `syncMeshes()`

Каждый кадр копирует `body.position/quaternion` → `mesh`. **Скрытые кости пропускает** (`if (!die.mesh.visible) continue`) — они припаркованы, синхронизировать незачем.

## Важно

- Кости стартуют как **DYNAMIC** (не KINEMATIC, как было раньше). Если оставить KINEMATIC — они зависнут в воздухе и не будут лежать на столе.
- При pickup тела паркуются под сценой. Это проще, чем убирать body из мира и потом добавлять обратно. Цена — body всё ещё в физическом мире, но не сталкивается ни с чем (стол при `y = -1000` далеко).
- `syncMeshes` пропускает скрытые — иначе при рендере они "телепортируются" под пол перед тем как visible снова true.
- `release` устанавливает mesh.position/quaternion вручную, не дожидаясь следующего `syncMeshes` — иначе один кадр кости отрисуются на старой позиции (или на парковке).
