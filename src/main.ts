import './style.css';
import type { GameEngine } from './engine/classes/_game-engine/game-engine.class';
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
  createLocalMatchConfig,
  type LocalMatchConfig,
} from './domain/local-match';
import {
  getLanguage,
  onLanguageChange,
  setLanguage,
  t,
  type Language,
} from './ui/i18n';
import { bindMouseOnlyClick } from './ui/mouse-only-button';
import { installCustomCursor } from './ui/custom-cursor';
import {
  closeMobileKeyboard,
  installMobileKeyboard,
  prepareMobileTextInput,
} from './ui/mobile-keyboard';
import { installPwaRuntime } from './ui/pwa-runtime';
import { installResponsiveUiScale } from './ui/responsive-ui-scale';
import {
  MOBILE_GAMEPLAY_EDGE_OFFSET,
  MOBILE_GAMEPLAY_GRID_ID,
  MOBILE_GAMEPLAY_TOP_MENU_RENDERED_EVENT,
} from './ui/mobile-gameplay-grid';
import {
  applyMobileModalLayer,
  releaseMobileModalLayer,
} from './ui/mobile/modal-layer';
import { createSoundSliders } from './ui/sound-controls';
import {
  TOP_MENU_DROPDOWN_CLOSE_EVENT,
  closeGamePopups,
  notifyGameplayOverlayState,
} from './ui/game-modal-state';
import {
  FONT_FAMILY,
  FONT_SIZE,
  MENU_BUTTON_BG,
  SETTINGS_BUTTON_BG,
  UI_RADIUS,
  UI_SIZE,
  scaledPx,
} from './ui/theme';
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
  type AudioSettings,
  type ControlAction,
  type ControlBindings,
  type GameplaySettings,
  type PlayerProfileSettings,
  type PlayerSettings,
} from './player-settings';
import { assetPreloader } from './engine/assets/asset-preloader';
import { audioService } from './engine/audio/audio.service';
import { musicService } from './engine/audio/music.service';
import type { MenuDiceScene } from './ui/menu-dice-scene';
import { hideLoadingOverlay, showLoadingOverlay } from './ui/loading-overlay';
import { AVATAR_URLS } from './avatars';
import { DICE_PRESETS, dicePresetName } from './dice-presets';
import {
  NetworkFlowController,
  StaleNetworkFlowError,
} from './network/network-flow-controller';

const DISPLAY_NAME_KEY = 'dice.displayName';
const LEGACY_USER_ID_KEY = 'dice.userId';
const SETTINGS_MODAL_ID = 'settings-modal';
const ROOM_BADGE_ID = 'room-badge';
const LANG_CONTROLS_ID = 'lang-controls';
const PROFILE_POPUP_ID = 'profile-popup';
const PROFILE_TOP_CONTROL_ID = 'profile-top-control';
const ROOM_LIST_MODAL_ID = 'room-list-modal';
const ROOM_PASSWORD_MODAL_ID = 'room-password-modal';
const MOBILE_ORIENTATION_GATE_ID = 'mobile-orientation-gate';
const MOBILE_DEVICE_RE =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
const ANDROID_APK_DOWNLOAD_URL = '/downloads/farklepit-android.apk';
const UI_ASSET_BASE = '/assets/ui';
const MAIN_LOGO_SRC = `${UI_ASSET_BASE}/main-logo.svg`;
const SMALL_FRAME_SRC = `${UI_ASSET_BASE}/small-icon-frame.svg`;
const AVATAR_MASK_SRC = `${UI_ASSET_BASE}/avatar-frame-mask.svg`;
const SETTINGS_ICON_SRC = `${UI_ASSET_BASE}/settings-icon.svg`;
const SOUND_ICON_SRC = `${UI_ASSET_BASE}/sound-icon.svg`;
const SOUND_DROPDOWN_SRC = `${UI_ASSET_BASE}/sound-dropdown-frame.svg`;
const SOUND_PICKER_SRC = `${UI_ASSET_BASE}/sound-slider-thumb.svg`;
const LANGUAGE_DROPDOWN_SRC = `${UI_ASSET_BASE}/language-dropdown-frame.svg`;
const BUTTON_S_SRC = `${UI_ASSET_BASE}/menu-button-small-frame.svg`;
const BUTTON_S_OVERLAY_SRC = `${UI_ASSET_BASE}/menu-button-small-hover-overlay.svg`;
const TOP_MENU_EDGE_OFFSET = 40;
const TOP_MENU_ICON_SIZE = 60;
const TOP_MENU_ICON_IMAGE_SIZE = 48;
const MOBILE_TOP_MENU_ICON_SIZE = 48;
const MOBILE_TOP_MENU_NICKNAME_GAP = 13;
const MOBILE_TOP_MENU_LOGO_WIDTH = 300;
const MOBILE_TOP_MENU_EDGE_OFFSET = 40;
const MOBILE_TOP_MENU_LOGO_GAP = 12;
const TOP_DROPDOWN_WIDTH = 60;
const SOUND_DROPDOWN_HEIGHT = 180;
const LANGUAGE_DROPDOWN_HEIGHT = 99;
const SMALL_MENU_BUTTON_WIDTH = 127;
const SMALL_MENU_BUTTON_HEIGHT = 40;
const PROFILE_AVATAR_IMAGE_SIZE = 68;
const SOUND_TRACK_TOP = 21;
const SOUND_TRACK_BOTTOM = 159;
const SOUND_PICKER_WIDTH = 18;
const SOUND_PICKER_HEIGHT = 9;
const TOP_DROPDOWN_ANIMATION_MS = 260;
const LANGUAGE_MATRIX_STEP_MS = 84;
const LANGUAGE_MATRIX_ROUNDS = 5;
const LANGUAGE_MATRIX_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯабвгдежзиклмнопрстуфхцчшэюя';

const LANG_ICON_SRC: Record<Language, string> = {
  en: '/assets/lang/language-en.png',
  ru: '/assets/lang/language-ru.png',
};
const LANG_ICON_LABEL: Record<Language, string> = {
  en: 'English',
  ru: 'Русский',
};
const APP_BACKGROUND_COLOR = '#151414';
const APP_BACKGROUND_OVERLAY = 'rgba(21,20,20,0.5)';
const APP_PANEL_BACKGROUND = '#151414';
const CUSTOM_ROOM_PLAYER_LIMIT = 4;

localStorage.removeItem(LEGACY_USER_ID_KEY);

const getSavedDisplayName = (): string => {
  return localStorage.getItem(DISPLAY_NAME_KEY)?.trim() ?? '';
};

const saveDisplayName = (value: string): string => {
  const name = value.trim().slice(0, 32) || 'Player';
  localStorage.setItem(DISPLAY_NAME_KEY, name);
  return name;
};

const hasSavedDisplayName = (): boolean => getSavedDisplayName().length > 0;

const app = document.getElementById('app');
if (!app) throw new Error('#app element not found');
app.replaceChildren();

const isMobileRuntime = (): boolean => {
  const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } };
  if (nav.userAgentData?.mobile === true) return true;
  if (MOBILE_DEVICE_RE.test(navigator.userAgent)) return true;
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    return true;
  return window.matchMedia('(max-width: 920px) and (pointer: coarse)').matches;
};

const mobileRuntime = isMobileRuntime();
const twaRuntime = new URLSearchParams(window.location.search).get('twa') === '1';
const androidApkLanding =
  mobileRuntime && !twaRuntime && /\bAndroid\b/i.test(navigator.userAgent);
const isMobilePortrait = (): boolean =>
  mobileRuntime && !window.matchMedia('(orientation: landscape)').matches;

document.documentElement.classList.toggle('mobile-runtime', mobileRuntime);
document.documentElement.classList.toggle('twa-runtime', twaRuntime);
installResponsiveUiScale();
installPwaRuntime();
installMobileKeyboard(mobileRuntime);
if (!mobileRuntime) {
  installCustomCursor();
}

let activeGame: GameEngine | null = null;
let activeNetwork: NetworkService | null = null;
let returningToLobby = false;
type LobbyView =
  | 'player-name'
  | 'home'
  | 'create-room'
  | 'multiplayer'
  | 'multiplayer-create'
  | 'multiplayer-join'
  | 'settings'
  | 'offline';

let currentLobbyView: LobbyView = 'home';
let menuDiceScene: MenuDiceScene | null = null;
let menuDiceSceneLoading: Promise<void> | null = null;
let networkGameMounting: Promise<void> | null = null;
let networkGameMountOwner: NetworkService | null = null;
let lobbyListNetwork: NetworkService | null = null;
let quickSearchNetwork: NetworkService | null = null;
let quickSearchConnecting = false;
let quickSearchToken = 0;
let quickSearchClockPreloadPending = false;
let finishedRoomReturnQueued = false;
let settingsScreenCleanup: (() => void) | null = null;
let languageDropdownPinnedOpen = false;
let languageMatrixRunId = 0;
let networkFlowLoadingOwner: number | null = null;
let offlineScreenActive = false;

const releaseNetworkFlowLoading = (): void => {
  if (networkFlowLoadingOwner === null) return;
  networkFlowLoadingOwner = null;
  hideLoadingOverlay();
};

const showNetworkFlowLoading = (generation: number): void => {
  if (networkFlowLoadingOwner === generation) return;
  releaseNetworkFlowLoading();
  showLoadingOverlay();
  networkFlowLoadingOwner = generation;
};

const hideNetworkFlowLoading = (generation: number): void => {
  if (networkFlowLoadingOwner !== generation) return;
  releaseNetworkFlowLoading();
};

const networkFlows = new NetworkFlowController<NetworkService>(
  (network) => {
    if (lobbyListNetwork === network) lobbyListNetwork = null;
  },
  releaseNetworkFlowLoading,
);

const isStaleNetworkFlowError = (error: unknown): boolean =>
  error instanceof StaleNetworkFlowError;

const QUICK_MATCH_PRELOAD_TIMEOUT_MS = 2500;

const isQuickSearchActive = (): boolean =>
  quickSearchConnecting || quickSearchNetwork !== null;

const syncQuickSearchClockSound = (): void => {
  if (!getPlayerSettings().audio.quickSearchClockEnabled) {
    audioService.stop('ui-quick-search-clock');
    return;
  }

  if (!isQuickSearchActive()) {
    audioService.stop('ui-quick-search-clock');
    return;
  }

  if (audioService.playLoop('ui-quick-search-clock') !== null) return;
  if (quickSearchClockPreloadPending) return;

  quickSearchClockPreloadPending = true;
  void audioService.preloadGroup('menu').finally(() => {
    quickSearchClockPreloadPending = false;
    if (isQuickSearchActive()) audioService.playLoop('ui-quick-search-clock');
  });
};

const UI_SOUND_HOVER_SELECTOR = 'button';
const MOBILE_UI_SOUND_SELECTOR =
  'button, a, input, select, textarea, [role="button"], [data-ui-click-sound]';
const UI_SOUND_HOVER_SUPPRESS_AFTER_CLICK_MS = 420;
const UI_SOUND_STATIONARY_POINTER_PX = 6;
let suppressUiClickForMusicStart: PointerEvent | null = null;

const isUiSoundDisabledTarget = (target: EventTarget | null): boolean =>
  target instanceof Element && target.closest('button:disabled, [aria-disabled="true"]') !== null;

const closestUiSoundTarget = (
  target: EventTarget | null,
  selector: string,
): Element | null => {
  if (!(target instanceof Element)) return null;
  const el = target.closest(selector);
  if (!el) return null;
  if (el instanceof HTMLButtonElement && el.disabled) return null;
  return el;
};

const isMusicStartTarget = (target: EventTarget | null): boolean => {
  const action = closestUiSoundTarget(target, 'button');
  if (!action) return false;
  if (action.closest('#mobile-keyboard')) return false;
  return action.closest('[data-ui-click-sound]') === null;
};

const installMusicStartOnUserIntent = (): void => {
  window.addEventListener(
    'pointerdown',
    (event) => {
      if (event.button !== 0 || !isMusicStartTarget(event.target)) return;
      if (musicService.start()) suppressUiClickForMusicStart = event;
    },
    true,
  );
};

const installUiSoundFeedback = ({ enableHover }: { enableHover: boolean }): void => {
  void audioService.preloadGroup('menu');

  let suppressHoverUntil = 0;
  let suppressHoverX = Number.NaN;
  let suppressHoverY = Number.NaN;

  const isSyntheticHoverAfterClick = (event: PointerEvent): boolean => {
    if (performance.now() > suppressHoverUntil) return false;
    return (
      Math.hypot(event.clientX - suppressHoverX, event.clientY - suppressHoverY) <=
      UI_SOUND_STATIONARY_POINTER_PX
    );
  };

  if (enableHover) {
    window.addEventListener(
      'pointerover',
      (event) => {
        if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
        const target = closestUiSoundTarget(event.target, UI_SOUND_HOVER_SELECTOR);
        if (!target) return;
        if (isSyntheticHoverAfterClick(event)) return;
        if (event.relatedTarget instanceof Node && target.contains(event.relatedTarget)) {
          return;
        }
        audioService.play('ui-hover');
      },
      true,
    );
  }

  window.addEventListener(
    'pointerdown',
    (event) => {
      if (event.button !== 0) return;
      suppressHoverUntil = performance.now() + UI_SOUND_HOVER_SUPPRESS_AFTER_CLICK_MS;
      suppressHoverX = event.clientX;
      suppressHoverY = event.clientY;
      if (event === suppressUiClickForMusicStart) {
        suppressUiClickForMusicStart = null;
        return;
      }
      if (event.target instanceof Element && event.target.closest('#mobile-keyboard')) {
        return;
      }
      if (
        mobileRuntime &&
        !closestUiSoundTarget(event.target, MOBILE_UI_SOUND_SELECTOR)
      ) {
        return;
      }
      if (isUiSoundDisabledTarget(event.target)) return;

      const specialTarget =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>('[data-ui-click-sound]')
          : null;
      const clickSound = specialTarget?.dataset.uiClickSound;
      if (clickSound === 'language-change') {
        const language = specialTarget?.dataset.languageOption;
        if (language === 'ru' || language === 'en') {
          if (language !== getLanguage()) audioService.play('ui-language-change');
          return;
        }
      }
      if (clickSound === 'none') return;
      audioService.play('ui-click');
    },
    true,
  );
};

