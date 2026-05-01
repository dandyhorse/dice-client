import { EventEmitter } from '../../event-emitter.class';
import { scoreRoll } from '../../../../domain/scorer';
import { onLanguageChange, t } from '../../../../ui/i18n';
import { FONT_FAMILY, FONT_SIZE, UI_SIZE } from '../../../../ui/theme';

import {
  DEFAULT_ROOM_OPTIONS,
  MATCH_PHASE,
  ROOM_MODE,
  ROOM_ROLE,
} from '../../../../network/protocol/types';
import type { MatchPhase, MatchStatePayload, RoomStatePayload } from '../../../../network/protocol/types';

const PANEL_BG = 'rgba(0,0,0,0.6)';
const PANEL_FG = '#eee';
const PANEL_RADIUS = '6px';
const PANEL_PAD = '10px 12px';

const BTN_BG = '#3b82f6';
const BTN_FG = '#fff';
const BTN_DISABLED_OPACITY = '0.4';

const ERROR_DURATION_MS = 2500;

const formatPlayer = (userId: string, ownUserId: string): string => {
  if (!userId) return '-';
  if (userId === ownUserId) return t('youSuffix');
  return shortId(userId);
};

const formatMember = (displayName: string, userId: string, ownUserId: string): string => {
  if (userId === ownUserId) return `${displayName || t('youSuffix')} (${t('youSuffix')})`;
  return displayName || shortId(userId);
};

const shortId = (id: string): string => (id.length <= 8 ? id : id.slice(0, 8));

/**
 * HUD-оверлей для turn-based матча. Vanilla DOM, без UI-фреймворков
 * (стиль как в `main.ts:renderLobby` / `showRoomCode`).
 *
 * Структура:
 *   - `#hud-left`: чей ход / turnPoints / bench
 *   - `#hud-right`: totals по игрокам vs TARGET_SCORE
 *   - `#hud-actions`: кнопки Continue/Bank (только когда твой ход и SELECTING)
 *   - `#hud-status`: статусная строка под кнопками (фаза текстом)
 *   - `#hud-error`: всплывающее сообщение (BUST, ACK_ERROR), исчезает через 2.5s
 *
 * Вход — `setMatchState(MATCH_STATE)` + `setSelectionState(n, valid)`. Выход —
 * события `continue-clicked` / `bank-clicked` через `events`.
 */
export class HudUiService {
  readonly events = new EventEmitter();

  private readonly root: HTMLDivElement;
  private readonly leftPanel: HTMLDivElement;
  private readonly rightPanel: HTMLDivElement;
  private readonly actionsPanel: HTMLDivElement;
  private readonly statusPanel: HTMLDivElement;
  private readonly errorPanel: HTMLDivElement;
  private readonly continueBtn: HTMLButtonElement;
  private readonly bankBtn: HTMLButtonElement;
  private readonly unsubscribeLanguage: () => void;

  private state: MatchStatePayload | null = null;
  private roomState: RoomStatePayload | null = null;
  private selectedCount = 0;
  private selectionValid = false;
  private selectedPoints = 0;
  private errorTimer: number | null = null;
  private statusTimer: number | null = null;
  /** Что выпало в последнем броске (из MATCH_ROLL_RESULT). Чистится при смене фазы с SELECTING. */
  private lastRolledFaces: number[] = [];

  private readonly ownUserId: string;

