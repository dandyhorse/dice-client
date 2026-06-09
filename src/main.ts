import './style.css';
import {
  getAuthIdentity,
  getLeaderboard,
  getStoredUser,
  loginAccount,
  logoutAccount,
  refreshCurrentUser,
  registerAccount,
} from './auth';
import { GameEngine } from './engine/classes/_game-engine/game-engine.class';
import {
  NetworkService,
  DEFAULT_ROOM_OPTIONS,
  ROOM_MIN_BANK_MAX,
  ROOM_MIN_BANK_MIN,
  ROOM_MIN_BANK_STEP,
  ROOM_MODE,
  ROOM_ROLE,
  ROOM_STATUS,
  ROOM_TARGET_SCORE_MAX,
  ROOM_TARGET_SCORE_MIN,
  ROOM_TARGET_SCORE_STEP,
  type RoomMode,
  type RoomOptionsPayload,
  type RoomListItem,
  type RoomState,
} from './engine/classes/_game-engine/services/network.service';
import {
  DEFAULT_SOLO_MODE,
  SOLO_MODE_CONFIGS,
  getSoloModeConfig,
  type SoloModeConfig,
} from './domain/solo-run';
import {
  getLanguage,
  onLanguageChange,
  setLanguage,
  soloModeTitle,
  t,
  type Language,
} from './ui/i18n';
import { bindMouseOnlyClick } from './ui/mouse-only-button';
import { FONT_FAMILY, FONT_SIZE, UI_SIZE, scaledPx } from './ui/theme';
import {
  CONTROL_ACTIONS,
  DEFAULT_PLAYER_SETTINGS,
  controlCodeLabel,
  getPlayerSettings,
  isAcceptedControlCode,
  loadPlayerSettings,
  onPlayerSettingsChange,
  savePlayerSettings,
  validatePlayerSettings,
  type ControlAction,
  type ControlBindings,
  type PlayerSettings,
} from './player-settings';
import { assetPreloader } from './engine/assets/asset-preloader';
import { audioService } from './engine/audio/audio.service';
import { MenuDiceScene } from './ui/menu-dice-scene';
import { hideLoadingOverlay, showLoadingOverlay } from './ui/loading-overlay';

const USER_ID_KEY = 'dice.userId';
const DISPLAY_NAME_KEY = 'dice.displayName';
const AUTH_CONTROLS_ID = 'auth-controls';
const AUTH_MODAL_ID = 'auth-modal';
const SETTINGS_MODAL_ID = 'settings-modal';
const BACK_BUTTON_ID = 'back-button';
const ROOM_BADGE_ID = 'room-badge';
const LANG_CONTROLS_ID = 'lang-controls';
const ROOM_LIST_MODAL_ID = 'room-list-modal';
const LEADERBOARD_ID = 'leaderboard-panel';
const RANKED_ENTRY_FEE = 10;
const MOBILE_DEVICE_RE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
const LANG_ICON_SRC: Record<Language, string> = {
  en: '/assets/lang/united-kingdom.png',
  ru: '/assets/lang/russia.png',
};
const LANG_ICON_BUTTON_SIZE = scaledPx(35);
const LANG_ICON_LABEL: Record<Language, string> = {
  en: 'English',
  ru: 'Русский',
};

// `crypto.randomUUID` в браузере доступен только в secure context (HTTPS/localhost).
// При открытии dev-клиента по LAN-IP его нет — ломается "Create room". Fallback:
// RFC 4122 v4 поверх `crypto.getRandomValues`, которое доступно везде.
const generateUuid = (): string => {
  const c = globalThis.crypto;
  if (typeof c.randomUUID === 'function') return c.randomUUID();
  const bytes = new Uint8Array(16);
  c.getRandomValues(bytes);
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
};

const getOrCreateUserId = (): string => {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = generateUuid();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
};

const getSavedDisplayName = (): string => {
  return localStorage.getItem(DISPLAY_NAME_KEY) ?? '';
};

const saveDisplayName = (value: string): string => {
  const name = value.trim().slice(0, 32) || 'Player';
  localStorage.setItem(DISPLAY_NAME_KEY, name);
  return name;
};

const app = document.getElementById('app');
if (!app) throw new Error('#app element not found');

const isMobileRuntime = (): boolean => {
  const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } };
  if (nav.userAgentData?.mobile === true) return true;
  if (MOBILE_DEVICE_RE.test(navigator.userAgent)) return true;
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true;
  return window.matchMedia('(max-width: 920px) and (pointer: coarse)').matches;
};

const renderMobileSoon = (): void => {
  document.title = t('mobileSoon');
  app.replaceChildren();

  const screen = document.createElement('main');
  Object.assign(screen.style, {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: '24px',
    boxSizing: 'border-box',
    background: '#111',
    color: '#f4f4f5',
    fontFamily: FONT_FAMILY.ui,
    textAlign: 'center',
  } satisfies Partial<CSSStyleDeclaration>);

  const title = document.createElement('h1');
  title.textContent = t('mobileSoon');
  Object.assign(title.style, {
    margin: '0',
    maxWidth: '14ch',
    fontSize: FONT_SIZE.mobileTitle,
    lineHeight: '1.05',
    fontWeight: '800',
  } satisfies Partial<CSSStyleDeclaration>);

  screen.appendChild(title);
  app.appendChild(screen);
};

const mobileRuntime = isMobileRuntime();
if (mobileRuntime) {
  renderMobileSoon();
}

let activeGame: GameEngine | null = null;
let activeNetwork: NetworkService | null = null;
type LobbyView =
  | 'home'
  | 'create-room'
  | 'solo'
  | 'multiplayer'
  | 'multiplayer-create'
  | 'multiplayer-join'
  | 'ranked'
  | 'settings';

let currentLobbyView: LobbyView = 'home';
let menuDiceScene: MenuDiceScene | null = null;
let menuDiceSceneLoading: Promise<void> | null = null;
let networkGameMounting: Promise<void> | null = null;

audioService.bindUnlockListeners();

onPlayerSettingsChange((settings) => {
  activeGame?.setPlayerSettings(settings);
});

const startLocal = async (soloConfig: SoloModeConfig = DEFAULT_SOLO_MODE): Promise<void> => {
  destroyMenuDiceScene();
  audioService.stopMusic();
  showLoadingOverlay();
  try {
    await Promise.all([
      assetPreloader.preloadGroup('gameplay'),
      audioService.preloadGroup('gameplay'),
    ]);
    clearLobby();
    clearRoomScreen();
    clearAuthControls();
    clearAuthModal();
    clearRoomBadge();
    const game = new GameEngine({ mode: 'local', soloConfig, playerSettings: getPlayerSettings() });
    app.appendChild(game.renderer.domElement);
    game.warmup();
    game.start();
    activeGame = game;
    renderBackButton();
  } finally {
    hideLoadingOverlay();
  }
};

const startNetwork = async (
  mode: 'create' | 'join',
  displayNameInput: string,
  code?: string,
  roomMode: RoomMode = ROOM_MODE.MATCH,
  roomOptions?: Partial<RoomOptionsPayload>,
  gameName?: string,
): Promise<void> => {
  const network = await connectNetwork(displayNameInput);
  activeNetwork = network;
  let state: RoomState;
  showLoadingOverlay();
  try {
    await Promise.all([
      assetPreloader.preloadGroup('gameplay'),
      audioService.preloadGroup('gameplay'),
    ]);
    state =
      mode === 'create'
        ? await network.createRoom(roomMode, roomOptions, gameName)
        : await network.joinRoom(code!);
  } catch (err) {
    if (activeNetwork === network) activeNetwork = null;
    network.disconnect();
    throw err;
  } finally {
    hideLoadingOverlay();
  }
  clearLobby();
  clearAuthControls();
  clearAuthModal();
  handleRoomState(network, state);
};

