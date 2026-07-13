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

Возвращаются индексы в `dice.remoteDice[]` массиве (= snapshot-id кости в `MATCH_DICE_SNAPSHOT`). `rolledFaces` приходит в порядке активных видимых костей, поэтому `SelectionService` держит маппинг `rolledFaces position ↔ snapshot-id`: подсказки `scoreRoll()` переводятся в snapshot-id для подсветки, а выбранные snapshot-id переводятся обратно в позиции `rolledFaces` для локальной проверки. Сервер принимает те же snapshot-id и маппит их через текущий `activeIndices`.

### Подсветка

Кость = `THREE.Mesh` с **массивом 6 материалов** (по одному на грань — `MeshStandardMaterial` с pip-текстурой, см. `dice.md`). Применяем `emissive = 0x4488ff`, `emissiveIntensity = 0.4` ко всем 6 материалам. Снимаем — `0x000000` / `0`. Геометрия и текстуры не трогаются.

## HudUiService

`hud-ui.service.ts`. Vanilla DOM (no React/Vue), стиль через `Object.assign(elem.style, {...})` — как `main.ts:renderLobby` / `showRoomCode`.

Singleplayer uses this same HUD. `GameEngine` local mode adapts the client-only bot match into
synthetic `RoomStatePayload` / `MatchStatePayload` values (`local-human` vs `local-bot`) instead of
owning a separate UI service.

### Структура DOM

Ниже FHD HUD монтируется в центрированный виртуальный холст `1920×1080`, scale'ящийся от 66.7% на `1280×720`. На FHD и выше SVG/HUD остаются в исходном размере, а reference-layer занимает весь viewport: фиксированные размеры не растут, viewport-relative отступы панелей остаются у краёв QHD/ultrawide. `pointer-events: none` используется где можно, чтобы не блокировать клики по сцене.

| id | где | что |
|---|---|---|
| `#hud-left` | top-left | player card с avatar, именем, total / TARGET_SCORE |
| `#hud-right` | top-right | player cards для остальных игроков с avatar, именем, total / TARGET_SCORE |
| `#hud-actions` | bottom-center | кнопки `[Continue]` `[Bank]` (только в SELECTING + own turn) |
| `#hud-status` | bottom-center (под actions) | строка по фазе («Бросаем...», «Ждём X», «Победил X!»...) |
| `#hud-error` | center | transient overlay — BUST/FARKLE держится обязательный таймер; обычные ошибки держатся до первого click/tap |
| `#hud-turn-banner` | center | `ТВОЙ ХОД` держится до первого click/tap или текущей клавиши броска (`Space` по умолчанию); чужой ход скрывается автоматически через `1500ms` |
| `#hud-final-actions` | center | финальные кнопки `Выйти` / `Реванш`; реванш скрыт для `DISCONNECT` и `EXIT` |

Player cards use enlarged avatar+score rectangles (`430px` min width, real `128px` avatar asset area, `18px 24px` padding). Их размеры сохраняются на FHD+, а исходные viewport-relative отступы двигают панели к краям QHD/ultrawide; compact desktop уменьшает всю композицию пропорционально.

The top turn stat tiles (`Banked` / `Selected`) use larger padding/min-width/value text than the original compact HUD so they read closer in scale to the player cards.

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
- **Player cards**: имя берётся из `RoomState.members[].displayName`, avatar из `RoomState.members[].avatarIndex`. Картинки берутся из tracked runtime-файлов `public/assets/avatars/*.png` через статический список `src/avatars.ts`; если индекс недоступен, используется avatar `0`, если список пуст — initials fallback.
- **Singleplayer avatars**: local human получает выбранный `PlayerSettings.profile.avatarIndex`; local bot получает следующий доступный avatar index или `0`, если доступна только одна картинка.
- **Singleplayer bench parity**: local mode now mirrors server `MATCH_STATE.bench`. Continue appends selected faces, hot-dice/bust/bank/new-turn clears it, and `BenchDiceService` renders the held dice just like network mode.
- **Turn banners / non-FARKLE transient errors**: `ТВОЙ ХОД` держится на экране до первого `pointerdown` или текущей клавиши броска (`Space` по умолчанию) в capture-фазе. Ход другого игрока показывается коротко (`1500ms`) и скрывается сам. Обычные ошибки держатся до первого `pointerdown`. Click/tap и клавиша броска только скрывают нужный overlay и не отменяют само действие под курсором.
- **BUST/FARKLE**: на `match-roll-result.bust=true` показываем «FARKLE» (через showError) на обязательный таймер `1200ms`. Пока таймер идёт, действия заблокированы; следующий turn banner показывается только после окончания FARKLE-таймера.
- **WIN/FARKLE**: на `MATCH_STATE.phase=FINISHED` показываем финальный экран. После `LAST_PLAYER` реванш недоступен.
- **Сдаться**: действие из HUD или hotkey (`Esc` по умолчанию) сначала открывает подтверждение. Подтверждение отправляет обычный `ROOM_LEAVE`: локальный клиент возвращается в меню, остальные продолжают матч.

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

`ShakeInputService.setEnabled(false)` посреди удержания эмитит `hold-cancel`; `DiceService.cancelPickup()` возвращает кости в состояние до pickup.

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
