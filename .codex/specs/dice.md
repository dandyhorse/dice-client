# Dice Specification

`src/engine/classes/_game-engine/services/dice.service.ts`

Сервис костей. Жизненный цикл: лежат на столе → игрок "берёт" (mousedown, кости исчезают) → "бросает" (mouseup, кости появляются на позиции курсора и летят с инерцией движения мыши).

## Структура

```ts
interface Die {
  mesh: THREE.Mesh;          // Куб с 6 pip-текстурированными гранями
  body: CANNON.Body;         // Box-тело
  spawnOffset: THREE.Vector3; // Смещение по X для разнесения костей при release
}
```

Каждая грань — отдельный `MeshStandardMaterial` (массив материалов в `Mesh`). Base color карты граней генерируются через canvas: фон берётся из `public/assets/dice/plastered-stone-wall-1k/plastered_stone_wall_diff_1k.jpg`, поверх рисуются текущие чёрные pips. Normal/roughness карты из того же набора шарятся между материалами.

`PARKED_Y = -1000` — Y-координата для "парковки" тел при hold (чтобы не мешали рейкастам).

`isHeld: boolean` — флаг "игрок держит кости в воздухе невидимыми".

## Методы

### `spawn()`

Создаёт `DICE_COUNT` костей **DYNAMIC, лежащих на столе**:
- `BoxGeometry(1, 1, 1)`, 6 материалов (`roughness 0.9, metalness 0`, plastered-stone base + pips)
- Тело: `Box(half=0.5)`, `mass = DICE_MASS`, `linearDamping/angularDamping = 0.1`
- **Стартовый тип: DYNAMIC** (не KINEMATIC). Кости лежат на столе и спят.
- `allowSleep = true`, `sleepSpeedLimit = 0.25`, `sleepTimeLimit = 0.2`
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
   - Зажать центр release-группы так, чтобы все активные кости с X-разносом стартовали внутри стен, затем поставить тело в `position + spawnOffset`
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
