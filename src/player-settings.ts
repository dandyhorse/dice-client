import { normalizeAvatarIndex } from './avatars';

export const CONTROL_ACTIONS = [
  'throwDice',
  'selectAll',
  'continueTurn',
  'bankTurn',
  'surrender',
] as const;

export type ControlAction = (typeof CONTROL_ACTIONS)[number];
export type ControlBindings = Record<ControlAction, string>;

export interface GameplaySettings {
  autoRollAfterContinue: boolean;
}

export interface PlayerProfileSettings {
  avatarIndex: number;
}

export interface AudioSettings {
  masterVolume: number;
  effectsVolume: number;
  musicVolume: number;
  quickSearchClockEnabled: boolean;
}

export interface PlayerSettings {
  version: 1;
  controls: ControlBindings;
  gameplay: GameplaySettings;
  profile: PlayerProfileSettings;
  audio: AudioSettings;
}

export const DEFAULT_PLAYER_SETTINGS: PlayerSettings = {
  version: 1,
  controls: {
    throwDice: 'Space',
    selectAll: 'KeyF',
    continueTurn: 'KeyQ',
    bankTurn: 'KeyE',
    surrender: 'Escape',
  },
  gameplay: {
    autoRollAfterContinue: true,
  },
  profile: {
    avatarIndex: 0,
  },
  audio: {
    masterVolume: 1,
    effectsVolume: 1,
    musicVolume: 1,
    quickSearchClockEnabled: true,
  },
};

const GUEST_SETTINGS_KEY = 'dice.playerSettings.guest';
const ACCEPTED_KEY_CODE_RE = /^(Escape|Space|Key[A-Z]|Digit[0-9]|Numpad[0-9])$/;
const listeners = new Set<(settings: PlayerSettings) => void>();

let currentSettings: PlayerSettings = cloneSettings(DEFAULT_PLAYER_SETTINGS);

const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

function cloneSettings(settings: PlayerSettings): PlayerSettings {
  return {
    version: 1,
    controls: { ...settings.controls },
    gameplay: { ...settings.gameplay },
    profile: { ...settings.profile },
    audio: { ...settings.audio },
  };
}

export const isAcceptedControlCode = (code: unknown): code is string =>
  typeof code === 'string' && ACCEPTED_KEY_CODE_RE.test(code);

export const controlCodeLabel = (code: string): string => {
  if (code === 'Escape') return 'ESC';
  if (code === 'Space') return 'SPACE';
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) return `NUM ${code.slice(6)}`;
  return code.toUpperCase();
};

const normalizeVolume = (value: unknown, fallback: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(1, value));
};

export const normalizePlayerSettings = (value: unknown): PlayerSettings => {
  if (!isObject(value) || value.version !== 1 || !isObject(value.controls)) {
    return cloneSettings(DEFAULT_PLAYER_SETTINGS);
  }

  const controls = { ...DEFAULT_PLAYER_SETTINGS.controls };
  for (const action of CONTROL_ACTIONS) {
    const code = value.controls[action];
    if (code === undefined) {
      controls[action] = DEFAULT_PLAYER_SETTINGS.controls[action];
      continue;
    }
    if (!isAcceptedControlCode(code))
      return cloneSettings(DEFAULT_PLAYER_SETTINGS);
    controls[action] = code;
  }

  const gameplay = { ...DEFAULT_PLAYER_SETTINGS.gameplay };
  if (isObject(value.gameplay)) {
    const autoRollAfterContinue = value.gameplay.autoRollAfterContinue;
    if (typeof autoRollAfterContinue === 'boolean') {
      gameplay.autoRollAfterContinue = autoRollAfterContinue;
    }
  }

  const profile = { ...DEFAULT_PLAYER_SETTINGS.profile };
  if (isObject(value.profile)) {
    profile.avatarIndex = normalizeAvatarIndex(value.profile.avatarIndex);
  }

  const audio = { ...DEFAULT_PLAYER_SETTINGS.audio };
  if (isObject(value.audio)) {
    audio.masterVolume = normalizeVolume(
      value.audio.masterVolume,
      audio.masterVolume,
    );
    audio.effectsVolume = normalizeVolume(
      value.audio.effectsVolume,
      audio.effectsVolume,
    );
    audio.musicVolume = normalizeVolume(
      value.audio.musicVolume,
      audio.musicVolume,
    );
    if (typeof value.audio.quickSearchClockEnabled === 'boolean') {
      audio.quickSearchClockEnabled = value.audio.quickSearchClockEnabled;
    }
  }

  return hasDuplicateBindings(controls)
    ? cloneSettings(DEFAULT_PLAYER_SETTINGS)
    : { version: 1, controls, gameplay, profile, audio };
};

