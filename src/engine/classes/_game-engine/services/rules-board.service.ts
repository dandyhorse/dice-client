import { DICE_RULE_ICON_URLS } from '../../../assets/asset-manifest';
import { audioService } from '../../../audio/audio.service';
import { onLanguageChange, t } from '../../../../ui/i18n';
import {
  isGameInteractionBlocked,
  requestTopMenuDropdownClose,
} from '../../../../ui/game-modal-state';

const RULES_BOARD_ASPECT_WIDTH = 299;
const RULES_BOARD_ASPECT_HEIGHT = 511;
const RULES_BOARD_Z_INDEX = '12';
const RULES_BOARD_RIGHT_OFFSET_PX = 168;
const RULES_BOARD_HIDDEN_OFFSET_PX = 48;
const RULES_BOARD_PADDING_PX = 10;
const RULES_BOARD_WIDTH_CSS = 'min(42vw, 560px, calc(86vh * 299 / 511), calc(920px * 299 / 511))';
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
const LANGUAGE_MATRIX_STEP_MS = 84;
const LANGUAGE_MATRIX_ROUNDS = 5;
const LANGUAGE_MATRIX_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯабвгдежзиклмнопрстуфхцчшэюя';

type DieFace = 1 | 2 | 3 | 4 | 5 | 6;
const DIE_FACES: readonly DieFace[] = [1, 2, 3, 4, 5, 6];
type RuleLabelKey = 'extraDiceLine1' | 'extraDiceLine2' | 'specialCombinations';
type RuleLabels = Record<RuleLabelKey, string>;

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
  private readonly diceImages = new Map<DieFace, HTMLImageElement>();

  private shown = false;
  private tiltX = 0;
  private tiltY = 0;
  private toggleKeyCode: string;
  private languageMatrixRunId = 0;
  private languageMatrixTimers: number[] = [];
  private animatedLabels: RuleLabels | null = null;
  private animatedScores: string[] | null = null;
  private removeLanguageListener: (() => void) | null = null;

  constructor(
    _scene: unknown,
    _camera: unknown,
    _canvas: HTMLCanvasElement,
    toggleKeyCode = 'KeyC',
  ) {
    void _scene;
    void _camera;
    void _canvas;
    this.toggleKeyCode = toggleKeyCode;

    this.createDomOverlay();
    this.applyVisibility();
    this.applyTilt();

    window.addEventListener('keydown', this.onKeyDown);
    this.panel.addEventListener('pointermove', this.onPointerMove);
    this.panel.addEventListener('pointerleave', this.onPointerLeave);
    this.removeLanguageListener = onLanguageChange(this.runLanguageMatrixAnimation);
    void document.fonts?.ready.then(() => this.renderRulesBoard());
  }

  update(_dt: number): void {
    void _dt;
  }

  updateLayout(): void {}

  setToggleKeyCode(code: string): void {
    this.toggleKeyCode = code;
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    this.panel.removeEventListener('pointermove', this.onPointerMove);
    this.panel.removeEventListener('pointerleave', this.onPointerLeave);
    this.clearLanguageMatrixTimers();
    this.languageMatrixRunId += 1;
    this.removeLanguageListener?.();
    this.removeLanguageListener = null;
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
      width: RULES_BOARD_WIDTH_CSS,
      willChange: 'transform',
    } satisfies Partial<CSSStyleDeclaration>);

    this.canvas.width = RULES_BOARD_ASPECT_WIDTH * RULES_BOARD_CANVAS_SCALE;
    this.canvas.height = RULES_BOARD_ASPECT_HEIGHT * RULES_BOARD_CANVAS_SCALE;
    Object.assign(this.canvas.style, {
      display: 'block',
      height: '100%',
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
    document.body.append(this.root);
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
    if (event.repeat || event.defaultPrevented || event.code !== this.toggleKeyCode) return;
    if (isGameInteractionBlocked()) return;
    if (isInteractiveKeyboardTarget(event.target)) return;

    event.preventDefault();
    requestTopMenuDropdownClose();
    audioService.play('ui-dropdown-toggle');
    this.shown = !this.shown;
    this.applyVisibility();
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