const applyAudioSettings = (settings: PlayerSettings): void => {
  audioService.setEffectsVolume(settings.audio.masterVolume * settings.audio.effectsVolume);
  musicService.setMusicVolume(settings.audio.masterVolume * settings.audio.musicVolume);
};

const saveAudioSettings = (audio: AudioSettings): void => {
  savePlayerSettings({
    ...getPlayerSettings(),
    audio,
  }).catch(showError);
};

applyAudioSettings(getPlayerSettings());

audioService.bindUnlockListeners();
installMusicStartOnUserIntent();
installUiSoundFeedback({ enableHover: !mobileRuntime });

onPlayerSettingsChange((settings) => {
  applyAudioSettings(settings);
  syncQuickSearchClockSound();
  activeGame?.setPlayerSettings(settings);
});

const cleanupSettingsUi = (): void => {
  settingsScreenCleanup?.();
  settingsScreenCleanup = null;
};

const startLocalMatch = async (
  localMatchConfig: LocalMatchConfig,
): Promise<void> => {
  cancelQuickSearch({ render: false });
  destroyMenuDiceScene();
  showLoadingOverlay();
  let game: GameEngine | null = null;
  try {
    await Promise.all([
      assetPreloader.preloadGroup('gameplay'),
      audioService.preloadGroup('gameplay'),
    ]);
    const { GameEngine } =
      await import('./engine/classes/_game-engine/game-engine.class');
    game = new GameEngine({
      mode: 'local',
      localMatchConfig,
      playerSettings: getPlayerSettings(),
      playerDisplayName: currentDisplayName(),
      onReturnToLobby: returnToLobby,
    });
    game.warmup();
    clearLobby();
    clearRoomScreen();
    clearRoomBadge();
    app.appendChild(game.renderer.domElement);
    game.start();
    activeGame = game;
    renderLanguageControls();
  } catch (error) {
    game?.destroy();
    if (activeGame === game) activeGame = null;
    renderHome();
    throw error;
  } finally {
    hideLoadingOverlay();
  }
};

const startNetwork = async (
  mode: 'create' | 'join',
  code?: string,
  roomMode: RoomMode = ROOM_MODE.MATCH,
  roomOptions?: Partial<RoomOptionsPayload>,
  gameName?: string,
  password?: string,
): Promise<void> => {
  cancelQuickSearch({ render: false });
  const generation = networkFlows.begin();
  let network: NetworkService | null = null;
  let state: RoomState | null = null;
  try {
    network = await connectNetwork(generation);
    networkFlows.assert(generation, network);
    showNetworkFlowLoading(generation);
    await Promise.all([
      assetPreloader.preloadGroup('gameplay'),
      audioService.preloadGroup('gameplay'),
    ]);
    networkFlows.assert(generation, network);
    state =
      mode === 'create'
        ? await network.createRoom(roomMode, roomOptions, gameName, password)
        : await network.joinRoom(code!, password);
    networkFlows.assert(generation, network);
  } catch (err) {
    if (network) {
      networkFlows.release(network);
      if (activeNetwork === network) activeNetwork = null;
      network.disconnect();
    }
    if (!networkFlows.isCurrent(generation) || isStaleNetworkFlowError(err)) return;
    throw err;
  } finally {
    hideNetworkFlowLoading(generation);
  }
  if (!network || !state || !networkFlows.isCurrent(generation)) return;
  networkFlows.preserve(generation, network);
  activeNetwork = network;
  clearLobby();
  handleRoomState(network, state);
};

const startQuickMatch = async (): Promise<void> => {
  if (quickSearchConnecting || quickSearchNetwork) return;
  const token = ++quickSearchToken;
  const generation = networkFlows.begin();
  quickSearchConnecting = true;
  syncQuickSearchClockSound();
  renderHome();
  let network: NetworkService | null = null;
  let state: RoomState;
  try {
    network = await connectNetwork(generation);
    networkFlows.assert(generation, network);
    if (quickSearchToken !== token || !quickSearchConnecting) throw new StaleNetworkFlowError();
    networkFlows.release(network);
    activeNetwork = network;
    quickSearchNetwork = network;
    quickSearchConnecting = false;
    syncQuickSearchClockSound();
    renderHome();
    await waitForQuickMatchPreload();
    void audioService.preloadGroup('gameplay');
    if (
      quickSearchToken !== token ||
      !networkFlows.isCurrent(generation) ||
      activeNetwork !== network ||
      quickSearchNetwork !== network
    ) {
      return;
    }
    state = await network.quickMatch();
    if (!networkFlows.isCurrent(generation)) throw new StaleNetworkFlowError();
  } catch (err) {
    const searchStillCurrent =
      quickSearchToken === token &&
      (quickSearchConnecting ||
        activeNetwork === network ||
        quickSearchNetwork === network);
    if (quickSearchToken === token) quickSearchConnecting = false;
    if (network && quickSearchNetwork === network) quickSearchNetwork = null;
    if (network && activeNetwork === network) activeNetwork = null;
    syncQuickSearchClockSound();
    network?.disconnect();
    if (
      !searchStillCurrent ||
      !networkFlows.isCurrent(generation) ||
      isStaleNetworkFlowError(err)
    ) return;
    renderHome();
    throw err;
  }
  if (
    quickSearchToken !== token ||
    !networkFlows.isCurrent(generation) ||
    activeNetwork !== network ||
    quickSearchNetwork !== network
  ) {
    return;
  }
  handleRoomState(network, state);
};

const waitForQuickMatchPreload = (): Promise<void> => {
  const preload = assetPreloader
    .preloadGroup('gameplay')
    .catch((error: unknown) => {
      console.warn(
        '[QuickMatch] gameplay preload failed before queueing:',
        error,
      );
    });
  const timeout = new Promise<void>((resolve) => {
    window.setTimeout(resolve, QUICK_MATCH_PRELOAD_TIMEOUT_MS);
  });
  return Promise.race([preload, timeout]).then(() => undefined);
};

const cancelQuickSearch = (options: { render?: boolean } = {}): void => {
  if (!quickSearchConnecting && !quickSearchNetwork) return;
  networkFlows.invalidate();
  quickSearchToken += 1;
  quickSearchConnecting = false;
  const network = quickSearchNetwork;
  quickSearchNetwork = null;
  syncQuickSearchClockSound();
  if (network) {
    if (activeNetwork === network) activeNetwork = null;
    void network
      .leaveRoom()
      .catch(() => undefined)
      .finally(() => network.disconnect());
  }
  if (options.render ?? true) renderHome();
};

const connectNetwork = async (generation: number): Promise<NetworkService> => {
  const network = new NetworkService();
  networkFlows.track(generation, network);
  network.events.on('room-state', (state: RoomState) => {
    handleRoomState(network, state);
  });
  network.events.on('connection-lost', () => handleConnectionLost(network));
  try {
    await network.connect(
      saveDisplayName(getSavedDisplayName()),
      getPlayerSettings().profile.avatarIndex,
      getPlayerSettings().profile.dicePresetId,
    );
    networkFlows.assert(generation, network);
    return network;
  } catch (error) {
    networkFlows.release(network);
    network.disconnect();
    throw error;
  }
};

const clearLobby = (): void => {
  closeMobileKeyboard();
  cleanupSettingsUi();
  const existing = document.getElementById('lobby');
  if (existing) existing.remove();
};

const clearRoomScreen = (): void => {
  const existing = document.getElementById('room-screen');
  releaseMobileModalLayer(existing);
  if (existing) existing.remove();
};

const clearSettingsModal = (): void => {
  closeMobileKeyboard();
  cleanupSettingsUi();
  const existing = document.getElementById(SETTINGS_MODAL_ID);
  releaseMobileModalLayer(existing);
  if (existing) existing.remove();
  notifyGameplayOverlayState();
};

const clearRoomListModal = (): void => {
  const existing = document.getElementById(ROOM_LIST_MODAL_ID);
  releaseMobileModalLayer(existing);
  if (existing) existing.remove();
};

const clearRoomPasswordModal = (): void => {
  closeMobileKeyboard();
  const existing = document.getElementById(ROOM_PASSWORD_MODAL_ID);
  releaseMobileModalLayer(existing);
  if (existing) existing.remove();
};

const closeLobbyListNetwork = (): void => {
  const network = lobbyListNetwork;
  lobbyListNetwork = null;
  if (!network) return;
  networkFlows.release(network);
  network.disconnect();
};

const clearRoomBadge = (): void => {
  const existing = document.getElementById(ROOM_BADGE_ID);
  if (existing) existing.remove();
};

const clearLanguageControls = (): void => {
  const existing = document.getElementById(LANG_CONTROLS_ID);
  if (existing) existing.remove();
  document.getElementById(PROFILE_TOP_CONTROL_ID)?.remove();
  notifyGameplayOverlayState();
};

const clearProfilePopup = (): void => {
  closeMobileKeyboard();
  const existing = document.getElementById(PROFILE_POPUP_ID);
  releaseMobileModalLayer(existing);
  existing?.remove();
};

const clearTopPopupLayer = (): void => {
  clearSettingsModal();
  clearProfilePopup();
};

const isInteractiveKeyboardTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) return false;
  if (target.closest('input, textarea, select, button')) return true;
  const editable = target.closest('[contenteditable]');
  return editable instanceof HTMLElement && editable.isContentEditable;
};

const destroyMenuDiceScene = (): void => {
  menuDiceScene?.destroy();
  menuDiceScene = null;
};

const isMenuDiceView = (): boolean =>
  currentLobbyView === 'home' ||
  currentLobbyView === 'player-name' ||
  currentLobbyView === 'settings' ||
  currentLobbyView === 'create-room' ||
  currentLobbyView === 'multiplayer-join';

const ensureMenuDiceScene = (asOrientationBackdrop = false): void => {
  if (menuDiceScene || menuDiceSceneLoading) return;
  showLoadingOverlay();
  menuDiceSceneLoading = assetPreloader
    .preloadGroup('menu')
    .then(async () => {
      if (!asOrientationBackdrop && (!isMenuDiceView() || activeGame)) return;
      const { MenuDiceScene } = await import('./ui/menu-dice-scene');
      const scene = await MenuDiceScene.create();
      const shouldMount = asOrientationBackdrop
        ? isMobilePortrait()
        : isMenuDiceView() && !activeGame;
      if (!shouldMount) {
        scene.destroy();
        return;
      }
      scene.mount(document.body);
      menuDiceScene = scene;
    })
    .catch(showError)
    .finally(() => {
      menuDiceSceneLoading = null;
      hideLoadingOverlay();
    });
};

const clearMobileOrientationGate = (): void => {
  document.documentElement.classList.remove('mobile-orientation-locked');
  document.getElementById(MOBILE_ORIENTATION_GATE_ID)?.remove();
};

const showMobileOrientationGate = (): void => {
  if (!isMobilePortrait()) return;
  closeMobileKeyboard();
  document.documentElement.classList.add('mobile-orientation-locked');
  clearLanguageControls();
  ensureMenuDiceScene(true);

  const existing = document.getElementById(MOBILE_ORIENTATION_GATE_ID);
  if (existing) existing.remove();

  const gate = document.createElement('main');
  gate.id = MOBILE_ORIENTATION_GATE_ID;
  Object.assign(gate.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '1001',
    display: 'grid',
    placeItems: 'center',
    padding: '24px',
    boxSizing: 'border-box',
    background: 'rgba(21,20,20,0.34)',
    color: '#f4f4f5',
    fontFamily: FONT_FAMILY.ui,
    textAlign: 'center',
    pointerEvents: 'auto',
  } satisfies Partial<CSSStyleDeclaration>);

  const prompt = document.createElement('div');
  Object.assign(prompt.style, {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    maxWidth: '24ch',
  } satisfies Partial<CSSStyleDeclaration>);
  const icon = document.createElement('div');
  icon.textContent = '↻';
  Object.assign(icon.style, {
    fontSize: '72px',
    lineHeight: '1',
  } satisfies Partial<CSSStyleDeclaration>);
  const title = document.createElement('div');
  title.textContent = t('rotateDeviceTitle');
  Object.assign(title.style, {
    fontSize: '20px',
    lineHeight: '1.1',
  } satisfies Partial<CSSStyleDeclaration>);
  const description = document.createElement('div');
  description.textContent = t('rotateDeviceDescription');
  Object.assign(description.style, {
    color: '#d4d4d8',
    fontSize: '17px',
    lineHeight: '1.35',
  } satisfies Partial<CSSStyleDeclaration>);
  prompt.append(icon, title, description);
  gate.appendChild(prompt);
  document.body.appendChild(gate);
};

const syncMobileOrientation = (): void => {
  if (!mobileRuntime) return;
  if (!navigator.onLine && !activeGame) {
    renderOfflineScreen();
    return;
  }
  if (androidApkLanding && !activeGame) {
    clearMobileOrientationGate();
    renderAndroidApkLanding();
    return;
  }
  if (isMobilePortrait()) {
    showMobileOrientationGate();
    return;
  }
  clearMobileOrientationGate();
  if (activeGame) {
    destroyMenuDiceScene();
    return;
  }
  rerenderCurrentShell();
};

const returnToLobby = (): void => {
  if (returningToLobby) return;
  returningToLobby = true;
  void returnToLobbyAsync();
};

const returnToLobbyAsync = async (): Promise<void> => {
  networkFlows.invalidate();
  const network = activeNetwork;
  const game = activeGame;
  activeGame = null;
  game?.destroy();
  if (network) {
    await network.leaveRoom().catch(() => undefined);
  }

  network?.disconnect();
  if (activeNetwork === network) activeNetwork = null;
  clearLobby();
  clearRoomScreen();
  clearRoomBadge();
  clearTopPopupLayer();
  clearRoomListModal();
  closeLobbyListNetwork();
  renderHome();
  returningToLobby = false;
};

