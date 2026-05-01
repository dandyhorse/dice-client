import { EventEmitter } from '../../event-emitter.class';
import { scoreRoll } from '../../../../domain/scorer';
import {
  onLanguageChange,
  soloModeDescription,
  soloModeTitle,
  t,
} from '../../../../ui/i18n';
import { FONT_FAMILY, FONT_SIZE, UI_SIZE } from '../../../../ui/theme';

import type { SoloModeConfig, SoloRunState } from '../../../../domain/solo-run';

const PANEL_BG = 'rgba(0,0,0,0.62)';
const PANEL_FG = '#eee';
const PANEL_RADIUS = '6px';
const PANEL_PAD = '10px 12px';
const BTN_BG = '#3b82f6';
const BTN_DISABLED_OPACITY = '0.4';
const ERROR_DURATION_MS = 2500;

export class SoloUiService {
  readonly events = new EventEmitter();

  private readonly root: HTMLDivElement;
  private readonly leftPanel: HTMLDivElement;
  private readonly rightPanel: HTMLDivElement;
  private readonly actionsPanel: HTMLDivElement;
  private readonly statusPanel: HTMLDivElement;
  private readonly errorPanel: HTMLDivElement;
  private readonly continueBtn: HTMLButtonElement;
  private readonly bankBtn: HTMLButtonElement;
  private readonly resetBtn: HTMLButtonElement;
  private readonly unsubscribeLanguage: () => void;

  private readonly config: SoloModeConfig;
  private state: SoloRunState;
  private selectedCount = 0;
  private selectionValid = false;
  private selectedPoints = 0;
  private lastRolledFaces: number[] = [];
  private statusText = '';
  private errorTimer: number | null = null;

  constructor(config: SoloModeConfig, initialState: SoloRunState) {
    this.config = config;
    this.state = initialState;

    this.root = document.createElement('div');
    this.root.id = 'solo-hud';
    Object.assign(this.root.style, {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      zIndex: '15',
      fontFamily: FONT_FAMILY.ui,
    } satisfies Partial<CSSStyleDeclaration>);

    this.leftPanel = this.makePanel({ top: '12px', left: '12px' });
    this.leftPanel.id = 'solo-hud-left';
    Object.assign(this.leftPanel.style, {
      minWidth: '220px',
      whiteSpace: 'pre-line',
    } satisfies Partial<CSSStyleDeclaration>);

    this.rightPanel = this.makePanel({ top: '60px', right: '12px' });
    this.rightPanel.id = 'solo-hud-right';
    Object.assign(this.rightPanel.style, {
      minWidth: '260px',
      maxWidth: '360px',
      whiteSpace: 'pre-line',
      textAlign: 'right',
    } satisfies Partial<CSSStyleDeclaration>);

    this.actionsPanel = document.createElement('div');
    this.actionsPanel.id = 'solo-hud-actions';
    Object.assign(this.actionsPanel.style, {
      position: 'fixed',
      bottom: '70px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '12px',
      pointerEvents: 'auto',
    } satisfies Partial<CSSStyleDeclaration>);

    this.continueBtn = this.makeButton(t('continue'), () => {
      if (!this.continueBtn.disabled) this.events.emit('continue-clicked');
    });
    this.bankBtn = this.makeButton(t('bank'), () => {
      if (!this.bankBtn.disabled) this.events.emit('bank-clicked');
    });
    this.resetBtn = this.makeButton(t('resetRun'), () => this.events.emit('reset-clicked'));
    this.resetBtn.style.background = '#52525b';
    this.actionsPanel.appendChild(this.continueBtn);
    this.actionsPanel.appendChild(this.bankBtn);
    this.actionsPanel.appendChild(this.resetBtn);

    this.statusPanel = document.createElement('div');
    this.statusPanel.id = 'solo-hud-status';
    Object.assign(this.statusPanel.style, {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: PANEL_PAD,
      background: PANEL_BG,
      color: PANEL_FG,
      fontFamily: FONT_FAMILY.ui,
      fontSize: FONT_SIZE.hud,
      borderRadius: PANEL_RADIUS,
      pointerEvents: 'none',
      maxWidth: '70vw',
      textAlign: 'center',
    } satisfies Partial<CSSStyleDeclaration>);

    this.errorPanel = document.createElement('div');
    this.errorPanel.id = 'solo-hud-error';
    Object.assign(this.errorPanel.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      padding: '14px 28px',
      background: 'rgba(180,40,40,0.85)',
      color: '#fff',
      fontFamily: FONT_FAMILY.ui,
      fontSize: FONT_SIZE.overlay,
      fontWeight: 'bold',
      borderRadius: PANEL_RADIUS,
      pointerEvents: 'none',
      display: 'none',
      letterSpacing: '0.05em',
    } satisfies Partial<CSSStyleDeclaration>);

