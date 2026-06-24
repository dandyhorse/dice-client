import { EventEmitter } from '../../event-emitter.class';
import {
  DEFAULT_PLAYER_SETTINGS,
  controlCodeLabel,
  type ControlBindings,
} from '../../../../player-settings';
import { onLanguageChange, t } from '../../../../ui/i18n';
import { bindMouseOnlyClick } from '../../../../ui/mouse-only-button';
import { FONT_FAMILY, FONT_SIZE, UI_SIZE } from '../../../../ui/theme';

import {
  DEFAULT_ROOM_OPTIONS,
  MATCH_PHASE,
  ROOM_MODE,
  ROOM_ROLE,
} from '../../../../network/protocol/types';
import type { MatchPhase, MatchStatePayload, RoomStatePayload } from '../../../../network/protocol/types';
import type { MatchSelectionPreviewPayload } from '../../../../network/protocol/types';

const PANEL_BG = 'rgba(0,0,0,0.6)';
const PANEL_FG = '#eee';
const PANEL_OFFLINE_FG = '#8e8e9d';
const PANEL_RADIUS = '6px';
const PANEL_PAD = '10px 12px';
const PANEL_ACTIVE_BORDER = '#22c55e';

const BTN_BG = '#3b82f6';
const BTN_FG = '#fff';
const BTN_DISABLED_OPACITY = '0.4';

const ERROR_DURATION_MS = 2500;
const FARKLE_DURATION_MS = 1200;
const TURN_BANNER_DURATION_MS = 1800;

const formatMember = (displayName: string): string => displayName.trim() || t('player');