const handleConnectionLost = (network: NetworkService): void => {
  const relevant =
    activeNetwork === network ||
    quickSearchNetwork === network ||
    lobbyListNetwork === network ||
    networkFlows.owns(network);
  networkFlows.release(network);
  if (!relevant) return;

  networkFlows.invalidate();
  quickSearchToken += 1;
  quickSearchConnecting = false;
  if (quickSearchNetwork === network) quickSearchNetwork = null;
  if (lobbyListNetwork === network) lobbyListNetwork = null;
  if (activeNetwork === network) activeNetwork = null;
  syncQuickSearchClockSound();
  activeGame?.destroy();
  activeGame = null;
  clearRoomScreen();
  clearRoomBadge();
  renderHome();
  showError(new Error(t('connectionLost')));
};

const scheduleFinishedRoomReturn = (network: NetworkService): void => {
  if (finishedRoomReturnQueued) return;
  finishedRoomReturnQueued = true;
  queueMicrotask(() => {
    finishedRoomReturnQueued = false;
    if (activeNetwork === network) {
      returnToLobby();
    } else {
      network.disconnect();
    }
  });
};

const rerenderCurrentShell = (): void => {
  if (offlineScreenActive) return;
  if (!navigator.onLine && !activeGame) {
    renderOfflineScreen();
    return;
  }
  if (androidApkLanding && !activeGame) {
    clearMobileOrientationGate();
    renderAndroidApkLanding();
    return;
  }
  if (isMobilePortrait()) {
    showMobileOrientationGate();
    return;
  }
  clearMobileOrientationGate();
  renderLanguageControls();
  if (activeGame) return;
  const roomState = activeNetwork?.getRoomState();
  if (activeNetwork && roomState) {
    handleRoomState(activeNetwork, roomState);
    return;
  }
  switch (currentLobbyView) {
    case 'offline':
      return;
    case 'player-name':
      renderPlayerNameEntry();
      break;
    case 'create-room':
      renderCreateRoomMenu();
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
    case 'settings':
      renderSettingsMenu();
      break;
    case 'home':
    default:
      renderHome();
      break;
  }
};

const canOpenMainMenuSettings = (): boolean => {
  const roomStatus = activeNetwork?.getRoomState()?.status;
  return (
    !activeGame &&
    !mobileRuntime &&
    !isQuickSearchActive() &&
    roomStatus !== ROOM_STATUS.WAITING
  );
};

const toggleProfilePopup = (): void => {
  if (document.getElementById(PROFILE_POPUP_ID)) {
    clearProfilePopup();
    return;
  }
  closeTopMenuDropdowns();
  clearSettingsModal();
  prepareMainMenuTopPopup();
  const popup = createProfilePopup();
  document.body.appendChild(popup);
  applyMobileModalLayer(popup, popup.firstElementChild as HTMLElement);
  audioService.play('ui-settings-open');
};

const toggleSettingsPopup = (): void => {
  if (document.getElementById(SETTINGS_MODAL_ID)) {
    clearSettingsModal();
    return;
  }
  closeTopMenuDropdowns();
  clearProfilePopup();
  prepareMainMenuTopPopup();
  renderSettingsModal();
  notifyGameplayOverlayState();
  audioService.play('ui-settings-open');
};

const rerenderOpenTopPopup = (popup: 'profile' | 'settings' | null): void => {
  if (popup === 'profile') {
    clearProfilePopup();
    const profilePopup = createProfilePopup();
    document.body.appendChild(profilePopup);
    applyMobileModalLayer(profilePopup, profilePopup.firstElementChild as HTMLElement);
    return;
  }
  if (popup === 'settings') {
    renderSettingsModal();
  }
};

const toggleSettingsMenu = (): void => {
  toggleSettingsPopup();
};

const prepareMainMenuTopPopup = (): void => {
  if (
    activeGame ||
    (currentLobbyView !== 'create-room' &&
      currentLobbyView !== 'multiplayer-join' &&
      currentLobbyView !== 'settings')
  ) {
    return;
  }
  goHome();
};

const currentDisplayName = (): string => {
  const saved = getSavedDisplayName();
  return saved || 'Player';
};

function createNicknameSpan(name: string): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = 'player-nickname';
  span.textContent = name;
  return span;
}

const isGameplayTopMenu = (): boolean => {
  const roomStatus = activeNetwork?.getRoomState()?.status;
  return (
    activeGame !== null ||
    roomStatus === ROOM_STATUS.ACTIVE ||
    roomStatus === ROOM_STATUS.FINISHED
  );
};

const masterVolume = (): number => {
  return getPlayerSettings().audio.masterVolume;
};

const saveMasterVolume = (volume: number): void => {
  const clamped = Math.max(0, Math.min(1, volume));
  saveAudioSettings({ ...getPlayerSettings().audio, masterVolume: clamped });
};

interface TopMenuDropdownCloseOptions {
  silentSound?: boolean;
}

const closeTopMenuDropdowns = (
  except?: HTMLElement,
  options: TopMenuDropdownCloseOptions = {},
): void => {
  document
    .querySelectorAll<HTMLElement>(`#${LANG_CONTROLS_ID} [data-top-dropdown]`)
    .forEach((dropdown) => {
      if (dropdown !== except) closeTopMenuDropdown(dropdown, options);
    });
};

const isAudioTopMenuDropdown = (dropdown: HTMLElement): boolean => {
  return dropdown.dataset.topDropdown === 'sound' || dropdown.dataset.topDropdown === 'language';
};

const playTopMenuDropdownToggleSound = (dropdown: HTMLElement): void => {
  if (isAudioTopMenuDropdown(dropdown)) audioService.play('ui-dropdown-toggle');
};

const closeTopMenuDropdown = (
  dropdown: HTMLElement,
  options: TopMenuDropdownCloseOptions = {},
): void => {
  if (dropdown.dataset.closing === 'true') return;
  if (dropdown.dataset.topDropdown === 'language') {
    languageDropdownPinnedOpen = false;
  }
  if (!options.silentSound) playTopMenuDropdownToggleSound(dropdown);
  if (mobileRuntime) {
    dropdown.remove();
    notifyGameplayOverlayState();
    return;
  }
  dropdown.dataset.closing = 'true';
  dropdown.style.pointerEvents = 'none';
  dropdown.style.opacity = '0';
  dropdown.style.transform = 'translateY(-10px)';
  dropdown.style.maxHeight = '0px';
  window.setTimeout(() => dropdown.remove(), TOP_DROPDOWN_ANIMATION_MS);
  notifyGameplayOverlayState();
};

const openTopMenuDropdown = (dropdown: HTMLElement): void => {
  const targetHeight = dropdown.offsetHeight || dropdown.scrollHeight;
  playTopMenuDropdownToggleSound(dropdown);
  if (mobileRuntime) {
    Object.assign(dropdown.style, {
      overflow: 'visible',
      transform: 'none',
      transition: 'none',
      opacity: '1',
      maxHeight: 'none',
    } satisfies Partial<CSSStyleDeclaration>);
    notifyGameplayOverlayState();
    return;
  }
  dropdown.style.overflow = 'hidden';
  dropdown.style.transformOrigin = 'top center';
  dropdown.style.transition = [
    `opacity ${TOP_DROPDOWN_ANIMATION_MS}ms ease`,
    `transform ${TOP_DROPDOWN_ANIMATION_MS}ms ease`,
    `max-height ${TOP_DROPDOWN_ANIMATION_MS}ms ease`,
  ].join(', ');
  dropdown.style.opacity = '0';
  dropdown.style.transform = 'translateY(-10px)';
  dropdown.style.maxHeight = '0px';
  void dropdown.offsetHeight;
  requestAnimationFrame(() => {
    dropdown.style.opacity = '1';
    dropdown.style.transform = 'translateY(0)';
    dropdown.style.maxHeight = `${targetHeight}px`;
  });
  notifyGameplayOverlayState();
};

const showTopMenuDropdown = (dropdown: HTMLElement): void => {
  const targetHeight = dropdown.offsetHeight || dropdown.scrollHeight;
  dropdown.style.overflow = 'hidden';
  dropdown.style.transformOrigin = 'top center';
  dropdown.style.transition = [
    `opacity ${TOP_DROPDOWN_ANIMATION_MS}ms ease`,
    `transform ${TOP_DROPDOWN_ANIMATION_MS}ms ease`,
    `max-height ${TOP_DROPDOWN_ANIMATION_MS}ms ease`,
  ].join(', ');
  dropdown.style.opacity = '1';
  dropdown.style.transform = 'translateY(0)';
  dropdown.style.maxHeight = `${targetHeight}px`;
};

const closeDropdownsOnOutsidePointer = (event: PointerEvent): void => {
  if (event.target instanceof Element && event.target.closest('[data-top-dropdown]')) {
    return;
  }
  if (
    event.target instanceof Element &&
    event.target.closest('[data-top-dropdown-trigger]')
  ) {
    return;
  }
  closeTopMenuDropdowns();
};

const shouldAnimateLanguageTextNode = (node: Text): boolean => {
  if (!node.data.trim()) return false;
  const parent = node.parentElement;
  if (!parent) return false;
  if (
    parent.closest(
      [
        `#${LANG_CONTROLS_ID}`,
        'input',
        'textarea',
        'select',
        'option',
        'script',
        'style',
      ].join(','),
    )
  ) {
    return false;
  }
  return true;
};

const collectLanguageTextNodes = (): Text[] => {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (node instanceof Text && shouldAnimateLanguageTextNode(node)) nodes.push(node);
    node = walker.nextNode();
  }
  return nodes;
};

const randomLanguageMatrixChar = (): string =>
  LANGUAGE_MATRIX_CHARS[
    Math.floor(Math.random() * LANGUAGE_MATRIX_CHARS.length)
  ]!;

const languageMatrixFrameText = (
  targetChars: string[],
  revealCount: number,
): string =>
  targetChars
    .map((char, index) => {
      if (/\s/u.test(char) || index < revealCount) return char;
      return randomLanguageMatrixChar();
    })
    .join('');

const runLanguageMatrixAnimation = (): void => {
  const runId = ++languageMatrixRunId;
  requestAnimationFrame(() => {
    if (runId !== languageMatrixRunId) return;
    const entries = collectLanguageTextNodes().map((node) => {
      const targetChars = Array.from(node.data);
      return {
        node,
        parent: node.parentElement,
        target: node.data,
        targetChars,
        revealEvery: Math.max(1, Math.ceil(targetChars.length / LANGUAGE_MATRIX_ROUNDS)),
      };
    });
    for (const entry of entries) {
      entry.parent?.classList.add('language-matrix-text', 'language-matrix-text-active');
    }
    for (let round = 0; round <= LANGUAGE_MATRIX_ROUNDS; round += 1) {
      window.setTimeout(() => {
        if (runId !== languageMatrixRunId) return;
        for (const entry of entries) {
          const revealCount = Math.min(
            entry.targetChars.length,
            round * entry.revealEvery,
          );
          entry.node.data = languageMatrixFrameText(entry.targetChars, revealCount);
        }
      }, round * LANGUAGE_MATRIX_STEP_MS);
    }
    window.setTimeout(() => {
      if (runId !== languageMatrixRunId) return;
      for (const entry of entries) {
        entry.node.data = entry.target;
        entry.parent?.classList.remove(
          'language-matrix-text-active',
          'language-matrix-text',
        );
      }
    }, (LANGUAGE_MATRIX_ROUNDS + 1) * LANGUAGE_MATRIX_STEP_MS);
  });
};

const selectLanguageFromDropdown = (language: Language): void => {
  // A mobile language tap re-renders the top menu. Do not recreate a stale
  // dropdown, otherwise the gameplay actions remain dimmed after it closes.
  languageDropdownPinnedOpen = !mobileRuntime;
  if (language === getLanguage()) {
    closeTopMenuDropdowns();
    return;
  }
  setLanguage(language);
};

const createTopMenuItem = (): HTMLDivElement => {
  const item = document.createElement('div');
  Object.assign(item.style, {
    position: 'relative',
    width: `${TOP_MENU_ICON_SIZE}px`,
    height: `${TOP_MENU_ICON_SIZE}px`,
    flex: `0 0 ${TOP_MENU_ICON_SIZE}px`,
  } satisfies Partial<CSSStyleDeclaration>);
  return item;
};

const createPlainIconButton = (
  label: string,
  iconSrc: string,
  onClick: () => void,
): HTMLButtonElement => {
  const btn = document.createElement('button');
  btn.title = label;
  btn.setAttribute('aria-label', label);
  Object.assign(btn.style, {
    width: `${TOP_MENU_ICON_SIZE}px`,
    height: `${TOP_MENU_ICON_SIZE}px`,
    padding: '0',
    background: `url("${iconSrc}") center / ${TOP_MENU_ICON_SIZE}px ${TOP_MENU_ICON_SIZE}px no-repeat`,
    border: 'none',
    borderRadius: '0',
    display: 'block',
    boxSizing: 'border-box',
  } satisfies Partial<CSSStyleDeclaration>);
  addSmallFrameHoverOverlay(btn, TOP_MENU_ICON_IMAGE_SIZE);
  bindMouseOnlyClick(btn, onClick);
  return btn;
};

