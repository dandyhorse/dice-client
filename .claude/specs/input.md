# Input Specification

`src/engine/classes/_game-engine/services/shake-input.service.ts`

Сервис ввода. Превращает движение мыши в события `hold-start`, `hold-move`, `release` с позицией в мировых координатах и скоростью движения мыши.

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
- `canvas.contextmenu` → `preventDefault` (не показывать меню по правой кнопке)

## Обработчики

### `onMouseDown(event)`

1. Только ЛКМ (`button === 0`)
2. `projectToHoldPlane(event)` — посчитать `currentPos` (если не попали в плоскость — выйти)
3. `isHolding = true`, очистить буфер, добавить первый сэмпл
4. Эмитнуть `hold-start` с клоном `currentPos`

### `onMouseMove(event)`

1. Если `!isHolding` — выйти
2. `projectToHoldPlane(event)` — обновить `currentPos`
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
7. Очистить буфер, эмитнуть `release(velocity, position)` — позиция = `currentPos.clone()` (последняя позиция курсора в мире на hold-плоскости)

## `update(currentTime)`

Вызывается из `GameEngine.gameLoop` каждый кадр. Удаляет из буфера сэмплы старше `currentTime - VELOCITY_BUFFER_MS`. Это нужно, чтобы при медленном движении в конце броска не учитывалась "история" быстрого старта.

## `projectToHoldPlane(event)`

1. Перевод координат курсора в NDC через `getBoundingClientRect()` (а не `innerWidth/Height` — на случай, если canvas не на весь экран)
2. `raycaster.setFromCamera(ndc, camera)`
3. Пересечение луча с `holdPlane`. Если нет пересечения — `false`, иначе записать в `currentPos` и вернуть `true`

## Важные тонкости

- `mouseup` слушается на `window`, не на `canvas` — иначе если игрок отпускает ЛКМ за пределами canvas, бросок не сработает
- `samples.shift()` — O(n), но n маленькое (≤ ~10 при VELOCITY_BUFFER_MS = 90ms и 60Hz). При увеличении окна стоит перейти на ring buffer
- Все Vector3, передаваемые в события, клонируются — иначе подписчики получат ссылку на изменяющийся `currentPos`
