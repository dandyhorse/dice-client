# Input Specification

`src/engine/classes/_game-engine/services/shake-input.service.ts`

Сервис ввода. Превращает движение основного указателя (мышь или touch) и настраиваемую клавишу броска
(`Space` по умолчанию) в события `hold-start`, `hold-move`, `hold-cancel`, `release` с
позицией в мировых координатах и скоростью броска.

## Поля

- `events: EventEmitter` — публичный, на него подписывается `GameEngine`
- `isHolding: boolean` — флаг удержания основного указателя
- `samples: { pos: Vector3, time: ms }[]` — кольцевой буфер позиций указателя за последние `VELOCITY_BUFFER_MS`
- `currentPos`, `lastEmittedPos: Vector3` — кэшируемые векторы
- `lastSpeed: number` — мгновенная скорость движения указателя (units/sec в мировых координатах)
- `raycaster: Raycaster` — для проекции указателя в сцену
- `holdPlane: Plane` — горизонтальная плоскость на `y = HOLD_HEIGHT`
- `ndc: Vector2`, `tmpHit: Vector3` — переиспользуемые буферы (без аллокаций в hot path)

## Подписка на DOM

В конструкторе:
- `canvas.pointerdown` → `onPointerDown`
- `canvas.pointermove` → `onPointerMove`
- `window.pointerup` → `onPointerUp` (на window, чтобы поймать release вне канваса)
- `window.keydown` → `onKeyDown` (настраиваемая клавиша мгновенного броска)
- `canvas.contextmenu` → `preventDefault` (не показывать меню по правой кнопке)

## Cursor

- Игровой canvas управляет курсором внутри `ShakeInputService`, а не глобальным CSS для всех `<canvas>`.
- Source gameplay hand assets (`open-hand`/`close-hand`) остаются `128×128` PNG в `public/assets/cursors/`; базовый `target-hand` runtime asset уменьшен до `50×50`, чтобы быть чуть крупнее обычного системного курсора.
- На desktop `src/ui/custom-cursor.ts` скрывает native cursor после первого pointer movement и рисует DOM overlay поверх страницы; overlay имеет `pointer-events: none`. `open-hand`/`close-hand` остаются `147×147` (`+15%`), базовый `target-hand` — `50×50`.
- Mobile runtime не устанавливает DOM-cursor, а CSS принудительно возвращает обычный touch cursor для всех элементов.
- В mobile runtime не регистрируется menu `ui-hover` sound; `ui-click` проигрывается только у реальных интерактивных DOM-controls, поэтому тап по пустому месту, фону или игровому столу полностью тихий. Custom mobile keyboard также не проигрывает `ui-click`, чтобы первый ввод текста не накладывался на техническое audio-unlock событие.
- Базовый cursor всего клиента: `target-hand`; он действует в меню, паузах, выборе костей и любых состояниях без активного hold/release.
- Когда input включён, кости ещё не взяты, pointer находится над throw-zone стола и поверх нет DOM-меню/модалки: `open-hand`.
- Когда игрок держит кости и pointer остаётся над throw-zone стола без DOM-меню/модалки поверх: `close-hand`.
- Если pointer выходит за throw-zone или под pointer оказывается не canvas (например, открыто меню поверх), desktop overlay принудительно показывает `target-hand`.
- После release canvas сразу возвращается к базовому `target-hand`; отдельного release-ассета сейчас нет.
- В коде `ShakeInputService` намеренно сохранён закомментированный `IMPORTANT: do not delete` подход для альтернативы: держать `open-hand` после release до local faces read / network `MATCH_ROLL_RESULT`. Он сейчас не активен.

## Обработчики

### `onPointerDown(event)`

1. Только основной указатель и основная кнопка (`isPrimary`, `button === 0`)
2. `projectToHoldPlane(event)` — посчитать `currentPos` (если не попали в плоскость — выйти) и зажать X/Z в безопасную зону стола
3. `isHolding = true`, очистить буфер, добавить первый сэмпл
4. Эмитнуть `hold-start` с клоном `currentPos`

### `onPointerMove(event)`