const addSmallFrameHoverOverlay = (
  host: HTMLElement,
  maskSize: number,
): void => {
  if (mobileRuntime) return;
  host.style.position = 'relative';
  host.style.isolation = 'isolate';
  const overlay = document.createElement('span');
  Object.assign(overlay.style, {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: `${maskSize}px`,
    height: `${maskSize}px`,
    transform: 'translate(-50%, -50%)',
    background: 'rgba(255,255,255,0.22)',
    opacity: '0',
    pointerEvents: 'none',
    transition: 'opacity 180ms ease',
    zIndex: '2',
  } satisfies Partial<CSSStyleDeclaration>);
  overlay.style.maskImage = `url("${AVATAR_MASK_SRC}")`;
  overlay.style.maskSize = `${maskSize}px ${maskSize}px`;
  overlay.style.maskRepeat = 'no-repeat';
  overlay.style.maskPosition = 'center';
  overlay.style.setProperty('-webkit-mask-image', `url("${AVATAR_MASK_SRC}")`);
  overlay.style.setProperty('-webkit-mask-size', `${maskSize}px ${maskSize}px`);
  overlay.style.setProperty('-webkit-mask-repeat', 'no-repeat');
  overlay.style.setProperty('-webkit-mask-position', 'center');
  const show = (): void => {
    overlay.style.opacity = '1';
  };
  const hide = (): void => {
    overlay.style.opacity = '0';
  };
  host.addEventListener('mouseenter', show);
  host.addEventListener('mouseleave', hide);
  host.addEventListener('focusin', show);
  host.addEventListener('focusout', hide);
  host.appendChild(overlay);
};

const createFrameImageButton = (
  label: string,
  iconSrc: string,
  onClick: () => void,
): HTMLButtonElement => {
  const btn = document.createElement('button');
  btn.title = label;
  btn.setAttribute('aria-label', label);
  Object.assign(btn.style, {
    width: `${TOP_MENU_ICON_SIZE}px`,
    height: `${TOP_MENU_ICON_SIZE}px`,
    padding: '0',
    background: `url("${SMALL_FRAME_SRC}") center / ${TOP_MENU_ICON_SIZE}px ${TOP_MENU_ICON_SIZE}px no-repeat`,
    border: 'none',
    borderRadius: '0',
    color: '#fff',
    display: 'grid',
    placeItems: 'center',
    fontFamily: FONT_FAMILY.ui,
    fontSize: '25px',
    lineHeight: '1',
    boxSizing: 'border-box',
    alignSelf: 'center',
  } satisfies Partial<CSSStyleDeclaration>);
  const icon = document.createElement('img');
  icon.src = iconSrc;
  icon.alt = '';
  icon.draggable = false;
  Object.assign(icon.style, {
    width: `${TOP_MENU_ICON_IMAGE_SIZE}px`,
    height: `${TOP_MENU_ICON_IMAGE_SIZE}px`,
    display: 'block',
    objectFit: 'contain',
    pointerEvents: 'none',
    userSelect: 'none',
    position: 'relative',
    zIndex: '1',
  } satisfies Partial<CSSStyleDeclaration>);
  btn.appendChild(icon);
  addSmallFrameHoverOverlay(btn, TOP_MENU_ICON_IMAGE_SIZE);
  bindMouseOnlyClick(btn, onClick);
  return btn;
};

const appendMaskedAvatar = (
  host: HTMLElement,
  avatarIndex: number,
  label: string,
  imageSize = TOP_MENU_ICON_IMAGE_SIZE,
): void => {
  const url = AVATAR_URLS[avatarIndex] ?? AVATAR_URLS[0];
  if (!url) {
    host.textContent = (label.trim()[0] ?? '?').toUpperCase();
    return;
  }
  const image = document.createElement('img');
  image.src = url;
  image.alt = '';
  image.draggable = false;
  Object.assign(image.style, {
    display: 'block',
    width: `${imageSize}px`,
    height: `${imageSize}px`,
    objectFit: 'cover',
    pointerEvents: 'none',
    userSelect: 'none',
    position: 'relative',
    zIndex: '1',
  } satisfies Partial<CSSStyleDeclaration>);
  image.style.maskImage = `url("${AVATAR_MASK_SRC}")`;
  image.style.maskSize = `${imageSize}px ${imageSize}px`;
  image.style.maskRepeat = 'no-repeat';
  image.style.maskPosition = 'center';
  image.style.setProperty('-webkit-mask-image', `url("${AVATAR_MASK_SRC}")`);
  image.style.setProperty('-webkit-mask-size', `${imageSize}px ${imageSize}px`);
  image.style.setProperty('-webkit-mask-repeat', 'no-repeat');
  image.style.setProperty('-webkit-mask-position', 'center');
  host.appendChild(image);
};

const createAvatarFrame = (
  editable: boolean,
  onClick: () => void,
  size = TOP_MENU_ICON_SIZE,
): HTMLElement => {
  const el = editable ? document.createElement('button') : document.createElement('div');
  const name = currentDisplayName();
  el.title = name;
  if (editable) el.setAttribute('aria-label', t('avatar'));
  Object.assign(el.style, {
    width: `${size}px`,
    height: `${size}px`,
    padding: '0',
    background: `url("${SMALL_FRAME_SRC}") center / ${size}px ${size}px no-repeat`,
    border: 'none',
    borderRadius: '0',
    color: '#fff',
    display: 'grid',
    placeItems: 'center',
    fontFamily: FONT_FAMILY.ui,
    fontSize: '16px',
    lineHeight: '1',
    boxSizing: 'border-box',
  } satisfies Partial<CSSStyleDeclaration>);
  const imageSize = Math.round((size * TOP_MENU_ICON_IMAGE_SIZE) / TOP_MENU_ICON_SIZE);
  appendMaskedAvatar(el, getPlayerSettings().profile.avatarIndex, name, imageSize);
  if (editable && el instanceof HTMLButtonElement) {
    el.dataset.uiClickSound = 'none';
    addSmallFrameHoverOverlay(el, imageSize);
    bindMouseOnlyClick(el, onClick);
  }
  return el;
};

const renderMobileProfileControl = (canEditProfile: boolean): void => {
  const wrap = document.createElement('div');
  wrap.id = PROFILE_TOP_CONTROL_ID;
  Object.assign(wrap.style, {
    position: 'fixed',
    top: 'var(--gameplay-top-row-offset)',
    left: MOBILE_GAMEPLAY_EDGE_OFFSET,
    display: 'flex',
    alignItems: 'center',
    gap: `${MOBILE_TOP_MENU_NICKNAME_GAP}px`,
    height: `${MOBILE_TOP_MENU_ICON_SIZE}px`,
    zIndex: '45',
    fontFamily: FONT_FAMILY.ui,
    color: '#fff',
    pointerEvents: 'auto',
  } satisfies Partial<CSSStyleDeclaration>);

  wrap.appendChild(createAvatarFrame(canEditProfile, toggleProfilePopup, MOBILE_TOP_MENU_ICON_SIZE));

  const name = document.createElement('div');
  name.className = 'player-nickname';
  name.textContent = currentDisplayName();
  Object.assign(name.style, {
    minWidth: '0',
    maxWidth: `max(0px, calc(50vw - ${MOBILE_TOP_MENU_LOGO_WIDTH / 2 + MOBILE_TOP_MENU_EDGE_OFFSET + MOBILE_TOP_MENU_ICON_SIZE + MOBILE_TOP_MENU_NICKNAME_GAP + MOBILE_TOP_MENU_LOGO_GAP}px))`,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '30px',
    lineHeight: '1',
    textShadow: '0 3px 12px rgba(0,0,0,0.8)',
  } satisfies Partial<CSSStyleDeclaration>);
  wrap.appendChild(name);
  document.body.appendChild(wrap);
};

const renderLanguageControls = (): void => {
  clearLanguageControls();
  const gameplayActive = isGameplayTopMenu();
  const mobileGameplayGrid =
    mobileRuntime && gameplayActive
      ? document.getElementById(MOBILE_GAMEPLAY_GRID_ID)
      : null;
  const inMobileGameplayGrid = mobileGameplayGrid instanceof HTMLElement;

  const canEditProfile = !gameplayActive && currentLobbyView !== 'player-name';
  if (!canEditProfile) clearProfilePopup();
  const wrap = document.createElement('div');
  wrap.id = LANG_CONTROLS_ID;
  wrap.classList.add('responsive-ui-corner', 'responsive-ui-corner-top-right');
  Object.assign(wrap.style, {
    position: inMobileGameplayGrid ? 'static' : 'fixed',
    top: inMobileGameplayGrid ? 'auto' : 'var(--gameplay-top-row-offset)',
    right: inMobileGameplayGrid
      ? 'auto'
      : mobileRuntime
        ? MOBILE_GAMEPLAY_EDGE_OFFSET
        : `${TOP_MENU_EDGE_OFFSET}px`,
    gridColumn: inMobileGameplayGrid ? '4' : 'auto',
    gridRow: inMobileGameplayGrid ? '1' : 'auto',
    alignSelf: inMobileGameplayGrid ? 'start' : 'auto',
    justifySelf: inMobileGameplayGrid ? 'end' : 'auto',
    marginTop: inMobileGameplayGrid
      ? 'var(--gameplay-top-row-offset)'
      : '0',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    zIndex: '45',
    fontFamily: FONT_FAMILY.ui,
    color: '#fff',
    pointerEvents: 'auto',
  } satisfies Partial<CSSStyleDeclaration>);

  if (!gameplayActive && mobileRuntime && currentLobbyView === 'home') {
    renderMobileProfileControl(canEditProfile);
  } else if (!gameplayActive && !mobileRuntime) {
    const name = document.createElement('div');
    name.className = 'player-nickname';
    name.textContent = currentDisplayName();
    Object.assign(name.style, {
      maxWidth: '180px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontSize: '25px',
      lineHeight: `${TOP_MENU_ICON_SIZE}px`,
      textShadow: '0 3px 12px rgba(0,0,0,0.8)',
    } satisfies Partial<CSSStyleDeclaration>);
    wrap.appendChild(name);

    const avatarItem = createTopMenuItem();
    avatarItem.appendChild(
      createAvatarFrame(canEditProfile, () => {
        toggleProfilePopup();
      }),
    );
    wrap.appendChild(avatarItem);
  }

  const settingsItem = createTopMenuItem();
  const settingsButton = createPlainIconButton(t('settings'), SETTINGS_ICON_SRC, () => {
    toggleSettingsPopup();
  });
  settingsButton.dataset.uiClickSound = 'none';
  settingsItem.appendChild(settingsButton);
  wrap.appendChild(settingsItem);

  const soundItem = createTopMenuItem();
  const soundButton = createPlainIconButton(t('sounds'), SOUND_ICON_SRC, () => {
    const existing = soundItem.querySelector<HTMLElement>('[data-top-dropdown="sound"]');
    if (existing) {
      closeTopMenuDropdown(existing);
      return;
    }
    const dropdown = createSoundDropdown();
    closeTopMenuDropdowns(undefined, { silentSound: true });
    soundItem.appendChild(dropdown);
    openTopMenuDropdown(dropdown);
  });
  soundButton.dataset.uiClickSound = 'none';
  soundButton.dataset.topDropdownTrigger = 'sound';
  soundItem.appendChild(soundButton);
  wrap.appendChild(soundItem);

  const languageItem = createTopMenuItem();
  const current = getLanguage();
  let pinnedLanguageDropdown: HTMLDivElement | null = null;
  const languageButton = createFrameImageButton(LANG_ICON_LABEL[current], LANG_ICON_SRC[current], () => {
    const existing = languageItem.querySelector<HTMLElement>('[data-top-dropdown="language"]');
    if (existing) {
      closeTopMenuDropdown(existing);
      return;
    }
    const dropdown = createLanguageDropdown();
    closeTopMenuDropdowns(undefined, { silentSound: true });
    languageDropdownPinnedOpen = !mobileRuntime;
    languageItem.appendChild(dropdown);
    openTopMenuDropdown(dropdown);
  });
  languageButton.dataset.uiClickSound = 'none';
  languageButton.dataset.topDropdownTrigger = 'language';
  languageItem.appendChild(languageButton);
  if (languageDropdownPinnedOpen) {
    pinnedLanguageDropdown = createLanguageDropdown();
    languageItem.appendChild(pinnedLanguageDropdown);
  }
  wrap.appendChild(languageItem);

  (inMobileGameplayGrid ? mobileGameplayGrid : document.body).appendChild(wrap);
  if (inMobileGameplayGrid) {
    window.dispatchEvent(new Event(MOBILE_GAMEPLAY_TOP_MENU_RENDERED_EVENT));
  }
  if (pinnedLanguageDropdown) showTopMenuDropdown(pinnedLanguageDropdown);
};