const connectNetwork = async (displayNameInput: string): Promise<NetworkService> => {
  const network = new NetworkService();
  const authIdentity = await getAuthIdentity();
  const displayName = authIdentity ? authIdentity.displayName : saveDisplayName(displayNameInput);
  const identity = authIdentity ?? {
    userId: getOrCreateUserId(),
    displayName,
    accessToken: undefined,
    authenticated: false,
  };
  network.events.on('room-state', (state: RoomState) => {
    handleRoomState(network, state);
  });
  await network.connect(identity.userId, identity.displayName, identity.accessToken);
  return network;
};

const rankedAccessError = (): Error | null => {
  const user = getStoredUser();
  if (!user) return new Error(t('authRequiredRanked'));
  if (user.coins < RANKED_ENTRY_FEE) return new Error(t('insufficientCoinsRanked'));
  return null;
};

const refreshAuthUserSilently = (): void => {
  refreshCurrentUser()
    .then(() => {
      if (document.getElementById(AUTH_CONTROLS_ID)) renderAuthControls();
    })
    .catch(() => {
      // Game flow should not be blocked by a stale auth badge refresh.
    });
};

const clearLobby = (): void => {
  const existing = document.getElementById('lobby');
  if (existing) existing.remove();
};

const clearRoomScreen = (): void => {
  const existing = document.getElementById('room-screen');
  if (existing) existing.remove();
};

const clearAuthControls = (): void => {
  const existing = document.getElementById(AUTH_CONTROLS_ID);
  if (existing) existing.remove();
};

const clearAuthModal = (): void => {
  const existing = document.getElementById(AUTH_MODAL_ID);
  if (existing) existing.remove();
};

const clearSettingsModal = (): void => {
  const existing = document.getElementById(SETTINGS_MODAL_ID);
  if (existing) existing.remove();
};

const clearRoomListModal = (): void => {
  const existing = document.getElementById(ROOM_LIST_MODAL_ID);
  if (existing) existing.remove();
};

const clearBackButton = (): void => {
  const existing = document.getElementById(BACK_BUTTON_ID);
  if (existing) existing.remove();
};

const clearRoomBadge = (): void => {
  const existing = document.getElementById(ROOM_BADGE_ID);
  if (existing) existing.remove();
};

const clearLanguageControls = (): void => {
  const existing = document.getElementById(LANG_CONTROLS_ID);
  if (existing) existing.remove();
};

const destroyMenuDiceScene = (): void => {
  menuDiceScene?.destroy();
  menuDiceScene = null;
};

const ensureMenuDiceScene = (): void => {
  if (menuDiceScene || menuDiceSceneLoading) return;
  showLoadingOverlay();
  menuDiceSceneLoading = Promise.all([
    assetPreloader.preloadGroup('menu'),
    audioService.preloadGroup('menu'),
  ])
    .then(() => {
      if (currentLobbyView !== 'home' || activeGame || mobileRuntime) return;
      const scene = new MenuDiceScene();
      scene.mount(document.body);
      menuDiceScene = scene;
      audioService.playMusic('menu-music');
    })
    .catch(showError)
    .finally(() => {
      menuDiceSceneLoading = null;
      hideLoadingOverlay();
    });
};

const returnToLobby = (): void => {
  activeGame?.destroy();
  activeGame = null;
  activeNetwork?.disconnect();
  activeNetwork = null;
  clearLobby();
  clearRoomScreen();
  clearRoomBadge();
  clearBackButton();
  clearAuthModal();
  clearSettingsModal();
  clearRoomListModal();
  renderLobby();
};

const renderBackButton = (): void => {
  clearBackButton();
  const wrap = document.createElement('div');
  wrap.id = BACK_BUTTON_ID;
  Object.assign(wrap.style, {
    position: 'fixed',
    right: '12px',
    bottom: '12px',
    display: 'flex',
    gap: '8px',
    zIndex: '35',
  } satisfies Partial<CSSStyleDeclaration>);

  const controlsBtn = button(t('controls'), renderControlsModal);
  Object.assign(controlsBtn.style, {
    background: 'rgba(82,82,91,0.9)',
    border: '1px solid rgba(255,255,255,0.18)',
    boxShadow: '0 8px 22px rgba(0,0,0,0.35)',
  } satisfies Partial<CSSStyleDeclaration>);
  wrap.appendChild(controlsBtn);

  const backBtn = button(t('back'), returnToLobby);
  Object.assign(backBtn.style, {
    background: 'rgba(15,15,22,0.86)',
    border: '1px solid rgba(255,255,255,0.22)',
    boxShadow: '0 8px 22px rgba(0,0,0,0.35)',
  } satisfies Partial<CSSStyleDeclaration>);
  wrap.appendChild(backBtn);
  document.body.appendChild(wrap);
};

const rerenderCurrentShell = (): void => {
  if (mobileRuntime) {
    renderMobileSoon();
    renderLanguageControls();
    return;
  }
  renderLanguageControls();
  if (activeGame) return;
  const roomState = activeNetwork?.getRoomState();
  if (activeNetwork && roomState) {
    handleRoomState(activeNetwork, roomState);
    return;
  }
  switch (currentLobbyView) {
    case 'create-room':
      renderCreateRoomMenu();
      break;
    case 'solo':
      renderSoloCreate();
      break;
    case 'multiplayer':
      renderMultiplayerMenu();
      break;
    case 'multiplayer-create':
      renderMultiplayerCreate();
      break;
    case 'multiplayer-join':
      renderMultiplayerJoin();
      break;
    case 'ranked':
      renderRankedMenu();
      break;
    case 'settings':
      renderSettingsMenu();
      break;
    case 'home':
    default:
      renderLobby();
      break;
  }
};

const renderLanguageControls = (): void => {
  clearLanguageControls();
  const wrap = document.createElement('div');
  wrap.id = LANG_CONTROLS_ID;
  Object.assign(wrap.style, {
    position: 'fixed',
    top: '12px',
    right: '12px',
    display: 'flex',
    gap: '0',
    padding: '0',
    background: 'rgba(12,12,18,0.78)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    zIndex: '45',
    fontFamily: FONT_FAMILY.ui,
  } satisfies Partial<CSSStyleDeclaration>);

  const current = getLanguage();
  for (const language of ['en', 'ru'] as Language[]) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.title = LANG_ICON_LABEL[language];
    btn.setAttribute('aria-label', LANG_ICON_LABEL[language]);
    btn.setAttribute('aria-pressed', String(current === language));
    Object.assign(btn.style, {
      padding: '0',
      display: 'grid',
      placeItems: 'center',
      background: current === language ? 'rgba(59,130,246,0.28)' : 'transparent',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontFamily: FONT_FAMILY.ui,
      lineHeight: '1',
      width: LANG_ICON_BUTTON_SIZE,
      height: LANG_ICON_BUTTON_SIZE,
      boxSizing: 'border-box',
      overflow: 'hidden',
    } satisfies Partial<CSSStyleDeclaration>);
    const icon = document.createElement('img');
    icon.src = LANG_ICON_SRC[language];
    icon.alt = '';
    icon.draggable = false;
    Object.assign(icon.style, {
      width: '100%',
      height: '100%',
      display: 'block',
      objectFit: 'cover',
      pointerEvents: 'none',
    } satisfies Partial<CSSStyleDeclaration>);
    btn.appendChild(icon);
    btn.addEventListener('click', () => {
      if (getLanguage() !== language) setLanguage(language);
    });
    wrap.appendChild(btn);
  }

  document.body.appendChild(wrap);
};

