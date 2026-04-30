# Turn UI Specification

Клиентская часть turn-based слоя (этап 6 из `dice-server/.claude/specs/match-rules.md`). Сервер — авторитативная state-machine; клиент только рендерит фазу и собирает выбор игрока.

Два сервиса + точечные доработки:

```
src/engine/classes/_game-engine/services/
├── selection.service.ts   — click-to-select по костям с подсветкой
└── hud-ui.service.ts      — DOM-оверлей с фазой/счётом/кнопками
```

## SelectionService

`selection.service.ts`. Raycaster на canvas mouseup, toggle подсветка кости, эмит индексов выбранных костей.

### API

```ts
class SelectionService {
  readonly events: EventEmitter;  // 'selection-changed' (indices: number[])
  constructor(canvas, camera, dice: DiceService);
  enable(): void;        // разрешить обработку кликов
  disable(): void;       // выключить + clear()
  getSelectedIndices(): number[];  // в порядке кликов
  clear(): void;         // снять подсветку, очистить set, эмит [].
}
```

### Слушает

`canvas.mouseup` (НЕ mousedown — иначе ненужный конфликт с любым будущим pointer-handler'ом). ЛКМ только. При `enabled=false` молча игнорирует.

### Что ловится

- Через `dice.getActiveRemoteMeshes()` — список `{mesh, index}` где `mesh.visible`. Bench-кости (`mesh.visible=false` после `applySnapshot` фильтрует `state.p[1] < -100`) автоматически выпадают.
- `Raycaster.intersectObjects(meshes, false)` — `recursive=false`, кости — плоские `Mesh`'и без детей.
- Найденный mesh маппится обратно в `index` (snapshot-индекс). Toggle.

### Индексы

Возвращаются индексы в `dice.remoteDice[]` массиве (= индексы в `MATCH_DICE_SNAPSHOT`). Сервер ожидает индексы в `lastRolledFaces` (массив активных костей); т.к. `activeIndices = [0..remainingDice-1]` — первые N в `physics.dice` — порядок совпадает 1:1. Bench-кости **не попадают** в выбор по построению (невидимы), значит индексы остаются непрерывными.

### Подсветка

Кость = `THREE.Mesh` с **массивом 6 материалов** (по одному на грань — `MeshStandardMaterial` с pip-текстурой, см. `dice.md`). Применяем `emissive = 0x4488ff`, `emissiveIntensity = 0.4` ко всем 6 материалам. Снимаем — `0x000000` / `0`. Геометрия и текстуры не трогаются.

## HudUiService

`hud-ui.service.ts`. Vanilla DOM (no React/Vue), стиль через `Object.assign(elem.style, {...})` — как `main.ts:renderLobby` / `showRoomCode`.

### Структура DOM

5 фиксированных оверлеев поверх canvas (`pointer-events: none` где можно, чтобы не блокировать клики по сцене):

| id | где | что |
|---|---|---|
| `#hud-left` | top-left | «Чей ход: X» / «Накоплено в ходу: N» / «Bench: f1, f2, ...» |
| `#hud-right` | top-right | для каждого игрока: «X: total / TARGET_SCORE» |
| `#hud-actions` | bottom-center | кнопки `[Continue]` `[Bank]` (только в SELECTING + own turn) |
| `#hud-status` | bottom-center (под actions) | строка по фазе («Бросаем...», «Ждём X», «Победил X!»...) |
| `#hud-error` | center | временный флэш — BUST или ACK_ERROR, исчезает через 2.5s |

### API

```ts
class HudUiService {
  readonly events: EventEmitter;  // 'continue-clicked', 'bank-clicked'
  constructor(ownUserId: string);
  setMatchState(state: MatchStatePayload): void;  // из MATCH_STATE
  setSelectedCount(n: number): void;              // из SelectionService
  showError(message: string): void;               // временный флэш
  destroy(): void;                                 // снять оверлеи
}
```

### Логика рендера

- **Кнопки видны** только если `phase === SELECTING && currentPlayer === ownUserId`.
- **Кнопки enabled** только если `selectedCount > 0` (нельзя отправить пустой выбор — сервер всё равно отвергнет, но UX-фильтр на клиенте дешевле).
- **Статус-строка** по фазе (см. таблицу в `match-rules.md`).
- **Player labels**: `userId === ownUserId` → «Ты», иначе — первые 8 символов userId (UUID длинный, urлять не хочется).
- **BUST**: на `match-roll-result.bust=true` показываем флэш «BUST» (через showError).

## Координация Input ↔ Selection

`ShakeInputService` — точно тот же, что и был, но получил метод `setEnabled(boolean)`. По умолчанию `true` (для local-режима ничего не меняется). В network-mode — выключен до получения первого `MATCH_STATE`, потом следует фазе:

| Фаза + чей ход | shake-input | selection |
|---|---|---|
| `WAITING` + own | enabled | disabled |
| `SELECTING` + own | disabled | enabled |
| `ROLLING` (любой) | disabled | disabled |
| Не свой ход | disabled | disabled |
| `FINISHED` | disabled | disabled |

Так click-by-cost и hold-to-throw **никогда не активны одновременно** — конфликта по mousedown/mouseup физически быть не может.

`ShakeInputService.setEnabled(false)` посреди удержания корректно отменяет hold (без emit'а release) — иначе в `DiceService` мог бы остаться `isHeld=true` и кости пропали бы навсегда.

## Доработки в существующих файлах

- `shake-input.service.ts`: добавлен `enabled` флаг, метод `setEnabled(boolean)`, гард в начале каждого `onMouseDown/Move/Up`.
- `dice.service.ts`: добавлен `getActiveRemoteMeshes(): {mesh, index}[]` — единственная точка доступа SelectionService к мешам.
- `game-engine.class.ts`: в network-mode создаются SelectionService + HudUiService и подписываются на `match-state` / `match-roll-result` / `selection-changed` / hud `continue-clicked`/`bank-clicked`. На continue/bank → `network.sendSelectDice/sendBank(indices)`, на success → `selection.clear()`, на reject → `hud.showError(e.message)`.

## Что НЕ в скоупе этапа 6

- Bench как 3D-слоты (только текстом в `#hud-left`).
- Победный экран и рестарт партии (этап 7).
- Drag&drop, анимации перехода в bench, частицы.
- Подсказки сервера о scoring-комбинациях (`MATCH_ROLL_RESULT` всё равно их не несёт — см. match-rules.md «Решения»).

## Ручная проверка

Полный e2e через Playwright не прогонялся (бинарей в окружении нет). План ручной проверки:

1. `cd dice-server && SERVER_PORT=3002 node -r tsconfig-paths/register .build/src/index.js`
2. `cd dice-client && npm run dev` — открыть `http://localhost:5173`
3. Создать комнату → видеть HUD с «Чей ход: Ты», `0 / 4000` справа, статус «Твой ход. Бросай кости (зажми и отпусти)».
4. Зажать ЛКМ, потрясти, отпустить — кости летят. Статус меняется на «Бросаем...».
5. После rest — статус пуст (или «Ходит ..., выбирает кости» если не свой ход), фаза SELECTING. Клик по 1-2 костям → синяя подсветка, кнопки Continue/Bank активируются.
6. Continue → выбранные уходят в bench (mesh.visible=false), снова можно бросать. Bank → totals обновляется на нужного игрока.
7. На бусте — флэш «BUST» по центру 2.5 сек.