const createProfilePopup = (): HTMLDivElement => {
  const overlay = document.createElement('div');
  overlay.id = PROFILE_POPUP_ID;
  overlay.classList.add('text-selection-allowed');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: APP_BACKGROUND_OVERLAY,
    zIndex: '40',
    pointerEvents: 'auto',
    fontFamily: FONT_FAMILY.ui,
  } satisfies Partial<CSSStyleDeclaration>);

  const panel = document.createElement('div');
  panel.classList.add('responsive-ui-content');
  Object.assign(panel.style, {
    width: 'min(520px, calc(100vw - 32px))',
    maxHeight: 'calc(100vh - 32px)',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: scaledPx(12),
    padding: scaledPx(22),
    background: APP_PANEL_BACKGROUND,
    color: '#eee',
    borderRadius: UI_RADIUS,
    boxSizing: 'border-box',
    fontFamily: FONT_FAMILY.ui,
    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
  } satisfies Partial<CSSStyleDeclaration>);

  const title = appendTitle(panel, t('playerSettings'));
  title.style.textAlign = 'center';

  const nameInput = textInput(t('displayName'));
  nameInput.value = currentDisplayName();
  nameInput.maxLength = 32;
  Object.assign(nameInput.style, {
    width: '345px',
    height: UI_SIZE.menuButtonHeight,
    alignSelf: 'center',
    padding: '0',
    border: 'none',
    borderRadius: '0',
    outline: 'none',
    boxShadow: 'none',
    appearance: 'none',
    backgroundColor: 'transparent',
    backgroundImage: `url("${UI_ASSET_BASE}/menu-button-large-frame.svg")`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '345px 60px',
    color: '#fff',
    textAlign: 'center',
    fontFamily: FONT_FAMILY.ui,
    fontSize: '25px',
    lineHeight: '1',
    boxSizing: 'border-box',
    caretColor: '#fff',
  } satisfies Partial<CSSStyleDeclaration>);
  nameInput.style.setProperty('-webkit-appearance', 'none');
  nameInput.addEventListener('focus', () => {
    nameInput.style.outline = 'none';
    nameInput.style.boxShadow = 'none';
  });
  panel.appendChild(nameInput);

  const avatarGrid = document.createElement('div');
  Object.assign(avatarGrid.style, {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '12px',
    width: '100%',
  } satisfies Partial<CSSStyleDeclaration>);
  panel.appendChild(avatarGrid);

  const diceTitle = appendSectionTitle(panel, t('diceCosmetics'));
  diceTitle.style.textAlign = 'center';

  const dicePresetGrid = document.createElement('div');
  Object.assign(dicePresetGrid.style, {
    display: 'grid',
    gridTemplateColumns: '1fr',
    justifyItems: 'center',
    gap: '12px',
    width: '100%',
  } satisfies Partial<CSSStyleDeclaration>);
  panel.appendChild(dicePresetGrid);

  const renderAvatarButtons = (): void => {
    avatarGrid.replaceChildren();
    for (let index = 0; index < AVATAR_URLS.length; index++) {
      const avatarBtn = document.createElement('button');
      avatarBtn.title = `${t('avatar')} ${index + 1}`;
      avatarBtn.setAttribute('aria-label', `${t('avatar')} ${index + 1}`);
      Object.assign(avatarBtn.style, {
        width: '100%',
        aspectRatio: '1 / 1',
        padding: '0',
        background: `url("${SMALL_FRAME_SRC}") center / 100% 100% no-repeat`,
        border: 'none',
        borderRadius: '0',
        display: 'grid',
        placeItems: 'center',
        opacity: getPlayerSettings().profile.avatarIndex === index ? '1' : '0.68',
      } satisfies Partial<CSSStyleDeclaration>);
      appendMaskedAvatar(
        avatarBtn,
        index,
        `${t('avatar')} ${index + 1}`,
        PROFILE_AVATAR_IMAGE_SIZE,
      );
      addSmallFrameHoverOverlay(avatarBtn, PROFILE_AVATAR_IMAGE_SIZE);
      bindMouseOnlyClick(avatarBtn, () => {
        savePlayerSettings({
          ...getPlayerSettings(),
          profile: {
            ...getPlayerSettings().profile,
            avatarIndex: index,
          },
        })
          .then(() => {
            renderAvatarButtons();
            renderLanguageControls();
          })
          .catch(showError);
      });
      avatarGrid.appendChild(avatarBtn);
    }
  };

  const renderDicePresetButtons = (): void => {
    dicePresetGrid.replaceChildren();
    const currentPresetId = getPlayerSettings().profile.dicePresetId;
    for (const preset of DICE_PRESETS) {
      const presetBtn = document.createElement('button');
      const name = dicePresetName(preset, getLanguage());
      presetBtn.type = 'button';
      presetBtn.title = name;
      presetBtn.setAttribute('aria-label', name);
      presetBtn.className = 'menu-frame-button';
      Object.assign(presetBtn.style, {
        opacity: currentPresetId === preset.id ? '1' : '0.68',
      } satisfies Partial<CSSStyleDeclaration>);
      const label = document.createElement('span');
      label.textContent = name;
      presetBtn.appendChild(label);
      bindMouseOnlyClick(presetBtn, () => {
        savePlayerSettings({
          ...getPlayerSettings(),
          profile: {
            ...getPlayerSettings().profile,
            dicePresetId: preset.id,
          },
        })
          .then(renderDicePresetButtons)
          .catch(showError);
      });
      dicePresetGrid.appendChild(presetBtn);
    }
  };

  const saveProfileName = (): void => {
    const next = nameInput.value.trim();
    if (!next) {
      nameInput.value = currentDisplayName();
      showError(new Error(t('displayNameRequired')));
      return;
    }
    nameInput.value = saveDisplayName(next);
    renderLanguageControls();
  };

  nameInput.addEventListener('input', () => {
    if (!mobileRuntime || !nameInput.value.trim()) return;
    nameInput.value = saveDisplayName(nameInput.value);
    renderLanguageControls();
  });
  nameInput.addEventListener('blur', saveProfileName);
  nameInput.addEventListener('keydown', (event) => {
    if (event.code !== 'Enter') return;
    event.preventDefault();
    saveProfileName();
    nameInput.blur();
  });

  overlay.addEventListener('click', (event) => {
    if (event.target !== overlay) return;
    if (mobileRuntime && nameInput.value.trim()) saveProfileName();
    clearProfilePopup();
  });
  panel.addEventListener('click', (event) => event.stopPropagation());
  overlay.appendChild(panel);
  renderAvatarButtons();
  renderDicePresetButtons();
  return overlay;
};

const createSoundDropdown = (): HTMLDivElement => {
  const dropdown = document.createElement('div');
  dropdown.dataset.topDropdown = 'sound';
  Object.assign(dropdown.style, {
    position: 'absolute',
    top: `${TOP_MENU_ICON_SIZE + 5}px`,
    left: `${(TOP_MENU_ICON_SIZE - TOP_DROPDOWN_WIDTH) / 2}px`,
    width: `${TOP_DROPDOWN_WIDTH}px`,
    height: `${SOUND_DROPDOWN_HEIGHT}px`,
    background: `url("${SOUND_DROPDOWN_SRC}") center / ${TOP_DROPDOWN_WIDTH}px ${SOUND_DROPDOWN_HEIGHT}px no-repeat`,
    pointerEvents: 'auto',
    touchAction: 'none',
  } satisfies Partial<CSSStyleDeclaration>);

  const picker = document.createElement('img');
  picker.src = SOUND_PICKER_SRC;
  picker.alt = '';
  picker.draggable = false;
  Object.assign(picker.style, {
    position: 'absolute',
    left: `${(TOP_DROPDOWN_WIDTH - SOUND_PICKER_WIDTH) / 2}px`,
    width: `${SOUND_PICKER_WIDTH}px`,
    height: `${SOUND_PICKER_HEIGHT}px`,
    pointerEvents: 'none',
    userSelect: 'none',
    opacity: '0',
    transform: 'translateY(-10px)',
    transition: [
      `opacity ${TOP_DROPDOWN_ANIMATION_MS}ms ease`,
      `transform ${TOP_DROPDOWN_ANIMATION_MS}ms ease`,
    ].join(', '),
  } satisfies Partial<CSSStyleDeclaration>);
  dropdown.appendChild(picker);

  const minTop = SOUND_TRACK_TOP;
  const maxTop = SOUND_TRACK_BOTTOM - SOUND_PICKER_HEIGHT;
  const topFromVolume = (volume: number): number =>
    minTop + (1 - Math.max(0, Math.min(1, volume))) * (maxTop - minTop);
  const volumeFromClientY = (clientY: number): number => {
    const rect = dropdown.getBoundingClientRect();
    const top = Math.max(
      minTop,
      Math.min(maxTop, clientY - rect.top - SOUND_PICKER_HEIGHT / 2),
    );
    picker.style.top = `${top}px`;
    return 1 - (top - minTop) / (maxTop - minTop);
  };
  picker.style.top = `${topFromVolume(masterVolume())}px`;
  requestAnimationFrame(() => {
    picker.style.opacity = '1';
    picker.style.transform = 'translateY(0)';
  });

  dropdown.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    saveMasterVolume(volumeFromClientY(event.clientY));
    const onMove = (moveEvent: PointerEvent): void => {
      moveEvent.preventDefault();
      saveMasterVolume(volumeFromClientY(moveEvent.clientY));
    };
    const onUp = (): void => {
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerup', onUp, true);
      window.removeEventListener('pointercancel', onUp, true);
    };
    window.addEventListener('pointermove', onMove, true);
    window.addEventListener('pointerup', onUp, true);
    window.addEventListener('pointercancel', onUp, true);
  });

  return dropdown;
};

const createLanguageDropdown = (): HTMLDivElement => {
  const dropdown = document.createElement('div');
  dropdown.dataset.topDropdown = 'language';
  Object.assign(dropdown.style, {
    position: 'absolute',
    top: `${TOP_MENU_ICON_SIZE + 5}px`,
    left: `${(TOP_MENU_ICON_SIZE - TOP_DROPDOWN_WIDTH) / 2}px`,
    width: `${TOP_DROPDOWN_WIDTH}px`,
    height: `${LANGUAGE_DROPDOWN_HEIGHT}px`,
    background: `url("${LANGUAGE_DROPDOWN_SRC}") center / ${TOP_DROPDOWN_WIDTH}px ${LANGUAGE_DROPDOWN_HEIGHT}px no-repeat`,
    display: 'grid',
    gridTemplateRows: `${LANGUAGE_DROPDOWN_HEIGHT / 2}px ${LANGUAGE_DROPDOWN_HEIGHT / 2}px`,
    pointerEvents: 'auto',
  } satisfies Partial<CSSStyleDeclaration>);

  for (const language of ['ru', 'en'] satisfies Language[]) {
    const btn = document.createElement('button');
    btn.dataset.uiClickSound = 'language-change';
    btn.dataset.languageOption = language;
    btn.title = LANG_ICON_LABEL[language];
    btn.setAttribute('aria-label', LANG_ICON_LABEL[language]);
    Object.assign(btn.style, {
      width: `${TOP_DROPDOWN_WIDTH}px`,
      height: `${LANGUAGE_DROPDOWN_HEIGHT / 2}px`,
      padding: '0',
      background: 'transparent',
      border: 'none',
      borderRadius: '0',
      display: 'grid',
      placeItems: 'center',
      opacity: '1',
    } satisfies Partial<CSSStyleDeclaration>);
    const icon = document.createElement('img');
    icon.src = LANG_ICON_SRC[language];
    icon.alt = '';
    icon.draggable = false;
    Object.assign(icon.style, {
      width: `${TOP_MENU_ICON_IMAGE_SIZE}px`,
      height: `${TOP_MENU_ICON_IMAGE_SIZE}px`,
      display: 'block',
      objectFit: 'contain',
      pointerEvents: 'none',
      userSelect: 'none',
    } satisfies Partial<CSSStyleDeclaration>);
    btn.appendChild(icon);
    bindMouseOnlyClick(btn, () => selectLanguageFromDropdown(language));
    dropdown.appendChild(btn);
  }

  return dropdown;
};

const handleRoomState = (network: NetworkService, state: RoomState): void => {
  if (activeNetwork !== network) return;

  if (state.status === ROOM_STATUS.FINISHED) {
    if (network === quickSearchNetwork) {
      quickSearchNetwork = null;
      quickSearchConnecting = false;
      syncQuickSearchClockSound();
    }
    if (activeGame && activeNetwork === network) return;
    scheduleFinishedRoomReturn(network);
    return;
  }

  if (network === quickSearchNetwork && state.status === ROOM_STATUS.WAITING) {
    clearRoomScreen();
    renderHome();
    return;
  }

  if (network === quickSearchNetwork) {
    quickSearchNetwork = null;
    syncQuickSearchClockSound();
  }

  if (state.status === ROOM_STATUS.WAITING) {
    renderRoomScreen(network, state);
    return;
  }

  destroyMenuDiceScene();
  clearLobby();
  clearRoomScreen();
  clearRoomBadge();
  renderLanguageControls();
  if (!activeGame) {
    mountNetworkGame(network).catch(showError);
  }
};

const mountNetworkGame = async (network: NetworkService): Promise<void> => {
  if (activeGame) return;
  if (networkGameMounting) {
    const mounting = networkGameMounting;
    if (networkGameMountOwner === network) return mounting;
    await mounting.catch(() => undefined);
    if (activeGame || activeNetwork !== network) return;
    return mountNetworkGame(network);
  }

  networkGameMountOwner = network;
  const mounting = (async (): Promise<void> => {
    showLoadingOverlay('LOADING', { backdrop: 'transparent' });
    let game: GameEngine | null = null;
    let failed = false;
    let failure: unknown;
    try {
      await Promise.all([
        assetPreloader.preloadGroup('gameplay'),
        audioService.preloadGroup('gameplay'),
      ]);
      if (activeGame || activeNetwork !== network) return;
      const { GameEngine } =
        await import('./engine/classes/_game-engine/game-engine.class');
      if (activeGame || activeNetwork !== network) return;
      game = new GameEngine({
        mode: 'network',
        network,
        playerSettings: getPlayerSettings(),
        onReturnToLobby: returnToLobby,
      });
      game.warmup();
      if (activeGame || activeNetwork !== network) {
        game.destroy();
        return;
      }
      app.appendChild(game.renderer.domElement);
      game.start();
      activeGame = game;
      renderLanguageControls();
    } catch (error) {
      game?.destroy();
      if (activeGame === game) activeGame = null;
      if (activeNetwork !== network) return;
      activeNetwork = null;
      if (quickSearchNetwork === network) quickSearchNetwork = null;
      quickSearchConnecting = false;
      const rollbackGeneration = networkFlows.begin();
      await network.leaveRoom().catch(() => undefined);
      network.disconnect();
      if (!networkFlows.isCurrent(rollbackGeneration)) return;
      syncQuickSearchClockSound();
      failed = true;
      failure = error;
    } finally {
      hideLoadingOverlay();
    }

    if (!failed) return;
    clearRoomScreen();
    clearRoomBadge();
    renderHome();
    throw failure;
  })();
  networkGameMounting = mounting;
  try {
    await mounting;
  } finally {
    if (networkGameMounting === mounting) {
      networkGameMounting = null;
      networkGameMountOwner = null;
    }
  }
};

