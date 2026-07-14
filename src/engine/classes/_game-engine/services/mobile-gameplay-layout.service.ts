import { avatarUrlForIndex } from '../../../../avatars';
import {
  GAMEPLAY_OVERLAY_STATE_EVENT,
  GAME_POPUP_CLOSE_EVENT,
  TOP_MENU_DROPDOWN_CLOSE_EVENT,
} from '../../../../ui/game-modal-state';
import {
  MOBILE_GAMEPLAY_GRID_ID,
  MOBILE_GAMEPLAY_RAIL_WIDTH,
  MOBILE_GAMEPLAY_RAIL_WIDTH_VARIABLE,
  MOBILE_GAMEPLAY_TOP_MENU_RENDERED_EVENT,
} from '../../../../ui/mobile-gameplay-grid';
import { bindMouseOnlyClick } from '../../../../ui/mouse-only-button';

export type MobileGameplayAction = 'select-all' | 'continue' | 'bank' | 'rules';

export interface MobileGameplayActionState {
  visible: boolean;
  selectAllEnabled: boolean;
  continueEnabled: boolean;
  bankEnabled: boolean;
  rulesEnabled: boolean;
}

export interface MobileGameplayPlayer {
  displayName: string;
  avatarIndex: number;
  total: number;
  targetScore: number;
  active: boolean;
  own: boolean;
}

interface MobileGameplayLayoutOptions {
  turnStatsPanel: HTMLElement;
  playerPanels: readonly HTMLElement[];
  desktopActionsPanel: HTMLElement;
  surrenderPanel: HTMLElement;
  surrenderButton: HTMLButtonElement;
  onAction: (action: MobileGameplayAction) => void;
}

const MOBILE_ACTION_HEIGHT = 45;
const MOBILE_ACTION_GAP = 8;
const MOBILE_TOP_CONTROL_SIZE = 48;
const MOBILE_ACTIONS_BLOCKED_OPACITY = '0.12';
const MOBILE_ACTIONS_BLOCK_HEIGHT =
  MOBILE_ACTION_HEIGHT * 4 + MOBILE_ACTION_GAP * 3;
const MOBILE_TOP_MENU_ID = 'lang-controls';
const MOBILE_AVATAR_FRAME_SIZE = 32;
const MOBILE_AVATAR_IMAGE_SIZE = Math.round(
  MOBILE_AVATAR_FRAME_SIZE * (108 / 128),
);
const MOBILE_AVATAR_MASK_SRC = '/assets/ui/avatar-frame-mask.svg';

const ACTIONS: readonly MobileGameplayAction[] = [
  'select-all',
  'continue',
  'bank',
  'rules',
];

/**
 * Mobile gameplay chrome uses one five-column CSS Grid:
 * edge | left rail | table | right rail | edge.
 */
export class MobileGameplayLayoutService {
  private readonly grid = document.createElement('div');
  private readonly root = document.createElement('div');
  private readonly leftRail = document.createElement('div');
  private readonly playersRoot = document.createElement('div');
  private readonly buttons = new Map<MobileGameplayAction, HTMLButtonElement>();
  private readonly turnStatsPanel: HTMLElement;
  private readonly playerPanels: readonly HTMLElement[];
  private readonly desktopActionsPanel: HTMLElement;
  private readonly surrenderPanel: HTMLElement;
  private readonly surrenderButton: HTMLButtonElement;
  private visible = false;
  private overlayStateTimer: number | null = null;
  private railTrackFrame: number | null = null;

  constructor(options: MobileGameplayLayoutOptions) {
    this.turnStatsPanel = options.turnStatsPanel;
    this.playerPanels = options.playerPanels;
    this.desktopActionsPanel = options.desktopActionsPanel;
    this.surrenderPanel = options.surrenderPanel;
    this.surrenderButton = options.surrenderButton;
    this.surrenderPanel.classList.add('mobile-surrender-control');
    this.surrenderButton.classList.remove('menu-frame-button');

    this.grid.id = MOBILE_GAMEPLAY_GRID_ID;
    Object.assign(this.grid.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '45',
      display: 'grid',
      visibility: 'hidden',
      gridTemplateColumns: [
        'var(--mobile-gameplay-edge-offset)',
        MOBILE_GAMEPLAY_RAIL_WIDTH,
        'minmax(0, 1fr)',
        MOBILE_GAMEPLAY_RAIL_WIDTH,
        'var(--mobile-gameplay-edge-offset)',
      ].join(' '),
      gridTemplateRows: `minmax(0, 1fr) ${MOBILE_ACTIONS_BLOCK_HEIGHT}px minmax(0, 1fr)`,
      pointerEvents: 'none',
    } satisfies Partial<CSSStyleDeclaration>);
    // Bootstrap from zero. The only real rail width is measured from the
    // outer edges of the rendered top-menu buttons below.
    this.grid.style.setProperty(MOBILE_GAMEPLAY_RAIL_WIDTH_VARIABLE, '0px');