const showRoomCode = (code: string, status: string, gameName?: string): void => {
  let badge = document.getElementById(ROOM_BADGE_ID) as HTMLDivElement | null;
  if (!badge) {
    badge = document.createElement('div');
    badge.id = ROOM_BADGE_ID;
    document.body.appendChild(badge);
  }
  badge.id = ROOM_BADGE_ID;
  badge.textContent = `${gameName || t('room')}: ${code} · ${status}`;
  Object.assign(badge.style, {
    position: 'fixed',
    top: '12px',
    left: '12px',
    padding: '6px 10px',
    background: 'rgba(0,0,0,0.55)',
    color: '#eee',
    fontFamily: FONT_FAMILY.ui,
    fontSize: FONT_SIZE.badge,
    borderRadius: '6px',
    zIndex: '10',
    userSelect: 'text',
  } satisfies Partial<CSSStyleDeclaration>);
};

const handleRoomState = (network: NetworkService, state: RoomState): void => {
  if (
    state.mode === ROOM_MODE.RANKED &&
    (state.status === ROOM_STATUS.ACTIVE || state.status === ROOM_STATUS.FINISHED)
  ) {
    refreshAuthUserSilently();
  }

  if (state.status === ROOM_STATUS.WAITING) {
    renderRoomScreen(network, state);
    return;
  }

  destroyMenuDiceScene();
  audioService.stopMusic();
  clearLobby();
  clearRoomScreen();
  showRoomCode(
    state.code,
    state.mode === ROOM_MODE.TEST ? t('test') : statusLabel(state.status),
    state.gameName,
  );
  renderBackButton();
  renderLanguageControls();
  if (!activeGame) {
    mountNetworkGame(network).catch(showError);
  }
};

const mountNetworkGame = async (network: NetworkService): Promise<void> => {
  if (activeGame) return;
  if (networkGameMounting) return networkGameMounting;

  showLoadingOverlay();
  networkGameMounting = Promise.all([
    assetPreloader.preloadGroup('gameplay'),
    audioService.preloadGroup('gameplay'),
  ])
    .then(() => {
      if (activeGame || activeNetwork !== network) return;
      activeGame = new GameEngine({ mode: 'network', network, playerSettings: getPlayerSettings() });
      app.appendChild(activeGame.renderer.domElement);
      activeGame.warmup();
      activeGame.start();
    })
    .finally(() => {
      networkGameMounting = null;
      hideLoadingOverlay();
    });
  return networkGameMounting;
};

const renderRoomScreen = (network: NetworkService, state: RoomState): void => {
  destroyMenuDiceScene();
  audioService.stopMusic();
  clearLobby();
  clearAuthControls();
  clearRoomScreen();
  renderBackButton();

  const screen = document.createElement('div');
  screen.id = 'room-screen';
  Object.assign(screen.style, {
    position: 'fixed',
    inset: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(10,10,15,0.9)',
    zIndex: '20',
    fontFamily: FONT_FAMILY.ui,
    color: '#eee',
  } satisfies Partial<CSSStyleDeclaration>);

  const panel = document.createElement('div');
  Object.assign(panel.style, {
    width: 'min(460px, calc(100vw - 32px))',
    padding: '22px',
    background: '#1c1c24',
    borderRadius: '8px',
    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  } satisfies Partial<CSSStyleDeclaration>);

  const title = document.createElement('div');
  title.textContent = `${state.gameName || t('room')} · ${state.code}`;
  Object.assign(title.style, {
    fontSize: FONT_SIZE.roomTitle,
    fontWeight: '700',
  } satisfies Partial<CSSStyleDeclaration>);
  panel.appendChild(title);

  const status = document.createElement('div');
  status.textContent =
    state.ownerId === network.getUserId() ? t('roomOwner') : t('waitingForStart');
  Object.assign(status.style, {
    color: '#b8b8c8',
    fontSize: FONT_SIZE.roomText,
    lineHeight: '1.4',
  } satisfies Partial<CSSStyleDeclaration>);
  panel.appendChild(status);

  const options = document.createElement('div');
  options.textContent = `${roomModeLabel(state.mode)} · ${roomOptionsLabel(state.options)}`;
  Object.assign(options.style, {
    padding: '8px',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '6px',
    color: '#d8d8e8',
    fontSize: FONT_SIZE.roomMeta,
  } satisfies Partial<CSSStyleDeclaration>);
  panel.appendChild(options);

  panel.appendChild(memberSection(t('players'), state, ROOM_ROLE.PLAYER, network.getUserId()));
  panel.appendChild(memberSection(t('spectators'), state, ROOM_ROLE.SPECTATOR, network.getUserId()));

  const error = document.createElement('div');
  Object.assign(error.style, {
    color: '#f66',
    fontSize: FONT_SIZE.roomMeta,
    minHeight: '18px',
  } satisfies Partial<CSSStyleDeclaration>);

  const startBtn = button(t('startGame'), () => {
    startBtn.disabled = true;
    network
      .startRoom()
      .then((next) => {
        if (next.mode === ROOM_MODE.RANKED) refreshAuthUserSilently();
        handleRoomState(network, next);
      })
      .catch((err: Error) => {
        startBtn.disabled = false;
        error.textContent = err.message;
      });
  });
  startBtn.disabled = state.ownerId !== network.getUserId();
  if (startBtn.disabled) {
    startBtn.style.opacity = '0.45';
    startBtn.style.cursor = 'default';
  }
  panel.appendChild(startBtn);
  panel.appendChild(error);

  screen.appendChild(panel);
  document.body.appendChild(screen);
};

const memberSection = (
  title: string,
  state: RoomState,
  role: (typeof ROOM_ROLE)[keyof typeof ROOM_ROLE],
  ownUserId: string | null,
): HTMLDivElement => {
  const wrap = document.createElement('div');
  const heading = document.createElement('div');
  heading.textContent = title;
  Object.assign(heading.style, {
    fontWeight: '700',
    marginBottom: '6px',
  } satisfies Partial<CSSStyleDeclaration>);
  wrap.appendChild(heading);

  const members = state.members.filter((m) => m.role === role);
  const list = document.createElement('div');
  Object.assign(list.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  } satisfies Partial<CSSStyleDeclaration>);
  if (members.length === 0) {
    const empty = document.createElement('div');
    empty.textContent = '—';
    empty.style.color = '#777';
    list.appendChild(empty);
  } else {
    for (const member of members) {
      const row = document.createElement('div');
      row.textContent = `${formatMember(member.displayName, member.userId, ownUserId)} · ${
        member.online ? t('online') : t('offline')
      }`;
      Object.assign(row.style, {
        padding: '6px 8px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '6px',
        color: member.online ? '#eee' : '#888',
      } satisfies Partial<CSSStyleDeclaration>);
      list.appendChild(row);
    }
  }
  wrap.appendChild(list);
  return wrap;
};

const formatMember = (displayName: string, userId: string, ownUserId: string | null): string => {
  const name = displayName || (userId.length <= 8 ? userId : userId.slice(0, 8));
  return userId === ownUserId ? `${name} (${t('youSuffix')})` : name;
};

const statusLabel = (status: RoomState['status']): string => {
  switch (status) {
    case ROOM_STATUS.WAITING:
      return t('waiting');
    case ROOM_STATUS.ACTIVE:
      return t('active');
    case ROOM_STATUS.PAUSED:
      return t('paused');
    case ROOM_STATUS.FINISHED:
      return t('finished');
    default:
      return t('unknown');
  }
};