const renderRoomScreen = (network: NetworkService, state: RoomState): void => {
  clearLobby();
  clearRoomScreen();
  renderLanguageControls();
  ensureMenuDiceScene();

  const screen = document.createElement('div');
  screen.id = 'room-screen';
  screen.classList.add('text-selection-allowed');
  Object.assign(screen.style, {
    position: 'fixed',
    inset: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: APP_BACKGROUND_OVERLAY,
    zIndex: '20',
    fontFamily: FONT_FAMILY.ui,
    color: '#eee',
  } satisfies Partial<CSSStyleDeclaration>);
  screen.addEventListener('click', (event) => {
    if (event.target === screen) returnToLobby();
  });

  const panel = document.createElement('div');
  panel.classList.add('responsive-ui-content');
  Object.assign(panel.style, {
    width: 'min(460px, calc(100vw - 32px))',
    padding: '22px',
    background: APP_PANEL_BACKGROUND,
    borderRadius: UI_RADIUS,
    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  } satisfies Partial<CSSStyleDeclaration>);
  panel.addEventListener('click', (event) => event.stopPropagation());

  const title = document.createElement('div');
  title.textContent = `${state.gameName || t('room')} · ${state.code}`;
  Object.assign(title.style, {
    fontSize: FONT_SIZE.roomTitle,
    fontWeight: '700',
  } satisfies Partial<CSSStyleDeclaration>);
  panel.appendChild(title);

  const status = document.createElement('div');
  status.textContent =
    state.ownerId === network.getUserId()
      ? t('roomOwner')
      : t('waitingForStart');
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
    borderRadius: UI_RADIUS,
    color: '#d8d8e8',
    fontSize: FONT_SIZE.roomMeta,
  } satisfies Partial<CSSStyleDeclaration>);
  panel.appendChild(options);

  panel.appendChild(
    memberSection(t('players'), state, ROOM_ROLE.PLAYER, network.getUserId()),
  );
  panel.appendChild(
    memberSection(
      t('spectators'),
      state,
      ROOM_ROLE.SPECTATOR,
      network.getUserId(),
    ),
  );
  const players = state.members.filter((m) => m.role === ROOM_ROLE.PLAYER);

  const error = document.createElement('div');
  Object.assign(error.style, {
    color: '#f66',
    fontSize: FONT_SIZE.roomMeta,
    minHeight: '18px',
  } satisfies Partial<CSSStyleDeclaration>);

  const startBtn = createMenuFrameButton(t('startGame'), () => {
    startBtn.disabled = true;
    network
      .startRoom()
      .then((next) => {
        handleRoomState(network, next);
      })
      .catch((err: Error) => {
        startBtn.disabled = false;
        error.textContent = err.message;
      });
  });
  startBtn.disabled =
    state.ownerId !== network.getUserId() || players.length < 2;
  panel.appendChild(startBtn);
  panel.appendChild(error);

  screen.appendChild(panel);
  document.body.appendChild(screen);
  applyMobileModalLayer(screen, panel);
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
  if (role === ROOM_ROLE.PLAYER) {
    heading.textContent = `${title} (${members.length}/${CUSTOM_ROOM_PLAYER_LIMIT})`;
  }
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
      row.append(createNicknameSpan(formatMember(member.displayName, member.userId, ownUserId)));
      Object.assign(row.style, {
        padding: '6px 8px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: UI_RADIUS,
        color: '#eee',
      } satisfies Partial<CSSStyleDeclaration>);
      list.appendChild(row);
    }
  }
  wrap.appendChild(list);
  return wrap;
};

const formatMember = (
  displayName: string,
  userId: string,
  ownUserId: string | null,
): string => {
  const name =
    displayName || (userId.length <= 8 ? userId : userId.slice(0, 8));
  return userId === ownUserId ? `${name} (${t('youSuffix')})` : name;
};

const roomModeLabel = (_mode: RoomMode): string => t('match');

const roomOptionsLabel = (
  options: RoomOptionsPayload = DEFAULT_ROOM_OPTIONS,
): string => {
  const minBank = options.minBank > 0 ? options.minBank : t('noValue');
  return `${t('target')}: ${options.targetScore} · ${t('minBank')}: ${minBank} · ${t(
    'hotDice',
  )}: ${t('enabled')}`;
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
    case 'surrender':
      return t('surrenderAction');
    case 'showRules':
      return t('showRules');
  }
};

const renderSettingsContent = (card: HTMLElement): void => {
  const current = getPlayerSettings();
  const showControlBindings = !mobileRuntime;
  let draftControls: ControlBindings = { ...current.controls };
  let draftGameplay: GameplaySettings = { ...current.gameplay };
  let draftProfile: PlayerProfileSettings = { ...current.profile };
  let draftAudio: AudioSettings = { ...current.audio };
  let capturing: ControlAction | null = null;
  const rowButtons = new Map<ControlAction, HTMLButtonElement>();

  appendSectionTitle(card, t('soundSettings'));
  const soundSlidersHost = document.createElement('div');
  card.appendChild(soundSlidersHost);

  if (showControlBindings) {
    appendSectionTitle(card, t('controlsTitle'));
    const rows = document.createElement('div');
    Object.assign(rows.style, {
      display: 'grid',
      gap: scaledPx(8),
    } satisfies Partial<CSSStyleDeclaration>);

    for (const action of CONTROL_ACTIONS) {
      const row = button('', () => {
        capturing = action;
        renderRows();
      });
      Object.assign(row.style, {
        width: '100%',
        justifyContent: 'space-between',
        background: SETTINGS_BUTTON_BG,
        border: '1px solid rgba(255,255,255,0.18)',
      } satisfies Partial<CSSStyleDeclaration>);
      rowButtons.set(action, row);
      rows.appendChild(row);
    }
    card.appendChild(rows);
  }

  appendSectionTitle(card, t('gameplaySettings'));
  const autoRollBtn = button('', () => {
    applyDraft(
      draftControls,
      {
        ...draftGameplay,
        autoRollAfterContinue: !draftGameplay.autoRollAfterContinue,
      },
      draftProfile,
      draftAudio,
    );
  });
  Object.assign(autoRollBtn.style, {
    width: '100%',
    justifyContent: 'space-between',
    background: SETTINGS_BUTTON_BG,
    border: '1px solid rgba(255,255,255,0.18)',
  } satisfies Partial<CSSStyleDeclaration>);
  autoRollBtn.setAttribute('role', 'switch');
  card.appendChild(autoRollBtn);

  const error = appendLobbyError(card);
  const actions = document.createElement('div');
  Object.assign(actions.style, {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  } satisfies Partial<CSSStyleDeclaration>);

  const resetBtn = createMenuFrameButton(t('resetDefaults'), () => {
    capturing = null;
    const reset = applyDraft(
      showControlBindings ? { ...DEFAULT_PLAYER_SETTINGS.controls } : draftControls,
      { ...DEFAULT_PLAYER_SETTINGS.gameplay },
      draftProfile,
      { ...DEFAULT_PLAYER_SETTINGS.audio },
    );
    if (reset) renderSoundSliders();
  });
  actions.appendChild(resetBtn);

  card.appendChild(actions);

  const keyListener = (event: KeyboardEvent): void => {
    if (!capturing) return;
    event.preventDefault();
    event.stopPropagation();
    if (!isAcceptedControlCode(event.code)) {
      error.textContent = t('invalidControlKey');
      return;
    }
    const action = capturing;
    const nextControls = { ...draftControls, [action]: event.code };
    capturing = null;
    if (!applyDraft(nextControls, draftGameplay, draftProfile, draftAudio))
      capturing = action;
  };

  function applyDraft(
    nextControls: ControlBindings,
    nextGameplay: GameplaySettings,
    nextProfile: PlayerProfileSettings,
    nextAudio: AudioSettings,
  ): boolean {
    const settings: PlayerSettings = {
      version: 1,
      controls: { ...nextControls },
      gameplay: { ...nextGameplay },
      profile: { ...nextProfile },
      audio: { ...nextAudio },
    };
    const validation = validatePlayerSettings(settings);
    if (!validation.valid) {
      error.textContent = t('duplicateControls');
      return false;
    }
    draftControls = { ...nextControls };
    draftGameplay = { ...nextGameplay };
    draftProfile = { ...nextProfile };
    draftAudio = { ...nextAudio };
    savePlayerSettings(settings).catch((err: Error) => {
      error.textContent = err.message;
    });
    renderRows();
    return true;
  }

  function renderSoundSliders(): void {
    soundSlidersHost.replaceChildren(
      createSoundSliders(draftAudio, (nextAudio) => {
        applyDraft(draftControls, draftGameplay, draftProfile, nextAudio);
      }),
    );
  }

  function renderRows(): void {
    for (const action of CONTROL_ACTIONS) {
      const row = rowButtons.get(action);
      if (!row) continue;
      row.textContent =
        capturing === action
          ? `${controlActionLabel(action)}: ${t('pressKey')}`
          : `${controlActionLabel(action)}: ${controlCodeLabel(draftControls[action])}`;
    }

    autoRollBtn.textContent = `${t('autoRollAfterContinue')}: ${
      draftGameplay.autoRollAfterContinue ? t('settingOn') : t('settingOff')
    }`;
    autoRollBtn.setAttribute(
      'aria-checked',
      String(draftGameplay.autoRollAfterContinue),
    );
    autoRollBtn.style.borderColor = draftGameplay.autoRollAfterContinue
      ? 'rgba(255,255,255,0.28)'
      : 'rgba(255,255,255,0.14)';
    autoRollBtn.style.color = draftGameplay.autoRollAfterContinue
      ? '#f4f4f5'
      : 'rgba(216,216,232,0.68)';
    const settings: PlayerSettings = {
      version: 1,
      controls: { ...draftControls },
      gameplay: { ...draftGameplay },
      profile: { ...draftProfile },
      audio: { ...draftAudio },
    };
    const validation = validatePlayerSettings(settings);
    error.textContent = validation.valid ? '' : t('duplicateControls');
  }

  if (showControlBindings) {
    window.addEventListener('keydown', keyListener, true);
    settingsScreenCleanup = () => {
      window.removeEventListener('keydown', keyListener, true);
    };
  }
  renderSoundSliders();
  renderRows();
};

const renderSettingsModal = (): void => {
  closeGamePopups();
  clearSettingsModal();

  const overlay = document.createElement('div');
  overlay.id = SETTINGS_MODAL_ID;
  if (!activeGame) overlay.classList.add('text-selection-allowed');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: APP_BACKGROUND_OVERLAY,
    zIndex: '40',
    fontFamily: FONT_FAMILY.ui,
  } satisfies Partial<CSSStyleDeclaration>);

  const panel = document.createElement('div');
  panel.classList.add('responsive-ui-content');
  Object.assign(panel.style, {
    width: 'min(520px, calc(100vw - 32px))',
    maxHeight: 'calc(100vh - 32px)',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: scaledPx(12),
    padding: scaledPx(22),
    background: APP_PANEL_BACKGROUND,
    color: '#eee',
    borderRadius: UI_RADIUS,
    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
  } satisfies Partial<CSSStyleDeclaration>);

  const title = appendTitle(panel, t('settings'));
  title.style.textAlign = 'center';
  const close = (): void => clearSettingsModal();
  renderSettingsContent(panel);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
  panel.addEventListener('click', (event) => event.stopPropagation());
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  applyMobileModalLayer(overlay, panel);
};

const createLobbyFrame = (
  widthPx = 340,
  onBackdropClick?: () => void,
): HTMLDivElement => {
  clearLobby();
  clearRoomBadge();
  const chromeFree = currentLobbyView === 'home';
  const mobileTwaHome = mobileRuntime && twaRuntime && chromeFree;
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
    background: chromeFree ? 'transparent' : APP_BACKGROUND_OVERLAY,
    zIndex: '20',
  } satisfies Partial<CSSStyleDeclaration>);
  if (mobileTwaHome) {
    lobby.classList.add('mobile-twa-home-lobby');
    Object.assign(lobby.style, {
      justifyContent: 'flex-end',
      gap: '0',
      padding: '8px max(24px, env(safe-area-inset-right)) max(20px, env(safe-area-inset-bottom)) max(24px, env(safe-area-inset-left))',
      boxSizing: 'border-box',
    } satisfies Partial<CSSStyleDeclaration>);
  }

  if (onBackdropClick) {
    lobby.addEventListener('click', (event) => {
      if (event.target === lobby) onBackdropClick();
    });
  }

  const content = document.createElement('div');
  content.classList.add('responsive-ui-content');
  Object.assign(content.style, {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: scaledPx(22),
  } satisfies Partial<CSSStyleDeclaration>);
  if (mobileTwaHome) {
    content.classList.remove('responsive-ui-content');
    Object.assign(content.style, {
      width: '100%',
      gap: '7px',
    } satisfies Partial<CSSStyleDeclaration>);
  }

  const card = document.createElement('div');
  Object.assign(card.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: chromeFree ? '20px' : scaledPx(12),
    padding: chromeFree ? '0' : scaledPx(24),
    width: chromeFree ? 'auto' : scaledPx(widthPx),
    maxWidth: 'calc(100vw - 32px)',
    boxSizing: 'border-box',
    background: chromeFree ? 'transparent' : APP_PANEL_BACKGROUND,
    borderRadius: chromeFree ? '0' : UI_RADIUS,
    color: '#eee',
    fontFamily: FONT_FAMILY.ui,
    fontSize: FONT_SIZE.card,
    boxShadow: chromeFree ? 'none' : '0 12px 32px rgba(0,0,0,0.5)',
  } satisfies Partial<CSSStyleDeclaration>);
  if (mobileTwaHome) {
    Object.assign(card.style, {
      width: '362px',
      maxWidth: '100%',
      gap: '7px',
    } satisfies Partial<CSSStyleDeclaration>);
  }
  if (onBackdropClick) {
    card.addEventListener('click', (event) => event.stopPropagation());
  }

  content.appendChild(card);
  lobby.appendChild(content);
  document.body.appendChild(lobby);
  return card;
};

const appendBrand = (card: HTMLElement): void => {
  if (mobileRuntime && !twaRuntime) return;
  const brand = document.createElement('img');
  brand.id = 'main-logo';
  brand.src = MAIN_LOGO_SRC;
  brand.alt = 'Farklepit';
  brand.draggable = false;
  Object.assign(brand.style, {
    display: 'block',
    width: mobileRuntime ? '300px' : '741px',
    height: mobileRuntime ? '102px' : '251px',
    maxWidth: 'calc(100vw - 32px)',
    objectFit: 'contain',
    pointerEvents: 'none',
    userSelect: 'none',
  } satisfies Partial<CSSStyleDeclaration>);
  card.parentElement?.insertBefore(brand, card);
};

