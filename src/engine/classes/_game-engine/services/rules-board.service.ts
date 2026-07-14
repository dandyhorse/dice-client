import { DICE_RULE_ICON_URLS } from '../../../assets/asset-manifest';
import { audioService } from '../../../audio/audio.service';
import { onLanguageChange, t } from '../../../../ui/i18n';
import { controlCodeLabel } from '../../../../player-settings';
import { bindMouseOnlyClick } from '../../../../ui/mouse-only-button';
import {
  isGameInteractionBlocked,
  requestTopMenuDropdownClose,
} from '../../../../ui/game-modal-state';
import { RulesBoardDesktopDragService } from './rules-board-desktop-drag.service';

const RULES_BOARD_ASPECT_WIDTH = 299;
const RULES_BOARD_ASPECT_HEIGHT = 511;
const RULES_BOARD_Z_INDEX = '12';
const RULES_BOARD_RIGHT_OFFSET_PX = 168;
const RULES_BOARD_HIDDEN_OFFSET_PX = 48;
const RULES_BOARD_PADDING_PX = 10;
const RULES_BOARD_REFERENCE_WIDTH_PX = 538;
const RULES_BOARD_FHD_HEIGHT_PX = 1080;
const RULES_BOARD_MIN_SCALE = 0.75;
const RULES_BOARD_COMPACT_HEIGHT_PX = 720;
const RULES_BOARD_TILT_FULL_DISTANCE_PX = 420;
const RULES_BOARD_HOVER_TILT_DEG = 5;
const RULES_BOARD_CANVAS_SCALE = 4;
const RULE_DIE_SIZE = 26;
const RULE_DIE_STEP = 32;
const RULE_SCORE_FONT_SIZE = 20;
const RULE_BODY_FONT_SIZE = 13.8;
const RULE_TITLE_FONT_SIZE = 15.2;
const RULE_TEXT_COLOR = '#f4f0ea';
const RULES_BOARD_TILT_TRANSITION = 'transform 140ms ease';
const RULES_BOARD_TILT_RETURN_TRANSITION = 'transform 1200ms cubic-bezier(0.16, 1, 0.3, 1)';
const RULES_BUTTON_RIGHT_PX = 24;
const RULES_BUTTON_WIDTH_PX = 345;
const RULES_DRAG_CLOSE_RATIO = 0.5;
const MOBILE_RULES_DISMISS_GUARD_MARGIN_PX = 24;
const MOBILE_RULES_DISMISS_GUARD_MS = 500;
const LANGUAGE_MATRIX_STEP_MS = 84;
const LANGUAGE_MATRIX_ROUNDS = 5;
const LANGUAGE_MATRIX_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯабвгдежзиклмнопрстуфхцчшэюя';

type DieFace = 1 | 2 | 3 | 4 | 5 | 6;
const DIE_FACES: readonly DieFace[] = [1, 2, 3, 4, 5, 6];
type RuleLabelKey = 'extraDiceLine1' | 'extraDiceLine2' | 'specialCombinations';
type RuleLabels = Record<RuleLabelKey, string>;

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

interface RuleScoreRow {
  faces: readonly DieFace[];
  score: string;
  x: number;
  y: number;
  scoreX: number;
  scoreAnchor?: 'start' | 'end';
}

const RULE_SCORE_ROWS: readonly RuleScoreRow[] = [
  { faces: [1], score: '100', x: 0, y: 0, scoreX: 34 },
  { faces: [5], score: '50', x: 168, y: 0, scoreX: 202 },
  { faces: [1, 1, 1], score: '1000', x: 0, y: 52, scoreX: 98 },
  { faces: [4, 4, 4], score: '400', x: 168, y: 52, scoreX: 296, scoreAnchor: 'end' },
  { faces: [2, 2, 2], score: '200', x: 0, y: 94, scoreX: 98 },
  { faces: [5, 5, 5], score: '500', x: 168, y: 94, scoreX: 296, scoreAnchor: 'end' },
  { faces: [3, 3, 3], score: '300', x: 0, y: 136, scoreX: 98 },
  { faces: [6, 6, 6], score: '600', x: 168, y: 136, scoreX: 296, scoreAnchor: 'end' },
  { faces: [3, 3, 3, 3], score: '600', x: 0, y: 234, scoreX: 130 },
  { faces: [3, 3, 3, 3, 3], score: '1200', x: 0, y: 276, scoreX: 162 },
  { faces: [3, 3, 3, 3, 3, 3], score: '2400', x: 0, y: 318, scoreX: 194 },
  { faces: [1, 2, 3, 4, 5], score: '500', x: 0, y: 401, scoreX: 162 },
  { faces: [2, 3, 4, 5, 6], score: '750', x: 0, y: 443, scoreX: 162 },
  { faces: [1, 2, 3, 4, 5, 6], score: '1500', x: 0, y: 485, scoreX: 194 },
];

const isInteractiveKeyboardTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) return false;
  if (target.closest('input, textarea, select, button')) return true;
  const editable = target.closest('[contenteditable]');
  return editable instanceof HTMLElement && editable.isContentEditable;
};

export class RulesBoardService {
  private readonly root = document.createElement('div');
  private readonly panel = document.createElement('div');
  private readonly canvas = document.createElement('canvas');
  private readonly toggleButton = document.createElement('button');
  private readonly toggleButtonLabel = document.createElement('span');
  private readonly diceImages = new Map<DieFace, HTMLImageElement>();
  private readonly host: HTMLElement;
  private readonly mobileRuntime = document.documentElement.classList.contains('mobile-runtime');
  private readonly interaction: { destroy(): void };

  private shown = false;
  private rulesScale = 1;
  private tiltX = 0;
  private tiltY = 0;
  private toggleKeyCode: string;
  private languageMatrixRunId = 0;
  private languageMatrixTimers: number[] = [];
  private animatedLabels: RuleLabels | null = null;
  private animatedScores: string[] | null = null;
  private removeLanguageListener: (() => void) | null = null;
  private mobileDismissGuard: {
    until: number;
    left: number;
    top: number;
    right: number;
    bottom: number;
  } | null = null;

  constructor(
    _scene: unknown,
    _camera: unknown,
    _canvas: HTMLCanvasElement,
    toggleKeyCode = 'KeyC',
    host: HTMLElement = document.body,
  ) {
    void _scene;
    void _camera;
    void _canvas;
    this.toggleKeyCode = toggleKeyCode;
    this.host = host;

    this.createDomOverlay();
    if (!this.mobileRuntime) this.createToggleButton();
    this.updateLayout();
    this.applyVisibility();
    this.applyTilt();

    window.addEventListener('keydown', this.onKeyDown);
    if (this.mobileRuntime) {
      this.interaction = { destroy: () => undefined };
      this.root.addEventListener('pointerdown', this.onMobileBackdropPointerDown);
      window.addEventListener('click', this.consumeMobileDismissClick, true);
    } else {
      this.interaction = new RulesBoardDesktopDragService(this.panel, {
        begin: () => {
          this.root.style.transition = 'none';
        },
        move: (distance) => {
          this.root.style.transform = `translate3d(${distance}px, -50%, 0)`;
        },
        commit: (distance) => {
          if (distance >= this.desktopCloseThreshold()) {
            this.setShown(false);
            return;
          }
          this.applyVisibility();
        },
        cancel: () => this.applyVisibility(),
      });
      this.panel.addEventListener('pointermove', this.onPointerMove);
      this.panel.addEventListener('pointerleave', this.onPointerLeave);
    }
    this.removeLanguageListener = onLanguageChange(this.handleLanguageChange);
    void document.fonts?.ready.then(() => this.renderRulesBoard());
  }

  update(_dt: number): void {
    void _dt;
  }

