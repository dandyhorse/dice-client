export const UI_SCALE = 1.2;
export const FONT_SCALE = 1.35;

export const scaledPx = (value: number): string => `${Math.round(value * UI_SCALE)}px`;
export const scaledFont = (value: number): string =>
  `${Math.round(value * UI_SCALE * FONT_SCALE)}px`;

export const FONT_FAMILY = {
  ui: 'var(--font-ui)',
  title: 'var(--font-title)',
} as const;

export const FONT_SIZE = {
  mobileTitle: '42px',
  lang: scaledFont(12),
  badge: scaledFont(12),
  auth: scaledFont(11),
  playerName: scaledFont(16),
  roomTitle: scaledFont(18),
  roomText: scaledFont(12),
  roomMeta: scaledFont(11),
  card: scaledFont(16),
  title: scaledFont(24),
  error: scaledFont(12),
  menuButton: '25px',
  control: scaledFont(16),
  label: scaledFont(14),
  hud: scaledFont(14),
  overlay: scaledFont(24),
  status: '50px',
  logo: scaledPx(34),
} as const;

export const UI_SIZE = {
  langButtonWidth: scaledPx(34),
  langButtonHeight: scaledPx(28),
  authButtonWidth: scaledPx(150),
  authButtonHeight: scaledPx(42),
  authIconButtonSize: scaledPx(34),
  controlHeight: scaledPx(42),
  menuButtonHeight: '60px',
  hudButtonWidth: scaledPx(120),
  hudButtonHeight: scaledPx(42),
} as const;

export const UI_RADIUS = '2px';
export const MENU_BUTTON_BG = '#3b82f6';
export const SETTINGS_BUTTON_BG = '#52525b';