const applyLoadingDotsLabel = (el: HTMLElement, label: string): void => {
  el.classList.add('loading-dots');
  const labelEl = document.createElement('span');
  labelEl.textContent = label;
  Object.assign(labelEl.style, {
    position: 'relative',
    zIndex: '1',
  } satisfies Partial<CSSStyleDeclaration>);
  el.replaceChildren(labelEl);
  for (let i = 0; i < 3; i += 1) {
    const dot = document.createElement('span');
    dot.className = 'loading-dot';
    dot.textContent = '.';
    Object.assign(dot.style, {
      position: 'relative',
      zIndex: '1',
    } satisfies Partial<CSSStyleDeclaration>);
    el.appendChild(dot);
  }
};

const appendTitle = (card: HTMLElement, text: string): HTMLHeadingElement => {
  const title = document.createElement('h2');
  title.textContent = text;
  Object.assign(title.style, {
    margin: '0',
    fontFamily: FONT_FAMILY.title,
    fontSize: FONT_SIZE.title,
    lineHeight: '1.2',
  } satisfies Partial<CSSStyleDeclaration>);
  card.appendChild(title);
  return title;
};

const appendLobbyError = (card: HTMLElement): HTMLDivElement => {
  const error = document.createElement('div');
  error.id = 'lobby-error';
  Object.assign(error.style, {
    color: '#f66',
    fontSize: FONT_SIZE.error,
    minHeight:
      mobileRuntime && twaRuntime && currentLobbyView === 'home'
        ? '0'
        : scaledPx(16),
    textAlign: 'center',
  } satisfies Partial<CSSStyleDeclaration>);
  card.appendChild(error);
  return error;
};

const applyLargeMenuButtonStyle = (element: HTMLElement): void => {
  Object.assign(element.style, {
    fontSize: FONT_SIZE.menuButton,
    padding: '0',
    height: UI_SIZE.menuButtonHeight,
    width: '345px',
    alignSelf: 'center',
  } satisfies Partial<CSSStyleDeclaration>);
};

const createMenuFrameButton = (
  label: string,
  onClick: () => void,
): HTMLButtonElement => {
  const btn = button(label, onClick);
  btn.classList.add('menu-frame-button');
  const text = document.createElement('span');
  text.textContent = label;
  Object.assign(text.style, {
    position: 'relative',
    zIndex: '1',
  } satisfies Partial<CSSStyleDeclaration>);
  btn.replaceChildren(text);
  applyLargeMenuButtonStyle(btn);
  return btn;
};

const appendMenuButton = (
  card: HTMLElement,
  label: string,
  onClick: () => void,
): HTMLButtonElement => {
  const btn = createMenuFrameButton(label, onClick);
  card.appendChild(btn);
  return btn;
};

const appendMenuDownloadLink = (
  card: HTMLElement,
  label: string,
  href: string,
  fileName: string,
): HTMLAnchorElement => {
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  link.title = label;
  link.setAttribute('aria-label', label);
  link.classList.add('menu-frame-button');
  Object.assign(link.style, {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
  } satisfies Partial<CSSStyleDeclaration>);
  const text = document.createElement('span');
  text.textContent = label;
  Object.assign(text.style, {
    position: 'relative',
    zIndex: '1',
  } satisfies Partial<CSSStyleDeclaration>);
  link.appendChild(text);
  applyLargeMenuButtonStyle(link);
  card.appendChild(link);
  return link;
};

const createSmallMenuButton = (
  label: string,
  onClick: () => void,
): HTMLButtonElement => {
  const btn = document.createElement('button');
  btn.title = label;
  btn.setAttribute('aria-label', label);
  Object.assign(btn.style, {
    position: 'relative',
    width: `${SMALL_MENU_BUTTON_WIDTH}px`,
    height: `${SMALL_MENU_BUTTON_HEIGHT}px`,
    padding: '0',
    background: `url("${BUTTON_S_SRC}") center / ${SMALL_MENU_BUTTON_WIDTH}px ${SMALL_MENU_BUTTON_HEIGHT}px no-repeat`,
    border: 'none',
    borderRadius: '0',
    color: '#fff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: FONT_FAMILY.ui,
    fontSize: '16px',
    lineHeight: '1',
    boxSizing: 'border-box',
    alignSelf: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  } satisfies Partial<CSSStyleDeclaration>);
  const overlay = document.createElement('span');
  Object.assign(overlay.style, {
    position: 'absolute',
    inset: '0',
    background: `url("${BUTTON_S_OVERLAY_SRC}") center / 119px 32px no-repeat`,
    opacity: '0',
    pointerEvents: 'none',
    transition: 'opacity 180ms ease',
  } satisfies Partial<CSSStyleDeclaration>);
  const text = document.createElement('span');
  text.textContent = label;
  Object.assign(text.style, {
    position: 'relative',
    zIndex: '1',
    maxWidth: '112px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } satisfies Partial<CSSStyleDeclaration>);
  btn.replaceChildren(overlay, text);
  btn.addEventListener('mouseenter', () => {
    overlay.style.opacity = '1';
  });
  btn.addEventListener('mouseleave', () => {
    overlay.style.opacity = '0';
  });
  btn.addEventListener('focus', () => {
    overlay.style.opacity = '1';
  });
  btn.addEventListener('blur', () => {
    overlay.style.opacity = '0';
  });
  bindMouseOnlyClick(btn, onClick);
  return btn;
};

// const appendDisabledMenuButton = (card: HTMLElement, label: string): HTMLButtonElement => {
//   const btn = button(`${label} · ${t('comingSoon')}`, () => undefined);
//   applyLargeMenuButtonStyle(btn);
//   btn.disabled = true;
//   Object.assign(btn.style, {
//     background: '#2b2b33',
//     color: '#8e8e9d',
//     border: '1px solid rgba(255,255,255,0.08)',
//   } satisfies Partial<CSSStyleDeclaration>);
//   card.appendChild(btn);
//   return btn;
// };

const appendSectionTitle = (
  card: HTMLElement,
  text: string,
): HTMLDivElement => {
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
  const backBtn = createMenuFrameButton(t('back'), onClick);
  card.appendChild(backBtn);
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

const goHome = (): void => {
  networkFlows.invalidate();
  closeLobbyListNetwork();
  renderHome();
};

const renderOfflineScreen = (): void => {
  if (activeGame || offlineScreenActive) return;
  offlineScreenActive = true;
  currentLobbyView = 'offline';
  networkFlows.invalidate();
  cancelQuickSearch({ render: false });
  closeLobbyListNetwork();
  activeNetwork?.disconnect();
  activeNetwork = null;
  destroyMenuDiceScene();
  clearMobileOrientationGate();
  clearLobby();
  clearRoomScreen();
  clearRoomBadge();
  clearLanguageControls();
  clearRoomListModal();
  clearRoomPasswordModal();
  clearTopPopupLayer();
  app.replaceChildren();

  const screen = document.createElement('main');
  screen.id = 'offline-screen';
  Object.assign(screen.style, {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: '24px',
    boxSizing: 'border-box',
    background: APP_BACKGROUND_COLOR,
    color: '#f4f4f5',
    fontFamily: FONT_FAMILY.ui,
    textAlign: 'center',
  } satisfies Partial<CSSStyleDeclaration>);

  const content = document.createElement('div');
  Object.assign(content.style, {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px',
    maxWidth: '28ch',
  } satisfies Partial<CSSStyleDeclaration>);
  const title = document.createElement('h1');
  title.textContent = t('offlineTitle');
  Object.assign(title.style, {
    margin: '0',
    fontFamily: FONT_FAMILY.title,
    fontSize: 'clamp(32px, 7vw, 56px)',
    lineHeight: '1.05',
  } satisfies Partial<CSSStyleDeclaration>);
  const description = document.createElement('p');
  description.textContent = t('offlineDescription');
  Object.assign(description.style, {
    margin: '0',
    color: '#d4d4d8',
    fontSize: '18px',
    lineHeight: '1.35',
  } satisfies Partial<CSSStyleDeclaration>);
  const retry = button(t('offlineRetry'), () => {
    if (navigator.onLine) renderHome();
  });
  content.append(title, description, retry);
  screen.appendChild(content);
  app.appendChild(screen);
};

const renderHome = (): void => {
  if (!navigator.onLine) {
    renderOfflineScreen();
    return;
  }
  if (offlineScreenActive) {
    offlineScreenActive = false;
    app.replaceChildren();
  }
  if (androidApkLanding) {
    renderAndroidApkLanding();
    return;
  }
  if (isMobilePortrait()) {
    showMobileOrientationGate();
    return;
  }
  clearMobileOrientationGate();
  clearRoomPasswordModal();
  if (!hasSavedDisplayName()) {
    renderPlayerNameEntry();
    return;
  }
  renderLobby();
};

const renderAndroidApkLanding = (): void => {
  currentLobbyView = 'home';
  clearLanguageControls();
  destroyMenuDiceScene();
  const card = createLobbyFrame(380);
  appendMenuDownloadLink(
    card,
    t('installGame'),
    ANDROID_APK_DOWNLOAD_URL,
    'farklepit-android.apk',
  ).dataset.uiClickSound = 'none';
};

const renderPlayerNameEntry = (): void => {
  currentLobbyView = 'player-name';
  renderLanguageControls();
  const card = createLobbyFrame(380);
  appendBrand(card);
  ensureMenuDiceScene();
  appendTitle(card, t('playerNamePrompt'));

  const nameInput = textInput(t('displayName'));
  nameInput.maxLength = 32;
  card.appendChild(nameInput);

  const continueBtn = button(t('continueButton'), submitName);
  card.appendChild(continueBtn);
  appendLobbyError(card);

  function submitName(): void {
    if (!nameInput.value.trim()) {
      showError(new Error(t('displayNameRequired')));
      return;
    }
    saveDisplayName(nameInput.value);
    renderHome();
  }

  nameInput.addEventListener('keydown', (event) => {
    if (event.code !== 'Enter') return;
    event.preventDefault();
    submitName();
  });
  nameInput.focus();
};

const renderLobby = (): void => {
  if (androidApkLanding) {
    renderAndroidApkLanding();
    return;
  }
  currentLobbyView = 'home';
  renderLanguageControls();
  const card = createLobbyFrame(380);
  appendBrand(card);
  ensureMenuDiceScene();

  const quickSearching = isQuickSearchActive();
  appendMenuButton(card, t('singleplayerGame'), () =>
    startLocalMatch(createLocalMatchConfig(DEFAULT_ROOM_OPTIONS)).catch(
      showError,
    ),
  );
  const quickBtn = appendMenuButton(
    card,
    quickSearching ? t('quickSearchCancel') : t('quickGame'),
    quickSearching
      ? cancelQuickSearch
      : () => startQuickMatch().catch(showError),
  );
  if (quickSearching) {
    quickBtn.classList.add('menu-frame-button-danger');
    applyLoadingDotsLabel(quickBtn, t('quickSearchCancel'));
  }
  appendMenuButton(card, t('createRoomMenu'), openCreateRoomMenu).dataset.uiClickSound = 'none';
  appendMenuButton(card, t('joinRoom'), openMultiplayerJoin).dataset.uiClickSound = 'none';
  appendLobbyError(card);
};

const renderCreateRoomMenu = (): void => {
  renderMultiplayerCreate();
};

const playMenuPopupOpenSound = (): void => {
  audioService.play('ui-settings-open');
};

const openCreateRoomMenu = (): void => {
  playMenuPopupOpenSound();
  renderCreateRoomMenu();
};

const openMultiplayerCreate = (): void => {
  playMenuPopupOpenSound();
  renderMultiplayerCreate();
};

const openMultiplayerJoin = (): void => {
  playMenuPopupOpenSound();
  renderMultiplayerJoin();
};

const renderMultiplayerMenu = (): void => {
  cancelQuickSearch({ render: false });
  networkFlows.begin();
  currentLobbyView = 'multiplayer';
  destroyMenuDiceScene();
  renderLanguageControls();
  const card = createLobbyFrame(420);
  appendTitle(card, t('multiplayer'));

  // appendSectionTitle(card, t('quickGame'));
  // appendDisabledMenuButton(card, t('normalMode'));
  // appendDisabledMenuButton(card, t('hardcoreMode'));
  appendSectionTitle(card, t('room'));
  appendMenuButton(card, t('createRoomAction'), openMultiplayerCreate).dataset.uiClickSound = 'none';
  appendMenuButton(card, t('joinRoom'), openMultiplayerJoin).dataset.uiClickSound = 'none';
  appendBackTo(card, renderCreateRoomMenu);
};

const renderMultiplayerCreate = (): void => {
  cancelQuickSearch({ render: false });
  networkFlows.begin();
  currentLobbyView = 'create-room';
  renderLanguageControls();
  ensureMenuDiceScene();
  const card = createLobbyFrame(460, goHome);
  appendTitle(card, t('createRoomAction'));

  const gameNameInput = textInput(t('gameName'));
  gameNameInput.maxLength = 40;
  const baseName = getSavedDisplayName() || 'Player';
  gameNameInput.value = `${baseName} game`;
  card.appendChild(gameNameInput);

  const passwordInput = textInput(t('roomPassword'));
  passwordInput.maxLength = 64;
  passwordInput.type = 'password';
  card.appendChild(labeledControl(t('roomPassword'), passwordInput));

  const { roomOptionsValue } = createRoomOptionsControls(card);

  const generatedCodeInput = textInput(t('roomCode'));
  generatedCodeInput.value = t('generatedAfterCreate');
  generatedCodeInput.disabled = true;
  generatedCodeInput.style.color = '#8e8e9d';
  card.appendChild(labeledControl(t('roomCode'), generatedCodeInput));

  appendLobbyError(card);
  const createBtn = createMenuFrameButton(t('createGame'), () => {
    const gameName = gameNameInput.value.trim();
    if (!gameName) {
      showError(new Error(t('gameNameRequired')));
      return;
    }
    startNetwork(
      'create',
      undefined,
      ROOM_MODE.MATCH,
      roomOptionsValue(),
      gameName,
      passwordInput.value,
    ).catch(showError);
  });
  card.appendChild(createBtn);
};

const renderMultiplayerJoin = (): void => {
  cancelQuickSearch({ render: false });
  const viewGeneration = networkFlows.begin();
  currentLobbyView = 'multiplayer-join';
  renderLanguageControls();
  ensureMenuDiceScene();

  closeLobbyListNetwork();
  let tempNetwork: NetworkService | null = null;
  let networkPromise: Promise<NetworkService> | null = null;
  let loadedRooms: RoomListItem[] = [];
  const closeJoinPopup = (): void => {
    if (networkFlows.isCurrent(viewGeneration)) networkFlows.invalidate();
    closeLobbyListNetwork();
    tempNetwork = null;
    networkPromise = null;
    renderHome();
  };

  const card = createLobbyFrame(900, closeJoinPopup);
  appendTitle(card, t('joinRoom'));

  const layout = document.createElement('div');
  Object.assign(layout.style, {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(240px, 300px)',
    gap: scaledPx(18),
    alignItems: 'start',
  } satisfies Partial<CSSStyleDeclaration>);

  const listPanel = document.createElement('div');
  Object.assign(listPanel.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: scaledPx(10),
    minHeight: scaledPx(320),
  } satisfies Partial<CSSStyleDeclaration>);

  const listHeader = document.createElement('div');
  Object.assign(listHeader.style, {
    display: 'flex',
    justifyContent: 'space-between',
    gap: scaledPx(10),
    alignItems: 'center',
  } satisfies Partial<CSSStyleDeclaration>);
  const listTitle = document.createElement('div');
  listTitle.textContent = t('lobbies');
  listTitle.style.fontWeight = '700';
  listHeader.appendChild(listTitle);
  const refreshBtn = createSmallMenuButton(t('refresh'), () => refreshRooms());
  listHeader.appendChild(refreshBtn);
  listPanel.appendChild(listHeader);

  const roomRows = document.createElement('div');
  Object.assign(roomRows.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: scaledPx(8),
    minHeight: scaledPx(260),
  } satisfies Partial<CSSStyleDeclaration>);
  listPanel.appendChild(roomRows);

  const filterInput = textInput(t('filterByName'));
  listPanel.appendChild(labeledControl(t('filterByName'), filterInput));
  filterInput.addEventListener('input', () => renderRows());
  layout.appendChild(listPanel);

  const codePanel = document.createElement('div');
  Object.assign(codePanel.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: scaledPx(10),
    padding: scaledPx(14),
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: UI_RADIUS,
  } satisfies Partial<CSSStyleDeclaration>);
  const codeInput = roomCodeInput();
  const roomCodeControlWidth = '240px';
  const codeControl = labeledControl(t('roomCode'), codeInput);
  Object.assign(codeControl.style, {
    width: roomCodeControlWidth,
    maxWidth: '100%',
    alignSelf: 'center',
  } satisfies Partial<CSSStyleDeclaration>);
  Object.assign(codeInput.style, {
    width: '100%',
  } satisfies Partial<CSSStyleDeclaration>);
  codePanel.appendChild(codeControl);
  const codeJoinBtn = createMenuFrameButton(t('joinByCode'), () => {
    const code = codeInput.value.trim().toUpperCase();
    if (!code) return;
    joinByCode(code, undefined, codeJoinBtn);
  });
  codeJoinBtn.classList.add('menu-frame-button-fit');
  codeJoinBtn.style.setProperty('--menu-frame-button-fit-width', roomCodeControlWidth);
  codePanel.appendChild(codeJoinBtn);
  layout.appendChild(codePanel);
  card.appendChild(layout);

  appendLobbyError(card);

  const ensureNetwork = (): Promise<NetworkService> => {
    if (!networkFlows.isCurrent(viewGeneration)) {
      return Promise.reject(new StaleNetworkFlowError());
    }
    if (tempNetwork) {
      networkFlows.assert(viewGeneration, tempNetwork);
      return Promise.resolve(tempNetwork);
    }
    if (networkPromise) return networkPromise;
    const pending = connectNetwork(viewGeneration)
      .then((network) => {
        networkFlows.assert(viewGeneration, network);
        tempNetwork = network;
        lobbyListNetwork = network;
        return network;
      })
      .finally(() => {
        if (networkPromise === pending) networkPromise = null;
      });
    networkPromise = pending;
    return pending;
  };

  function enterRoom(network: NetworkService, state: RoomState): void {
    networkFlows.preserve(viewGeneration, network);
    activeNetwork = network;
    tempNetwork = null;
    lobbyListNetwork = null;
    clearLobby();
    handleRoomState(network, state);
  }

  function joinByCode(
    code: string,
    password: string | undefined,
    clicked: HTMLButtonElement,
  ): void {
    clicked.disabled = true;
    ensureNetwork()
      .then((network) =>
        network
          .joinRoom(code, password)
          .then((state) => {
            if (!networkFlows.isCurrent(viewGeneration)) {
              network.disconnect();
              throw new StaleNetworkFlowError();
            }
            enterRoom(network, state);
          }),
      )
      .catch((error: Error) => {
        if (
          !networkFlows.isCurrent(viewGeneration) ||
          isStaleNetworkFlowError(error)
        ) return;
        clicked.disabled = false;
        if (error.message.startsWith('BAD_PASSWORD')) {
          openRoomPasswordModal(
            (password) => joinByCode(code, password, clicked),
            t('invalidRoomPassword'),
          );
          return;
        }
        showError(error);
      });
  }

  function renderRows(): void {
    roomRows.replaceChildren();
    const query = filterInput.value.trim().toLocaleLowerCase();
    const rooms = query
      ? loadedRooms.filter((room) =>
          room.gameName.toLocaleLowerCase().includes(query),
        )
      : loadedRooms;
    if (rooms.length === 0) {
      roomRows.textContent = t('noRooms');
      return;
    }
    for (const room of rooms) {
      const row = document.createElement('div');
      Object.assign(row.style, {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        gap: scaledPx(10),
        alignItems: 'center',
        padding: scaledPx(10),
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: UI_RADIUS,
      } satisfies Partial<CSSStyleDeclaration>);
      const meta = document.createElement('div');
      meta.append(
        document.createTextNode(
          `${room.hasPassword ? `[${t('locked')}] ` : ''}${room.gameName} · ${
            room.playerCount
          }/${CUSTOM_ROOM_PLAYER_LIMIT} · `,
        ),
        createNicknameSpan(room.ownerDisplayName),
      );
      meta.style.overflow = 'hidden';
      meta.style.textOverflow = 'ellipsis';
      meta.style.whiteSpace = 'nowrap';
      row.appendChild(meta);

      const joinBtn = button(t('join'), () => {
        if (room.hasPassword) {
          openRoomPasswordModal((password) => joinByCode(room.code, password, joinBtn));
          return;
        }
        joinByCode(room.code, undefined, joinBtn);
      });
      row.appendChild(joinBtn);
      roomRows.appendChild(row);
    }
  }

  function refreshRooms(): void {
    refreshBtn.disabled = true;
    roomRows.textContent = t('connecting');
    ensureNetwork()
      .then((network) => network.listRooms())
      .then((rooms) => {
        if (!networkFlows.isCurrent(viewGeneration)) return;
        loadedRooms = rooms;
        renderRows();
      })
      .catch((error: unknown) => {
        if (
          networkFlows.isCurrent(viewGeneration) &&
          !isStaleNetworkFlowError(error)
        ) showError(error);
      })
      .finally(() => {
        if (networkFlows.isCurrent(viewGeneration)) refreshBtn.disabled = false;
      });
  }

  refreshRooms();
};

