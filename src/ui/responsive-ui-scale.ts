const REFERENCE_WIDTH = 1920;
const REFERENCE_HEIGHT = 1080;
const MIN_SCALE = 2 / 3;
const SCALE_VARIABLE = '--responsive-ui-scale';
const GAMEPLAY_TOP_ROW_OFFSET_VARIABLE = '--gameplay-top-row-offset';
const GAMEPLAY_TOP_ROW_OFFSET_PX = 40;

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
  const referencePhysicalHeight = REFERENCE_HEIGHT * scale;
  const referenceTop = scale < 1
    ? Math.max(0, (height - referencePhysicalHeight) / 2)
    : 0;
  document.documentElement.style.setProperty(SCALE_VARIABLE, scale.toFixed(4));
  document.documentElement.style.setProperty(
    GAMEPLAY_TOP_ROW_OFFSET_VARIABLE,
    `${(referenceTop + GAMEPLAY_TOP_ROW_OFFSET_PX * scale).toFixed(2)}px`,
  );
};

/** Keeps menu and dialog chrome proportional on compact desktop viewports. */
export const installResponsiveUiScale = (): void => {
  updateScale();
  window.addEventListener('resize', updateScale);
  window.visualViewport?.addEventListener('resize', updateScale);
};