    this.root.appendChild(this.leftPanel);
    this.root.appendChild(this.rightPanel);
    document.body.appendChild(this.root);
    document.body.appendChild(this.actionsPanel);
    document.body.appendChild(this.statusPanel);
    document.body.appendChild(this.errorPanel);
    this.unsubscribeLanguage = onLanguageChange(() => {
      this.continueBtn.textContent = t('continue');
      this.bankBtn.textContent = t('bank');
      this.resetBtn.textContent = t('resetRun');
      this.render();
    });
    this.render();
  }

  setState(state: SoloRunState): void {
    this.state = state;
    if (state.status !== 'active') {
      this.lastRolledFaces = [];
      this.selectedCount = 0;
      this.selectionValid = false;
      this.selectedPoints = 0;
    }
    this.render();
  }

  setStatus(text: string): void {
    this.statusText = text;
    this.renderStatus();
  }

  setRollResult(rolledFaces: number[]): void {
    this.lastRolledFaces = [...rolledFaces];
    this.render();
  }

  clearRollResult(): void {
    this.lastRolledFaces = [];
    this.selectedCount = 0;
    this.selectionValid = false;
    this.selectedPoints = 0;
    this.render();
  }

  setSelectionState(n: number, valid: boolean, points = 0): void {
    this.selectedCount = n;
    this.selectionValid = valid;
    this.selectedPoints = points;
    this.renderActions();
    this.renderLeft();
  }

  showError(message: string): void {
    this.errorPanel.textContent = message;
    this.errorPanel.style.display = 'block';
    if (this.errorTimer !== null) clearTimeout(this.errorTimer);
    this.errorTimer = window.setTimeout(() => {
      this.errorPanel.style.display = 'none';
      this.errorTimer = null;
    }, ERROR_DURATION_MS);
  }

  destroy(): void {
    if (this.errorTimer !== null) clearTimeout(this.errorTimer);
    this.errorTimer = null;
    this.unsubscribeLanguage();
    this.root.remove();
    this.actionsPanel.remove();
    this.statusPanel.remove();
    this.errorPanel.remove();
  }

  private render(): void {
    this.renderLeft();
    this.renderRight();
    this.renderActions();
    this.renderStatus();
  }

  private renderLeft(): void {
    const s = this.state;
    const lines = [
      soloModeTitle(this.config.id, this.config.title),
      `${t('total')}: ${s.totalScore}${
        this.config.targetScore ? ` / ${this.config.targetScore}` : ''
      }`,
      `${t('turn')}: ${s.turnIndex}${this.config.turnLimit ? ` / ${this.config.turnLimit}` : ''}`,
      `${t('turnScore')}: ${s.turnScore}`,
      `${t('activeDice')}: ${s.activeDiceCount}`,
      `${t('banks')}: ${s.bankCount} · ${t('busts')}: ${s.bustCount}`,
      `${t('hotDice')}: ${s.hotDiceCount}`,
      `${t('bestBank')}: ${s.bestSingleTurnBank}`,
    ];

    if (this.lastRolledFaces.length > 0) {
      lines.push('');
      lines.push(`${t('rolled')}: ${this.lastRolledFaces.join(', ')}`);
      if (this.selectedCount > 0) {
        lines.push(
          `${t('selected')}: ${this.selectedCount}${
            this.selectionValid ? ` · +${this.selectedPoints}` : ` · ${t('incompleteSet')}`
          }`,
        );
      }
    }

    this.leftPanel.textContent = lines.join('\n');
  }

  private renderRight(): void {
    const lines: string[] = [];
    if (this.lastRolledFaces.length > 0) {
      const opts = scoreRoll(this.lastRolledFaces);
      lines.push(t('scoring'));
      if (opts.length === 0) {
        lines.push('—');
      } else {
        for (const o of opts) {
          const positions = o.dieIndices.map((i) => i + 1).join(',');
          lines.push(`${o.label} (${positions}) → ${o.points}`);
        }
      }
    }

    if (this.state.history.length > 0) {
      if (lines.length > 0) lines.push('');
      lines.push(t('history'));
      for (const h of this.state.history) {
        if (h.result === 'bank') {
          lines.push(`#${h.turnIndex}: ${t('bank')} ${h.banked} → ${h.totalScore}`);
        } else {
          lines.push(`#${h.turnIndex}: bust, ${t('burned')} ${h.burned}`);
        }
      }
    }

    this.rightPanel.textContent =
      lines.length > 0
        ? lines.join('\n')
        : soloModeDescription(this.config.id, this.config.description);
  }

  private renderActions(): void {
    const selecting = this.state.status === 'active' && this.lastRolledFaces.length > 0;
    const canSubmit = selecting && this.selectedCount > 0 && this.selectionValid;
    this.continueBtn.style.display = selecting ? 'inline-block' : 'none';
    this.bankBtn.style.display = selecting ? 'inline-block' : 'none';
    this.setButtonEnabled(this.continueBtn, canSubmit);
    this.setButtonEnabled(this.bankBtn, canSubmit);
  }

  private renderStatus(): void {
    if (this.state.status === 'won') {
      this.statusPanel.textContent = t('targetReached');
    } else if (this.state.status === 'lost') {
      this.statusPanel.textContent = t('runFailed');
    } else if (this.state.status === 'finished') {
      this.statusPanel.textContent = `${t('finalScore')}: ${this.state.totalScore}`;
    } else {
      this.statusPanel.textContent = this.statusText;
    }
    this.statusPanel.style.display = this.statusPanel.textContent ? 'block' : 'none';
  }

  private makePanel(pos: Partial<CSSStyleDeclaration>): HTMLDivElement {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'fixed',
      padding: PANEL_PAD,
      background: PANEL_BG,
      color: PANEL_FG,
      fontFamily: FONT_FAMILY.ui,
      fontSize: FONT_SIZE.hud,
      borderRadius: PANEL_RADIUS,
      pointerEvents: 'none',
      lineHeight: '1.5',
    } satisfies Partial<CSSStyleDeclaration>);
    Object.assign(el.style, pos);
    return el;
  }

  private makeButton(label: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.textContent = label;
    Object.assign(btn.style, {
      padding: '8px 16px',
      background: BTN_BG,
      color: '#fff',
      border: 'none',
      borderRadius: PANEL_RADIUS,
      fontFamily: FONT_FAMILY.ui,
      fontSize: FONT_SIZE.hud,
      width: UI_SIZE.hudButtonWidth,
      height: UI_SIZE.hudButtonHeight,
      boxSizing: 'border-box',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: '1',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      pointerEvents: 'auto',
    } satisfies Partial<CSSStyleDeclaration>);
    btn.addEventListener('click', onClick);
    return btn;
  }

  private setButtonEnabled(btn: HTMLButtonElement, enabled: boolean): void {
    btn.disabled = !enabled;
    btn.style.opacity = enabled ? '1' : BTN_DISABLED_OPACITY;
    btn.style.cursor = enabled ? 'pointer' : 'not-allowed';
  }
}