const renderSettingsMenu = (): void => {
  currentLobbyView = 'settings';
  renderLanguageControls();
  ensureMenuDiceScene();
  const card = createLobbyFrame(520, goHome);
  const title = appendTitle(card, t('settings'));
  title.style.textAlign = 'center';
  renderSettingsContent(card);
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
    background: APP_BACKGROUND_COLOR,
    color: '#eee',
    borderRadius: UI_RADIUS,
    fontFamily: FONT_FAMILY.ui,
  } satisfies Partial<CSSStyleDeclaration>);
  return prepareMobileTextInput(input);
};

const numberInput = (
  value: number,
  min: number,
  max: number,
  step: number,
): HTMLInputElement => {
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

const labeledControl = (
  label: string,
  control: HTMLElement,
): HTMLLabelElement => {
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
    background: MENU_BUTTON_BG,
    color: '#fff',
    border: 'none',
    borderRadius: UI_RADIUS,
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

const openRoomPasswordModal = (
  onSubmit: (password: string) => void,
  initialError = '',
): void => {
  clearRoomPasswordModal();

  const overlay = document.createElement('div');
  overlay.id = ROOM_PASSWORD_MODAL_ID;
  overlay.classList.add('text-selection-allowed');
  overlay.setAttribute('role', 'presentation');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scaledPx(16),
    boxSizing: 'border-box',
    background: APP_BACKGROUND_OVERLAY,
    zIndex: '50',
    fontFamily: FONT_FAMILY.ui,
  } satisfies Partial<CSSStyleDeclaration>);

  const panel = document.createElement('form');
  panel.classList.add('responsive-ui-content');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', t('roomPassword'));
  Object.assign(panel.style, {
    width: 'min(380px, 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: scaledPx(12),
    padding: scaledPx(22),
    boxSizing: 'border-box',
    background: APP_PANEL_BACKGROUND,
    color: '#eee',
    borderRadius: UI_RADIUS,
    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
  } satisfies Partial<CSSStyleDeclaration>);

  appendTitle(panel, t('roomPassword'));
  const passwordInput = textInput(t('roomPassword'));
  passwordInput.type = 'password';
  passwordInput.name = 'room-password';
  passwordInput.autocomplete = 'current-password';
  passwordInput.maxLength = 64;
  panel.appendChild(labeledControl(t('roomPassword'), passwordInput));

  const error = document.createElement('div');
  error.textContent = initialError;
  error.setAttribute('aria-live', 'polite');
  Object.assign(error.style, {
    minHeight: scaledPx(16),
    color: '#f66',
    fontSize: FONT_SIZE.error,
  } satisfies Partial<CSSStyleDeclaration>);
  panel.appendChild(error);

  const actions = document.createElement('div');
  Object.assign(actions.style, {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: scaledPx(8),
  } satisfies Partial<CSSStyleDeclaration>);
  const close = (): void => clearRoomPasswordModal();
  const cancel = button(t('close'), close);
  cancel.type = 'button';
  const submit = button(t('join'), () => undefined);
  submit.type = 'submit';
  actions.append(cancel, submit);
  panel.appendChild(actions);

  panel.addEventListener('submit', (event) => {
    event.preventDefault();
    const password = passwordInput.value;
    if (!password) {
      error.textContent = t('roomPasswordRequired');
      passwordInput.focus();
      return;
    }
    clearRoomPasswordModal();
    onSubmit(password);
  });
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  applyMobileModalLayer(overlay, panel);
  passwordInput.focus();
};

const showError = (err: unknown): void => {
  const el = document.getElementById('lobby-error');
  if (el) el.textContent = err instanceof Error ? err.message : String(err);
};

onLanguageChange(() => {
  const openPopup = document.getElementById(PROFILE_POPUP_ID)
    ? 'profile'
    : document.getElementById(SETTINGS_MODAL_ID)
      ? 'settings'
      : null;
  rerenderCurrentShell();
  rerenderOpenTopPopup(openPopup);
  runLanguageMatrixAnimation();
});
if (mobileRuntime) {
  window.addEventListener('resize', syncMobileOrientation);
  window.addEventListener('orientationchange', syncMobileOrientation);
}
window.addEventListener('offline', () => {
  if (!activeGame) renderOfflineScreen();
});
window.addEventListener('online', () => {
  if (!activeGame && offlineScreenActive) renderHome();
});
window.addEventListener('pointerdown', closeDropdownsOnOutsidePointer, true);
window.addEventListener(TOP_MENU_DROPDOWN_CLOSE_EVENT, () => closeTopMenuDropdowns());
window.addEventListener('keydown', (event) => {
  if (
    event.code === 'KeyS' &&
    !event.repeat &&
    !event.defaultPrevented &&
    !isInteractiveKeyboardTarget(event.target) &&
    (currentLobbyView === 'settings' || canOpenMainMenuSettings())
  ) {
    event.preventDefault();
    toggleSettingsMenu();
    return;
  }
  if (event.code !== 'Escape' || event.repeat || event.defaultPrevented) return;
  if (isQuickSearchActive()) {
    event.preventDefault();
    cancelQuickSearch();
    return;
  }
  if (document.getElementById(ROOM_PASSWORD_MODAL_ID)) {
    event.preventDefault();
    clearRoomPasswordModal();
    return;
  }
  if (document.getElementById(SETTINGS_MODAL_ID)) {
    event.preventDefault();
    clearSettingsModal();
    return;
  }
  if (document.getElementById(PROFILE_POPUP_ID)) {
    event.preventDefault();
    clearProfilePopup();
    return;
  }
  if (!activeGame && currentLobbyView === 'settings') {
    event.preventDefault();
    goHome();
    return;
  }
  const roomState = activeNetwork?.getRoomState();
  if (!activeGame && roomState?.status === ROOM_STATUS.WAITING) {
    event.preventDefault();
    returnToLobby();
    return;
  }
  if (
    !activeGame &&
    (currentLobbyView === 'create-room' ||
      currentLobbyView === 'multiplayer-join')
  ) {
    event.preventDefault();
    goHome();
    return;
  }
  if (isInteractiveKeyboardTarget(event.target)) return;
});
loadPlayerSettings()
  .catch((err: Error) => {
    console.warn(`settings load failed: ${err.message}`);
  })
  .finally(() => {
    if (mobileRuntime) {
      if (!navigator.onLine) {
        renderOfflineScreen();
        return;
      }
      syncMobileOrientation();
      return;
    }
    renderLanguageControls();
    renderHome();
  });