1. Если `!isHolding` — выйти
2. `projectToHoldPlane(event)` — обновить `currentPos` и зажать X/Z в безопасную зону стола
3. Посчитать `lastSpeed = distance(currentPos, prevSample.pos) / dt`
4. Добавить сэмпл
5. Эмитнуть `hold-move` с `(currentPos.clone(), lastSpeed)`

### `onPointerUp(event)`

1. Только основной указатель и только если `isHolding`
2. `update(now)` — обрезать старые сэмплы
3. **Расчёт velocity**:
   - Если в буфере ≥2 сэмпла: `velocity = (last.pos - first.pos) / dt`
   - Умножить на `THROW_LINEAR_SCALE`
4. **Минимальная скорость**: если `length < THROW_MIN_SPEED` — добавить forward-вектор камеры (только XZ, нормализованный, умноженный на `THROW_MIN_SPEED`). Без этого "клик без движения" не бросал бы кости.
5. Прибавить к `velocity.y` константу `THROW_DOWNWARD_BIAS` — чтобы кости не "плавали" по столу, а падали
6. **Clamp**: если `length > THROW_MAX_SPEED` — `setLength(THROW_MAX_SPEED)`. Гарантия отсутствия tunneling сквозь стены при очень быстром движении.
7. Очистить буфер, эмитнуть `release(velocity, position)` — позиция = `currentPos.clone()` (последняя позиция указателя в мире на hold-плоскости, уже зажатая в safe throw zone)

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
   - горизонтальная скорость = `THROW_MAX_SPEED * 0.41`
   - вертикальная составляющая = `+3.7`, чтобы Space/автобросок давал размеренную дугу вверх

## `update(currentTime)`

Вызывается из `GameEngine.gameLoop` каждый кадр. Удаляет из буфера сэмплы старше `currentTime - VELOCITY_BUFFER_MS`. Это нужно, чтобы при медленном движении в конце броска не учитывалась "история" быстрого старта.

## Отмена удержания

Если input выключается или поверх игры появляется блокирующий UI во время hold, сервис очищает velocity samples и эмитит `hold-cancel`. `GameEngine` вызывает `DiceService.cancelPickup()`, который восстанавливает локальные тела или последнюю сетевую позу вместо оставления скрытых костей.

## `projectToHoldPlane(event)`

1. Перевод координат указателя в NDC через `getBoundingClientRect()` (а не `innerWidth/Height` — на случай, если canvas не на весь экран)
2. `raycaster.setFromCamera(ndc, camera)`
3. Пересечение луча с `holdPlane`. Если нет пересечения — `false`, иначе записать в `currentPos`.
4. Зажать `currentPos.x/z` в область внутри стен: `TABLE/2 - WALL_INSET - DICE_HALF_SIZE - THROW_POSITION_PADDING`, а `currentPos.y` вернуть на `HOLD_HEIGHT`.

## Rules board hotkey

- Настраиваемая клавиша `showRules` (`KeyC` по умолчанию) переключает rules-board справа от стола.
- В игровом поле справа показывается `Rules / Правила (<клавиша>)` в рамке `Button_L`. Клик по ней переключает ту же доску.
- Пока доска выезжает и показана, подсказка плавно исчезает; после её закрытия — плавно возвращается.
- Клавиша игнорируется в `input`, `textarea`, `select`, `button`, `[contenteditable]`.

## Важные тонкости

- `pointerup` слушается на `window`, не на `canvas` — иначе если игрок отпускает кнопку мыши или палец за пределами canvas, бросок не сработает
- `keydown` слушается на `window`, но `Space` не перехватывается при фокусе в интерактивных UI-элементах
- `throwKeyCode` хранится как `KeyboardEvent.code`, чтобы физическая клавиша
  работала одинаково в EN/RU раскладках.
- `samples.shift()` — O(n), но n маленькое (≤ ~10 при VELOCITY_BUFFER_MS = 90ms и 60Hz). При увеличении окна стоит перейти на ring buffer
- Все Vector3, передаваемые в события, клонируются — иначе подписчики получат ссылку на изменяющийся `currentPos`