const roomModeLabel = (mode: RoomMode): string => {
  switch (mode) {
    case ROOM_MODE.RANKED:
      return t('ranked');
    case ROOM_MODE.TEST:
      return t('testRoom');
    case ROOM_MODE.MATCH:
    default:
      return t('match');
  }
};

const roomOptionsLabel = (options: RoomOptionsPayload = DEFAULT_ROOM_OPTIONS): string => {
  const minBank = options.minBank > 0 ? options.minBank : t('noValue');
  return `${t('target')}: ${options.targetScore} · ${t('minBank')}: ${minBank} · ${t(
    'hotDice',
  )}: ${t('enabled')}`;
};

const applyAuthButtonSize = (btn: HTMLButtonElement): void => {
  Object.assign(btn.style, {
    flex: `0 0 ${UI_SIZE.authButtonWidth}`,
    width: UI_SIZE.authButtonWidth,
    height: UI_SIZE.authButtonHeight,
    padding: `0 ${scaledPx(8)}`,
    fontSize: FONT_SIZE.auth,
  } satisfies Partial<CSSStyleDeclaration>);
};

const applyAuthIconButtonSize = (btn: HTMLButtonElement): void => {
  Object.assign(btn.style, {
    flex: `0 0 ${UI_SIZE.authIconButtonSize}`,
    width: UI_SIZE.authIconButtonSize,
    height: UI_SIZE.authIconButtonSize,
    padding: '0',
    borderRadius: '999px',
    fontSize: FONT_SIZE.menuButton,
  } satisfies Partial<CSSStyleDeclaration>);
};

const renderAuthControls = (): void => {
  clearAuthControls();

  const wrap = document.createElement('div');
  wrap.id = AUTH_CONTROLS_ID;
  Object.assign(wrap.style, {
    position: 'fixed',
    top: '12px',
    left: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    background: 'rgba(12,12,18,0.78)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    color: '#eee',
    fontFamily: FONT_FAMILY.ui,
    fontSize: FONT_SIZE.auth,
    zIndex: '30',
  } satisfies Partial<CSSStyleDeclaration>);

  const user = getStoredUser();
  if (user) {
    const label = document.createElement('span');
    label.textContent = user.username;
    Object.assign(label.style, {
      fontFamily: FONT_FAMILY.title,
      fontSize: FONT_SIZE.playerName,
      fontWeight: '400',
      lineHeight: '1',
      letterSpacing: '0.04em',
    } satisfies Partial<CSSStyleDeclaration>);
    wrap.appendChild(label);

    const coins = document.createElement('span');
    coins.textContent = `${user.coins} ${t('coins')}`;
    Object.assign(coins.style, {
      padding: '2px 6px',
      border: '1px solid rgba(250,204,21,0.32)',
      borderRadius: '6px',
      color: '#facc15',
      lineHeight: '1',
      whiteSpace: 'nowrap',
    } satisfies Partial<CSSStyleDeclaration>);
    wrap.appendChild(coins);

    const logoutBtn = button('×', () => {
      logoutAccount()
        .then(() => {
          return loadPlayerSettings();
        })
        .then(() => {
          renderAuthControls();
          renderLobby();
        })
        .catch(showError);
    });
    logoutBtn.title = t('authLogout');
    logoutBtn.setAttribute('aria-label', t('authLogout'));
    logoutBtn.style.background = 'transparent';
    logoutBtn.style.border = 'none';
    logoutBtn.style.color = '#b8b8c8';
    applyAuthIconButtonSize(logoutBtn);
    wrap.appendChild(logoutBtn);
  } else {
    const registerBtn = button(t('authRegister'), () => renderAuthModal('register'));
    registerBtn.style.background = '#16a34a';
    applyAuthButtonSize(registerBtn);
    wrap.appendChild(registerBtn);

    const loginBtn = button(t('authLogin'), () => renderAuthModal('login'));
    loginBtn.style.background = 'transparent';
    loginBtn.style.border = '1px solid #555';
    applyAuthButtonSize(loginBtn);
    wrap.appendChild(loginBtn);
  }

  const controlsBtn = button(t('controls'), renderControlsModal);
  controlsBtn.style.background = '#52525b';
  applyAuthButtonSize(controlsBtn);
  wrap.appendChild(controlsBtn);

  document.body.appendChild(wrap);
};

const renderAuthModal = (mode: 'register' | 'login'): void => {
  clearAuthModal();

  const overlay = document.createElement('div');
  overlay.id = AUTH_MODAL_ID;
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.58)',
    zIndex: '40',
    fontFamily: FONT_FAMILY.ui,
  } satisfies Partial<CSSStyleDeclaration>);

  const panel = document.createElement('div');
  Object.assign(panel.style, {
    width: 'min(340px, calc(100vw - 32px))',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '22px',
    background: '#1c1c24',
    color: '#eee',
    borderRadius: '8px',
    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
  } satisfies Partial<CSSStyleDeclaration>);

  const title = document.createElement('h2');
  title.textContent = mode === 'register' ? t('authRegister') : t('authLogin');
  Object.assign(title.style, {
    margin: '0',
    fontFamily: FONT_FAMILY.title,
    fontSize: FONT_SIZE.title,
  } satisfies Partial<CSSStyleDeclaration>);
  panel.appendChild(title);

  const usernameInput = textInput(t('username'));
  usernameInput.maxLength = 32;
  panel.appendChild(usernameInput);

  const passwordInput = textInput(t('password'));
  passwordInput.type = 'password';
  passwordInput.maxLength = 128;
  panel.appendChild(passwordInput);

  const error = document.createElement('div');
  Object.assign(error.style, {
    minHeight: '16px',
    color: '#f66',
    fontSize: FONT_SIZE.error,
  } satisfies Partial<CSSStyleDeclaration>);
  panel.appendChild(error);

  const actions = document.createElement('div');
  Object.assign(actions.style, {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  } satisfies Partial<CSSStyleDeclaration>);

  const submitBtn = button(mode === 'register' ? t('authCreate') : t('authLogin'), () => {
    error.textContent = '';
    submitBtn.disabled = true;
    const request =
      mode === 'register'
        ? registerAccount({
            username: usernameInput.value,
            password: passwordInput.value,
            guestId: getOrCreateUserId(),
          })
        : loginAccount({
            username: usernameInput.value,
            password: passwordInput.value,
          });

    request
      .then((payload) => {
        saveDisplayName(payload.user.username);
        return loadPlayerSettings();
      })
      .then(() => {
        clearAuthModal();
        renderAuthControls();
        renderLobby();
      })
      .catch((err: Error) => {
        submitBtn.disabled = false;
        error.textContent = err.message;
      });
  });
  actions.appendChild(submitBtn);

  const cancelBtn = button(t('authCancel'), () => clearAuthModal());
  cancelBtn.style.background = 'transparent';
  cancelBtn.style.border = '1px solid #555';
  actions.appendChild(cancelBtn);
  panel.appendChild(actions);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) clearAuthModal();
  });
  panel.addEventListener('click', (event) => event.stopPropagation());

  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  usernameInput.focus();
};

const controlActionLabel = (action: ControlAction): string => {
  switch (action) {
    case 'throwDice':
      return t('throwDice');
    case 'selectAll':
      return t('selectAllAction');
    case 'continueTurn':
      return t('continueAction');
    case 'bankTurn':
      return t('bankAction');
  }
};

