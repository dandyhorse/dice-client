// ⚠️ DUPLICATE — keep in sync with dice-server/src/domain/scorer.ts
//
/**
 * KCD-style Farkle scorer. Чистая математика над массивом значений граней (1..6).
 * Без зависимостей от cannon, сети и БД — только подсчёт очков и валидация выбора.
 *
 * Источник правил: текущий dev spec правил костей и `.codex/specs/match-rules.md`.
 * Ключевые отклонения от стандартного Farkle:
 *   • 1-1-1 даёт 1000, а не 100×3=300.
 *   • 4/5/6 одинаковых = 2×/4×/8× от тройки того же значения.
 *   • Малый стрит 1-2-3-4-5 = 500, малый 2-3-4-5-6 = 750, большой 1-2-3-4-5-6 = 1500.
 *   • Без «трёх пар», full house, бонусных пар и badges.
 */

export interface ScoringOption {
  /** Индексы из исходного `faces`, которые формируют эту опцию. */
  dieIndices: number[];
  points: number;
  /** Человеко-читаемый ярлык. Формат: 'single-1' | 'three-of-a-kind:4' | 'straight-1-6' и т.п. */
  label: string;
}

const FACE_MIN = 1;
const FACE_MAX = 6;

/** Базовая стоимость тройки данного значения (с учётом исключения для 1). */
const tripleBase = (value: number): number => (value === 1 ? 1000 : value * 100);

/**
 * Очки за N одинаковых костей (N >= 3). 4× = 2×triple, 5× = 4×triple, 6× = 8×triple.
 * Для N < 3 не вызывается — одиночки 1/5 обрабатываются отдельно.
 */
const nOfAKindPoints = (value: number, n: number): number => {
  if (n < 3) return 0;
  const base = tripleBase(value);
  if (n === 3) return base;
  if (n === 4) return base * 2;
  if (n === 5) return base * 4;
  return base * 8; // n === 6
};

/** Подсчитать частоту каждой грани в массиве. Возвращает массив длины 7 (индексы 1..6). */
const countFaces = (faces: number[]): number[] => {
  const counts = new Array<number>(FACE_MAX + 1).fill(0);
  for (const f of faces) {
    if (Number.isInteger(f) && f >= FACE_MIN && f <= FACE_MAX) {
      counts[f]++;
    }
  }
  return counts;
};

/** Собрать индексы исходного массива по значению грани (для построения dieIndices в опциях). */
const indicesByValue = (faces: number[]): number[][] => {
  const map: number[][] = Array.from({ length: FACE_MAX + 1 }, () => []);
  for (let i = 0; i < faces.length; i++) {
    const v = faces[i];
    if (Number.isInteger(v) && v >= FACE_MIN && v <= FACE_MAX) {
      map[v].push(i);
    }
  }
  return map;
};

const isSmallStraightLow = (counts: number[]): boolean =>
  counts[1] >= 1 && counts[2] >= 1 && counts[3] >= 1 && counts[4] >= 1 && counts[5] >= 1;

const isSmallStraightHigh = (counts: number[]): boolean =>
  counts[2] >= 1 && counts[3] >= 1 && counts[4] >= 1 && counts[5] >= 1 && counts[6] >= 1;

const isFullStraight = (counts: number[]): boolean =>
  counts[1] >= 1 &&
  counts[2] >= 1 &&
  counts[3] >= 1 &&
  counts[4] >= 1 &&
  counts[5] >= 1 &&
  counts[6] >= 1;

/**
 * Перечислить «прямые» scoring-опции для текущего броска: одиночки 1/5, N-of-a-kind
 * (3..6), стрейты. Опции могут пересекаться по индексам — клиент сам выбирает
 * непересекающееся подмножество. Не генерируем декартово произведение всех
 * возможных разбиений: для UI и валидации этого достаточно.
 */
export const scoreRoll = (faces: number[]): ScoringOption[] => {
  const counts = countFaces(faces);
  const byValue = indicesByValue(faces);
  const options: ScoringOption[] = [];

  // Стрейты — добавляем сначала, чтобы в UI они шли «крупным куском» сверху.
  if (isFullStraight(counts)) {
    const dieIndices: number[] = [];
    for (let v = 1; v <= 6; v++) dieIndices.push(byValue[v][0]);
    options.push({ dieIndices, points: 1500, label: 'straight-1-6' });
  }
  if (isSmallStraightLow(counts)) {
    const dieIndices: number[] = [];
    for (let v = 1; v <= 5; v++) dieIndices.push(byValue[v][0]);
    options.push({ dieIndices, points: 500, label: 'straight-1-5' });
  }
  if (isSmallStraightHigh(counts)) {
    const dieIndices: number[] = [];
    for (let v = 2; v <= 6; v++) dieIndices.push(byValue[v][0]);
    options.push({ dieIndices, points: 750, label: 'straight-2-6' });
  }

  // N-of-a-kind: выдаём canonical варианты 3..N. Это нужно UI: при четырёх,
  // пяти или шести одинаковых игрок может осознанно выбрать меньший валидный
  // набор, а сервер всё равно валидирует конкретный picked через validateSelection.
  for (let v = 1; v <= 6; v++) {
    const n = counts[v];
    for (let size = 3; size <= n; size++) {
      options.push({
        dieIndices: byValue[v].slice(0, size),
        points: nOfAKindPoints(v, size),
        label: `${nLabel(size)}-of-a-kind:${v}`,
      });
    }
  }

  // Одиночные 1 и 5 — каждая отдельной опцией. Если их 3+, тройка уже добавлена
  // выше; одиночки всё равно полезны как «отдельные» опции (например, игрок
  // хочет взять только две 1 из трёх).
  for (const idx of byValue[1]) {
    options.push({ dieIndices: [idx], points: 100, label: 'single-1' });
  }
  for (const idx of byValue[5]) {
    options.push({ dieIndices: [idx], points: 50, label: 'single-5' });
  }

  return options;
};

