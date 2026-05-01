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
  mobileTitle: 'clamp(34px, 12vw, 58px)',
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
  menuButton: scaledFont(18),
  control: scaledFont(16),
  label: scaledFont(14),
  hud: scaledFont(14),
  overlay: scaledFont(24),
  logo: scaledPx(34),
} as const;

export const UI_SIZE = {
  langButtonWidth: scaledPx(34),
  langButtonHeight: scaledPx(28),
  authButtonWidth: scaledPx(150),
  authButtonHeight: scaledPx(42),
  authIconButtonSize: scaledPx(34),
  controlHeight: scaledPx(42),
  menuButtonHeight: scaledPx(52),
  hudButtonWidth: scaledPx(120),
  hudButtonHeight: scaledPx(42),
} as const;