const renderControlsModal = (): void => {
  clearSettingsModal();

  let draft: ControlBindings = { ...getPlayerSettings().controls };
  let capturing: ControlAction | null = null;
  let saving = false;
  const rowButtons = new Map<ControlAction, HTMLButtonElement>();

  const overlay = document.createElement('div');
  overlay.id = SETTINGS_MODAL_ID;
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.58)',
    zIndex: '45',
    fontFamily: FONT_FAMILY.ui,
  } satisfies Partial<CSSStyleDeclaration>);

  const panel = document.createElement('div');
  Object.assign(panel.style, {
    width: 'min(420px, calc(100vw - 32px))',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '22px',
    background: '#1c1c24',
    color: '#eee',
    borderRadius: '8px',
    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
  } satisfies Partial<CSSStyleDeclaration>);

  const title = document.createElement('h2');
  title.textContent = t('controlsTitle');
  Object.assign(title.style, {
    margin: '0',
    fontFamily: FONT_FAMILY.title,
    fontSize: FONT_SIZE.title,
  } satisfies Partial<CSSStyleDeclaration>);
  panel.appendChild(title);

  const rows = document.createElement('div');
  Object.assign(rows.style, {
    display: 'grid',
    gap: '8px',
  } satisfies Partial<CSSStyleDeclaration>);

  for (const action of CONTROL_ACTIONS) {
    const row = button('', () => {
      capturing = action;
      renderRows();
    });
    Object.assign(row.style, {
      width: '100%',
      justifyContent: 'space-between',
      background: '#111',
      border: '1px solid #444',
    } satisfies Partial<CSSStyleDeclaration>);
    rowButtons.set(action, row);
    rows.appendChild(row);
  }
  panel.appendChild(rows);

  const error = document.createElement('div');
  Object.assign(error.style, {
    minHeight: scaledPx(16),
    color: '#f66',
    fontSize: FONT_SIZE.error,
  } satisfies Partial<CSSStyleDeclaration>);
  panel.appendChild(error);

  const actions = document.createElement('div');
  Object.assign(actions.style, {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '8px',
  } satisfies Partial<CSSStyleDeclaration>);

  const resetBtn = button(t('resetDefaults'), () => {
    draft = { ...DEFAULT_PLAYER_SETTINGS.controls };
    capturing = null;
    renderRows();
  });
  resetBtn.style.background = '#52525b';
  actions.appendChild(resetBtn);

  const cancelBtn = button(t('authCancel'), () => close());
  cancelBtn.style.background = 'transparent';
  cancelBtn.style.border = '1px solid #555';
  actions.appendChild(cancelBtn);

  const saveBtn = button(t('save'), () => {
    const settings: PlayerSettings = { version: 1, controls: { ...draft } };
    const validation = validatePlayerSettings(settings);
    if (!validation.valid || saving) return;
    saving = true;
    saveBtn.disabled = true;
    savePlayerSettings(settings)
      .then(() => close())
      .catch((err: Error) => {
        saving = false;
        error.textContent = err.message;
        renderRows();
      });
  });
  actions.appendChild(saveBtn);
  panel.appendChild(actions);

  const keyListener = (event: KeyboardEvent): void => {
    if (!capturing) return;
    event.preventDefault();
    event.stopPropagation();
    if (!isAcceptedControlCode(event.code)) {
      error.textContent = t('invalidControlKey');
      return;
    }
    draft = { ...draft, [capturing]: event.code };
    capturing = null;
    renderRows();
  };

  function close(): void {
    window.removeEventListener('keydown', keyListener, true);
    clearSettingsModal();
  }

  function renderRows(): void {
    for (const action of CONTROL_ACTIONS) {
      const row = rowButtons.get(action);
      if (!row) continue;
      row.textContent =
        capturing === action
          ? `${controlActionLabel(action)}: ${t('pressKey')}`
          : `${controlActionLabel(action)}: ${controlCodeLabel(draft[action])}`;
    }

    const settings: PlayerSettings = { version: 1, controls: { ...draft } };
    const validation = validatePlayerSettings(settings);
    error.textContent = validation.valid ? '' : t('duplicateControls');
    saveBtn.disabled = !validation.valid || saving;
    saveBtn.style.opacity = saveBtn.disabled ? '0.4' : '1';
    saveBtn.style.cursor = saveBtn.disabled ? 'not-allowed' : 'pointer';
  }

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
  panel.addEventListener('click', (event) => event.stopPropagation());
  window.addEventListener('keydown', keyListener, true);

  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  renderRows();
};

const createLobbyFrame = (widthPx = 340): HTMLDivElement => {
  clearLobby();
  clearBackButton();
  clearRoomBadge();
  const lobby = document.createElement('div');
  lobby.id = 'lobby';
  Object.assign(lobby.style, {
    position: 'fixed',
    inset: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaledPx(22),
    background: 'rgba(10,10,15,0.62)',
    zIndex: '20',
  } satisfies Partial<CSSStyleDeclaration>);

  const card = document.createElement('div');
  Object.assign(card.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: scaledPx(12),
    padding: scaledPx(24),
    width: scaledPx(widthPx),
    maxWidth: 'calc(100vw - 32px)',
    boxSizing: 'border-box',
    background: '#1c1c24',
    borderRadius: '8px',
    color: '#eee',
    fontFamily: FONT_FAMILY.ui,
    fontSize: FONT_SIZE.card,
    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
  } satisfies Partial<CSSStyleDeclaration>);

  lobby.appendChild(card);
  document.body.appendChild(lobby);
  return card;
};

const appendBrand = (card: HTMLElement): void => {
  const brand = document.createElement('div');
  brand.textContent = 'FARKLEPIT';
  Object.assign(brand.style, {
    color: '#f4f4f5',
    fontFamily: FONT_FAMILY.title,
    fontSize: FONT_SIZE.logo,
    fontWeight: '800',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    textAlign: 'center',
  } satisfies Partial<CSSStyleDeclaration>);
  card.parentElement?.insertBefore(brand, card);
};

const appendTitle = (card: HTMLElement, text: string): void => {
  const title = document.createElement('h2');
  title.textContent = text;
  Object.assign(title.style, {
    margin: '0',
    fontFamily: FONT_FAMILY.title,
    fontSize: FONT_SIZE.title,
    lineHeight: '1.2',
  } satisfies Partial<CSSStyleDeclaration>);
  card.appendChild(title);
};

const appendLobbyError = (card: HTMLElement): HTMLDivElement => {
  const error = document.createElement('div');
  error.id = 'lobby-error';
  Object.assign(error.style, {
    color: '#f66',
    fontSize: FONT_SIZE.error,
    minHeight: scaledPx(16),
  } satisfies Partial<CSSStyleDeclaration>);
  card.appendChild(error);
  return error;
};

