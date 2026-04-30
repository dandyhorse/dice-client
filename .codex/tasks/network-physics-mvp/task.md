# Task (client side): Network Physics MVP

См. зеркальный план `.claude/plans/dice-multiplayer.md` (секции 1.7-1.12).

## Цель (клиентская часть)
Перевести dice-client в режим, где физика **не считается локально** — клиент шлёт `release` на сервер и рендерит интерполированные снапшоты. Двух игроков в одной комнате синхронно показывают идентичный бросок.

## Acceptance criteria
- [ ] `mode: 'local' | 'network'` флаг в `GameEngine`. Local-режим работает как раньше (для регрессий).
- [ ] `network.service.ts` — обёртка над socket.io-client; шлёт `match:release`, эмитит `dice-snapshot`/`dice-rest`/`dice-spawn`.
- [ ] `snapshot-buffer.ts` (или внутри network.service) — хранит последние снапшоты, `sample(now)` возвращает интерполированное состояние с задержкой 100ms (`INTERPOLATION_DELAY_MS`).
- [ ] `DiceService.applySnapshot({ id, p, q }[])` — применяет позиции/кватернионы к мешам в network mode.
- [ ] `ShakeInputService` в network mode при release шлёт `network.sendRelease(velocity, position)` вместо `dice.release()`.
- [ ] Минимальный DOM-lobby: input комнаты + кнопки Create/Join. userId = uuid из localStorage.
- [ ] `npm run build` зелёный.
- [ ] Local-режим (без подключения к серверу) продолжает работать.

## Out of scope
- Аккаунты
- Persistent rooms
- Spectators / chat
- Turn-based логика (любой бросает в любой момент)

## Конвенции
- **Arrow functions only**: `const fn = () => {}`, не `function fn() {}` (см. memory)
- TypeScript strict — компилятор не пропустит мусор
- Один класс на файл, суффикс `.class.ts`; сервисы — `.service.ts`