  updateLayout(viewportHeight = window.innerHeight): void {
    if (this.mobileRuntime) {
      void viewportHeight;
      this.panel.style.width = `min(${RULES_BOARD_REFERENCE_WIDTH_PX}px, calc(100vw - 32px))`;
      this.panel.style.height = 'auto';
      this.panel.style.maxHeight = 'calc(100dvh - 32px)';
      this.applyVisibility();
      return;
    }
    if (viewportHeight < RULES_BOARD_FHD_HEIGHT_PX) {
      const compactProgress = clamp(
        (viewportHeight - RULES_BOARD_COMPACT_HEIGHT_PX) /
          (RULES_BOARD_FHD_HEIGHT_PX - RULES_BOARD_COMPACT_HEIGHT_PX),
        0,
        1,
      );
      this.rulesScale =
        RULES_BOARD_MIN_SCALE + (1 - RULES_BOARD_MIN_SCALE) * compactProgress;
    } else {
      this.rulesScale = clamp(
        RULES_BOARD_FHD_HEIGHT_PX / Math.max(1, viewportHeight),
        RULES_BOARD_MIN_SCALE,
        1,
      );
    }
    const width = RULES_BOARD_REFERENCE_WIDTH_PX * this.rulesScale;
    this.panel.style.width = `${width}px`;
    this.applyVisibility();
  }

  setToggleKeyCode(code: string): void {
    this.toggleKeyCode = code;
    this.renderToggleButtonLabel();
  }

  toggle(): void {
    if (!this.mobileRuntime && isGameInteractionBlocked()) return;
    this.setShown(!this.shown);
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    this.interaction.destroy();
    this.root.removeEventListener('pointerdown', this.onMobileBackdropPointerDown);
    window.removeEventListener('click', this.consumeMobileDismissClick, true);
    this.panel.removeEventListener('pointermove', this.onPointerMove);
    this.panel.removeEventListener('pointerleave', this.onPointerLeave);
    this.clearLanguageMatrixTimers();
    this.languageMatrixRunId += 1;
    this.removeLanguageListener?.();
    this.removeLanguageListener = null;
    this.root.remove();
    this.toggleButton.remove();
  }

