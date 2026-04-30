# Progress: Client-side prediction

## Status: superseded (поворот → `.claude/tasks/deterministic-lockstep/` → финально state sync)

## История
1. Начали с client prediction для бросающего: `isLocalThrow` флаг, local physics на release, snap к серверному rest — бросающему стало мгновенно, но observer получал stream снапшотов с jitter'ом, дёргалось
2. Pivot 1 → deterministic lockstep: сервер шлёт spin'ы, оба клиента крутят свою физику. Провал: cannon-es не детерминистичен между Node и browser V8, траектории расходятся
3. Pivot 2 → input sync: оба клиента ждут `throw-start` от сервера и стартуют с идентичными spin'ами. Провал: физики всё равно расходятся, финальный snap визуально "перерисовывает результат"
4. **Финал** → Fiedler state sync: сервер — single source of truth, шлёт state (p, q, v, w) с 60 Hz, клиенты зеркалят + extrapolate между снапшотами. Ноль локальной cannon-es на клиентах в network-mode. Оба видят идентичную картинку, плавно.

См. `.claude/tasks/deterministic-lockstep/progress.md` — там финальная реализация и чек-лист на причёску.

## Lessons
- Client prediction хорош для single-object под контролем одного игрока (persona в Fall Flat). Для shared-объекта (dice, которую видят оба) — prediction создаёт два разных видеоряда, склеивать которые в конце = "телепорт".
- Lockstep требует bitwise-детерминистичного физ-движка. cannon-es им не является.
- Для коротких discrete event'ов типа броска костей с мелкой геометрией самое простое и правильное — чистый state sync + extrapolation. Трафик приемлемый (~6-8 KB/s), обе стороны видят одно и то же.