const renderLeaderboard = (): void => {
  const lobby = document.getElementById('lobby');
  if (!lobby) return;
  const panel = document.createElement('aside');
  panel.id = LEADERBOARD_ID;
  Object.assign(panel.style, {
    position: 'fixed',
    top: '50%',
    right: 'calc(50% + 220px)',
    transform: 'translateY(-50%)',
    width: '260px',
    maxWidth: 'calc(50vw - 240px)',
    padding: scaledPx(14),
    boxSizing: 'border-box',
    background: 'rgba(28,28,36,0.92)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    color: '#eee',
    fontFamily: FONT_FAMILY.ui,
    fontSize: FONT_SIZE.card,
    boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
    lineHeight: '1.35',
  } satisfies Partial<CSSStyleDeclaration>);

  const title = document.createElement('div');
  title.textContent = t('leaderboard');
  Object.assign(title.style, {
    marginBottom: scaledPx(10),
    fontWeight: '700',
  } satisfies Partial<CSSStyleDeclaration>);
  panel.appendChild(title);

  const body = document.createElement('div');
  body.textContent = t('connecting');
  Object.assign(body.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: scaledPx(6),
  } satisfies Partial<CSSStyleDeclaration>);
  panel.appendChild(body);
  lobby.appendChild(panel);

  getLeaderboard(10)
    .then((leaders) => {
      if (!document.getElementById(LEADERBOARD_ID)) return;
      body.replaceChildren();
      if (leaders.length === 0) {
        body.textContent = '—';
        return;
      }
      for (const [index, row] of leaders.entries()) {
        const line = document.createElement('div');
        line.textContent = `${index + 1}. ${row.displayName || row.username}: ${row.rating} · ${
          row.wins
        }/${row.losses}`;
        Object.assign(line.style, {
          padding: '4px 0',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          color: index === 0 ? '#facc15' : '#eee',
        } satisfies Partial<CSSStyleDeclaration>);
        body.appendChild(line);
      }
    })
    .catch(() => {
      if (document.getElementById(LEADERBOARD_ID)) body.textContent = '—';
    });
};

