# Tune Physics

Гид по тюнингу физики dice-client. Все константы — в `src/engine/config.ts`. Перед началом прочитай `.claude/specs/engine.md` и `.claude/specs/dice.md`.

## Симптомы → что крутить

### "Кости плавают, медленно падают"

- Уменьшить `WORLD_GRAVITY` (сделать ещё отрицательнее, например -35)
- Увеличить `THROW_DOWNWARD_BIAS` по модулю (-3.5 вместо -2.5)

### "Кости слишком прыгают по столу"

- Уменьшить `restitution` в контактном материале `dice ↔ table` (`game-engine.class.ts → setupContactMaterials`)
- Увеличить `friction` там же
- Увеличить `linearDamping`/`angularDamping` в `DiceService.spawn()`

### "Кости скользят и не останавливаются"

- Увеличить `friction` (dice↔table)
- Увеличить `sleepSpeedLimit`/уменьшить `sleepTimeLimit` в `DiceService.spawn()` — быстрее заснут
- Уменьшить `WORLD_GRAVITY` по модулю — кости легче, быстрее тормозят

### "Кости застревают друг в друге / странно сталкиваются"

- Увеличить `world.solver.iterations` (сейчас 10, можно 15-20) в `createPhysicsWorld()`
- Уменьшить `contactEquationRelaxation` (жёстче контакт)
- Проверить, что `quatNormalizeSkip` не слишком велик (сейчас 2)

### "Бросок слабый / кости еле летят"

- Увеличить `THROW_LINEAR_SCALE` (с 6 до 8-10)
- Увеличить `THROW_ANGULAR_RANDOM` для более резкого вращения

### "Бросок слишком резкий, неуправляемый"

- Уменьшить `THROW_LINEAR_SCALE`
- Уменьшить `VELOCITY_BUFFER_MS` (с 90 до 50) — учитывается только самый последний рывок мыши
- Уменьшить `THROW_ANGULAR_RANDOM`

### "При hold кости дёргаются неестественно"

- Уменьшить `HOLD_JITTER_SCALE` (с 0.04 до 0.02)
- Понизить максимум `tumble` в `DiceService.holdAt()` (`Math.min(... , 0.4)` — уменьшить 0.4)

### "Click без движения не бросает кости"

- Это работает: `THROW_MIN_SPEED` добавляет forward камеры
- Если хочешь отключить — убрать блок `if (velocity.length() < THROW_MIN_SPEED)` в `ShakeInputService.onMouseUp`

### "Кости падают через стол"

- Увеличить `contactEquationStiffness` (сейчас 1e8, попробуй 1e9)
- Увеличить количество substeps в `physicsWorld.step(1/60, dt, 3)` (третий аргумент)
- Проверить `TABLE_THICKNESS` — слишком тонкий стол + быстрая кость = туннелирование

## Где что искать

| Что | Где |
|-----|-----|
| Гравитация, размеры, масса, тайминги | `src/engine/config.ts` |
| Контактные материалы (friction, restitution) | `game-engine.class.ts → setupContactMaterials()` |
| Solver iterations, broadphase | `game-engine.class.ts → createPhysicsWorld()` |
| Damping, sleep, начальный тип тела | `dice.service.ts → spawn()` |
| Jitter, tumble при hold | `dice.service.ts → holdAt()` |
| Случайная угловая скорость при release | `dice.service.ts → release()` |
| Расчёт скорости броска от движения мыши | `shake-input.service.ts → onMouseUp()` |

## Цикл итерации

1. Менять по одному параметру за раз
2. `npm run dev`, попробовать руками 5-10 бросков
3. Если хуже — откатить, попробовать другое
4. После финальной настройки — `/verify`

## Что НЕ трогать без сильных оснований

- Фиксированный шаг `1/60` в `physicsWorld.step` — менять только если меняется целевой FPS
- `pixelRatio = min(devicePixelRatio, 2)` — этот клэмп защищает от GPU-перегруза на ретине
- Размер shadow map (2048×2048) — больше = жор VRAM, меньше = "зубцы" теней