  constructor(ownUserId: string) {
    this.ownUserId = ownUserId;
    this.root = document.createElement('div');
    this.root.id = 'hud';
    Object.assign(this.root.style, {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      zIndex: '15',
      fontFamily: FONT_FAMILY.ui,
    } satisfies Partial<CSSStyleDeclaration>);

    // top:60px — чтобы не наезжать на room badge (см. main.ts:showRoomCode,
    // который висит в top:12px left:12px). Бэйдж ~36px высотой + воздух.
    this.leftPanel = this.makePanel({ top: '60px', left: '12px' });
    this.leftPanel.id = 'hud-left';
    Object.assign(this.leftPanel.style, {
      minWidth: '180px',
      whiteSpace: 'pre-line',
    } satisfies Partial<CSSStyleDeclaration>);

    this.rightPanel = this.makePanel({ top: '60px', right: '12px' });
    this.rightPanel.id = 'hud-right';
    Object.assign(this.rightPanel.style, {
      minWidth: '180px',
      whiteSpace: 'pre-line',
      textAlign: 'right',
    } satisfies Partial<CSSStyleDeclaration>);

    this.actionsPanel = document.createElement('div');
    this.actionsPanel.id = 'hud-actions';
    Object.assign(this.actionsPanel.style, {
      position: 'fixed',
      bottom: '70px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'none',
      gap: '12px',
      pointerEvents: 'auto',
    } satisfies Partial<CSSStyleDeclaration>);

    this.continueBtn = this.makeButton(t('continue'), () => {
      if (this.continueBtn.disabled) return;
      this.events.emit('continue-clicked');
    });
    this.bankBtn = this.makeButton(t('bank'), () => {
      if (this.bankBtn.disabled) return;
      this.events.emit('bank-clicked');
    });
    this.actionsPanel.appendChild(this.continueBtn);
    this.actionsPanel.appendChild(this.bankBtn);

    this.statusPanel = document.createElement('div');
    this.statusPanel.id = 'hud-status';
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
    this.errorPanel.id = 'hud-error';
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
      this.render();
    });
    this.render();
  }

  setMatchState(state: MatchStatePayload): void {
    // Если фаза ушла из SELECTING — последний бросок больше не релевантен,
    // подсказка в HUD должна исчезнуть (новый бросок придёт через setRollResult).
    if (state.phase !== MATCH_PHASE.SELECTING) {
      this.lastRolledFaces = [];
      this.selectedCount = 0;
      this.selectionValid = false;
      this.selectedPoints = 0;
    }
    this.state = state;
    this.updateStatusTimer();
    this.render();
  }

  setRoomState(state: RoomStatePayload): void {
    this.roomState = state;
    this.updateStatusTimer();
    this.render();
  }

  /**
   * Уведомление о результате последнего броска. Сохраняем faces для HUD-подсказки
   * «что можно брать» — игроку не нужно держать в голове правила Farkle.
   */
  setRollResult(rolledFaces: number[]): void {
    this.lastRolledFaces = [...rolledFaces];
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
    if (this.statusTimer !== null) clearInterval(this.statusTimer);
    this.errorTimer = null;
    this.statusTimer = null;
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
    if (!s) {
      this.leftPanel.textContent = t('connecting');
      return;
    }
    const turnLabel = formatPlayer(s.currentPlayer, this.ownUserId);
    const benchLabel = s.bench.length > 0 ? s.bench.join(', ') : '-';
    const minBank = this.roomState?.options.minBank ?? DEFAULT_ROOM_OPTIONS.minBank;
    const lines = [
      `${t('turnOwner')}: ${turnLabel}`,
      `${t('turnPoints')}: ${s.turnPoints}`,
      `${t('bench')}: ${benchLabel}`,
      minBank > 0 ? `${t('minBank')}: ${minBank}` : `${t('minBank')}: -`,
    ];

    const isMyTurn = s.currentPlayer === this.ownUserId;
    if (
      isMyTurn &&
      s.phase === MATCH_PHASE.SELECTING &&
      this.lastRolledFaces.length > 0 &&
      !this.isRanked()
    ) {
      lines.push('');
      lines.push(`${t('rolled')}: ${this.lastRolledFaces.join(', ')}`);
      const opts = scoreRoll(this.lastRolledFaces);
      if (opts.length === 0) {
        lines.push(t('scoringNone'));
      } else {
        lines.push(t('availableScoring'));
        for (const o of opts) {
          const positions = o.dieIndices.map((i) => i + 1).join(',');
          lines.push(`• ${o.label} (поз. ${positions}) → ${o.points}`);
        }
      }
    }

    if (isMyTurn && s.phase === MATCH_PHASE.SELECTING && this.selectedCount > 0) {
      lines.push('');
      lines.push(
        `${t('selected')}: ${this.selectedCount}${
          this.selectionValid ? '' : ` (${t('incompleteSet')})`
        }`,
      );
    }

    this.leftPanel.textContent = lines.join('\n');
  }

  private renderRight(): void {
    const s = this.state;
    const room = this.roomState;
    const targetScore = room?.options.targetScore ?? DEFAULT_ROOM_OPTIONS.targetScore;
    if (!room) {
      if (!s || s.totals.length === 0) {
        this.rightPanel.textContent = '—';
        return;
      }
      const lines = s.totals.map((t) => {
        const label = formatPlayer(t.userId, this.ownUserId);
        return `${label}: ${t.total} / ${targetScore}`;
      });
      this.rightPanel.textContent = lines.join('\n');
      return;
    }

    const totalByUser = new Map((s?.totals ?? []).map((t) => [t.userId, t.total]));
    const lines: string[] = [t('players')];
    const players = room.members.filter((m) => m.role === ROOM_ROLE.PLAYER);
    if (players.length === 0) {
      lines.push('—');
    } else {
      for (const m of players) {
        const label = formatMember(m.displayName, m.userId, this.ownUserId);
        const total = totalByUser.get(m.userId) ?? 0;
        const turn = s?.currentPlayer === m.userId ? ` · ${t('turn')}` : '';
        const online = m.online ? t('online') : t('offline');
        lines.push(`${label}: ${total} / ${targetScore} · ${online}${turn}`);
      }
    }

    const spectators = room.members.filter((m) => m.role === ROOM_ROLE.SPECTATOR);
    lines.push('');
    lines.push(t('spectators'));
    if (spectators.length === 0) {
      lines.push('—');
    } else {
      for (const m of spectators) {
        const label = formatMember(m.displayName, m.userId, this.ownUserId);
        lines.push(`${label} · ${m.online ? t('online') : t('offline')}`);
      }
    }

    this.rightPanel.textContent = lines.join('\n');
  }

  private getOwnRole(): number | null {
    const member = this.roomState?.members.find((m) => m.userId === this.ownUserId);
    return member?.role ?? null;
  }

  private renderActions(): void {
    const s = this.state;
    const showButtons =
      s !== null &&
      !s.paused &&
      this.getOwnRole() !== ROOM_ROLE.SPECTATOR &&
      s.phase === MATCH_PHASE.SELECTING &&
      s.currentPlayer === this.ownUserId;
    this.actionsPanel.style.display = showButtons ? 'flex' : 'none';
    const canSubmit = showButtons && this.selectedCount > 0 && this.selectionValid;
    const minBank = this.roomState?.options.minBank ?? DEFAULT_ROOM_OPTIONS.minBank;
    const canBank =
      canSubmit && s !== null && s.turnPoints + this.selectedPoints >= minBank;
    this.setButtonEnabled(this.continueBtn, canSubmit);
    this.setButtonEnabled(this.bankBtn, canBank);
  }

  private renderStatus(): void {
    const s = this.state;
    if (!s) {
      this.statusPanel.textContent = '';
      this.statusPanel.style.display = 'none';
      return;
    }
    if (s.paused) {
      this.statusPanel.textContent = s.pauseReason ? `${t('pause')}: ${s.pauseReason}` : t('pause');
      this.statusPanel.style.display = 'block';
      return;
    }
    const isSpectator = this.getOwnRole() === ROOM_ROLE.SPECTATOR;
    if (isSpectator) {
      this.statusPanel.textContent = t('spectatorMode');
      this.statusPanel.style.display = 'block';
      return;
    }
    const isMyTurn = s.currentPlayer === this.ownUserId;
    const opponent = s.currentPlayer ? formatPlayer(s.currentPlayer, this.ownUserId) : '-';
    let text = '';
    switch (s.phase as MatchPhase) {
      case MATCH_PHASE.WAITING:
        text = isMyTurn ? t('yourTurnRoll') : `${t('waitingFor')} ${opponent}`;
        break;
      case MATCH_PHASE.ROLLING:
        text = t('rolling');
        break;
      case MATCH_PHASE.SELECTING:
        text = isMyTurn ? '' : `${t('turnOwner')}: ${opponent}, ${t('selectingDice')}`;
        break;
      case MATCH_PHASE.FINISHED: {
        const winner = s.winner ? formatPlayer(s.winner, this.ownUserId) : '-';
        text = `${t('won')}: ${winner}`;
        break;
      }
      default:
        text = '';
    }
    const timer = this.formatTurnTimer();
    if (timer) text = text ? `${text} · ${timer}` : timer;
    this.statusPanel.textContent = text;
    this.statusPanel.style.display = text ? 'block' : 'none';
  }

  private isRanked(): boolean {
    return this.roomState?.mode === ROOM_MODE.RANKED;
  }

  private formatTurnTimer(): string {
    const deadline = this.state?.turnDeadlineAt ?? 0;
    if (deadline <= 0 || this.state?.phase !== MATCH_PHASE.SELECTING) return '';
    const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    return `${seconds}s`;
  }

  private updateStatusTimer(): void {
    const hasTimer =
      (this.state?.turnDeadlineAt ?? 0) > Date.now() &&
      this.state?.phase === MATCH_PHASE.SELECTING;
    if (hasTimer && this.statusTimer === null) {
      this.statusTimer = window.setInterval(() => {
        this.updateStatusTimer();
        this.renderStatus();
      }, 250);
      return;
    }
    if (!hasTimer && this.statusTimer !== null) {
      clearInterval(this.statusTimer);
      this.statusTimer = null;
    }
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
      color: BTN_FG,
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
