# Input Specification

`src/engine/classes/_game-engine/services/shake-input.service.ts`

Сервис ввода. Превращает движение мыши и настраиваемую клавишу броска
(`Space` по умолчанию) в события `hold-start`, `hold-move`, `release` с
позицией в мировых координатах и скоростью броска.

## Поля

- `events: EventEmitter` — публичный, на него подписывается `GameEngine`
- `isHolding: boolean` — флаг зажатой ЛКМ
- `samples: { pos: Vector3, time: ms }[]` — кольцевой буфер позиций мыши за последние `VELOCITY_BUFFER_MS`
- `currentPos`, `lastEmittedPos: Vector3` — кэшируемые векторы
- `lastSpeed: number` — мгновенная скорость движения мыши (units/sec в мировых координатах)
- `raycaster: Raycaster` — для проекции мыши в сцену
- `holdPlane: Plane` — горизонтальная плоскость на `y = HOLD_HEIGHT`
- `ndc: Vector2`, `tmpHit: Vector3` — переиспользуемые буферы (без аллокаций в hot path)

## Подписка на DOM

В конструкторе:
- `canvas.mousedown` → `onMouseDown`
- `canvas.mousemove` → `onMouseMove`
- `window.mouseup` → `onMouseUp` (на window, чтобы поймать release вне канваса)
- `window.keydown` → `onKeyDown` (настраиваемая клавиша мгновенного броска)
- `canvas.contextmenu` → `preventDefault` (не показывать меню по правой кнопке)

## Обработчики

### `onMouseDown(event)`

1. Только ЛКМ (`button === 0`)
2. `projectToHoldPlane(event)` — посчитать `currentPos` (если не попали в плоскость — выйти) и зажать X/Z в безопасную зону стола
3. `isHolding = true`, очистить буфер, добавить первый сэмпл
4. Эмитнуть `hold-start` с клоном `currentPos`

### `onMouseMove(event)`

1. Если `!isHolding` — выйти
2. `projectToHoldPlane(event)` — обновить `currentPos` и зажать X/Z в безопасную зону стола
3. Посчитать `lastSpeed = distance(currentPos, prevSample.pos) / dt`
4. Добавить сэмпл
5. Эмитнуть `hold-move` с `(currentPos.clone(), lastSpeed)`

### `onMouseUp(event)`

1. Только ЛКМ и только если `isHolding`
2. `update(now)` — обрезать старые сэмплы
3. **Расчёт velocity**:
   - Если в буфере ≥2 сэмпла: `velocity = (last.pos - first.pos) / dt`
   - Умножить на `THROW_LINEAR_SCALE`
4. **Минимальная скорость**: если `length < THROW_MIN_SPEED` — добавить forward-вектор камеры (только XZ, нормализованный, умноженный на `THROW_MIN_SPEED`). Без этого "клик без движения" не бросал бы кости.
5. Прибавить к `velocity.y` константу `THROW_DOWNWARD_BIAS` — чтобы кости не "плавали" по столу, а падали
6. **Clamp**: если `length > THROW_MAX_SPEED` — `setLength(THROW_MAX_SPEED)`. Гарантия отсутствия tunneling сквозь стены при очень быстрой мыши.
7. Очистить буфер, эмитнуть `release(velocity, position)` — позиция = `currentPos.clone()` (последняя позиция курсора в мире на hold-плоскости, уже зажатая в safe throw zone)

### `onKeyDown(event)`

1. Только `event.code === throwKeyCode`
2. Игнорировать, если input выключен через `setEnabled(false)`, событие повторное (`event.repeat`), уже отменено (`defaultPrevented`) или сейчас активен mouse-hold
3. Игнорировать, если фокус/target внутри `input`, `textarea`, `select`, `button` или `[contenteditable]`
4. `preventDefault()`, чтобы пробел не скроллил страницу
5. Выбрать random edge-start позицию и эмитнуть из неё `hold-start`
6. Сразу эмитнуть `release` из этой же позиции:
   - старт выбирается с одной из 4 сторон стола, позиция вдоль стороны рандомится
   - старт расположен ближе к центру стороны: `58–76%` от центра к краю, spread вдоль стороны `22%`
   - цель выбирается ближе к центру: в противоположную сторону только на `8–28%` глубины от центра, spread по поперечной оси `25%`
   - горизонтальная скорость = `THROW_MAX_SPEED * 0.46`
   - вертикальная составляющая = `+3.7`, чтобы Space/автобросок давал размеренную дугу вверх

## `update(currentTime)`

Вызывается из `GameEngine.gameLoop` каждый кадр. Удаляет из буфера сэмплы старше `currentTime - VELOCITY_BUFFER_MS`. Это нужно, чтобы при медленном движении в конце броска не учитывалась "история" быстрого старта.

## `projectToHoldPlane(event)`

1. Перевод координат курсора в NDC через `getBoundingClientRect()` (а не `innerWidth/Height` — на случай, если canvas не на весь экран)
2. `raycaster.setFromCamera(ndc, camera)`
3. Пересечение луча с `holdPlane`. Если нет пересечения — `false`, иначе записать в `currentPos`.
4. Зажать `currentPos.x/z` в область внутри стен: `TABLE/2 - WALL_INSET - DICE_HALF_SIZE - THROW_POSITION_PADDING`, а `currentPos.y` вернуть на `HOLD_HEIGHT`.

## Rules board hotkey

- `KeyH` переключает rules-board справа от стола.
- Клавиша игнорируется в `input`, `textarea`, `select`, `button`, `[contenteditable]`.

## Важные тонкости

- `mouseup` слушается на `window`, не на `canvas` — иначе если игрок отпускает ЛКМ за пределами canvas, бросок не сработает
- `keydown` слушается на `window`, но `Space` не перехватывается при фокусе в интерактивных UI-элементах
- `throwKeyCode` хранится как `KeyboardEvent.code`, чтобы физическая клавиша
  работала одинаково в EN/RU раскладках.
- `samples.shift()` — O(n), но n маленькое (≤ ~10 при VELOCITY_BUFFER_MS = 90ms и 60Hz). При увеличении окна стоит перейти на ring buffer
- Все Vector3, передаваемые в события, клонируются — иначе подписчики получат ссылку на изменяющийся `currentPos`