const nLabel = (n: number): string => {
  switch (n) {
    case 3:
      return 'three';
    case 4:
      return 'four';
    case 5:
      return 'five';
    case 6:
      return 'six';
    default:
      return String(n);
  }
};

export const isBust = (faces: number[]): boolean => scoreRoll(faces).length === 0;

/**
 * Валидация выбора игрока. Алгоритм:
 *   1. Проверяем что picked — корректный набор индексов (без дубликатов, в диапазоне).
 *   2. Собираем частоты по picked-костям.
 *   3. Жадно «расходуем» частоты:
 *        стрейты (большой → малые) → N-of-a-kind (4..6 затем 3) → одиночки 1/5.
 *      Жадность безопасна: правила не пересекаются по способу употребления
 *      (стрейт «съедает» по 1 кости каждой грани, тройки — только по 3+ одной).
 *   4. Если после расхода в counts что-то осталось → invalid (есть «прицепленная»
 *      кость без scoring-комбинации).
 */
export const validateSelection = (
  faces: number[],
  picked: number[],
): { valid: true; points: number } | { valid: false; reason: string } => {
  if (picked.length === 0) {
    return { valid: false, reason: 'must pick at least one scoring die' };
  }

  const seen = new Set<number>();
  for (const idx of picked) {
    if (!Number.isInteger(idx) || idx < 0 || idx >= faces.length) {
      return { valid: false, reason: `index out of range: ${idx}` };
    }
    if (seen.has(idx)) {
      return { valid: false, reason: `duplicate index: ${idx}` };
    }
    seen.add(idx);
  }

  const pickedFaces = picked.map((i) => faces[i]);
  const counts = countFaces(pickedFaces);

  // Если в picked попало невалидное значение (не 1..6) — countFaces его проигнорирует,
  // и сумма counts будет меньше pickedFaces.length: это и поймаем как остаток.
  let remaining = picked.length;
  let points = 0;

  // Стрейты — приоритет большому, потом малым. После стрейта вычитаем по 1 из каждой
  // задействованной грани. Большой и малые взаимоисключающие при ровно 5 костях
  // (5 различных значений из 1-6); если выбрано 6 различных — это большой стрит.
  if (isFullStraight(counts)) {
    points += 1500;
    for (let v = 1; v <= 6; v++) counts[v]--;
    remaining -= 6;
  } else if (isSmallStraightLow(counts)) {
    points += 500;
    for (let v = 1; v <= 5; v++) counts[v]--;
    remaining -= 5;
  } else if (isSmallStraightHigh(counts)) {
    points += 750;
    for (let v = 2; v <= 6; v++) counts[v]--;
    remaining -= 5;
  }

  // N-of-a-kind: для каждой грани берём максимальный N (3..6) одним блоком.
  // Это безопасно, т.к. оставшиеся счётчики после стрейта < 3 для задействованных
  // граней, а правила не дают нам разбивать четвёрку на «тройка + одиночка»
  // одновременно — кроме граней 1 и 5, для которых одиночки обработаны ниже.
  for (let v = 1; v <= 6; v++) {
    if (counts[v] >= 3) {
      points += nOfAKindPoints(v, counts[v]);
      remaining -= counts[v];
      counts[v] = 0;
    }
  }

  // Одиночки: только грани 1 и 5 — scoring. Любая оставшаяся кость другой грани
  // → invalid (нельзя «прицепить» лишнюю кость к scoring-комбинации).
  if (counts[1] > 0) {
    points += counts[1] * 100;
    remaining -= counts[1];
    counts[1] = 0;
  }
  if (counts[5] > 0) {
    points += counts[5] * 50;
    remaining -= counts[5];
    counts[5] = 0;
  }

  if (remaining !== 0) {
    return { valid: false, reason: 'selection contains non-scoring dice' };
  }

  return { valid: true, points };
};
