const REFERENCE_WIDTH = 1920;
const REFERENCE_HEIGHT = 1080;
const MIN_UI_SCALE = 2 / 3;
// Keep authored SVG and HUD pixels native at FHD and above. High-resolution
// displays centre the FHD gameplay composition instead of enlarging it.
const MAX_UI_SCALE = 1;
const COMPACT_TABLE_FILL = 0.58;
const STANDARD_TABLE_FILL = 0.72;

export interface GameplayLayoutMetrics {
  viewportWidth: number;
  viewportHeight: number;
  uiScale: number;
  referencePhysicalWidth: number;
  referencePhysicalHeight: number;
  tableViewportFill: number;
}

type LayoutListener = (metrics: GameplayLayoutMetrics) => void;

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/**
 * Below FHD, keeps gameplay UI in a compact centred 1920×1080 composition.
 * At FHD and above, the authored UI stays native-sized but uses the complete
 * viewport for its responsive offsets.
 */
export class GameplayLayoutService {
  readonly viewport = document.createElement('div');
  readonly reference = document.createElement('div');

  private readonly canvas: HTMLCanvasElement;
  private readonly listeners = new Set<LayoutListener>();
  private metrics: GameplayLayoutMetrics;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.metrics = this.buildMetrics();
    this.createOverlayHosts();
    this.applyMetrics();

    window.addEventListener('resize', this.handleResize);
    window.visualViewport?.addEventListener('resize', this.handleResize);
  }

  get current(): GameplayLayoutMetrics {
    return this.metrics;
  }

  refresh(): GameplayLayoutMetrics {
    const next = this.buildMetrics();
    const changed =
      next.viewportWidth !== this.metrics.viewportWidth ||
      next.viewportHeight !== this.metrics.viewportHeight ||
      next.uiScale !== this.metrics.uiScale;
    this.metrics = next;
    this.applyMetrics();
    if (changed) this.listeners.forEach((listener) => listener(this.metrics));
    return this.metrics;
  }

  onChange(listener: LayoutListener): () => void {
    this.listeners.add(listener);
    listener(this.metrics);
    return () => this.listeners.delete(listener);
  }

  destroy(): void {
    window.removeEventListener('resize', this.handleResize);
    window.visualViewport?.removeEventListener('resize', this.handleResize);
    this.listeners.clear();
    this.viewport.remove();
  }

  private createOverlayHosts(): void {
    this.viewport.id = 'gameplay-overlay-viewport';
    Object.assign(this.viewport.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '10',
      pointerEvents: 'none',
      overflow: 'hidden',
    } satisfies Partial<CSSStyleDeclaration>);

    this.reference.id = 'gameplay-overlay-reference';
    Object.assign(this.reference.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      pointerEvents: 'none',
      transformOrigin: '0 0',
      willChange: 'transform',
    } satisfies Partial<CSSStyleDeclaration>);

    this.viewport.append(this.reference);
    document.body.append(this.viewport);
  }

  private buildMetrics(): GameplayLayoutMetrics {
    const rect = this.canvas.getBoundingClientRect();
    const viewportWidth = Math.max(1, Math.round(rect.width || window.innerWidth));
    const viewportHeight = Math.max(1, Math.round(rect.height || window.innerHeight));
    const uiScale = clamp(
      Math.min(viewportWidth / REFERENCE_WIDTH, viewportHeight / REFERENCE_HEIGHT),
      MIN_UI_SCALE,
      MAX_UI_SCALE,
    );
    const compactProgress = clamp(
      (uiScale - MIN_UI_SCALE) / (1 - MIN_UI_SCALE),
      0,
      1,
    );
    const referenceTableFill =
      COMPACT_TABLE_FILL + (STANDARD_TABLE_FILL - COMPACT_TABLE_FILL) * compactProgress;
    const referencePhysicalHeight = REFERENCE_HEIGHT * uiScale;

    return {
      viewportWidth,
      viewportHeight,
      uiScale,
      referencePhysicalWidth: REFERENCE_WIDTH * uiScale,
      referencePhysicalHeight,
      tableViewportFill: referenceTableFill * (referencePhysicalHeight / viewportHeight),
    };
  }

  private applyMetrics(): void {
    if (this.metrics.uiScale < 1) {
      Object.assign(this.reference.style, {
        top: '50%',
        left: '50%',
        width: `${REFERENCE_WIDTH}px`,
        height: `${REFERENCE_HEIGHT}px`,
        transform: `translate3d(-50%, -50%, 0) scale(${this.metrics.uiScale})`,
        transformOrigin: '50% 50%',
      } satisfies Partial<CSSStyleDeclaration>);
      return;
    }

    Object.assign(this.reference.style, {
      top: '0',
      left: '0',
      width: `${this.metrics.viewportWidth}px`,
      height: `${this.metrics.viewportHeight}px`,
      transform: 'none',
      transformOrigin: '0 0',
    } satisfies Partial<CSSStyleDeclaration>);
  }

  private handleResize = (): void => {
    this.refresh();
  };
}
