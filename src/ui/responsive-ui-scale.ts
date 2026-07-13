const REFERENCE_WIDTH = 1920;
const REFERENCE_HEIGHT = 1080;
const MIN_SCALE = 2 / 3;
const SCALE_VARIABLE = '--responsive-ui-scale';

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const updateScale = (): void => {
  const viewport = window.visualViewport;
  const width = Math.max(1, viewport?.width ?? window.innerWidth);
  const height = Math.max(1, viewport?.height ?? window.innerHeight);
  const scale = clamp(
    Math.min(width / REFERENCE_WIDTH, height / REFERENCE_HEIGHT),
    MIN_SCALE,
    1,
  );
  document.documentElement.style.setProperty(SCALE_VARIABLE, scale.toFixed(4));
};

/** Keeps menu and dialog chrome proportional on compact desktop viewports. */
export const installResponsiveUiScale = (): void => {
  updateScale();
  window.addEventListener('resize', updateScale);
  window.visualViewport?.addEventListener('resize', updateScale);
};
