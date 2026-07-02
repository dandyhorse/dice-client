import { RULES_BOARD_TEXTURE_URL } from '../../../assets/asset-manifest';

const RULES_BOARD_ASPECT_WIDTH = 299;
const RULES_BOARD_ASPECT_HEIGHT = 511;
const RULES_BOARD_Z_INDEX = '12';
const RULES_BOARD_RIGHT_OFFSET_PX = 168;
const RULES_BOARD_HIDDEN_OFFSET_PX = 48;
const RULES_BOARD_MAX_HEIGHT_CSS = 'min(86vh, 920px)';
const RULES_BOARD_PADDING_PX = 10;
const RULES_BOARD_TILT_FULL_DISTANCE_PX = 420;
const RULES_BOARD_HOVER_TILT_DEG = 5;

const isInteractiveKeyboardTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) return false;
  if (target.closest('input, textarea, select, button')) return true;
  const editable = target.closest('[contenteditable]');
  return editable instanceof HTMLElement && editable.isContentEditable;
};

export class RulesBoardService {
  private readonly root = document.createElement('div');
  private readonly panel = document.createElement('div');
  private readonly image = document.createElement('img');

  private shown = false;
  private tiltX = 0;
  private tiltY = 0;

  constructor(_scene: unknown, _camera: unknown, _canvas: HTMLCanvasElement) {
    void _scene;
    void _camera;
    void _canvas;

    this.createDomOverlay();
    this.applyVisibility();
    this.applyTilt();

    window.addEventListener('keydown', this.onKeyDown);
    this.panel.addEventListener('pointermove', this.onPointerMove);
    this.panel.addEventListener('pointerleave', this.onPointerLeave);
  }

  update(_dt: number): void {
    void _dt;
  }

  updateLayout(): void {}

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    this.panel.removeEventListener('pointermove', this.onPointerMove);
    this.panel.removeEventListener('pointerleave', this.onPointerLeave);
    this.root.remove();
  }

  private createDomOverlay(): void {
    this.root.className = 'dice-rules-board-overlay';
    Object.assign(this.root.style, {
      position: 'fixed',
      top: '50%',
      right: `${RULES_BOARD_RIGHT_OFFSET_PX}px`,
      zIndex: RULES_BOARD_Z_INDEX,
      opacity: '0',
      pointerEvents: 'none',
      transform: `translate3d(calc(100% + ${RULES_BOARD_HIDDEN_OFFSET_PX}px), -50%, 0)`,
      transition: 'transform 240ms ease, opacity 180ms ease',
      perspective: '1100px',
      transformStyle: 'preserve-3d',
      willChange: 'transform, opacity',
    } satisfies Partial<CSSStyleDeclaration>);

    Object.assign(this.panel.style, {
      aspectRatio: `${RULES_BOARD_ASPECT_WIDTH} / ${RULES_BOARD_ASPECT_HEIGHT}`,
      background: '#2a1b12',
      border: '1px solid rgba(255, 226, 178, 0.22)',
      borderRadius: '8px',
      boxShadow: '0 14px 34px rgba(0, 0, 0, 0.34)',
      boxSizing: 'border-box',
      padding: `${RULES_BOARD_PADDING_PX}px`,
      transformOrigin: '50% 50%',
      transformStyle: 'preserve-3d',
      transition: 'transform 140ms ease',
      userSelect: 'none',
      willChange: 'transform',
    } satisfies Partial<CSSStyleDeclaration>);

    Object.assign(this.image.style, {
      display: 'block',
      height: RULES_BOARD_MAX_HEIGHT_CSS,
      maxWidth: 'min(42vw, 560px)',
      objectFit: 'contain',
      pointerEvents: 'none',
      userSelect: 'none',
      width: 'auto',
    } satisfies Partial<CSSStyleDeclaration>);

    this.image.alt = '';
    this.image.decoding = 'async';
    this.image.draggable = false;
    this.image.src = RULES_BOARD_TEXTURE_URL;

    this.panel.append(this.image);
    this.root.append(this.panel);
    document.body.append(this.root);
  }

  private applyVisibility(): void {
    this.root.style.opacity = this.shown ? '1' : '0';
    this.root.style.pointerEvents = this.shown ? 'auto' : 'none';
    this.root.style.transform = this.shown
      ? 'translate3d(0, -50%, 0)'
      : `translate3d(calc(100% + ${RULES_BOARD_HIDDEN_OFFSET_PX}px), -50%, 0)`;
  }

  private applyTilt(): void {
    this.panel.style.transform = `rotateX(${this.tiltX}deg) rotateY(${this.tiltY}deg)`;
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat || event.defaultPrevented || event.code !== 'KeyH') return;
    if (isInteractiveKeyboardTarget(event.target)) return;

    event.preventDefault();
    this.shown = !this.shown;
    if (!this.shown) {
      this.tiltX = 0;
      this.tiltY = 0;
      this.applyTilt();
    }
    this.applyVisibility();
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (!this.shown) return;

    const rect = this.panel.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);

    this.tiltX = Math.max(
      -RULES_BOARD_HOVER_TILT_DEG,
      Math.min(RULES_BOARD_HOVER_TILT_DEG, (-dy / RULES_BOARD_TILT_FULL_DISTANCE_PX) * RULES_BOARD_HOVER_TILT_DEG),
    );
    this.tiltY = Math.max(
      -RULES_BOARD_HOVER_TILT_DEG,
      Math.min(RULES_BOARD_HOVER_TILT_DEG, (dx / RULES_BOARD_TILT_FULL_DISTANCE_PX) * RULES_BOARD_HOVER_TILT_DEG),
    );
    this.applyTilt();
  };

  private onPointerLeave = (): void => {
    this.tiltX = 0;
    this.tiltY = 0;
    this.applyTilt();
  };
}
