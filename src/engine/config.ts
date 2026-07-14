export const WORLD_GRAVITY = -30;

// Стол фиксированных размеров в мировых координатах. На любом аспекте экрана
// игроки видят одинаковую физическую площадку — это требование мультиплеера.
export const TABLE_WIDTH = 9;
export const TABLE_DEPTH = 9;
export const TABLE_THICKNESS = 0.4;

// Стены вдоль кромки стола, чтобы кости не улетали. Физические, но невидимые.
// WALL_INSET = WALL_THICKNESS — внешняя грань стены ровно на кромке стола, внутренняя
// сдвинута на минимальную безопасную толщину к центру.
// CEILING закрывает арену сверху (невидимый), чтобы кости не вылетали при сильном броске.
// Стены держим близко к визуальному борту, но толще максимального server tick displacement.
export const WALL_HEIGHT = 4;
export const WALL_THICKNESS = 0.1;
export const WALL_INSET = 0.1;

export const DICE_COUNT = 6;
export const DICE_HALF_SIZE = 0.3276;
export const DICE_MASS = 4.86;
export const DICE_SPACING = 0.76;
export const DICE_LINEAR_DAMPING = 0.27;
export const DICE_ANGULAR_DAMPING = 0.35;
export const DICE_TABLE_FRICTION = 0.88;
export const DICE_TABLE_RESTITUTION = 0.1;
export const DICE_TABLE_CONTACT_STIFFNESS = 1e8;
export const DICE_TABLE_CONTACT_RELAXATION = 2;
export const DICE_DICE_FRICTION = 0.34;
export const DICE_DICE_RESTITUTION = 0.46;
export const DICE_CONTACT_MIN_HORIZONTAL_NORMAL = 0.35;
export const DICE_DICE_CONTACT_KICK_SPEED = 6;
export const DICE_DICE_CONTACT_KICK_MAX_DELTA = 3.5;
export const DICE_EDGE_REPULSION_DISTANCE = 0;
export const DICE_EDGE_REPULSION_FORCE = 12;
export const DICE_EDGE_REPULSION_KICK_SPEED = 4.2;
export const DICE_REROLL_FALL_Y = -DICE_HALF_SIZE;
export const DICE_BOTTOM_MAGNET_TORQUE = 0.11;
export const DICE_BOTTOM_MAGNET_MAX_HEIGHT = DICE_HALF_SIZE * 3.1;

export const REST_FACE_DOT_MIN = 0.82;
export const REST_STACKED_CENTER_Y_MIN = DICE_HALF_SIZE * 2.2;
export const REST_CORRECTION_MAX_PASSES = 3;
export const REST_CORRECTION_DOWNWARD_VELOCITY = -1.6;
export const REST_CORRECTION_ANGULAR_VELOCITY = 1.2;
export const REST_CORRECTION_LIFT = 0.04;
export const REST_REROLL_POSITION_ATTEMPTS = 16;
export const REST_REROLL_CLEARANCE = DICE_SPACING;

// Turn-based: целевой счёт для победы. Сервер судит — клиенту нужно для
// прогресс-бара. При изменении — править и dice-server/src/engine/config.ts.
export const TARGET_SCORE = 4000;

export const HOLD_HEIGHT = 2.85;
export const HOLD_JITTER_SCALE = 0.04;

export const VELOCITY_BUFFER_MS = 90;
export const THROW_LINEAR_SCALE = 0.6;
export const THROW_DOWNWARD_BIAS = -2.8;
export const THROW_MIN_SPEED = 0.4;
// Дополнительный отступ от внутренней грани невидимой стены для release-position.
export const THROW_POSITION_PADDING = 0.2;
// Жёсткий потолок скорости броска. Без него быстрая мышь даёт displacement
// больше WALL_THICKNESS за substep — кость туннелирует сквозь стену.
// 9.3 u/s * (1/120 server tick) = 0.0775 — меньше WALL_THICKNESS.
export const THROW_MAX_SPEED = 9.3;
export const THROW_ANGULAR_RANDOM = 3.2;
export const THROW_SELF_SPIN_MIN = 6.75;
export const THROW_SELF_SPIN_MAX = 10.125;
export const THROW_ANGULAR_DIE_VARIATION = 0.25;

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
