import { EventEmitter } from '../../event-emitter.class';
import {
  DEFAULT_PLAYER_SETTINGS,
  controlCodeLabel,
  type ControlBindings,
} from '../../../../player-settings';
import { onLanguageChange, t } from '../../../../ui/i18n';
import { bindMouseOnlyClick } from '../../../../ui/mouse-only-button';
import { FONT_FAMILY, FONT_SIZE, UI_RADIUS } from '../../../../ui/theme';
import { avatarUrlForIndex } from '../../../../avatars';

import {
  DEFAULT_ROOM_OPTIONS,
  MATCH_PHASE,
  ROOM_MODE,
  ROOM_ROLE,
} from '../../../../network/protocol/types';
import type { MatchPhase, MatchStatePayload, RoomStatePayload } from '../../../../network/protocol/types';
import type { MatchSelectionPreviewPayload } from '../../../../network/protocol/types';

const PANEL_FG = '#eee';
const PANEL_OFFLINE_FG = '#8e8e9d';
const PANEL_RADIUS = UI_RADIUS;
const PANEL_PAD = '18px 24px';
const PLAYER_PANEL_TOP_Y = 'calc(clamp(90px, 14vh, 170px) + 15px)';
const PLAYER_PANEL_BOTTOM_Y = 'calc(clamp(90px, 14vh, 170px) + 25px)';
const PLAYER_PANEL_TABLE_X = 'max(18px, calc(20vw - 14.4vh - 20px))';
const HUD_AVATAR_SIZE = 128;
const HUD_AVATAR_IMAGE_SIZE = 108;
const HUD_AVATAR_FRAME_SRC = '/assets/ui/Small_frame.svg';
const HUD_AVATAR_MASK_SRC = '/assets/ui/avatar_mask.svg';
const HUD_BUTTON_S_FRAME_SRC = '/assets/ui/Button_S.svg';
const TURN_STAT_TILE_WIDTH = 191;
const TURN_STAT_TILE_HEIGHT = 60;
const TURN_STAT_TILE_GAP = 16;

const BTN_DISABLED_OPACITY = '0.4';
const FARKLE_DURATION_MS = 1200;
const OPPONENT_TURN_BANNER_DURATION_MS = 1500;
const BLOCKING_OVERLAY_SELECTORS = [
  '#settings-modal',
  '#profile-popup',
  '#auth-modal',
  '#room-list-modal',
  '#hud-surrender-confirm',
].join(',');

const formatMember = (displayName: string): string => displayName.trim() || t('player');

const formatActionLabel = (label: string, code: string): string =>
  `${label} (${controlCodeLabel(code)})`;

const isInteractiveDismissTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) return false;
  if (target.closest('input, textarea, select, button, [contenteditable]')) return true;
  return target.closest(BLOCKING_OVERLAY_SELECTORS) !== null;
};

const hasBlockingOverlay = (): boolean =>
  document.querySelector(BLOCKING_OVERLAY_SELECTORS) !== null;

const isCanvasPointer = (event: PointerEvent): boolean =>
  event.target instanceof HTMLCanvasElement;

type TurnBannerDismissPointerPredicate = (event: PointerEvent) => boolean;