const renderRoomListModal = (displayNameInput: string): void => {
  clearRoomListModal();

  const overlay = document.createElement('div');
  overlay.id = ROOM_LIST_MODAL_ID;
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.62)',
    zIndex: '42',
    fontFamily: FONT_FAMILY.ui,
    color: '#eee',
  } satisfies Partial<CSSStyleDeclaration>);

  const panel = document.createElement('div');
  Object.assign(panel.style, {
    width: 'min(760px, calc(100vw - 32px))',
    maxHeight: 'min(680px, calc(100vh - 32px))',
    overflow: 'auto',
    padding: scaledPx(18),
    background: '#1c1c24',
    borderRadius: '8px',
    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    gap: scaledPx(12),
  } satisfies Partial<CSSStyleDeclaration>);

  const header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: scaledPx(12),
  } satisfies Partial<CSSStyleDeclaration>);
  const title = document.createElement('h2');
  title.textContent = t('lobbies');
  Object.assign(title.style, {
    margin: '0',
    fontFamily: FONT_FAMILY.title,
    fontSize: FONT_SIZE.title,
  } satisfies Partial<CSSStyleDeclaration>);
  header.appendChild(title);

  const closeBtn = button(t('close'), () => {
    tempNetwork?.disconnect();
    clearRoomListModal();
  });
  closeBtn.style.background = 'transparent';
  closeBtn.style.border = '1px solid #555';
  header.appendChild(closeBtn);
  panel.appendChild(header);

  const content = document.createElement('div');
  content.textContent = t('connecting');
  panel.appendChild(content);

  overlay.appendChild(panel);
  overlay.addEventListener('click', (event) => {
    if (event.target !== overlay) return;
    tempNetwork?.disconnect();
    clearRoomListModal();
  });
  panel.addEventListener('click', (event) => event.stopPropagation());
  document.body.appendChild(overlay);

  let tempNetwork: NetworkService | null = null;
  const renderRows = (network: NetworkService, rooms: RoomListItem[]): void => {
    content.replaceChildren();
    if (rooms.length === 0) {
      content.textContent = t('noRooms');
      return;
    }

    const table = document.createElement('table');
    Object.assign(table.style, {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: FONT_SIZE.card,
    } satisfies Partial<CSSStyleDeclaration>);

    const head = document.createElement('tr');
    for (const label of [
      t('gameName'),
      t('mode'),
      t('status'),
      t('players'),
      t('owner'),
      t('action'),
    ]) {
      const th = document.createElement('th');
      th.textContent = label;
      Object.assign(th.style, {
        textAlign: 'left',
        padding: '8px',
        borderBottom: '1px solid #444',
        color: '#b8b8c8',
      } satisfies Partial<CSSStyleDeclaration>);
      head.appendChild(th);
    }
    table.appendChild(head);

    for (const room of rooms) {
      const tr = document.createElement('tr');
      const cells = [
        room.gameName,
        roomModeLabel(room.mode),
        statusLabel(room.status),
        `${room.playerCount} / ${room.spectatorCount}`,
        room.ownerDisplayName,
      ];
      for (const value of cells) {
        const td = document.createElement('td');
        td.textContent = value;
        Object.assign(td.style, {
          padding: '8px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          verticalAlign: 'middle',
        } satisfies Partial<CSSStyleDeclaration>);
        tr.appendChild(td);
      }

      const actionCell = document.createElement('td');
      Object.assign(actionCell.style, {
        padding: '8px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      } satisfies Partial<CSSStyleDeclaration>);
      const joinBtn = button(room.canJoinAsPlayer ? t('join') : t('spectate'), () => {
        if (room.mode === ROOM_MODE.RANKED && room.canJoinAsPlayer) {
          const accessError = rankedAccessError();
          if (accessError) {
            content.appendChild(errorLine(accessError.message));
            return;
          }
        }
        joinBtn.disabled = true;
        network
          .joinRoom(room.code)
          .then((state) => {
            activeNetwork = network;
            tempNetwork = null;
            clearRoomListModal();
            clearLobby();
            clearAuthControls();
            clearAuthModal();
            handleRoomState(network, state);
          })
          .catch((error: Error) => {
            joinBtn.disabled = false;
            content.appendChild(errorLine(error.message));
          });
      });
      actionCell.appendChild(joinBtn);
      tr.appendChild(actionCell);
      table.appendChild(tr);
    }
    content.appendChild(table);
  };

  connectNetwork(displayNameInput)
    .then((network) => {
      if (!document.getElementById(ROOM_LIST_MODAL_ID)) {
        network.disconnect();
        return Promise.resolve();
      }
      tempNetwork = network;
      return network.listRooms().then((rooms) => {
        if (!document.getElementById(ROOM_LIST_MODAL_ID)) {
          network.disconnect();
          return;
        }
        renderRows(network, rooms);
      });
    })
    .catch((error: Error) => {
      content.replaceChildren(errorLine(error.message));
    });
};

const errorLine = (message: string): HTMLDivElement => {
  const error = document.createElement('div');
  error.textContent = message;
  Object.assign(error.style, {
    color: '#f66',
    fontSize: FONT_SIZE.error,
    minHeight: scaledPx(16),
  } satisfies Partial<CSSStyleDeclaration>);
  return error;
};

const applyLargeMenuButtonStyle = (btn: HTMLButtonElement): void => {
  Object.assign(btn.style, {
    fontSize: FONT_SIZE.menuButton,
    padding: scaledPx(12),
    height: UI_SIZE.menuButtonHeight,
    width: '100%',
  } satisfies Partial<CSSStyleDeclaration>);
};

const appendMenuButton = (
  card: HTMLElement,
  label: string,
  onClick: () => void,
  accent = '#3b82f6',
): HTMLButtonElement => {
  const btn = button(label, onClick);
  applyLargeMenuButtonStyle(btn);
  btn.style.background = accent;
  card.appendChild(btn);
  return btn;
};

const appendDisabledMenuButton = (card: HTMLElement, label: string): HTMLButtonElement => {
  const btn = button(`${label} · ${t('comingSoon')}`, () => undefined);
  applyLargeMenuButtonStyle(btn);
  btn.disabled = true;
  Object.assign(btn.style, {
    background: '#2b2b33',
    color: '#8e8e9d',
    cursor: 'not-allowed',
    border: '1px solid rgba(255,255,255,0.08)',
  } satisfies Partial<CSSStyleDeclaration>);
  card.appendChild(btn);
  return btn;
};

const appendSectionTitle = (card: HTMLElement, text: string): HTMLDivElement => {
  const title = document.createElement('div');
  title.textContent = text;
  Object.assign(title.style, {
    marginTop: scaledPx(4),
    color: '#b8b8c8',
    fontSize: FONT_SIZE.label,
    fontWeight: '700',
  } satisfies Partial<CSSStyleDeclaration>);
  card.appendChild(title);
  return title;
};

const appendBackTo = (card: HTMLElement, onClick: () => void): void => {
  const backBtn = button(t('back'), onClick);
  backBtn.style.background = 'transparent';
  backBtn.style.border = '1px solid #555';
  card.appendChild(backBtn);
};

const appendDisplayNameInput = (card: HTMLElement): (() => string) => {
  const user = getStoredUser();
  let nameInput: HTMLInputElement | null = null;
  if (!user) {
    nameInput = textInput(t('displayName'));
    nameInput.maxLength = 32;
    nameInput.value = getSavedDisplayName();
    card.appendChild(nameInput);
  }
  return () => user?.username ?? nameInput?.value ?? '';
};

const readSteppedNumber = (
  input: HTMLInputElement,
  fallback: number,
  min: number,
  max: number,
  step: number,
): number => {
  const raw = Number(input.value);
  if (!Number.isFinite(raw)) {
    input.value = String(fallback);
    return fallback;
  }
  const stepped = Math.round((raw - min) / step) * step + min;
  const clamped = Math.max(min, Math.min(max, stepped));
  input.value = String(clamped);
  return clamped;
};

const createRoomOptionsControls = (
  card: HTMLElement,
): {
  targetInput: HTMLInputElement;
  minBankInput: HTMLInputElement;
  roomOptionsValue: () => RoomOptionsPayload;
} => {
  const targetInput = numberInput(
    DEFAULT_ROOM_OPTIONS.targetScore,
    ROOM_TARGET_SCORE_MIN,
    ROOM_TARGET_SCORE_MAX,
    ROOM_TARGET_SCORE_STEP,
  );
  card.appendChild(labeledControl(t('targetScore'), targetInput));

  const minBankInput = numberInput(
    DEFAULT_ROOM_OPTIONS.minBank,
    ROOM_MIN_BANK_MIN,
    ROOM_MIN_BANK_MAX,
    ROOM_MIN_BANK_STEP,
  );
  card.appendChild(labeledControl(t('bankRule'), minBankInput));

  return {
    targetInput,
    minBankInput,
    roomOptionsValue: () => ({
      ...DEFAULT_ROOM_OPTIONS,
      targetScore: readSteppedNumber(
        targetInput,
        DEFAULT_ROOM_OPTIONS.targetScore,
        ROOM_TARGET_SCORE_MIN,
        ROOM_TARGET_SCORE_MAX,
        ROOM_TARGET_SCORE_STEP,
      ),
      minBank: readSteppedNumber(
        minBankInput,
        DEFAULT_ROOM_OPTIONS.minBank,
        ROOM_MIN_BANK_MIN,
        ROOM_MIN_BANK_MAX,
        ROOM_MIN_BANK_STEP,
      ),
    }),
  };
};

const renderLobby = (): void => {
  currentLobbyView = 'home';
  renderAuthControls();
  renderLanguageControls();
  const card = createLobbyFrame(380);
  appendBrand(card);
  ensureMenuDiceScene();

  appendMenuButton(card, t('createRoomMenu'), renderCreateRoomMenu);
  appendMenuButton(card, t('rankedGame'), renderRankedMenu, '#0f766e');
  appendMenuButton(card, t('settings'), renderSettingsMenu, '#52525b');
  appendDisabledMenuButton(card, t('shop'));
  appendDisabledMenuButton(card, t('shopPromo'));
};

const renderCreateRoomMenu = (): void => {
  currentLobbyView = 'create-room';
  destroyMenuDiceScene();
  audioService.stopMusic();
  renderAuthControls();
  renderLanguageControls();
  const card = createLobbyFrame(420);
  appendTitle(card, t('createRoomMenu'));
  appendSectionTitle(card, t('modeSelection'));

  appendDisabledMenuButton(card, t('tutorial'));
  appendMenuButton(card, t('soloGame'), renderSoloCreate);
  appendMenuButton(card, t('multiplayer'), renderMultiplayerMenu, '#0f766e');
  appendBackTo(card, renderLobby);
};

const renderSoloCreate = (): void => {
  currentLobbyView = 'solo';
  destroyMenuDiceScene();
  audioService.stopMusic();
  renderAuthControls();
  renderLanguageControls();
  const card = createLobbyFrame(440);
  appendTitle(card, t('soloGame'));

  const soloSelect = selectInput(
    SOLO_MODE_CONFIGS.map((mode) => [mode.id, soloModeTitle(mode.id, mode.title)]),
  );
  soloSelect.value = DEFAULT_SOLO_MODE.id;
  card.appendChild(labeledControl(t('mode'), soloSelect));

  const { targetInput, minBankInput } = createRoomOptionsControls(card);
  const syncSoloDefaults = (): void => {
    const selected = getSoloModeConfig(soloSelect.value);
    targetInput.value = String(selected.targetScore ?? DEFAULT_ROOM_OPTIONS.targetScore);
  };
  soloSelect.addEventListener('change', syncSoloDefaults);
  syncSoloDefaults();

  appendDisabledMenuButton(card, `${t('mode')}: Bot ${t('normalMode')}`);

  const startBtn = button(t('createGame'), () => {
    const selected = getSoloModeConfig(soloSelect.value);
    const soloConfig: SoloModeConfig = {
      ...selected,
      targetScore: readSteppedNumber(
        targetInput,
        selected.targetScore ?? DEFAULT_ROOM_OPTIONS.targetScore,
        ROOM_TARGET_SCORE_MIN,
        ROOM_TARGET_SCORE_MAX,
        ROOM_TARGET_SCORE_STEP,
      ),
      minBank: readSteppedNumber(
        minBankInput,
        DEFAULT_ROOM_OPTIONS.minBank,
        ROOM_MIN_BANK_MIN,
        ROOM_MIN_BANK_MAX,
        ROOM_MIN_BANK_STEP,
      ),
    };
    startLocal(soloConfig).catch(showError);
  });
  card.appendChild(startBtn);

  appendBackTo(card, renderCreateRoomMenu);
  appendLobbyError(card);
};

const renderMultiplayerMenu = (): void => {
  currentLobbyView = 'multiplayer';
  destroyMenuDiceScene();
  audioService.stopMusic();
  renderAuthControls();
  renderLanguageControls();
  const card = createLobbyFrame(420);
  appendTitle(card, t('multiplayer'));

  appendSectionTitle(card, t('quickGame'));
  appendDisabledMenuButton(card, t('normalMode'));
  appendDisabledMenuButton(card, t('hardcoreMode'));
  appendSectionTitle(card, t('room'));
  appendMenuButton(card, t('createRoomAction'), renderMultiplayerCreate);
  appendMenuButton(card, t('joinRoom'), renderMultiplayerJoin, '#0f766e');
  appendBackTo(card, renderCreateRoomMenu);
};

const renderMultiplayerCreate = (): void => {
  currentLobbyView = 'multiplayer-create';
  destroyMenuDiceScene();
  audioService.stopMusic();
  renderAuthControls();
  renderLanguageControls();
  const card = createLobbyFrame(460);
  appendTitle(card, t('createRoomAction'));

  const displayNameValue = appendDisplayNameInput(card);
  const gameNameInput = textInput(t('gameName'));
  gameNameInput.maxLength = 40;
  const baseName = displayNameValue().trim() || 'Player';
  gameNameInput.value = `${baseName} game`;
  card.appendChild(gameNameInput);

  const { roomOptionsValue } = createRoomOptionsControls(card);

  const generatedCodeInput = textInput(t('roomCode'));
  generatedCodeInput.value = t('generatedAfterCreate');
  generatedCodeInput.disabled = true;
  generatedCodeInput.style.color = '#8e8e9d';
  card.appendChild(labeledControl(t('roomCode'), generatedCodeInput));

  const createBtn = button(t('createGame'), () => {
    const gameName = gameNameInput.value.trim();
    if (!gameName) {
      showError(new Error(t('gameNameRequired')));
      return;
    }
    startNetwork(
      'create',
      displayNameValue(),
      undefined,
      ROOM_MODE.MATCH,
      roomOptionsValue(),
      gameName,
    ).catch(showError);
  });
  card.appendChild(createBtn);

  appendBackTo(card, renderMultiplayerMenu);
  appendLobbyError(card);
};

const renderMultiplayerJoin = (): void => {
  currentLobbyView = 'multiplayer-join';
  destroyMenuDiceScene();
  audioService.stopMusic();
  renderAuthControls();
  renderLanguageControls();
  const card = createLobbyFrame(420);
  appendTitle(card, t('joinRoom'));

  const displayNameValue = appendDisplayNameInput(card);
  const codeInput = roomCodeInput();
  card.appendChild(labeledControl(t('roomCode'), codeInput));

  const joinBtn = button(t('joinByCode'), () => {
    const code = codeInput.value.trim().toUpperCase();
    if (!code) return;
    startNetwork('join', displayNameValue(), code).catch(showError);
  });
  card.appendChild(joinBtn);

  const listBtn = button(t('browseLobbies'), () => {
    renderRoomListModal(displayNameValue());
  });
  listBtn.style.background = '#52525b';
  card.appendChild(listBtn);

  appendBackTo(card, renderMultiplayerMenu);
  appendLobbyError(card);
};

const renderRankedMenu = (): void => {
  currentLobbyView = 'ranked';
  destroyMenuDiceScene();
  audioService.stopMusic();
  renderAuthControls();
  renderLanguageControls();
  const card = createLobbyFrame(380);
  appendTitle(card, t('rankedGame'));
  renderLeaderboard();

  const startBtn = button(t('startGame'), () => {
    const accessError = rankedAccessError();
    if (accessError) {
      showError(accessError);
      return;
    }
    const user = getStoredUser();
    startNetwork(
      'create',
      user?.username ?? '',
      undefined,
      ROOM_MODE.RANKED,
      DEFAULT_ROOM_OPTIONS,
      `${user?.username ?? 'Player'} ranked`,
    ).catch(showError);
  });
  card.appendChild(startBtn);

  const leaderboardBtn = button(t('leaderboard'), () => {
    document.getElementById(LEADERBOARD_ID)?.remove();
    renderLeaderboard();
  });
  leaderboardBtn.style.background = '#52525b';
  card.appendChild(leaderboardBtn);

  appendBackTo(card, renderLobby);
  appendLobbyError(card);
};

const renderSettingsMenu = (): void => {
  currentLobbyView = 'settings';
  destroyMenuDiceScene();
  audioService.stopMusic();
  renderAuthControls();
  renderLanguageControls();
  const card = createLobbyFrame(440);
  appendTitle(card, t('settings'));

  appendSectionTitle(card, t('playerSettings'));
  appendDisabledMenuButton(card, `${t('playerName')} / ${t('titleLabel')}`);
  appendDisabledMenuButton(card, t('rating'));
  appendDisabledMenuButton(card, t('avatar'));
  appendDisabledMenuButton(card, t('avatarFrame'));
  appendDisabledMenuButton(card, t('diceCosmetics'));
  appendDisabledMenuButton(card, t('handCup'));

  appendSectionTitle(card, t('soundSettings'));
  appendDisabledMenuButton(card, t('generalVolume'));
  appendDisabledMenuButton(card, t('music'));
  appendDisabledMenuButton(card, t('sounds'));

  appendMenuButton(card, t('controls'), renderControlsModal, '#52525b');
  appendDisabledMenuButton(card, `${t('autoResetDice')} (${t('yesNo')})`);
  appendBackTo(card, renderLobby);
};

const textInput = (placeholder: string): HTMLInputElement => {
  const input = document.createElement('input');
  input.placeholder = placeholder;
  Object.assign(input.style, {
    padding: scaledPx(8),
    fontSize: FONT_SIZE.control,
    height: UI_SIZE.controlHeight,
    boxSizing: 'border-box',
    border: '1px solid #444',
    background: '#111',
    color: '#eee',
    borderRadius: '6px',
    fontFamily: FONT_FAMILY.ui,
  } satisfies Partial<CSSStyleDeclaration>);
  return input;
};

const numberInput = (value: number, min: number, max: number, step: number): HTMLInputElement => {
  const input = textInput('');
  input.type = 'number';
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  input.inputMode = 'numeric';
  return input;
};

const roomCodeInput = (): HTMLInputElement => {
  const input = textInput(t('roomCode'));
  input.maxLength = 16;
  input.autocapitalize = 'characters';
  input.style.textTransform = 'uppercase';
  return input;
};

const selectInput = (options: [string, string][]): HTMLSelectElement => {
  const select = document.createElement('select');
  for (const [value, label] of options) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    select.appendChild(opt);
  }
  Object.assign(select.style, {
    padding: scaledPx(8),
    fontSize: FONT_SIZE.control,
    height: UI_SIZE.controlHeight,
    boxSizing: 'border-box',
    border: '1px solid #444',
    background: '#111',
    color: '#eee',
    borderRadius: '6px',
    fontFamily: FONT_FAMILY.ui,
  } satisfies Partial<CSSStyleDeclaration>);
  return select;
};

