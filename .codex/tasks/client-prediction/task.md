# Task: Client-side prediction для бросающего игрока

## Почему

В network-режиме (MVP) между `mouseup` и первым видимым движением кости проходит RTT + interp buffer ≈ 60-120 мс. Это воспринимается как подвисание + телепорт в точку броска. В local-режиме этого нет — клиент крутит свою `cannon-es`-симуляцию и движение стартует в тот же кадр, что и отпускание.

Добавляем стандартный online-game приём: инициатор броска локально применяет результат мгновенно (как в local), сервер остаётся source-of-truth, но используется только для:
- рассылки снапшотов зрителю (второму игроку)
- финального face-value (для инициатора — snap после `dice-rest`)

## Что меняется (только клиент, сервер без правок)

### 1. `dice-client/src/engine/classes/_game-engine/game-engine.class.ts`
- В network-режиме теперь **тоже** создаётся полный physics world + materials + `createPlayArea()` (как в local). Было: только меши.
- Новый приватный флаг `isLocalThrow: boolean` (default false).
- Release-handler в network-mode:
  ```ts
  this.dice.release(velocity, position);          // ← локальная симуляция сразу
  this.network.sendRelease(velocity, position);   // ← сервер авторитатив
  this.isLocalThrow = true;
  ```
- `gameLoop`:
  - `mode === 'local' || isLocalThrow` → `physicsWorld.step` + `dice.syncMeshes()` (как в local)
  - `mode === 'network' && !isLocalThrow` → `network.sampleDiceState` + `dice.applySnapshot` (observer-ветка, текущее поведение)
- Подписка на `network.events.on('dice-rest', ...)` → `isLocalThrow = false` + `dice.applySnapshot(rest.dice)` — мгновенный snap к серверной авторитативной позе. Даёт ~1 кадр визуального "щелчка" в момент, когда кость уже остановилась — незаметно.
- `createPlayAreaVisualsOnly` удаляем, всё идёт через обычный `createPlayArea` с body.

### 2. `dice-client/src/engine/classes/_game-engine/services/dice.service.ts`
- В `spawn()`: body добавляется в world для **обоих** режимов (не только local). В network-режиме по умолчанию `KINEMATIC` (чтобы не симулироваться, пока не случится `release`).
- `pickup()`: убираем ветвление по mode, всегда прячем меш + паркуем body (было: в network только прятали меш).
- `release()`: снимаем guard `if (this.mode === 'network') return` — теперь release локально применяется в обоих режимах.
- `applySnapshot()`: снимаем guard `if (this.mode !== 'network') return` — вызывается и для observer-ветки, и для rest-snap у бросающего. Также синхронизируем body с поступающим состоянием (position/quaternion + обнуляем velocity + KINEMATIC), чтобы при следующем `pickup→release` body стартовал с чистого листа.
- `syncMeshes()`: убираем ранний return по mode — теперь вызывается в обоих режимах (но только когда активна local-симуляция; gameLoop это контролирует).

### 3. Observer-поведение (второй игрок, не бросающий)
Без изменений. `isLocalThrow` у наблюдателя остаётся `false`, gameLoop идёт в snapshot-ветку, всё как сейчас.

## Анти-чит

Сохраняется: финальные face values приходят с сервера в `match:dice-rest`. Локальная симуляция у бросающего **может отличаться** по промежуточной траектории (spin рандомный и на сервере, и у клиента — независимые RNG), но конечное число — серверное. Клиент может "красиво" показать себе бросок, но "выбить 6-6" своим рендером не может — оппонент видит серверные значения.

## Acceptance criteria

- [ ] Инициатор броска: mouseup → кости появляются и движутся в тот же кадр (ровно как в local-режиме, без freeze/teleport).
- [ ] Второй игрок (другое окно): видит бросок через серверные снапшоты с интерполяцией (как и сейчас).
- [ ] По завершении броска оба игрока видят одинаковую final-позу (от сервера); у бросающего может быть микро-snap на последнем кадре — норма.
- [ ] Local-режим продолжает работать ровно как был.
- [ ] `npm run build` зелёный.

## Out of scope

- Плавный blend (lerp) между локальной rest и серверной rest. MVP = мгновенный snap.
- Отображение face values в UI (они приходят в `dice-rest.dice[i].faceValue`, но рендерить пока не надо).
- Reconciliation **во время** броска (коррекция локальной симуляции промежуточными серверными снапшотами). Снапшоты сервера в `isLocalThrow=true` игнорируются — это ок для короткого броска (1-3 сек).
- Детерминированная физика (одинаковый seed). Не нужно — итоговый state сервера авторитетен.

## Конвенции
- Arrow functions only (memory `feedback_arrow_functions` в проекте).
- TypeScript strict — компилятор не пропустит мусор.
- Никаких новых констант в config.ts — логика на флагах/методах.