  private createDomOverlay(): void {
    this.root.id = 'rules-board';
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
      aspectRatio: this.mobileRuntime ? 'auto' : `${RULES_BOARD_ASPECT_WIDTH} / ${RULES_BOARD_ASPECT_HEIGHT}`,
      background: '#2a1b12',
      borderRadius: '8px',
      boxShadow: '0 14px 34px rgba(0, 0, 0, 0.34)',
      boxSizing: 'border-box',
      color: RULE_TEXT_COLOR,
      fontFamily: 'var(--font-ui)',
      padding: `${RULES_BOARD_PADDING_PX}px`,
      transformOrigin: '50% 50%',
      transformStyle: 'preserve-3d',
      transition: RULES_BOARD_TILT_TRANSITION,
      userSelect: 'none',
      width: `${RULES_BOARD_REFERENCE_WIDTH_PX}px`,
      overflowY: this.mobileRuntime ? 'auto' : 'visible',
      overscrollBehavior: this.mobileRuntime ? 'contain' : 'auto',
      touchAction: this.mobileRuntime ? 'pan-y' : 'auto',
      willChange: 'transform',
    } satisfies Partial<CSSStyleDeclaration>);

    this.canvas.width = RULES_BOARD_ASPECT_WIDTH * RULES_BOARD_CANVAS_SCALE;
    this.canvas.height = RULES_BOARD_ASPECT_HEIGHT * RULES_BOARD_CANVAS_SCALE;
    Object.assign(this.canvas.style, {
      display: 'block',
      height: this.mobileRuntime ? 'auto' : '100%',
      opacity: '1',
      pointerEvents: 'none',
      transition: 'opacity 60ms ease',
      userSelect: 'none',
      width: '100%',
    } satisfies Partial<CSSStyleDeclaration>);

    this.canvas.setAttribute('aria-hidden', 'true');
    this.loadDiceImages();
    this.renderRulesBoard();

    // Previous static rules image for rollback: /assets/rules-board-static.svg.
    this.panel.append(this.canvas);
    this.root.append(this.panel);
    (this.mobileRuntime ? document.body : this.host).append(this.root);
  }

  private createToggleButton(): void {
    this.toggleButton.id = 'rules-toggle-button';
    this.toggleButton.classList.add('menu-frame-button');
    this.toggleButton.setAttribute('aria-controls', 'rules-board');
    Object.assign(this.toggleButton.style, {
      position: 'fixed',
      top: '50%',
      right: `${RULES_BUTTON_RIGHT_PX}px`,
      zIndex: '11',
      width: `${RULES_BUTTON_WIDTH_PX}px`,
      maxWidth: `${RULES_BUTTON_WIDTH_PX}px`,
      opacity: '1',
      pointerEvents: 'auto',
      transformOrigin: '100% 50%',
      transform: 'translate3d(0, -50%, 0)',
      transition: 'transform 240ms ease, opacity 180ms ease',
      willChange: 'transform, opacity',
    } satisfies Partial<CSSStyleDeclaration>);
    Object.assign(this.toggleButtonLabel.style, {
      position: 'relative',
      zIndex: '1',
      maxWidth: 'calc(100% - 24px)',
    } satisfies Partial<CSSStyleDeclaration>);

    this.toggleButton.append(this.toggleButtonLabel);
    this.renderToggleButtonLabel();
    bindMouseOnlyClick(this.toggleButton, () => this.toggle());
    this.host.append(this.toggleButton);
  }

  private renderRulesBoard = (): void => {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.scale(RULES_BOARD_CANVAS_SCALE, RULES_BOARD_CANVAS_SCALE);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    RULE_SCORE_ROWS.forEach((row, index) => {
      this.drawDiceRow(ctx, row);
      this.drawScore(ctx, row, this.animatedScores?.[index] ?? row.score);
    });

    const labels = this.animatedLabels ?? this.currentRuleLabels();
    this.drawLabel(ctx, labels.extraDiceLine1, 0, 204, RULE_BODY_FONT_SIZE);
    this.drawLabel(ctx, labels.extraDiceLine2, 0, 224, RULE_BODY_FONT_SIZE);
    this.drawLabel(ctx, labels.specialCombinations, 0, 385, RULE_TITLE_FONT_SIZE);
  };

  private runLanguageMatrixAnimation = (): void => {
    const runId = ++this.languageMatrixRunId;
    this.clearLanguageMatrixTimers();
    this.canvas.style.opacity = '0.74';
    const target = this.currentRuleLabels();
    const scoreTargets = RULE_SCORE_ROWS.map((row) => row.score);
    const labelEntries = Object.entries(target).map(([key, value]) => {
      const targetChars = Array.from(value);
      return {
        key: key as RuleLabelKey,
        targetChars,
        revealEvery: Math.max(1, Math.ceil(targetChars.length / LANGUAGE_MATRIX_ROUNDS)),
      };
    });
    const scoreEntries = scoreTargets.map((value, index) => ({
      index,
      targetChars: Array.from(value),
      revealEvery: Math.max(1, Math.ceil(value.length / LANGUAGE_MATRIX_ROUNDS)),
    }));

    for (let round = 0; round <= LANGUAGE_MATRIX_ROUNDS; round += 1) {
      this.languageMatrixTimers.push(window.setTimeout(() => {
        if (runId !== this.languageMatrixRunId) return;
        const labels = { ...target };
        const scores = [...scoreTargets];
        for (const entry of labelEntries) {
          const revealCount = Math.min(
            entry.targetChars.length,
            round * entry.revealEvery,
          );
          labels[entry.key] = this.languageMatrixFrameText(entry.targetChars, revealCount);
        }
        for (const entry of scoreEntries) {
          const revealCount = Math.min(
            entry.targetChars.length,
            round * entry.revealEvery,
          );
          scores[entry.index] = this.languageMatrixFrameText(entry.targetChars, revealCount);
        }
        this.animatedLabels = labels;
        this.animatedScores = scores;
        this.renderRulesBoard();
      }, round * LANGUAGE_MATRIX_STEP_MS));
    }

    this.languageMatrixTimers.push(window.setTimeout(() => {
      if (runId !== this.languageMatrixRunId) return;
      this.animatedLabels = null;
      this.animatedScores = null;
      this.canvas.style.opacity = '1';
      this.renderRulesBoard();
      this.clearLanguageMatrixTimers();
    }, (LANGUAGE_MATRIX_ROUNDS + 1) * LANGUAGE_MATRIX_STEP_MS));
  };

  private clearLanguageMatrixTimers(): void {
    for (const timer of this.languageMatrixTimers) clearTimeout(timer);
    this.languageMatrixTimers = [];
  }

  private currentRuleLabels(): RuleLabels {
    return {
      extraDiceLine1: t('rulesExtraDiceLine1'),
      extraDiceLine2: t('rulesExtraDiceLine2'),
      specialCombinations: t('rulesSpecialCombinations'),
    };
  }

  private languageMatrixFrameText(targetChars: string[], revealCount: number): string {
    return targetChars
      .map((char, index) => {
        if (/\s/u.test(char) || index < revealCount) return char;
        return this.randomLanguageMatrixChar();
      })
      .join('');
  }

  private randomLanguageMatrixChar(): string {
    return LANGUAGE_MATRIX_CHARS[
      Math.floor(Math.random() * LANGUAGE_MATRIX_CHARS.length)
    ]!;
  }

  private loadDiceImages(): void {
    for (const face of DIE_FACES) {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => this.renderRulesBoard();
      image.src = DICE_RULE_ICON_URLS[face - 1];
      this.diceImages.set(face, image);
    }
  }

  private drawDiceRow(ctx: CanvasRenderingContext2D, row: RuleScoreRow): void {
    row.faces.forEach((face, index) => {
      const image = this.diceImages.get(face);
      if (!image?.complete || image.naturalWidth <= 0) return;
      ctx.drawImage(
        image,
        row.x + index * RULE_DIE_STEP,
        row.y,
        RULE_DIE_SIZE,
        RULE_DIE_SIZE,
      );
    });
  }

  private drawScore(ctx: CanvasRenderingContext2D, row: RuleScoreRow, score: string): void {
    this.applyTextStyle(ctx, RULE_SCORE_FONT_SIZE);
    ctx.textBaseline = 'middle';
    ctx.textAlign = row.scoreAnchor ?? 'start';
    ctx.fillText(score, row.scoreX, row.y + RULE_DIE_SIZE / 2);
  }

  private drawLabel(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    fontSize: number,
  ): void {
    this.applyTextStyle(ctx, fontSize);
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'start';
    ctx.fillText(text, x, y);
  }

  private applyTextStyle(ctx: CanvasRenderingContext2D, fontSize: number): void {
    const fontFamily =
      getComputedStyle(document.documentElement).getPropertyValue('--font-ui').trim() ||
      'serif';
    ctx.fillStyle = RULE_TEXT_COLOR;
    ctx.font = `400 ${fontSize}px ${fontFamily}`;
  }

  private applyVisibility(): void {
    if (this.mobileRuntime) {
      this.root.dataset.mobileRulesOpen = this.shown ? 'true' : 'false';
      Object.assign(this.root.style, {
        position: 'fixed',
        inset: '0',
        top: '0',
        right: '0',
        zIndex: '70',
        opacity: this.shown ? '1' : '0',
        pointerEvents: this.shown ? 'auto' : 'none',
        transform: 'none',
        transition: 'opacity 180ms ease',
        background: this.shown ? 'rgba(0, 0, 0, 0.18)' : 'transparent',
      } satisfies Partial<CSSStyleDeclaration>);
      Object.assign(this.panel.style, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        right: 'auto',
        width: `min(${RULES_BOARD_REFERENCE_WIDTH_PX}px, calc(100vw - 32px))`,
        maxHeight: 'calc(100dvh - 32px)',
        overflowY: 'auto',
        transition: 'none',
      } satisfies Partial<CSSStyleDeclaration>);
      this.applyTilt();
      this.toggleButton.setAttribute('aria-expanded', String(this.shown));
      return;
    }

    this.root.style.opacity = this.shown ? '1' : '0';
    this.root.style.pointerEvents = this.shown ? 'auto' : 'none';
    this.root.style.transition = 'transform 240ms ease, opacity 180ms ease';
    this.root.style.transform = this.shown
      ? 'translate3d(0, -50%, 0)'
      : `translate3d(calc(100% + ${RULES_BOARD_HIDDEN_OFFSET_PX}px), -50%, 0)`;

    this.toggleButton.style.opacity = this.shown ? '0' : '1';
    this.toggleButton.style.pointerEvents = this.shown ? 'none' : 'auto';
    this.toggleButton.style.transform = this.shown
      ? `translate3d(24px, -50%, 0) scale(${this.rulesScale})`
      : `translate3d(0, -50%, 0) scale(${this.rulesScale})`;
    this.toggleButton.setAttribute('aria-expanded', String(this.shown));
  }

  private applyTilt(): void {
    this.panel.style.transform = this.mobileRuntime
      ? 'translate3d(-50%, -50%, 0)'
      : `rotateX(${this.tiltX}deg) rotateY(${this.tiltY}deg)`;
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (this.mobileRuntime) return;
    if (event.repeat || event.defaultPrevented || event.code !== this.toggleKeyCode) return;
    if (isGameInteractionBlocked()) return;
    if (isInteractiveKeyboardTarget(event.target)) return;

    event.preventDefault();
    this.toggle();
  };

  private renderToggleButtonLabel(): void {
    const label = `${t('showRules')} (${controlCodeLabel(this.toggleKeyCode)})`;
    this.toggleButtonLabel.textContent = label;
    this.toggleButton.setAttribute('aria-label', label);
  }

  private handleLanguageChange = (): void => {
    this.renderToggleButtonLabel();
    this.runLanguageMatrixAnimation();
  };

  private desktopCloseThreshold(): number {
    return (
      (Math.max(1, this.panel.getBoundingClientRect().width) + RULES_BOARD_HIDDEN_OFFSET_PX) *
      RULES_DRAG_CLOSE_RATIO
    );
  }

  private setShown(shown: boolean): void {
    if (this.shown === shown) {
      this.applyVisibility();
      return;
    }
    this.shown = shown;
    requestTopMenuDropdownClose();
    audioService.play('ui-dropdown-toggle');
    this.applyVisibility();
  }

  private onMobileBackdropPointerDown = (event: PointerEvent): void => {
    if (!this.mobileRuntime || !this.shown) return;
    if (event.target instanceof Node && this.panel.contains(event.target)) return;
    this.armMobileDismissGuard();
    event.preventDefault();
    event.stopPropagation();
    this.setShown(false);
  };

  private armMobileDismissGuard(): void {
    const rulesButton = document.querySelector<HTMLElement>(
      '#hud-mobile-actions [data-mobile-gameplay-action="rules"]',
    );
    if (!rulesButton) {
      this.mobileDismissGuard = null;
      return;
    }
    const bounds = rulesButton.getBoundingClientRect();
    this.mobileDismissGuard = {
      until: performance.now() + MOBILE_RULES_DISMISS_GUARD_MS,
      left: bounds.left - MOBILE_RULES_DISMISS_GUARD_MARGIN_PX,
      top: bounds.top - MOBILE_RULES_DISMISS_GUARD_MARGIN_PX,
      right: bounds.right + MOBILE_RULES_DISMISS_GUARD_MARGIN_PX,
      bottom: bounds.bottom + MOBILE_RULES_DISMISS_GUARD_MARGIN_PX,
    };
  }

  private consumeMobileDismissClick = (event: MouseEvent): void => {
    const guard = this.mobileDismissGuard;
    if (!guard) return;
    if (performance.now() > guard.until) {
      this.mobileDismissGuard = null;
      return;
    }
    const withinRulesZone =
      event.clientX >= guard.left &&
      event.clientX <= guard.right &&
      event.clientY >= guard.top &&
      event.clientY <= guard.bottom;
    this.mobileDismissGuard = null;
    if (!withinRulesZone) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (!this.shown) return;
    this.panel.style.transition = RULES_BOARD_TILT_TRANSITION;

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
    if (!this.shown) return;
    this.panel.style.transition = RULES_BOARD_TILT_RETURN_TRANSITION;
    this.tiltX = 0;
    this.tiltY = 0;
    this.applyTilt();
  };
}