export const validatePlayerSettings = (
  settings: PlayerSettings,
): { valid: true } | { valid: false; message: string } => {
  for (const action of CONTROL_ACTIONS) {
    if (!isAcceptedControlCode(settings.controls[action])) {
      return { valid: false, message: `Invalid key: ${action}` };
    }
  }
  if (hasDuplicateBindings(settings.controls)) {
    return { valid: false, message: 'Keys must be unique' };
  }
  if (
    !isObject(settings.gameplay) ||
    typeof settings.gameplay.autoRollAfterContinue !== 'boolean'
  ) {
    return { valid: false, message: 'Invalid gameplay settings' };
  }
  if (
    !isObject(settings.profile) ||
    normalizeAvatarIndex(settings.profile.avatarIndex) !==
      settings.profile.avatarIndex
  ) {
    return { valid: false, message: 'Invalid profile settings' };
  }
  if (
    !isObject(settings.audio) ||
    normalizeVolume(settings.audio.masterVolume, -1) !==
      settings.audio.masterVolume ||
    normalizeVolume(settings.audio.effectsVolume, -1) !==
      settings.audio.effectsVolume ||
    normalizeVolume(settings.audio.musicVolume, -1) !==
      settings.audio.musicVolume ||
    typeof settings.audio.quickSearchClockEnabled !== 'boolean'
  ) {
    return { valid: false, message: 'Invalid audio settings' };
  }
  return { valid: true };
};

export const getPlayerSettings = (): PlayerSettings =>
  cloneSettings(currentSettings);

export const onPlayerSettingsChange = (
  listener: (settings: PlayerSettings) => void,
): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const loadPlayerSettings = async (): Promise<PlayerSettings> => {
  setCurrentSettings(readGuestSettings());
  return getPlayerSettings();
};

export const savePlayerSettings = async (
  settings: PlayerSettings,
): Promise<PlayerSettings> => {
  const validation = validatePlayerSettings(settings);
  if (!validation.valid) throw new Error(validation.message);
  const normalized = normalizePlayerSettings(settings);
  localStorage.setItem(GUEST_SETTINGS_KEY, JSON.stringify(normalized));
  setCurrentSettings(normalized);
  return getPlayerSettings();
};

const readGuestSettings = (): PlayerSettings => {
  const raw = localStorage.getItem(GUEST_SETTINGS_KEY);
  if (!raw) return cloneSettings(DEFAULT_PLAYER_SETTINGS);
  try {
    return normalizePlayerSettings(JSON.parse(raw) as unknown);
  } catch {
    localStorage.removeItem(GUEST_SETTINGS_KEY);
    return cloneSettings(DEFAULT_PLAYER_SETTINGS);
  }
};

const setCurrentSettings = (settings: PlayerSettings): void => {
  currentSettings = cloneSettings(settings);
  const snapshot = getPlayerSettings();
  for (const listener of listeners) listener(snapshot);
};

const hasDuplicateBindings = (controls: ControlBindings): boolean => {
  const seen = new Set<string>();
  for (const action of CONTROL_ACTIONS) {
    const code = controls[action];
    if (seen.has(code)) return true;
    seen.add(code);
  }
  return false;
};
