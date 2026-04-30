# DICE-CLIENT

3D-симулятор бросания игральных костей (бывший `kosti`). TypeScript + Three.js (рендер) + Cannon-ES (физика). Сборка: Vite. Игрок зажимает ЛКМ, "трясёт" мышью кости над столом и отпускает — кости летят с инерцией движения курсора.

Серверный авторитативный backend — соседний репо `~/projects/dice-server`. См. `.claude/plans/dice-multiplayer.md` для плана интеграции.

## Архитектура

Модульная сервисная архитектура. Главный оркестратор — `GameEngine`, делегирует работу сервисам. Сервисы общаются через `EventEmitter` (`hold-start`, `hold-move`, `release`).

```
src/
├── main.ts                          # Точка входа, бутстрап
├── style.css                        # Глобальные стили (canvas full-screen)
└── engine/
    ├── config.ts                    # ВСЕ игровые константы (физика, размеры, камера)
    └── classes/
        ├── event-emitter.class.ts   # Базовый EventEmitter для loose coupling
        └── _game-engine/
            ├── game-engine.class.ts # Главный класс, game loop, сцена, физика
            └── services/
                ├── dice.service.ts        # Кости: spawn, hold, release, sync
                └── shake-input.service.ts # Ввод мыши, hold-plane raycast, генерация velocity
```

## Multiplayer-инвариантность

Проект готовится к онлайн-игре. **Физическая площадка (стол + стены) фиксирована в world-units** (`TABLE_WIDTH × TABLE_DEPTH = 16×9` по умолчанию). На разных разрешениях экрана физика и позиции одинаковы — отличается только Y-координата камеры (см. `computeCameraY` в `GameEngine`, contain-fit). Нельзя делать игровые сущности зависящими от viewport.

Аналогично для **сетевого протокола**: файлы `src/network/protocol/*.ts` и `~/projects/dice/dice-server/src/net/protocol/*.ts` обязаны быть бит-в-бит идентичны (за исключением маркер-комментария в первой строке). Wire-формат — см. `dice-server/.claude/specs/network-physics.md`.

И ещё один инвариант — **визуальные грани кости**: таблица `FACE_VALUES_BY_MATERIAL_INDEX` в `src/engine/classes/_game-engine/services/dice.service.ts` обязана соответствовать серверному `FACE_AXES` в `~/projects/dice/dice-server/src/engine/classes/physics-world.class.ts`. Расхождение = клиент покажет одно, сервер засчитает другое (silent gameplay corruption).

Аналогично — **scorer**: `src/domain/scorer.ts` обязан быть бит-в-бит копией `~/projects/dice/dice-server/src/domain/scorer.ts` (за исключением маркер-комментария на первой строке). Клиент использует его только для UI-подсказок (показать игроку какие комбинации scoring); сервер — авторитативный источник для зачёта очков. Если правила меняются — править оба файла синхронно.

## Ключевые паттерны

- **Composition over inheritance**: `GameEngine` владеет сервисами, не наследуется
- **Event-Driven**: `EventEmitter` для коммуникации `ShakeInputService` → `GameEngine` → `DiceService`
- **Pickup/release**: кости стартуют DYNAMIC и лежат на столе. На mousedown — `DiceService.pickup()` скрывает их и паркует тела под сценой. На mouseup — `release(velocity, position)` спавнит их на позиции курсора с инерцией движения мыши.
- **Velocity buffer**: окно последних `VELOCITY_BUFFER_MS` сэмплов мыши для расчёта скорости броска

## Конвенции кода

- Классы: PascalCase, один класс на файл, суффикс `.class.ts`
- Сервисы: kebab-case с суффиксом `.service.ts`, лежат в `services/`
- Конфиги: ВСЁ в `engine/config.ts`, не разбрасывать магические числа
- Никаких UI-фреймворков, vanilla DOM
- TypeScript strict + `noUnusedLocals` + `noUnusedParameters` — компилятор не пропустит мусор

## SPARC спецификации

Подробные спецификации каждой системы в `.claude/specs/`:
- `engine.md` — `GameEngine`, game loop, сцена, физический мир, контактные материалы
- `dice.md` — `DiceService`: spawn, holdAt, release, syncMeshes
- `input.md` — `ShakeInputService`: hold-plane raycast, velocity buffer, события
- `network.md` — `NetworkService`, бинарный WebSocket, протокол C↔S
- `turn-ui.md` — `SelectionService` + `HudUiService`: click-to-select, HUD-оверлей, координация click vs hold

**Перед любой задачей — прочитай релевантную спецификацию.**

## Кастомные команды

- `/add-service` — добавить новый сервис движка
- `/verify` — проверить сборкой (`npm run build`)
- `/tune-physics` — гид по тюнингу физики и ощущения броска

## Правила работы

1. **Не ломай game loop** — изменения в `gameLoop()` (фиксированный шаг физики, sync, render) требуют особой осторожности
2. **Регистрируй в `config.ts`** — новые константы (физика, размеры, тайминги)
3. **Используй EventEmitter** — для коммуникации между сервисами, не дёргай напрямую
4. **Помни про pickup/release контракт** — `pickup()` скрывает кости и паркует тела; `release(velocity, position)` показывает их и переключает в DYNAMIC. Не забывай про идемпотентность (`isHeld`).
5. **Тестируй билд** — `npm run build` перед коммитом

## Continuity между сессиями

Контекстное окно конечно. Чтобы не терять прогресс между сессиями:

1. **Перед началом работы** — проверь `.claude/tasks/` на наличие активных задач с `progress.md`
2. **Во время работы** — обновляй `progress.md` после каждого значимого шага (файл изменён, баг найден, решение принято)
3. **При завершении** — если задача не закончена, обязательно запиши текущий прогресс

Структура задач:
```
.claude/tasks/
├── {task-name}/
│   ├── task.md          # Описание задачи, acceptance criteria
│   └── progress.md      # Текущий прогресс
```

Формат `progress.md`:
```
# Progress: {task name}
## Status: in-progress | blocked | done
## Completed
- [x] Шаг 1 — что сделано, какие файлы изменены
## Remaining
- [ ] Шаг 2 — что нужно сделать
## Notes
Контекст, решения, неочевидные моменты для следующей сессии
```

**Правило**: если видишь задачу со статусом `in-progress` — продолжи с того места, где остановился, не начинай сначала.
