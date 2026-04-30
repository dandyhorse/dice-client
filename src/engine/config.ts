export const WORLD_GRAVITY = -25;

// Стол фиксированных размеров в мировых координатах. На любом аспекте экрана
// игроки видят одинаковую физическую площадку — это требование мультиплеера.
export const TABLE_WIDTH = 16;
export const TABLE_DEPTH = 9;
export const TABLE_THICKNESS = 0.4;

// Стены вдоль кромки стола, чтобы кости не улетали. Видимые (брус по периметру).
// WALL_INSET = WALL_THICKNESS — внешняя грань стены ровно на кромке стола, внутренняя
// сдвинута на толщину к центру (одновременно даёт видимость в FOV top-down камеры).
// CEILING закрывает арену сверху (невидимый), чтобы кости не вылетали при сильном броске.
// Толстые стены (1.0) — страховка от tunneling в дополнение к THROW_MAX_SPEED.
export const WALL_HEIGHT = 4;
export const WALL_THICKNESS = 1.0;
export const WALL_INSET = 1.0;

export const DICE_COUNT = 6;
export const DICE_HALF_SIZE = 0.22;
export const DICE_MASS = 0.3;
export const DICE_SPACING = 0.6;

// Turn-based: целевой счёт для победы (KCD1 = 4000). Сервер судит — клиенту
// нужно для прогресс-бара. При изменении — править и dice-server/src/engine/config.ts.
export const TARGET_SCORE = 4000;

export const HOLD_HEIGHT = 2.5;
export const HOLD_JITTER_SCALE = 0.04;

export const VELOCITY_BUFFER_MS = 90;
export const THROW_LINEAR_SCALE = 0.8;
export const THROW_DOWNWARD_BIAS = -1.8;
export const THROW_MIN_SPEED = 0.4;
// Жёсткий потолок скорости броска. Без него быстрая мышь даёт displacement
// больше WALL_THICKNESS за substep — кость туннелирует сквозь стену.
// 12 u/s * (1/60/3 substep) = 0.067 — намного меньше WALL_THICKNESS=1.0.
export const THROW_MAX_SPEED = 12;
export const THROW_ANGULAR_RANDOM = 5;

// Камера строго сверху вниз. Y вычисляется из размеров стола и аспекта viewport
// (см. GameEngine.computeCameraY) — здесь только X/Z и FOV. Up-вектор по -Z,
// чтобы избежать gimbal lock и согласовать движение мыши с осями мира.
export const CAMERA_FOV = 45;
export const CAMERA_X = 0;
export const CAMERA_Z = 0;
export const CAMERA_TARGET: [number, number, number] = [0, 0, 0];
export const CAMERA_UP: [number, number, number] = [0, 0, -1];

// Network mode: задержка интерполяции снапшотов (рендерим "now - N ms").
// 50 мс при 60 Гц снапшотов = ~3 кадра буфера — покрывает LAN/хороший WAN jitter,
// но не добавляет перцептивного "подвисания" после release.
export const INTERPOLATION_DELAY_MS = 50;

// Адрес dice-server. В production nginx проксирует /auth и /ws на тот же origin,
// чтобы браузер не упирался в CORS и mixed-content. В dev берём host страницы +
// порт сервера (чтобы работало и на localhost, и на LAN-IP).
export const SERVER_PORT = 3002;
export const SERVER_URL =
  (import.meta.env.VITE_SERVER_URL as string | undefined) ??
  (import.meta.env.PROD
    ? window.location.origin
    : `${window.location.protocol}//${window.location.hostname}:${SERVER_PORT}`);