    this.root.id = 'hud-mobile-actions';
    Object.assign(this.root.style, {
      gridColumn: '4',
      gridRow: '2',
      alignSelf: 'stretch',
      justifySelf: 'stretch',
      zIndex: '1',
      display: 'none',
      width: '100%',
      height: `${MOBILE_ACTIONS_BLOCK_HEIGHT}px`,
      boxSizing: 'border-box',
      flexDirection: 'column',
      gap: `${MOBILE_ACTION_GAP}px`,
      pointerEvents: 'auto',
      transition: 'opacity 140ms ease, filter 140ms ease',
    } satisfies Partial<CSSStyleDeclaration>);

    this.leftRail.id = 'hud-mobile-scoreboard';
    Object.assign(this.leftRail.style, {
      gridColumn: '2',
      gridRow: '2',
      alignSelf: 'start',
      justifySelf: 'stretch',
      zIndex: '1',
      display: 'none',
      width: '100%',
      maxHeight: 'calc(100dvh - max(22px, env(safe-area-inset-top) + env(safe-area-inset-bottom)))',
      flexDirection: 'column',
      gap: `${MOBILE_ACTION_GAP}px`,
      overflowY: 'auto',
      overscrollBehavior: 'contain',
      pointerEvents: 'none',
    } satisfies Partial<CSSStyleDeclaration>);