/**
 * HUD-оверлей для turn-based матча. Vanilla DOM, без UI-фреймворков
 * (стиль как в `main.ts:renderLobby` / `showRoomCode`).
 *
 * Структура:
 *   - `#hud-left`: чей ход / turnPoints / bench
 *   - `#hud-right`: totals по игрокам vs TARGET_SCORE
 *   - `#hud-actions`: кнопки Continue/Bank (только когда твой ход и SELECTING)
 *   - `#hud-status`: статусная строка под кнопками (фаза текстом)
 *   - `#hud-error`: всплывающее сообщение (FARKLE по таймеру, остальные до клика)
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
  private readonly surrenderPanel: HTMLDivElement;
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
  private farkleTimer: number | null = null;
  private turnBannerTimer: number | null = null;
  private statusTimer: number | null = null;
  private transientDismissBound = false;
  private turnBannerClickDismissable = false;
  private turnBannerUserId = '';
  private queuedTurnBannerUserId = '';
  private lastAnnouncedTurnPlayer = '';
  private finalResult: 'WIN' | 'FARKLE' | null = null;
  private finalRematchRequestedBy: string[] = [];
  private finalRematchAvailable = true;
  private readonly ownUserId: string;
  private readonly isTurnBannerDismissPointer: TurnBannerDismissPointerPredicate;

  constructor(
    ownUserId: string,
    controls: ControlBindings = DEFAULT_PLAYER_SETTINGS.controls,
    isTurnBannerDismissPointer: TurnBannerDismissPointerPredicate = isCanvasPointer,
  ) {
    this.ownUserId = ownUserId;
    this.isTurnBannerDismissPointer = isTurnBannerDismissPointer;
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

    this.leftPanel = this.makePanel({ top: PLAYER_PANEL_TOP_Y, left: PLAYER_PANEL_TABLE_X });
    this.leftPanel.id = 'hud-left';
    Object.assign(this.leftPanel.style, {
      minWidth: '430px',
      whiteSpace: 'pre-line',
    } satisfies Partial<CSSStyleDeclaration>);

    this.opponentPanel = this.makePanel({
      bottom: PLAYER_PANEL_BOTTOM_Y,
      left: PLAYER_PANEL_TABLE_X,
    });
    this.opponentPanel.id = 'hud-opponent';
    Object.assign(this.opponentPanel.style, {
      minWidth: '430px',
      whiteSpace: 'pre-line',
      display: 'none',
    } satisfies Partial<CSSStyleDeclaration>);

    this.rightPanel = this.makePanel({ top: PLAYER_PANEL_TOP_Y, right: PLAYER_PANEL_TABLE_X });
    this.rightPanel.id = 'hud-right';
    Object.assign(this.rightPanel.style, {
      minWidth: '430px',
      whiteSpace: 'pre-line',
      textAlign: 'left',
    } satisfies Partial<CSSStyleDeclaration>);

    this.turnStatsPanel = document.createElement('div');
    this.turnStatsPanel.id = 'hud-turn-stats';
    Object.assign(this.turnStatsPanel.style, {
      position: 'fixed',
      top: '40px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'grid',
      gridTemplateColumns: `repeat(2, ${TURN_STAT_TILE_WIDTH}px)`,
      gap: `${TURN_STAT_TILE_GAP}px`,
      minWidth: `${TURN_STAT_TILE_WIDTH * 2 + TURN_STAT_TILE_GAP}px`,
      pointerEvents: 'none',
    } satisfies Partial<CSSStyleDeclaration>);

    this.actionsPanel = document.createElement('div');
    this.actionsPanel.id = 'hud-actions';
    Object.assign(this.actionsPanel.style, {
      position: 'fixed',
      left: '50%',
      bottom: '28px',
      transform: 'translateX(-50%)',
      display: 'none',
      flexDirection: 'row',
      gap: '16px',
      width: 'min(1067px, calc(100vw - 32px))',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'nowrap',
      pointerEvents: 'auto',
    } satisfies Partial<CSSStyleDeclaration>);

    this.surrenderPanel = document.createElement('div');
    this.surrenderPanel.id = 'hud-surrender';
    Object.assign(this.surrenderPanel.style, {
      position: 'fixed',
      right: '12px',
      bottom: '12px',
      display: 'none',
      width: 'min(360px, calc(100vw - 24px))',
      justifyContent: 'center',
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
    this.surrenderPanel.appendChild(this.surrenderBtn);

    this.statusPanel = document.createElement('div');
    this.statusPanel.id = 'hud-status';
    this.statusPanel.classList.add('status-frame');
    Object.assign(this.statusPanel.style, {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      pointerEvents: 'none',
      display: 'none',
    } satisfies Partial<CSSStyleDeclaration>);

    this.errorPanel = document.createElement('div');
    this.errorPanel.id = 'hud-error';
    this.errorPanel.classList.add('status-frame');
    Object.assign(this.errorPanel.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      display: 'none',
    } satisfies Partial<CSSStyleDeclaration>);

    this.turnBannerPanel = document.createElement('div');
    this.turnBannerPanel.id = 'hud-turn-banner';
    this.turnBannerPanel.classList.add('status-frame');
    Object.assign(this.turnBannerPanel.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      display: 'none',
    } satisfies Partial<CSSStyleDeclaration>);

    this.finalActionsPanel = document.createElement('div');
    this.finalActionsPanel.id = 'hud-final-actions';
    Object.assign(this.finalActionsPanel.style, {
      position: 'fixed',
      top: 'calc(50% + 140px)',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'none',
      gap: '15px',
      width: 'min(410px, calc(100vw - 24px))',
      justifyContent: 'center',
      flexWrap: 'nowrap',
      pointerEvents: 'auto',
      zIndex: '16',
    } satisfies Partial<CSSStyleDeclaration>);
    this.finalExitBtn = this.makeButton('', () => {
      if (this.finalExitBtn.disabled) return;
      this.events.emit('final-exit-clicked');
    });
    this.finalExitBtn.classList.add('menu-frame-button-small', 'menu-frame-button-small-large');
    this.finalRematchBtn = this.makeButton('', () => {
      if (this.finalRematchBtn.disabled) return;
      this.events.emit('rematch-clicked');
    });
    this.finalRematchBtn.classList.add('menu-frame-button-small', 'menu-frame-button-small-large');
    this.finalActionsPanel.appendChild(this.finalExitBtn);
    this.finalActionsPanel.appendChild(this.finalRematchBtn);

    this.root.appendChild(this.leftPanel);
    this.root.appendChild(this.opponentPanel);
    this.root.appendChild(this.rightPanel);
    this.root.appendChild(this.turnStatsPanel);
    document.body.appendChild(this.root);
    document.body.appendChild(this.actionsPanel);
    document.body.appendChild(this.surrenderPanel);
    document.body.appendChild(this.statusPanel);
    document.body.appendChild(this.errorPanel);
    document.body.appendChild(this.turnBannerPanel);
    document.body.appendChild(this.finalActionsPanel);

    this.unsubscribeLanguage = onLanguageChange(() => {
      this.renderButtonLabels();
      this.render();
      this.refreshLanguageText();
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
    this.refreshLanguageText();
  }

  setRoomState(state: RoomStatePayload): void {
    this.roomState = state;
    this.updateStatusTimer();
    this.render();
    this.refreshLanguageText();
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
    this.errorPanel.classList.remove('status-frame-large');
    this.errorPanel.classList.toggle('status-frame-danger', isFarkle);
    this.errorPanel.style.display = 'grid';
    if (isFarkle) {
      this.unbindTransientDismiss();
      this.actionsBlocked = true;
      this.clearTurnBannerTimer();
      this.turnBannerClickDismissable = false;
      this.turnBannerUserId = '';
      this.turnBannerPanel.style.display = 'none';
      this.renderActions();
      if (this.farkleTimer !== null) clearTimeout(this.farkleTimer);
      this.farkleTimer = window.setTimeout(this.finishFarkleOverlay, FARKLE_DURATION_MS);
      return;
    }
    this.bindTransientDismiss();
  }

  showFinalResult(
    result: 'WIN' | 'FARKLE',
    requestedBy: string[] = [],
    rematchAvailable = true,
  ): void {
    this.finalResult = result;
    this.finalRematchAvailable = rematchAvailable;
    this.finalRematchRequestedBy = Array.from(new Set(requestedBy));
    if (this.farkleTimer !== null) clearTimeout(this.farkleTimer);
    this.farkleTimer = null;
    this.clearTurnBannerTimer();
    this.unbindTransientDismiss();
    this.turnBannerClickDismissable = false;
    this.turnBannerUserId = '';
    this.queuedTurnBannerUserId = '';
    this.actionsBlocked = true;
    this.errorPanel.textContent = result === 'FARKLE' ? t('farkle') : 'WIN';
    this.errorPanel.classList.add('status-frame-large');
    this.errorPanel.classList.toggle('status-frame-danger', result === 'FARKLE');
    this.errorPanel.style.display = 'grid';
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

  setFinalRematchAvailable(available: boolean): void {
    this.finalRematchAvailable = available;
    if (this.finalResult !== null) this.renderFinalButtons();
  }

  destroy(): void {
    if (this.farkleTimer !== null) clearTimeout(this.farkleTimer);
    this.clearTurnBannerTimer();
    if (this.statusTimer !== null) clearInterval(this.statusTimer);
    this.farkleTimer = null;
    this.statusTimer = null;
    this.unbindTransientDismiss();
    this.turnBannerClickDismissable = false;
    this.queuedTurnBannerUserId = '';
    this.unsubscribeLanguage();
    this.root.remove();
    this.actionsPanel.remove();
    this.surrenderPanel.remove();
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
    this.setButtonLabel(this.selectAllBtn, formatActionLabel(
      t('selectAllAction'),
      this.controls.selectAll,
    ));
    this.setButtonLabel(this.continueBtn, formatActionLabel(
      t('continueAction'),
      this.controls.continueTurn,
    ));
    this.setButtonLabel(
      this.bankBtn,
      formatActionLabel(t('bankAction'), this.controls.bankTurn),
    );
    this.setButtonLabel(this.surrenderBtn, formatActionLabel(
      t('surrenderAction'),
      this.controls.surrender,
    ));
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
    this.leftPanel.style.top = PLAYER_PANEL_TOP_Y;
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
    this.renderScorePanel(this.leftPanel, ownPlayer, totalByUser, targetScore);
    this.stylePlayerPanel(this.leftPanel, ownPlayer, s.currentPlayer === ownPlayer.userId);

    if (others.length === 0) {
      this.rightPanel.style.display = 'none';
      return;
    }

    this.rightPanel.style.display = 'block';
    this.renderScorePanelList(this.rightPanel, others, totalByUser, targetScore);
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
      width: `${TURN_STAT_TILE_WIDTH}px`,
      height: `${TURN_STAT_TILE_HEIGHT}px`,
      padding: '0',
      backgroundImage: `url('${HUD_BUTTON_S_FRAME_SRC}')`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: '100% 100%',
      color: PANEL_FG,
      textAlign: 'center',
      boxSizing: 'border-box',
      position: 'relative',
    } satisfies Partial<CSSStyleDeclaration>);

    const labelEl = document.createElement('div');
    labelEl.textContent = label;
    Object.assign(labelEl.style, {
      position: 'absolute',
      top: '-31px',
      left: '12px',
      right: '12px',
      fontSize: FONT_SIZE.hud,
      color: '#b8b8c8',
      lineHeight: '1.1',
      whiteSpace: 'nowrap',
    } satisfies Partial<CSSStyleDeclaration>);

    const valueEl = document.createElement('div');
    valueEl.textContent = value;
    Object.assign(valueEl.style, {
      position: 'absolute',
      inset: '0',
      display: 'grid',
      placeItems: 'center',
      fontSize: '42px',
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

    this.leftPanel.style.top = PLAYER_PANEL_TOP_Y;
    this.renderScorePanel(this.leftPanel, opponent, totalByUser, targetScore);
    this.stylePlayerPanel(this.leftPanel, opponent, s.currentPlayer === opponent.userId);
    this.opponentPanel.style.display = 'block';
    this.renderScorePanel(this.opponentPanel, ownPlayer, totalByUser, targetScore);
    this.stylePlayerPanel(this.opponentPanel, ownPlayer, s.currentPlayer === ownPlayer.userId);
  }

  private renderScorePanel(
    panel: HTMLDivElement,
    member: NonNullable<RoomStatePayload['members'][number]>,
    totalByUser: Map<string, number>,
    targetScore: number,
  ): void {
    panel.replaceChildren(this.createScorePanelContent(member, totalByUser, targetScore));
  }

  private renderScorePanelList(
    panel: HTMLDivElement,
    members: NonNullable<RoomStatePayload['members'][number]>[],
    totalByUser: Map<string, number>,
    targetScore: number,
  ): void {
    panel.replaceChildren(
      ...members.map((member, index) => {
        const row = this.createScorePanelContent(member, totalByUser, targetScore);
        if (index > 0) row.style.marginTop = '12px';
        return row;
      }),
    );
  }

  private createScorePanelContent(
    member: NonNullable<RoomStatePayload['members'][number]>,
    totalByUser: Map<string, number>,
    targetScore: number,
  ): HTMLDivElement {
    const label = formatMember(member.displayName);
    const total = totalByUser.get(member.userId) ?? 0;
    const row = document.createElement('div');
    Object.assign(row.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '18px',
      minWidth: '0',
    } satisfies Partial<CSSStyleDeclaration>);

    const text = document.createElement('div');
    Object.assign(text.style, {
      minWidth: '0',
      whiteSpace: 'pre-line',
      lineHeight: '1.2',
      fontSize: '26px',
    } satisfies Partial<CSSStyleDeclaration>);
    text.textContent = `${label}\n${total} / ${targetScore}`;

    row.append(this.createAvatar(member, label), text);
    return row;
  }

  private createAvatar(
    member: NonNullable<RoomStatePayload['members'][number]>,
    label: string,
  ): HTMLDivElement {
    const avatar = document.createElement('div');
    Object.assign(avatar.style, {
      width: `${HUD_AVATAR_SIZE}px`,
      height: `${HUD_AVATAR_SIZE}px`,
      flex: `0 0 ${HUD_AVATAR_SIZE}px`,
      display: 'grid',
      placeItems: 'center',
      overflow: 'visible',
      borderRadius: '0',
      background: `url("${HUD_AVATAR_FRAME_SRC}") center / ${HUD_AVATAR_SIZE}px ${HUD_AVATAR_SIZE}px no-repeat`,
      border: 'none',
      color: '#fff',
      fontSize: '34px',
      fontWeight: '700',
      opacity: member.online === false ? '0.45' : '1',
      boxSizing: 'border-box',
      position: 'relative',
    } satisfies Partial<CSSStyleDeclaration>);

    const url = avatarUrlForIndex(member.avatarIndex);
    if (!url) {
      avatar.textContent = (label.trim()[0] ?? '?').toUpperCase();
      return avatar;
    }

    const image = document.createElement('img');
    image.src = url;
    image.alt = '';
    image.draggable = false;
    Object.assign(image.style, {
      display: 'block',
      width: `${HUD_AVATAR_IMAGE_SIZE}px`,
      height: `${HUD_AVATAR_IMAGE_SIZE}px`,
      objectFit: 'cover',
      pointerEvents: 'none',
      userSelect: 'none',
      position: 'relative',
      zIndex: '1',
    } satisfies Partial<CSSStyleDeclaration>);
    image.style.maskImage = `url("${HUD_AVATAR_MASK_SRC}")`;
    image.style.maskSize = `${HUD_AVATAR_IMAGE_SIZE}px ${HUD_AVATAR_IMAGE_SIZE}px`;
    image.style.maskRepeat = 'no-repeat';
    image.style.maskPosition = 'center';
    image.style.setProperty('-webkit-mask-image', `url("${HUD_AVATAR_MASK_SRC}")`);
    image.style.setProperty(
      '-webkit-mask-size',
      `${HUD_AVATAR_IMAGE_SIZE}px ${HUD_AVATAR_IMAGE_SIZE}px`,
    );
    image.style.setProperty('-webkit-mask-repeat', 'no-repeat');
    image.style.setProperty('-webkit-mask-position', 'center');
    avatar.appendChild(image);
    return avatar;
  }

  private stylePlayerPanel(
    panel: HTMLDivElement,
    member: NonNullable<RoomStatePayload['members'][number]> | null,
    _active: boolean,
  ): void {
    panel.style.color = member?.online === false ? PANEL_OFFLINE_FG : PANEL_FG;
    panel.style.border = 'none';
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
    this.surrenderPanel.style.display = showPanel ? 'flex' : 'none';
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
      this.statusPanel.style.display = 'grid';
      return;
    }
    const isSpectator = this.getOwnRole() === ROOM_ROLE.SPECTATOR;
    if (isSpectator) {
      this.statusPanel.textContent = t('spectatorMode');
      this.statusPanel.style.display = 'grid';
      return;
    }
    let text = '';
    switch (s.phase as MatchPhase) {
      case MATCH_PHASE.WAITING:
        text = '';
        break;
      case MATCH_PHASE.ROLLING:
        text = '';
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
    this.statusPanel.style.display = text ? 'grid' : 'none';
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
    this.clearTurnBannerTimer();
    this.turnBannerUserId = userId;
    this.turnBannerPanel.textContent = this.turnBannerTextForUser(userId);
    this.turnBannerPanel.style.display = 'grid';
    this.turnBannerClickDismissable = userId === this.ownUserId;
    if (this.turnBannerClickDismissable) {
      this.bindTransientDismiss();
      return;
    }
    if (this.errorPanel.style.display === 'none') this.unbindTransientDismiss();
    this.turnBannerTimer = window.setTimeout(
      this.finishTimedTurnBanner,
      OPPONENT_TURN_BANNER_DURATION_MS,
    );
  }

  private turnBannerTextForUser(userId: string): string {
    const text =
      userId === this.ownUserId
        ? t('yourTurnBanner')
        : `${t('playerTurnPrefix')}: ${this.displayNameForUser(userId)}`;
    return text.toLocaleUpperCase();
  }

  private queueOrShowTurnBanner(userId: string): void {
    if (this.actionsBlocked || this.errorPanel.style.display !== 'none') {
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
      background: 'transparent',
      color: PANEL_FG,
      fontFamily: FONT_FAMILY.ui,
      fontSize: FONT_SIZE.hud,
      borderRadius: PANEL_RADIUS,
      border: 'none',
      pointerEvents: 'none',
      lineHeight: '1.5',
    } satisfies Partial<CSSStyleDeclaration>);
    Object.assign(el.style, pos);
    return el;
  }

  private makeButton(label: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.classList.add('menu-frame-button');
    Object.assign(btn.style, {
      boxSizing: 'border-box',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      lineHeight: '1.15',
      whiteSpace: 'normal',
      pointerEvents: 'auto',
    } satisfies Partial<CSSStyleDeclaration>);
    this.setButtonLabel(btn, label);
    bindMouseOnlyClick(btn, onClick);
    return btn;
  }

  private setButtonLabel(btn: HTMLButtonElement, label: string): void {
    let text = btn.querySelector<HTMLSpanElement>('[data-button-label="true"]');
    if (!text || text.parentElement !== btn) {
      text = document.createElement('span');
      text.dataset.buttonLabel = 'true';
      Object.assign(text.style, {
        position: 'relative',
        zIndex: '1',
        maxWidth: 'calc(100% - 24px)',
      } satisfies Partial<CSSStyleDeclaration>);
      btn.replaceChildren(text);
    }
    text.textContent = label;
  }

  private setButtonEnabled(btn: HTMLButtonElement, enabled: boolean): void {
    btn.disabled = !enabled;
    btn.style.opacity = enabled ? '1' : BTN_DISABLED_OPACITY;
  }

  private bindTransientDismiss(): void {
    if (this.transientDismissBound) return;
    this.transientDismissBound = true;
    window.addEventListener('pointerdown', this.dismissTransientOverlays, true);
    window.addEventListener('keydown', this.dismissTransientOverlays, true);
  }

  private unbindTransientDismiss(): void {
    if (!this.transientDismissBound) return;
    this.transientDismissBound = false;
    window.removeEventListener('pointerdown', this.dismissTransientOverlays, true);
    window.removeEventListener('keydown', this.dismissTransientOverlays, true);
  }

  private clearTurnBannerTimer(): void {
    if (this.turnBannerTimer !== null) clearTimeout(this.turnBannerTimer);
    this.turnBannerTimer = null;
  }

  private finishFarkleOverlay = (): void => {
    this.farkleTimer = null;
    if (this.finalResult !== null) return;

    this.errorPanel.style.display = 'none';
    this.actionsBlocked = false;
    this.renderActions();

    if (this.queuedTurnBannerUserId) {
      const userId = this.queuedTurnBannerUserId;
      this.queuedTurnBannerUserId = '';
      this.showTurnBanner(userId);
    }
  };

  private finishTimedTurnBanner = (): void => {
    this.turnBannerTimer = null;
    if (this.finalResult !== null || this.turnBannerClickDismissable) return;
    this.turnBannerPanel.style.display = 'none';
    this.turnBannerUserId = '';
    if (this.errorPanel.style.display === 'none') this.unbindTransientDismiss();
  };

  private dismissTransientOverlays = (event: PointerEvent | KeyboardEvent): void => {
    if (this.finalResult !== null) return;
    const isKeyboard = event.type === 'keydown';
    const canDismissTurnBanner = isKeyboard
      ? (event as KeyboardEvent).code === this.controls.throwDice &&
        !hasBlockingOverlay() &&
        !isInteractiveDismissTarget(event.target)
      : this.isTurnBannerDismissPointer(event as PointerEvent);

    let dismissed = false;
    if (!isKeyboard && this.errorPanel.style.display !== 'none' && this.farkleTimer === null) {
      this.errorPanel.style.display = 'none';
      dismissed = true;
      if (this.actionsBlocked) {
        this.actionsBlocked = false;
        this.renderActions();
      }
    }
    if (
      canDismissTurnBanner &&
      this.turnBannerPanel.style.display !== 'none' &&
      this.turnBannerClickDismissable
    ) {
      this.clearTurnBannerTimer();
      this.turnBannerPanel.style.display = 'none';
      this.turnBannerClickDismissable = false;
      this.turnBannerUserId = '';
      dismissed = true;
    }

    if (dismissed && this.queuedTurnBannerUserId) {
      const userId = this.queuedTurnBannerUserId;
      this.queuedTurnBannerUserId = '';
      this.showTurnBanner(userId);
      return;
    }
    if (
      this.errorPanel.style.display === 'none' &&
      (this.turnBannerPanel.style.display === 'none' || !this.turnBannerClickDismissable)
    ) {
      this.unbindTransientDismiss();
    }
  };

  private renderFinalButtons(): void {
    this.setButtonLabel(this.finalExitBtn, t('exitMatch'));
    this.finalRematchBtn.style.display = this.finalRematchAvailable ? 'inline-flex' : 'none';
    if (!this.finalRematchAvailable) {
      this.setButtonEnabled(this.finalExitBtn, true);
      this.setButtonEnabled(this.finalRematchBtn, false);
      return;
    }
    const requested = this.finalRematchRequestedBy;
    const ownRequested = requested.includes(this.ownUserId);
    const opponentRequested = requested.some((userId) => userId !== this.ownUserId);
    this.setButtonLabel(this.finalRematchBtn, ownRequested
      ? t('rematchWaiting')
      : opponentRequested
        ? t('rematchAccept')
        : t('rematchAsk'));
    this.setButtonEnabled(this.finalExitBtn, true);
    this.setButtonEnabled(this.finalRematchBtn, !ownRequested);
  }

  private refreshLanguageText(): void {
    if (this.finalResult !== null) {
      this.errorPanel.textContent = this.finalResult === 'FARKLE' ? t('farkle') : 'WIN';
    } else if (
      this.errorPanel.style.display !== 'none' &&
      this.errorPanel.classList.contains('status-frame-danger')
    ) {
      this.errorPanel.textContent = t('farkle');
    }

    if (this.turnBannerPanel.style.display !== 'none' && this.turnBannerUserId) {
      this.turnBannerPanel.textContent = this.turnBannerTextForUser(this.turnBannerUserId);
    }
  }

  private clearFinalResult(): void {
    this.finalResult = null;
    this.finalRematchRequestedBy = [];
    this.finalRematchAvailable = true;
    this.actionsBlocked = false;
    this.errorPanel.style.display = 'none';
    this.errorPanel.classList.remove('status-frame-large');
    this.turnBannerClickDismissable = false;
    this.turnBannerUserId = '';
    this.finalActionsPanel.style.display = 'none';
  }
}
