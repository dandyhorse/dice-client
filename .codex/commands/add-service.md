# Add Engine Service

Добавление нового сервиса в движок dice-client.

## Перед началом

Прочитай: `.claude/specs/engine.md`

## Шаг 1: Создать сервис

Файл: `src/engine/classes/_game-engine/services/{name}.service.ts`

```typescript
export class {Name}Service {
  // Зависимости — храним приватные ссылки
  constructor(/* зависимости вроде scene, world, material */) {
    // Инициализация
  }

  // Публичные методы

  // Если нужно обновление каждый кадр:
  update(currentTime: number): void {
    // ...
  }
}
```

В dice-client синглтонов нет — все сервисы создаются `GameEngine`. Не добавляй `static getInstance()` без необходимости.

## Шаг 2: Подключить к GameEngine

В `src/engine/classes/_game-engine/game-engine.class.ts`:

```typescript
private readonly {name}: {Name}Service;

constructor() {
  // ... после createScene/Renderer/PhysicsWorld
  this.{name} = new {Name}Service(this.scene, this.physicsWorld, /* ... */);
}
```

## Шаг 3: Подключить к game loop (если нужно)

Если сервис требует обновления каждый кадр — добавить вызов в `gameLoop()`:

```typescript
private gameLoop = (): void => {
  // ...
  this.{name}.update(currentTime);
  // ...
};
```

Порядок важен: `input.update` → `physicsWorld.step` → синхронизации (`dice.syncMeshes`) → `renderer.render`.

## Шаг 4: События (если сервис общается с другими)

Если сервис нужно слушать другим сервисам — добавь в него `readonly events = new EventEmitter()` (см. `ShakeInputService`). В `GameEngine` подпишись:

```typescript
this.{name}.events.on('some-event', (payload) => this.other.doStuff(payload));
```

## Шаг 5: Конфиг

Все новые числовые константы — в `src/engine/config.ts`. Не оставляй магических чисел в сервисе.

## Шаг 6: Проверить сборку

```
/verify
```

## Существующие сервисы для справки

| Сервис | Зависимости | Обновление в loop | Назначение |
|--------|-------------|-------------------|------------|
| `DiceService` | scene, world, diceMaterial | `syncMeshes()` | Жизненный цикл костей, KINEMATIC↔DYNAMIC |
| `ShakeInputService` | canvas, camera | `update(t)` | Ввод мыши, расчёт velocity, события |

## Шаг 7: Спека

Если сервис нетривиальный — добавь файл `.claude/specs/{name}.md` (по образцу `dice.md`/`input.md`) и упомяни его в `CLAUDE.md`.
