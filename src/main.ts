import './style.css';
import {
  getAuthIdentity,
  getStoredUser,
  loginAccount,
  logoutAccount,
  registerAccount,
} from './auth';
import { GameEngine } from './engine/classes/_game-engine/game-engine.class';
import {
  NetworkService,
  DEFAULT_ROOM_OPTIONS,
  ROOM_MODE,
  ROOM_ROLE,
  ROOM_STATUS,
  type RoomMode,
  type RoomOptionsPayload,
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
import { FONT_FAMILY, FONT_SIZE, UI_SIZE, scaledPx } from './ui/theme';

const USER_ID_KEY = 'dice.userId';
const DISPLAY_NAME_KEY = 'dice.displayName';
const AUTH_CONTROLS_ID = 'auth-controls';
const AUTH_MODAL_ID = 'auth-modal';
const BACK_BUTTON_ID = 'back-button';
const ROOM_BADGE_ID = 'room-badge';
const LANG_CONTROLS_ID = 'lang-controls';
const MOBILE_DEVICE_RE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

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
let currentLobbyView: 'home' | 'solo' | 'multiplayer' = 'home';

const startLocal = (soloConfig: SoloModeConfig = DEFAULT_SOLO_MODE): void => {
  clearLobby();
  clearRoomScreen();
  clearAuthControls();
  clearAuthModal();
  clearRoomBadge();
  const game = new GameEngine({ mode: 'local', soloConfig });
  app.appendChild(game.renderer.domElement);
  game.start();
  activeGame = game;
  renderBackButton();
};

const startNetwork = async (
  mode: 'create' | 'join',
  displayNameInput: string,
  code?: string,
  roomMode: RoomMode = ROOM_MODE.MATCH,
  roomOptions?: Partial<RoomOptionsPayload>,
): Promise<void> => {
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
  activeNetwork = network;
  let state: RoomState;
  try {
    state =
      mode === 'create'
        ? await network.createRoom(roomMode, roomOptions)
        : await network.joinRoom(code!);
  } catch (err) {
    if (activeNetwork === network) activeNetwork = null;
    network.disconnect();
    throw err;
  }
  clearLobby();
  clearAuthControls();
  clearAuthModal();
  handleRoomState(network, state);
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
  renderLobby();
};

const renderBackButton = (): void => {
  clearBackButton();
  const backBtn = button(t('back'), returnToLobby);
  backBtn.id = BACK_BUTTON_ID;
  Object.assign(backBtn.style, {
    position: 'fixed',
    right: '12px',
    bottom: '12px',
    zIndex: '35',
    background: 'rgba(15,15,22,0.86)',
    border: '1px solid rgba(255,255,255,0.22)',
    boxShadow: '0 8px 22px rgba(0,0,0,0.35)',
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(backBtn);
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
    case 'solo':
      renderSoloCreate();
      break;
    case 'multiplayer':
      renderMultiplayerCreate();
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
    gap: '6px',
    padding: '6px',
    background: 'rgba(12,12,18,0.78)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    zIndex: '45',
    fontFamily: FONT_FAMILY.ui,
  } satisfies Partial<CSSStyleDeclaration>);

  const current = getLanguage();
  for (const language of ['en', 'ru'] as Language[]) {
    const btn = document.createElement('button');
    btn.textContent = language.toUpperCase();
    Object.assign(btn.style, {
      padding: '4px 8px',
      background: current === language ? '#3b82f6' : 'transparent',
      color: '#fff',
      border: current === language ? '1px solid #3b82f6' : '1px solid #555',
      borderRadius: '5px',
      cursor: 'pointer',
      fontFamily: FONT_FAMILY.ui,
      fontSize: FONT_SIZE.lang,
      lineHeight: '1',
      width: UI_SIZE.langButtonWidth,
      height: UI_SIZE.langButtonHeight,
      boxSizing: 'border-box',
    } satisfies Partial<CSSStyleDeclaration>);
    btn.addEventListener('click', () => {
      if (getLanguage() !== language) setLanguage(language);
    });
    wrap.appendChild(btn);
  }

  document.body.appendChild(wrap);
};

const showRoomCode = (code: string, status: string): void => {
  let badge = document.getElementById(ROOM_BADGE_ID) as HTMLDivElement | null;
  if (!badge) {
    badge = document.createElement('div');
    badge.id = ROOM_BADGE_ID;
    document.body.appendChild(badge);
  }
  badge.id = ROOM_BADGE_ID;
  badge.textContent = `${t('room')}: ${code} · ${status}`;
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
  if (state.status === ROOM_STATUS.WAITING) {
    renderRoomScreen(network, state);
    return;
  }

  clearLobby();
  clearRoomScreen();
  showRoomCode(state.code, state.mode === ROOM_MODE.TEST ? t('test') : statusLabel(state.status));
  renderBackButton();
  renderLanguageControls();
  if (!activeGame) {
    activeGame = new GameEngine({ mode: 'network', network });
    app.appendChild(activeGame.renderer.domElement);
    activeGame.start();
  }
};

const renderRoomScreen = (network: NetworkService, state: RoomState): void => {
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
  title.textContent = `${t('room')} ${state.code}`;
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
  options.textContent = roomOptionsLabel(state.options);
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
      .then((next) => handleRoomState(network, next))
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

    const logoutBtn = button('×', () => {
      logoutAccount()
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
    background: 'rgba(10,10,15,0.85)',
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

const renderLobby = (): void => {
  currentLobbyView = 'home';
  renderAuthControls();
  renderLanguageControls();
  const card = createLobbyFrame(360);
  appendBrand(card);

  const soloBtn = button(t('soloGame'), renderSoloCreate);
  soloBtn.style.fontSize = FONT_SIZE.menuButton;
  soloBtn.style.padding = scaledPx(12);
  soloBtn.style.height = UI_SIZE.menuButtonHeight;
  card.appendChild(soloBtn);

  const multiplayerBtn = button(t('multiplayer'), renderMultiplayerCreate);
  multiplayerBtn.style.fontSize = FONT_SIZE.menuButton;
  multiplayerBtn.style.padding = scaledPx(12);
  multiplayerBtn.style.height = UI_SIZE.menuButtonHeight;
  multiplayerBtn.style.background = '#0f766e';
  card.appendChild(multiplayerBtn);
};

const renderSoloCreate = (): void => {
  currentLobbyView = 'solo';
  renderAuthControls();
  renderLanguageControls();
  const card = createLobbyFrame(420);
  appendTitle(card, t('soloGame'));

  const soloSelect = selectInput(
    SOLO_MODE_CONFIGS.map((mode) => [mode.id, soloModeTitle(mode.id, mode.title)]),
  );
  soloSelect.value = DEFAULT_SOLO_MODE.id;
  card.appendChild(labeledControl(t('mode'), soloSelect));

  const startBtn = button(t('createGame'), () => {
    startLocal(getSoloModeConfig(soloSelect.value));
  });
  card.appendChild(startBtn);

  const backBtn = button(t('back'), renderLobby);
  backBtn.style.background = 'transparent';
  backBtn.style.border = '1px solid #555';
  card.appendChild(backBtn);
};

const renderMultiplayerCreate = (): void => {
  currentLobbyView = 'multiplayer';
  renderAuthControls();
  renderLanguageControls();
  const card = createLobbyFrame(460);
  appendTitle(card, t('multiplayer'));

  const user = getStoredUser();
  let nameInput: HTMLInputElement | null = null;
  if (!user) {
    nameInput = textInput(t('displayName'));
    nameInput.maxLength = 32;
    nameInput.value = getSavedDisplayName();
    card.appendChild(nameInput);
  }

  const displayNameValue = (): string => user?.username ?? nameInput?.value ?? '';

  const roomModeSelect = selectInput([
    ['match', t('match')],
    ['test', t('testRoom')],
  ]);
  card.appendChild(labeledControl(t('mode'), roomModeSelect));

  const targetSelect = selectInput([
    ['3000', 'Quick 3000'],
    ['4000', 'Classic 4000'],
    ['5000', 'Long 5000'],
    ['10000', 'Marathon 10000'],
  ]);
  targetSelect.value = String(DEFAULT_ROOM_OPTIONS.targetScore);
  card.appendChild(labeledControl(t('targetScore'), targetSelect));

  const minBankSelect = selectInput([
    ['0', `${t('minBank')}: ${t('noValue')}`],
    ['300', `${t('minBank')}: 300`],
    ['500', `${t('minBank')}: 500`],
  ]);
  minBankSelect.value = String(DEFAULT_ROOM_OPTIONS.minBank);
  card.appendChild(labeledControl(t('bankRule'), minBankSelect));

  const roomOptionsValue = (): RoomOptionsPayload => ({
    ...DEFAULT_ROOM_OPTIONS,
    targetScore: Number(targetSelect.value) as RoomOptionsPayload['targetScore'],
    minBank: Number(minBankSelect.value) as RoomOptionsPayload['minBank'],
  });

  const roomModeValue = (): RoomMode =>
    roomModeSelect.value === 'test' ? ROOM_MODE.TEST : ROOM_MODE.MATCH;

  const createBtn = button(t('createGame'), () => {
    startNetwork('create', displayNameValue(), undefined, roomModeValue(), roomOptionsValue()).catch(
      showError,
    );
  });
  card.appendChild(createBtn);

  const codeInput = document.createElement('input');
  codeInput.placeholder = t('roomCode');
  codeInput.maxLength = 16;
  codeInput.autocapitalize = 'characters';
  Object.assign(codeInput.style, {
    padding: scaledPx(8),
    fontSize: FONT_SIZE.control,
    height: UI_SIZE.controlHeight,
    boxSizing: 'border-box',
    border: '1px solid #444',
    background: '#111',
    color: '#eee',
    borderRadius: '6px',
    textTransform: 'uppercase',
    fontFamily: FONT_FAMILY.ui,
  } satisfies Partial<CSSStyleDeclaration>);
  card.appendChild(codeInput);

  const joinBtn = button(t('joinByCode'), () => {
    const code = codeInput.value.trim().toUpperCase();
    if (!code) return;
    startNetwork('join', displayNameValue(), code).catch(showError);
  });
  card.appendChild(joinBtn);

  const backBtn = button(t('back'), renderLobby);
  backBtn.style.background = 'transparent';
  backBtn.style.border = '1px solid #555';
  card.appendChild(backBtn);

  appendLobbyError(card);
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
  btn.addEventListener('click', onClick);
  return btn;
};

const showError = (err: unknown): void => {
  const el = document.getElementById('lobby-error');
  if (el) el.textContent = err instanceof Error ? err.message : String(err);
};

onLanguageChange(rerenderCurrentShell);
renderLanguageControls();
if (!mobileRuntime) renderLobby();