const formatActionLabel = (label: string, code: string): string =>
  `${label} (${controlCodeLabel(code)})`;

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
  private readonly opponentPanel: HTMLDivElement;
  private readonly rightPanel: HTMLDivElement;
  private readonly turnStatsPanel: HTMLDivElement;
  private readonly actionsPanel: HTMLDivElement;
  private readonly statusPanel: HTMLDivElement;
  private readonly errorPanel: HTMLDivElement;
  private readonly turnBannerPanel: HTMLDivElement;
  private readonly finalActionsPanel: HTMLDivElement;
  private readonly selectAllBtn: HTMLButtonElement;
  private readonly continueBtn: HTMLButtonElement;
  private readonly bankBtn: HTMLButtonElement;
  private readonly surrenderBtn: HTMLButtonElement;
  private readonly finalExitBtn: HTMLButtonElement;
  private readonly finalRematchBtn: HTMLButtonElement;
  private readonly unsubscribeLanguage: () => void;

  private state: MatchStatePayload | null = null;
  private roomState: RoomStatePayload | null = null;
  private controls: ControlBindings;
  private selectedCount = 0;
  private selectionValid = false;
  private selectedPoints = 0;
  private remoteSelectionPreview: MatchSelectionPreviewPayload | null = null;
  private actionsBlocked = false;
  private errorTimer: number | null = null;
  private statusTimer: number | null = null;
  private turnBannerTimer: number | null = null;
  private queuedTurnBannerUserId = '';
  private lastAnnouncedTurnPlayer = '';
  private finalResult: 'WIN' | 'FARKLE' | null = null;
  private finalRematchRequestedBy: string[] = [];
  private readonly ownUserId: string;

  constructor(ownUserId: string, controls: ControlBindings = DEFAULT_PLAYER_SETTINGS.controls) {
    this.ownUserId = ownUserId;
    this.controls = { ...controls };
    this.root = document.createElement('div');
    this.root.id = 'hud';
    Object.assign(this.root.style, {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      zIndex: '15',
      fontFamily: FONT_FAMILY.ui,
    } satisfies Partial<CSSStyleDeclaration>);

    this.leftPanel = this.makePanel({ top: '12px', left: '12px' });
    this.leftPanel.id = 'hud-left';
    Object.assign(this.leftPanel.style, {
      minWidth: '180px',
      whiteSpace: 'pre-line',
    } satisfies Partial<CSSStyleDeclaration>);

    this.opponentPanel = this.makePanel({ bottom: '12px', left: '12px' });
    this.opponentPanel.id = 'hud-opponent';
    Object.assign(this.opponentPanel.style, {
      minWidth: '180px',
      whiteSpace: 'pre-line',
      display: 'none',
    } satisfies Partial<CSSStyleDeclaration>);

    this.rightPanel = this.makePanel({ top: '12px', right: '12px' });
    this.rightPanel.id = 'hud-right';
    Object.assign(this.rightPanel.style, {
      minWidth: '180px',
      whiteSpace: 'pre-line',
      textAlign: 'right',
    } satisfies Partial<CSSStyleDeclaration>);

    this.turnStatsPanel = document.createElement('div');
    this.turnStatsPanel.id = 'hud-turn-stats';
    Object.assign(this.turnStatsPanel.style, {
      position: 'fixed',
      top: '12px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '8px',
      minWidth: '260px',
      pointerEvents: 'none',
    } satisfies Partial<CSSStyleDeclaration>);

    this.actionsPanel = document.createElement('div');
    this.actionsPanel.id = 'hud-actions';
    Object.assign(this.actionsPanel.style, {
      position: 'fixed',
      right: '12px',
      bottom: '12px',
      display: 'none',
      flexDirection: 'column',
      gap: '8px',
      width: 'min(360px, calc(100vw - 24px))',
      pointerEvents: 'auto',
    } satisfies Partial<CSSStyleDeclaration>);

    this.selectAllBtn = this.makeButton('', () => {
      if (this.selectAllBtn.disabled) return;
      this.events.emit('select-all-clicked');
    });
    this.continueBtn = this.makeButton('', () => {
      if (this.continueBtn.disabled) return;
      this.events.emit('continue-clicked');
    });
    this.bankBtn = this.makeButton('', () => {
      if (this.bankBtn.disabled) return;
      this.events.emit('bank-clicked');
    });
    this.surrenderBtn = this.makeButton('', () => {
      if (this.surrenderBtn.disabled) return;
      this.events.emit('surrender-clicked');
    });
    this.actionsPanel.appendChild(this.selectAllBtn);
    this.actionsPanel.appendChild(this.continueBtn);
    this.actionsPanel.appendChild(this.bankBtn);
    this.actionsPanel.appendChild(this.surrenderBtn);

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
      padding: '18px 34px',
      background: 'rgba(180,40,40,0.85)',
      color: '#fff',
      fontFamily: FONT_FAMILY.ui,
      fontSize: 'clamp(42px, 8vw, 92px)',
      fontWeight: 'bold',
      borderRadius: '0',
      pointerEvents: 'none',
      display: 'none',
      letterSpacing: '0.05em',
    } satisfies Partial<CSSStyleDeclaration>);

    this.turnBannerPanel = document.createElement('div');
    this.turnBannerPanel.id = 'hud-turn-banner';
    Object.assign(this.turnBannerPanel.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: '#fff',
      fontFamily: FONT_FAMILY.title,
      fontSize: 'clamp(46px, 9vw, 104px)',
      fontWeight: '700',
      textAlign: 'center',
      textShadow: '0 8px 28px rgba(0,0,0,0.7)',
      pointerEvents: 'none',
      display: 'none',
      letterSpacing: '0',
    } satisfies Partial<CSSStyleDeclaration>);

    this.finalActionsPanel = document.createElement('div');
    this.finalActionsPanel.id = 'hud-final-actions';
    Object.assign(this.finalActionsPanel.style, {
      position: 'fixed',
      top: 'calc(50% + 108px)',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'none',
      gap: '10px',
      width: 'min(380px, calc(100vw - 24px))',
      pointerEvents: 'auto',
      zIndex: '16',
    } satisfies Partial<CSSStyleDeclaration>);
    this.finalExitBtn = this.makeButton('', () => {
      if (this.finalExitBtn.disabled) return;
      this.events.emit('final-exit-clicked');
    });
    this.finalExitBtn.style.background = '#374151';
    this.finalExitBtn.style.flex = '1 1 0';
    this.finalExitBtn.style.width = 'auto';
    this.finalRematchBtn = this.makeButton('', () => {
      if (this.finalRematchBtn.disabled) return;
      this.events.emit('rematch-clicked');
    });
    this.finalRematchBtn.style.flex = '1 1 0';
    this.finalRematchBtn.style.width = 'auto';
    this.finalActionsPanel.appendChild(this.finalExitBtn);
    this.finalActionsPanel.appendChild(this.finalRematchBtn);

    this.root.appendChild(this.leftPanel);
    this.root.appendChild(this.opponentPanel);
    this.root.appendChild(this.rightPanel);
    this.root.appendChild(this.turnStatsPanel);
    document.body.appendChild(this.root);
    document.body.appendChild(this.actionsPanel);
    document.body.appendChild(this.statusPanel);
    document.body.appendChild(this.errorPanel);
    document.body.appendChild(this.turnBannerPanel);
    document.body.appendChild(this.finalActionsPanel);

    this.unsubscribeLanguage = onLanguageChange(() => {
      this.renderButtonLabels();
      this.render();
    });
    this.renderButtonLabels();
    this.render();
  }

  setMatchState(state: MatchStatePayload): void {
    if (state.phase !== MATCH_PHASE.FINISHED && this.finalResult !== null) {
      this.clearFinalResult();
    }
    if (state.phase !== MATCH_PHASE.SELECTING) {
      this.selectedCount = 0;
      this.selectionValid = false;
      this.selectedPoints = 0;
      this.remoteSelectionPreview = null;
    }
    this.state = state;
    if (
      state.phase !== MATCH_PHASE.FINISHED &&
      state.currentPlayer &&
      state.currentPlayer !== this.lastAnnouncedTurnPlayer
    ) {
      this.lastAnnouncedTurnPlayer = state.currentPlayer;
      this.queueOrShowTurnBanner(state.currentPlayer);
    }
    this.updateStatusTimer();
    this.render();
  }

  setRoomState(state: RoomStatePayload): void {
    this.roomState = state;
    this.updateStatusTimer();
    this.render();
  }

  setControls(controls: ControlBindings): void {
    this.controls = { ...controls };
    this.renderButtonLabels();
  }

  setRollResult(_rolledFaces: number[]): void {
    this.render();
  }

  setSelectionState(n: number, valid: boolean, points = 0): void {
    this.selectedCount = n;
    this.selectionValid = valid;
    this.selectedPoints = points;
    this.renderActions();
    this.renderLeft();
    this.renderTurnStats();
  }

  setSelectionPreview(payload: MatchSelectionPreviewPayload | null): void {
    this.remoteSelectionPreview = payload;
    this.renderTurnStats();
  }

  showError(message: string): void {
    if (this.finalResult !== null) return;
    const isFarkle = message.toUpperCase() === 'BUST';
    this.errorPanel.textContent = isFarkle ? t('farkle') : message;
    this.errorPanel.style.display = 'block';
    if (isFarkle) {
      this.actionsBlocked = true;
      this.turnBannerPanel.style.display = 'none';
      this.renderActions();
    }
    if (this.errorTimer !== null) clearTimeout(this.errorTimer);
    this.errorTimer = window.setTimeout(() => {
      this.errorPanel.style.display = 'none';
      if (isFarkle) {
        this.actionsBlocked = false;
        this.renderActions();
        if (this.queuedTurnBannerUserId) {
          const userId = this.queuedTurnBannerUserId;
          this.queuedTurnBannerUserId = '';
          this.showTurnBanner(userId);
        }
      }
      this.errorTimer = null;
    }, isFarkle ? FARKLE_DURATION_MS : ERROR_DURATION_MS);
  }

  showFinalResult(result: 'WIN' | 'FARKLE', requestedBy: string[] = []): void {
    this.finalResult = result;
    this.finalRematchRequestedBy = Array.from(new Set(requestedBy));
    if (this.errorTimer !== null) clearTimeout(this.errorTimer);
    if (this.turnBannerTimer !== null) clearTimeout(this.turnBannerTimer);
    this.errorTimer = null;
    this.turnBannerTimer = null;
    this.queuedTurnBannerUserId = '';
    this.actionsBlocked = true;
    this.errorPanel.textContent = result === 'FARKLE' ? t('farkle') : 'WIN';
    this.errorPanel.style.background =
      result === 'WIN' ? 'rgba(34,197,94,0.88)' : 'rgba(180,40,40,0.85)';
    this.errorPanel.style.display = 'block';
    this.turnBannerPanel.style.display = 'none';
    this.finalActionsPanel.style.display = 'flex';
    this.renderFinalButtons();
    this.renderActions();
    this.renderStatus();
  }

  setFinalRematchRequestedBy(requestedBy: string[]): void {
    this.finalRematchRequestedBy = Array.from(new Set(requestedBy));
    if (this.finalResult !== null) this.renderFinalButtons();
  }

  destroy(): void {
    if (this.errorTimer !== null) clearTimeout(this.errorTimer);
    if (this.statusTimer !== null) clearInterval(this.statusTimer);
    if (this.turnBannerTimer !== null) clearTimeout(this.turnBannerTimer);
    this.errorTimer = null;
    this.statusTimer = null;
    this.turnBannerTimer = null;
    this.queuedTurnBannerUserId = '';
    this.unsubscribeLanguage();
    this.root.remove();
    this.actionsPanel.remove();
    this.statusPanel.remove();
    this.errorPanel.remove();
    this.turnBannerPanel.remove();
    this.finalActionsPanel.remove();
  }

  private render(): void {
    this.renderLeft();
    this.renderTurnStats();
    this.renderActions();
    this.renderStatus();
  }

  private renderButtonLabels(): void {
    this.selectAllBtn.textContent = formatActionLabel(
      t('selectAllAction'),
      this.controls.selectAll,
    );
    this.continueBtn.textContent = formatActionLabel(
      t('continueAction'),
      this.controls.continueTurn,
    );
    this.bankBtn.textContent = formatActionLabel(t('bankAction'), this.controls.bankTurn);
    this.surrenderBtn.textContent = formatActionLabel(
      t('surrenderAction'),
      this.controls.surrender,
    );
    this.renderFinalButtons();
  }

  private renderLeft(): void {
    const s = this.state;
    if (!s) {
      this.leftPanel.textContent = t('connecting');
      this.opponentPanel.style.display = 'none';
      this.rightPanel.style.display = 'none';
      this.turnStatsPanel.style.display = 'none';
      return;
    }
    if (this.isDuel()) {
      this.renderDuelLeft();
      return;
    }

    this.opponentPanel.style.display = 'none';
    this.leftPanel.style.top = '12px';
    const room = this.roomState;
    const targetScore = room?.options.targetScore ?? DEFAULT_ROOM_OPTIONS.targetScore;
    const totalByUser = new Map(s.totals.map((total) => [total.userId, total.total]));
    const players = room?.members.filter((m) => m.role === ROOM_ROLE.PLAYER) ?? [];

    if (players.length === 0) {
      const ownTotal = s.totals.find((total) => total.userId === this.ownUserId);
      this.leftPanel.textContent = `${t('player')}\n${ownTotal?.total ?? 0} / ${targetScore}`;
      this.stylePlayerPanel(this.leftPanel, null, s.currentPlayer === this.ownUserId);
      return;
    }

    const ownPlayer = players.find((m) => m.userId === this.ownUserId) ?? players[0]!;
    const others = players.filter((m) => m.userId !== ownPlayer.userId);
    this.leftPanel.textContent = this.formatScorePanel(ownPlayer, totalByUser, targetScore);
    this.stylePlayerPanel(this.leftPanel, ownPlayer, s.currentPlayer === ownPlayer.userId);

    if (others.length === 0) {
      this.rightPanel.style.display = 'none';
      return;
    }

    this.rightPanel.style.display = 'block';
    this.rightPanel.textContent = others
      .map((member) => this.formatScorePanel(member, totalByUser, targetScore))
      .join('\n\n');
    this.stylePlayerPanel(
      this.rightPanel,
      others.find((member) => s.currentPlayer === member.userId) ?? others[0]!,
      others.some((member) => s.currentPlayer === member.userId),
    );
  }

  private renderTurnStats(): void {
    const s = this.state;
    if (!s || s.phase === MATCH_PHASE.FINISHED) {
      this.turnStatsPanel.style.display = 'none';
      return;
    }

    this.turnStatsPanel.style.display = 'grid';
    const remoteSelected =
      s.currentPlayer !== this.ownUserId &&
      this.remoteSelectionPreview?.userId === s.currentPlayer &&
      this.remoteSelectionPreview.valid
        ? this.remoteSelectionPreview.points
        : 0;
    const selected = s.currentPlayer === this.ownUserId
      ? this.selectionValid
        ? this.selectedPoints
        : 0
      : remoteSelected;
    this.turnStatsPanel.replaceChildren(
      this.makeStatTile(t('bankedTurn'), String(s.turnPoints)),
      this.makeStatTile(t('selectedPoints'), String(selected)),
    );
  }

  private makeStatTile(label: string, value: string): HTMLDivElement {
    const tile = document.createElement('div');
    Object.assign(tile.style, {
      padding: '8px 14px',
      background: PANEL_BG,
      color: PANEL_FG,
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: PANEL_RADIUS,
      textAlign: 'center',
      minWidth: '120px',
      boxSizing: 'border-box',
    } satisfies Partial<CSSStyleDeclaration>);

    const labelEl = document.createElement('div');
    labelEl.textContent = label;
    Object.assign(labelEl.style, {
      fontSize: FONT_SIZE.label,
      color: '#b8b8c8',
      lineHeight: '1.1',
    } satisfies Partial<CSSStyleDeclaration>);

    const valueEl = document.createElement('div');
    valueEl.textContent = value;
    Object.assign(valueEl.style, {
      marginTop: '4px',
      fontSize: FONT_SIZE.title,
      lineHeight: '1',
      fontWeight: '700',
    } satisfies Partial<CSSStyleDeclaration>);

    tile.append(labelEl, valueEl);
    return tile;
  }

  private renderDuelLeft(): void {
    const s = this.state;
    const room = this.roomState;
    if (!s || !room) return;

    const players = room.members.filter((m) => m.role === ROOM_ROLE.PLAYER);
    const ownPlayer = players.find((m) => m.userId === this.ownUserId) ?? players[0]!;
    const opponent = players.find((m) => m.userId !== ownPlayer.userId) ?? players[1]!;
    const targetScore = room.options.targetScore ?? DEFAULT_ROOM_OPTIONS.targetScore;
    const totalByUser = new Map(s.totals.map((t) => [t.userId, t.total]));

    this.leftPanel.style.top = '12px';
    this.leftPanel.textContent = this.formatScorePanel(opponent, totalByUser, targetScore);
    this.stylePlayerPanel(this.leftPanel, opponent, s.currentPlayer === opponent.userId);
    this.opponentPanel.style.display = 'block';
    this.opponentPanel.textContent = this.formatScorePanel(ownPlayer, totalByUser, targetScore);
    this.stylePlayerPanel(this.opponentPanel, ownPlayer, s.currentPlayer === ownPlayer.userId);
  }

  private formatScorePanel(
    member: NonNullable<RoomStatePayload['members'][number]>,
    totalByUser: Map<string, number>,
    targetScore: number,
  ): string {
    const label = formatMember(member.displayName);
    const total = totalByUser.get(member.userId) ?? 0;
    return `${label}\n${total} / ${targetScore}`;
  }

  private stylePlayerPanel(
    panel: HTMLDivElement,
    member: NonNullable<RoomStatePayload['members'][number]> | null,
    active: boolean,
  ): void {
    panel.style.color = member?.online === false ? PANEL_OFFLINE_FG : PANEL_FG;
    panel.style.border = active ? `1px solid ${PANEL_ACTIVE_BORDER}` : '1px solid transparent';
  }

  private getOwnRole(): number | null {
    const member = this.roomState?.members.find((m) => m.userId === this.ownUserId);
    return member?.role ?? null;
  }

  private renderActions(): void {
    const s = this.state;
    const showPanel =
      s !== null &&
      this.getOwnRole() !== ROOM_ROLE.SPECTATOR &&
      s.phase !== MATCH_PHASE.FINISHED &&
      this.finalResult === null;
    this.actionsPanel.style.display = showPanel ? 'flex' : 'none';
    this.selectAllBtn.style.display = this.isRanked() ? 'none' : 'inline-flex';

    const canUseSelection =
      s !== null &&
      showPanel &&
      !this.actionsBlocked &&
      !s.paused &&
      s.phase === MATCH_PHASE.SELECTING &&
      s.currentPlayer === this.ownUserId;
    const canSubmit = canUseSelection && this.selectedCount > 0 && this.selectionValid;
    const minBank = this.roomState?.options.minBank ?? DEFAULT_ROOM_OPTIONS.minBank;
    const canBank =
      canSubmit && s !== null && s.turnPoints + this.selectedPoints >= minBank;
    this.setButtonEnabled(this.selectAllBtn, canUseSelection && !this.isRanked());
    this.setButtonEnabled(this.continueBtn, canSubmit);
    this.setButtonEnabled(this.bankBtn, canBank);
    this.setButtonEnabled(this.surrenderBtn, showPanel && !this.actionsBlocked);
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
    let text = '';
    switch (s.phase as MatchPhase) {
      case MATCH_PHASE.WAITING:
        text = '';
        break;
      case MATCH_PHASE.ROLLING:
        text = t('rolling');
        break;
      case MATCH_PHASE.SELECTING:
        text = '';
        break;
      case MATCH_PHASE.FINISHED: {
        const winner = s.winner ? this.displayNameForUser(s.winner) : '-';
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

  private isDuel(): boolean {
    const players = this.roomState?.members.filter((m) => m.role === ROOM_ROLE.PLAYER) ?? [];
    return players.length === 2;
  }

  private displayNameForUser(userId: string): string {
    const member = this.roomState?.members.find((m) => m.userId === userId);
    return member?.displayName.trim() || t('player');
  }

  private showTurnBanner(userId: string): void {
    if (this.turnBannerTimer !== null) clearTimeout(this.turnBannerTimer);
    const text =
      userId === this.ownUserId
        ? t('yourTurnBanner')
        : `${t('playerTurnPrefix')}: ${this.displayNameForUser(userId)}`;
    this.turnBannerPanel.textContent = text.toLocaleUpperCase();
    this.turnBannerPanel.style.display = 'block';
    this.turnBannerTimer = window.setTimeout(() => {
      this.turnBannerPanel.style.display = 'none';
      this.turnBannerTimer = null;
    }, TURN_BANNER_DURATION_MS);
  }

  private queueOrShowTurnBanner(userId: string): void {
    if (this.actionsBlocked || this.errorPanel.style.display === 'block') {
      this.queuedTurnBannerUserId = userId;
      return;
    }
    this.showTurnBanner(userId);
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
      border: '1px solid transparent',
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
      borderRadius: '6px',
      fontFamily: FONT_FAMILY.ui,
      fontSize: FONT_SIZE.hud,
      width: '100%',
      minHeight: UI_SIZE.hudButtonHeight,
      boxSizing: 'border-box',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      lineHeight: '1.15',
      whiteSpace: 'normal',
      cursor: 'pointer',
      pointerEvents: 'auto',
    } satisfies Partial<CSSStyleDeclaration>);
    bindMouseOnlyClick(btn, onClick);
    return btn;
  }

  private setButtonEnabled(btn: HTMLButtonElement, enabled: boolean): void {
    btn.disabled = !enabled;
    btn.style.opacity = enabled ? '1' : BTN_DISABLED_OPACITY;
    btn.style.cursor = enabled ? 'pointer' : 'not-allowed';
  }

  private renderFinalButtons(): void {
    this.finalExitBtn.textContent = t('exitMatch');
    const requested = this.finalRematchRequestedBy;
    const ownRequested = requested.includes(this.ownUserId);
    const opponentRequested = requested.some((userId) => userId !== this.ownUserId);
    this.finalRematchBtn.textContent = ownRequested
      ? t('rematchWaiting')
      : opponentRequested
        ? t('rematchAccept')
        : t('rematchAsk');
    this.setButtonEnabled(this.finalExitBtn, true);
    this.setButtonEnabled(this.finalRematchBtn, !ownRequested);
  }

  private clearFinalResult(): void {
    this.finalResult = null;
    this.finalRematchRequestedBy = [];
    this.actionsBlocked = false;
    this.errorPanel.style.display = 'none';
    this.errorPanel.style.background = 'rgba(180,40,40,0.85)';
    this.finalActionsPanel.style.display = 'none';
  }
}
