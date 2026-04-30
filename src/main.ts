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
  ROOM_MODE,
  ROOM_ROLE,
  ROOM_STATUS,
  type RoomMode,
  type RoomState,
} from './engine/classes/_game-engine/services/network.service';

const USER_ID_KEY = 'dice.userId';
const DISPLAY_NAME_KEY = 'dice.displayName';
const AUTH_CONTROLS_ID = 'auth-controls';
const AUTH_MODAL_ID = 'auth-modal';
const BACK_BUTTON_ID = 'back-button';
const ROOM_BADGE_ID = 'room-badge';

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

let activeGame: GameEngine | null = null;
let activeNetwork: NetworkService | null = null;

const startLocal = (): void => {
  clearLobby();
  clearRoomScreen();
  clearAuthControls();
  clearAuthModal();
  clearRoomBadge();
  const game = new GameEngine({ mode: 'local' });
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
    state = mode === 'create' ? await network.createRoom(roomMode) : await network.joinRoom(code!);
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
  const backBtn = button('Назад', returnToLobby);
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

const showRoomCode = (code: string, status: string): void => {
  let badge = document.getElementById(ROOM_BADGE_ID) as HTMLDivElement | null;
  if (!badge) {
    badge = document.createElement('div');
    badge.id = ROOM_BADGE_ID;
    document.body.appendChild(badge);
  }
  badge.id = ROOM_BADGE_ID;
  badge.textContent = `Room: ${code} · ${status}`;
  Object.assign(badge.style, {
    position: 'fixed',
    top: '12px',
    left: '12px',
    padding: '6px 10px',
    background: 'rgba(0,0,0,0.55)',
    color: '#eee',
    fontFamily: 'system-ui, sans-serif',
    fontSize: '14px',
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
  showRoomCode(state.code, state.mode === ROOM_MODE.TEST ? 'test' : statusLabel(state.status));
  renderBackButton();
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
    fontFamily: 'system-ui, sans-serif',
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
  title.textContent = `Room ${state.code}`;
  Object.assign(title.style, {
    fontSize: '22px',
    fontWeight: '700',
  } satisfies Partial<CSSStyleDeclaration>);
  panel.appendChild(title);

  const status = document.createElement('div');
  status.textContent =
    state.ownerId === network.getUserId() ? 'Автор комнаты' : 'Ожидание старта';
  Object.assign(status.style, {
    color: '#b8b8c8',
    fontSize: '14px',
    lineHeight: '1.4',
  } satisfies Partial<CSSStyleDeclaration>);
  panel.appendChild(status);

  panel.appendChild(memberSection('Игроки', state, ROOM_ROLE.PLAYER, network.getUserId()));
  panel.appendChild(memberSection('Зрители', state, ROOM_ROLE.SPECTATOR, network.getUserId()));

  const error = document.createElement('div');
  Object.assign(error.style, {
    color: '#f66',
    fontSize: '13px',
    minHeight: '18px',
  } satisfies Partial<CSSStyleDeclaration>);

  const startBtn = button('Start game', () => {
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
        member.online ? 'online' : 'offline'
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
  return userId === ownUserId ? `${name} (ты)` : name;
};

const statusLabel = (status: RoomState['status']): string => {
  switch (status) {
    case ROOM_STATUS.WAITING:
      return 'waiting';
    case ROOM_STATUS.ACTIVE:
      return 'active';
    case ROOM_STATUS.PAUSED:
      return 'paused';
    case ROOM_STATUS.FINISHED:
      return 'finished';
    default:
      return 'unknown';
  }
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
    fontFamily: 'system-ui, sans-serif',
    fontSize: '13px',
    zIndex: '30',
  } satisfies Partial<CSSStyleDeclaration>);

  const user = getStoredUser();
  if (user) {
    const label = document.createElement('span');
    label.textContent = `@${user.username}`;
    label.style.fontWeight = '700';
    wrap.appendChild(label);

    const logoutBtn = button('Выйти', () => {
      logoutAccount()
        .then(() => {
          renderAuthControls();
          renderLobby();
        })
        .catch(showError);
    });
    logoutBtn.style.background = 'transparent';
    logoutBtn.style.border = '1px solid #555';
    wrap.appendChild(logoutBtn);
  } else {
    const registerBtn = button('Регистрация', () => renderAuthModal('register'));
    registerBtn.style.background = '#16a34a';
    wrap.appendChild(registerBtn);

    const loginBtn = button('Вход', () => renderAuthModal('login'));
    loginBtn.style.background = 'transparent';
    loginBtn.style.border = '1px solid #555';
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
    fontFamily: 'system-ui, sans-serif',
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
  title.textContent = mode === 'register' ? 'Регистрация' : 'Вход';
  title.style.margin = '0';
  panel.appendChild(title);

  const usernameInput = textInput('Username');
  usernameInput.maxLength = 32;
  panel.appendChild(usernameInput);

  const passwordInput = textInput('Password');
  passwordInput.type = 'password';
  passwordInput.maxLength = 128;
  panel.appendChild(passwordInput);

  const error = document.createElement('div');
  Object.assign(error.style, {
    minHeight: '16px',
    color: '#f66',
    fontSize: '12px',
  } satisfies Partial<CSSStyleDeclaration>);
  panel.appendChild(error);

  const actions = document.createElement('div');
  Object.assign(actions.style, {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  } satisfies Partial<CSSStyleDeclaration>);

  const submitBtn = button(mode === 'register' ? 'Создать' : 'Войти', () => {
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

  const cancelBtn = button('Отмена', () => clearAuthModal());
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

const renderLobby = (): void => {
  clearLobby();
  clearBackButton();
  clearRoomBadge();
  renderAuthControls();
  const lobby = document.createElement('div');
  lobby.id = 'lobby';
  Object.assign(lobby.style, {
    position: 'fixed',
    inset: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(10,10,15,0.85)',
    zIndex: '20',
  } satisfies Partial<CSSStyleDeclaration>);

  const card = document.createElement('div');
  Object.assign(card.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '24px',
    width: '280px',
    background: '#1c1c24',
    borderRadius: '10px',
    color: '#eee',
    fontFamily: 'system-ui, sans-serif',
    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
  } satisfies Partial<CSSStyleDeclaration>);

  const title = document.createElement('h2');
  title.textContent = 'Dice';
  title.style.margin = '0';
  card.appendChild(title);

  const user = getStoredUser();
  let nameInput: HTMLInputElement | null = null;
  if (user) {
    const identity = document.createElement('div');
    identity.textContent = `Playing as @${user.username}`;
    Object.assign(identity.style, {
      padding: '8px',
      color: '#b8b8c8',
      fontSize: '14px',
      background: 'rgba(255,255,255,0.06)',
      borderRadius: '6px',
    } satisfies Partial<CSSStyleDeclaration>);
    card.appendChild(identity);
  } else {
    nameInput = textInput('Display name');
    nameInput.maxLength = 32;
    nameInput.value = getSavedDisplayName();
    card.appendChild(nameInput);
  }

  const displayNameValue = (): string => user?.username ?? nameInput?.value ?? '';

  const createBtn = button('Create room', () => {
    startNetwork('create', displayNameValue()).catch(showError);
  });
  card.appendChild(createBtn);

  const testRoomBtn = button('Тестовая комната', () => {
    startNetwork('create', displayNameValue(), undefined, ROOM_MODE.TEST).catch(showError);
  });
  testRoomBtn.style.background = '#0f766e';
  card.appendChild(testRoomBtn);

  const codeInput = document.createElement('input');
  codeInput.placeholder = 'Room code';
  codeInput.maxLength = 16;
  codeInput.autocapitalize = 'characters';
  Object.assign(codeInput.style, {
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #444',
    background: '#111',
    color: '#eee',
    borderRadius: '6px',
    textTransform: 'uppercase',
  } satisfies Partial<CSSStyleDeclaration>);
  card.appendChild(codeInput);

  const joinBtn = button('Join', () => {
    const code = codeInput.value.trim().toUpperCase();
    if (!code) return;
    startNetwork('join', displayNameValue(), code).catch(showError);
  });
  card.appendChild(joinBtn);

  const localBtn = button('Play local (no server)', () => {
    startLocal();
  });
  localBtn.style.background = 'transparent';
  localBtn.style.border = '1px solid #555';
  card.appendChild(localBtn);

  const error = document.createElement('div');
  error.id = 'lobby-error';
  Object.assign(error.style, {
    color: '#f66',
    fontSize: '12px',
    minHeight: '16px',
  } satisfies Partial<CSSStyleDeclaration>);
  card.appendChild(error);

  lobby.appendChild(card);
  document.body.appendChild(lobby);
};

const textInput = (placeholder: string): HTMLInputElement => {
  const input = document.createElement('input');
  input.placeholder = placeholder;
  Object.assign(input.style, {
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #444',
    background: '#111',
    color: '#eee',
    borderRadius: '6px',
  } satisfies Partial<CSSStyleDeclaration>);
  return input;
};

const button = (label: string, onClick: () => void): HTMLButtonElement => {
  const btn = document.createElement('button');
  btn.textContent = label;
  Object.assign(btn.style, {
    padding: '8px 12px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  } satisfies Partial<CSSStyleDeclaration>);
  btn.addEventListener('click', onClick);
  return btn;
};

const showError = (err: unknown): void => {
  const el = document.getElementById('lobby-error');
  if (el) el.textContent = err instanceof Error ? err.message : String(err);
};

renderLobby();