const labeledControl = (label: string, control: HTMLElement): HTMLLabelElement => {
  const wrap = document.createElement('label');
  Object.assign(wrap.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: scaledPx(6),
    color: '#b8b8c8',
    fontSize: FONT_SIZE.label,
  } satisfies Partial<CSSStyleDeclaration>);
  const text = document.createElement('span');
  text.textContent = label;
  wrap.appendChild(text);
  wrap.appendChild(control);
  return wrap;
};

const button = (label: string, onClick: () => void): HTMLButtonElement => {
  const btn = document.createElement('button');
  btn.textContent = label;
  Object.assign(btn.style, {
    padding: `${scaledPx(8)} ${scaledPx(12)}`,
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: FONT_SIZE.control,
    fontFamily: FONT_FAMILY.ui,
    height: UI_SIZE.controlHeight,
    boxSizing: 'border-box',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: '1',
    whiteSpace: 'nowrap',
  } satisfies Partial<CSSStyleDeclaration>);
  bindMouseOnlyClick(btn, onClick);
  return btn;
};

const showError = (err: unknown): void => {
  const el = document.getElementById('lobby-error');
  if (el) el.textContent = err instanceof Error ? err.message : String(err);
};

onLanguageChange(rerenderCurrentShell);
loadPlayerSettings()
  .catch((err: Error) => {
    console.warn(`settings load failed: ${err.message}`);
  })
  .then(() => refreshCurrentUser().catch(() => null))
  .finally(() => {
    renderLanguageControls();
    if (!mobileRuntime) renderLobby();
  });