    Object.assign(this.playersRoot.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: `${MOBILE_ACTION_GAP}px`,
      width: '100%',
    } satisfies Partial<CSSStyleDeclaration>);

    for (const action of ACTIONS) {
      const button = document.createElement('button');
      button.type = 'button';
      Object.assign(button.style, {
        width: '100%',
        height: `${MOBILE_ACTION_HEIGHT}px`,
        flex: `0 0 ${MOBILE_ACTION_HEIGHT}px`,
        boxSizing: 'border-box',
        padding: '0 10px',
        background: `url('/assets/ui/menu-button-small-frame-stretch.svg') center / 100% 100% no-repeat`,
        border: 'none',
        borderRadius: '0',
        color: '#fff',
        fontFamily: 'var(--font-ui)',
        fontSize: '12px',
        lineHeight: '1.05',
        textAlign: 'center',
        textShadow: '0 2px 8px rgba(0,0,0,0.72)',
      } satisfies Partial<CSSStyleDeclaration>);
      button.dataset.mobileGameplayAction = action;
      bindMouseOnlyClick(button, () => options.onAction(action));
      this.buttons.set(action, button);
      this.root.appendChild(button);
    }

    this.leftRail.append(this.turnStatsPanel, this.playersRoot);
    this.grid.append(this.surrenderPanel, this.leftRail, this.root);
    document.body.appendChild(this.grid);
    this.adoptTopMenu();
    this.applyStaticLayout();
    this.scheduleRailTrackSync();
    window.addEventListener('resize', this.scheduleRailTrackSync);
    window.visualViewport?.addEventListener('resize', this.scheduleRailTrackSync);
    window.addEventListener(
      MOBILE_GAMEPLAY_TOP_MENU_RENDERED_EVENT,
      this.scheduleRailTrackSync,
    );
    window.addEventListener('pointerdown', this.scheduleOverlayStateSync, true);
    window.addEventListener(GAMEPLAY_OVERLAY_STATE_EVENT, this.syncOverlayState);
    window.addEventListener(GAME_POPUP_CLOSE_EVENT, this.scheduleOverlayStateSync);
    window.addEventListener(TOP_MENU_DROPDOWN_CLOSE_EVENT, this.scheduleOverlayStateSync);
  }

  setActionState(state: MobileGameplayActionState): void {
    this.visible = state.visible;
    this.applyStaticLayout();
    this.root.style.display = state.visible ? 'flex' : 'none';
    this.leftRail.style.display = state.visible ? 'flex' : 'none';
    this.setEnabled('select-all', state.selectAllEnabled);
    this.setEnabled('continue', state.continueEnabled);
    this.setEnabled('bank', state.bankEnabled);
    this.setEnabled('rules', state.rulesEnabled);
    this.syncOverlayState();
  }

  setActionLabels(labels: Record<MobileGameplayAction, string>): void {
    for (const [action, button] of this.buttons) {
      button.textContent = labels[action];
      button.setAttribute('aria-label', labels[action]);
      button.title = labels[action];
    }
  }

  setPlayers(players: readonly MobileGameplayPlayer[]): void {
    this.playersRoot.replaceChildren(
      ...players.map((player) => this.createPlayerCard(player)),
    );
  }

  setSurrenderLabel(label: string): void {
    this.surrenderButton.setAttribute('aria-label', label);
    this.surrenderButton.title = label;
    const text = this.surrenderButton.querySelector<HTMLElement>('[data-button-label="true"]');
    if (text) text.textContent = 'X';
  }

  destroy(): void {
    if (this.overlayStateTimer !== null) clearTimeout(this.overlayStateTimer);
    if (this.railTrackFrame !== null) cancelAnimationFrame(this.railTrackFrame);
    window.removeEventListener('resize', this.scheduleRailTrackSync);
    window.visualViewport?.removeEventListener('resize', this.scheduleRailTrackSync);
    window.removeEventListener(
      MOBILE_GAMEPLAY_TOP_MENU_RENDERED_EVENT,
      this.scheduleRailTrackSync,
    );
    window.removeEventListener('pointerdown', this.scheduleOverlayStateSync, true);
    window.removeEventListener(GAMEPLAY_OVERLAY_STATE_EVENT, this.syncOverlayState);
    window.removeEventListener(GAME_POPUP_CLOSE_EVENT, this.scheduleOverlayStateSync);
    window.removeEventListener(TOP_MENU_DROPDOWN_CLOSE_EVENT, this.scheduleOverlayStateSync);
    this.restoreTopMenu();
    this.grid.remove();
  }

  private adoptTopMenu(): void {
    const topMenu = document.getElementById(MOBILE_TOP_MENU_ID);
    if (!topMenu) return;
    Object.assign(topMenu.style, {
      position: 'static',
      top: 'auto',
      right: 'auto',
      gridColumn: '4',
      gridRow: '1',
      alignSelf: 'start',
      justifySelf: 'end',
      marginTop: 'var(--gameplay-top-row-offset)',
    } satisfies Partial<CSSStyleDeclaration>);
    this.grid.appendChild(topMenu);
  }

  private restoreTopMenu(): void {
    const topMenu = document.getElementById(MOBILE_TOP_MENU_ID);
    if (!topMenu || !this.grid.contains(topMenu)) return;
    Object.assign(topMenu.style, {
      position: 'fixed',
      top: 'var(--gameplay-top-row-offset)',
      right: 'var(--mobile-gameplay-edge-offset)',
      gridColumn: 'auto',
      gridRow: 'auto',
      alignSelf: 'auto',
      justifySelf: 'auto',
      marginTop: '0',
    } satisfies Partial<CSSStyleDeclaration>);
    document.body.appendChild(topMenu);
  }

  private scheduleRailTrackSync = (): void => {
    if (this.railTrackFrame !== null) cancelAnimationFrame(this.railTrackFrame);
    this.railTrackFrame = requestAnimationFrame(() => {
      this.railTrackFrame = null;
      const topMenu = document.getElementById(MOBILE_TOP_MENU_ID);
      const topMenuItems = Array.from(topMenu?.children ?? []).filter(
        (child): child is HTMLElement => child instanceof HTMLElement,
      );
      const firstItem = topMenuItems[0]?.getBoundingClientRect();
      const lastItem = topMenuItems[topMenuItems.length - 1]?.getBoundingClientRect();
      // The parent grid item may be constrained by its own track. Use actual
      // button bounds, so rail = [first button left .. last button right],
      // including both visible flex gaps.
      const width = firstItem && lastItem
        ? lastItem.right - firstItem.left
        : 0;
      if (width <= 0) return;
      this.grid.style.setProperty(
        MOBILE_GAMEPLAY_RAIL_WIDTH_VARIABLE,
        `${width.toFixed(2)}px`,
      );
      this.grid.style.visibility = 'visible';
    });
  };

  private applyStaticLayout(): void {
    this.playerPanels.forEach((panel) => {
      panel.style.setProperty('display', 'none', 'important');
    });
    this.desktopActionsPanel.style.setProperty('display', 'none', 'important');
    Object.assign(this.turnStatsPanel.style, {
      position: 'static',
      width: '100%',
      minWidth: '0',
      height: 'auto',
      transform: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: `${MOBILE_ACTION_GAP}px`,
      justifyContent: 'start',
      pointerEvents: 'none',
    } satisfies Partial<CSSStyleDeclaration>);
    Object.assign(this.surrenderPanel.style, {
      position: 'static',
      top: 'auto',
      left: 'auto',
      right: 'auto',
      bottom: 'auto',
      gridColumn: '2',
      gridRow: '1',
      alignSelf: 'start',
      justifySelf: 'start',
      marginTop: 'var(--gameplay-top-row-offset)',
      width: `${MOBILE_TOP_CONTROL_SIZE}px`,
      height: `${MOBILE_TOP_CONTROL_SIZE}px`,
      minWidth: `${MOBILE_TOP_CONTROL_SIZE}px`,
      minHeight: `${MOBILE_TOP_CONTROL_SIZE}px`,
      maxWidth: `${MOBILE_TOP_CONTROL_SIZE}px`,
      maxHeight: `${MOBILE_TOP_CONTROL_SIZE}px`,
      flex: `0 0 ${MOBILE_TOP_CONTROL_SIZE}px`,
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      boxSizing: 'border-box',
      zIndex: '1',
    } satisfies Partial<CSSStyleDeclaration>);
    Object.assign(this.surrenderButton.style, {
      width: `${MOBILE_TOP_CONTROL_SIZE}px`,
      height: `${MOBILE_TOP_CONTROL_SIZE}px`,
      minWidth: `${MOBILE_TOP_CONTROL_SIZE}px`,
      minHeight: `${MOBILE_TOP_CONTROL_SIZE}px`,
      maxWidth: `${MOBILE_TOP_CONTROL_SIZE}px`,
      maxHeight: `${MOBILE_TOP_CONTROL_SIZE}px`,
      flex: `0 0 ${MOBILE_TOP_CONTROL_SIZE}px`,
      margin: '0',
      padding: '0',
      background: `url('/assets/ui/small-icon-frame.svg') center / ${MOBILE_TOP_CONTROL_SIZE}px ${MOBILE_TOP_CONTROL_SIZE}px no-repeat`,
      border: 'none',
      borderRadius: '0',
      color: '#fff',
      display: 'grid',
      placeItems: 'center',
      position: 'relative',
      appearance: 'none',
      fontFamily: 'var(--font-ui)',
      fontSize: '20px',
      lineHeight: '1',
      textShadow: '0 2px 8px rgba(0,0,0,0.72)',
    } satisfies Partial<CSSStyleDeclaration>);
    const label = this.surrenderButton.querySelector<HTMLElement>('[data-button-label="true"]');
    if (!label) return;
    Object.assign(label.style, {
      position: 'absolute',
      inset: '0',
      display: 'grid',
      placeItems: 'center',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      maxWidth: 'none',
      transform: 'none',
      lineHeight: '1',
    } satisfies Partial<CSSStyleDeclaration>);
  }

  private createPlayerCard(player: MobileGameplayPlayer): HTMLDivElement {
    const card = document.createElement('div');
    Object.assign(card.style, {
      width: '100%',
      height: `${MOBILE_ACTION_HEIGHT}px`,
      minHeight: `${MOBILE_ACTION_HEIGHT}px`,
      maxHeight: `${MOBILE_ACTION_HEIGHT}px`,
      padding: '4px 7px',
      display: 'grid',
      gridTemplateColumns: `${MOBILE_AVATAR_FRAME_SIZE}px minmax(0, 1fr)`,
      gridTemplateRows: '1fr 1fr',
      columnGap: '6px',
      alignItems: 'center',
      boxSizing: 'border-box',
      background: `url('/assets/ui/menu-button-small-frame-stretch.svg') center / 100% 100% no-repeat`,
      color: '#fff',
      opacity: player.active ? '1' : '0.72',
      filter: player.active ? 'none' : 'grayscale(0.82)',
      transition: 'opacity 160ms ease, filter 160ms ease',
    } satisfies Partial<CSSStyleDeclaration>);

    const avatar = document.createElement('div');
    Object.assign(avatar.style, {
      gridRow: '1 / span 2',
      width: `${MOBILE_AVATAR_FRAME_SIZE}px`,
      height: `${MOBILE_AVATAR_FRAME_SIZE}px`,
      display: 'grid',
      placeItems: 'center',
      overflow: 'hidden',
      background: `url('/assets/ui/small-icon-frame.svg') center / ${MOBILE_AVATAR_FRAME_SIZE}px ${MOBILE_AVATAR_FRAME_SIZE}px no-repeat`,
    } satisfies Partial<CSSStyleDeclaration>);
    const avatarUrl = avatarUrlForIndex(player.avatarIndex);
    if (avatarUrl) {
      const image = document.createElement('img');
      image.src = avatarUrl;
      image.alt = '';
      image.draggable = false;
      Object.assign(image.style, {
        width: `${MOBILE_AVATAR_IMAGE_SIZE}px`,
        height: `${MOBILE_AVATAR_IMAGE_SIZE}px`,
        objectFit: 'cover',
        pointerEvents: 'none',
        userSelect: 'none',
      } satisfies Partial<CSSStyleDeclaration>);
      image.style.maskImage = `url("${MOBILE_AVATAR_MASK_SRC}")`;
      image.style.maskSize = `${MOBILE_AVATAR_IMAGE_SIZE}px ${MOBILE_AVATAR_IMAGE_SIZE}px`;
      image.style.maskRepeat = 'no-repeat';
      image.style.maskPosition = 'center';
      image.style.setProperty(
        '-webkit-mask-image',
        `url("${MOBILE_AVATAR_MASK_SRC}")`,
      );
      image.style.setProperty(
        '-webkit-mask-size',
        `${MOBILE_AVATAR_IMAGE_SIZE}px ${MOBILE_AVATAR_IMAGE_SIZE}px`,
      );
      image.style.setProperty('-webkit-mask-repeat', 'no-repeat');
      image.style.setProperty('-webkit-mask-position', 'center');
      avatar.appendChild(image);
    } else {
      avatar.textContent = (player.displayName[0] ?? '?').toUpperCase();
    }

    const name = document.createElement('div');
    name.className = 'player-nickname';
    name.textContent = player.displayName;
    Object.assign(name.style, {
      minWidth: '0',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontSize: '11px',
      lineHeight: '1',
    } satisfies Partial<CSSStyleDeclaration>);

    const score = document.createElement('div');
    score.textContent = `${player.total} / ${player.targetScore}`;
    Object.assign(score.style, {
      fontSize: '10px',
      lineHeight: '1',
      fontVariantNumeric: 'tabular-nums',
      opacity: '0.82',
    } satisfies Partial<CSSStyleDeclaration>);
    card.append(avatar, name, score);
    return card;
  }

  private setEnabled(action: MobileGameplayAction, enabled: boolean): void {
    const button = this.buttons.get(action);
    if (!button) return;
    button.disabled = !enabled;
    button.style.opacity = enabled ? '1' : '0.4';
  }

  private scheduleOverlayStateSync = (): void => {
    if (this.overlayStateTimer !== null) clearTimeout(this.overlayStateTimer);
    this.overlayStateTimer = window.setTimeout(() => {
      this.overlayStateTimer = null;
      this.syncOverlayState();
    }, 0);
  };

  private syncOverlayState = (): void => {
    if (!this.visible) return;
    const overlayOpen = document.querySelector(
      '#settings-modal, #lang-controls [data-top-dropdown="sound"], #lang-controls [data-top-dropdown="language"]',
    ) !== null;
    this.root.style.pointerEvents = overlayOpen ? 'none' : 'auto';
    this.root.style.opacity = overlayOpen ? MOBILE_ACTIONS_BLOCKED_OPACITY : '1';
    this.root.style.filter = overlayOpen ? 'grayscale(1) brightness(0.58)' : 'none';
    this.root.setAttribute('aria-hidden', String(overlayOpen));
  };
}
