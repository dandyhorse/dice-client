import { getAuthIdentity } from './auth';
import { SERVER_URL } from './engine/config';

export const CONTROL_ACTIONS = [
  'throwDice',
  'selectAll',
  'continueTurn',
  'bankTurn',
  'surrender',
] as const;

export type ControlAction = (typeof CONTROL_ACTIONS)[number];
export type ControlBindings = Record<ControlAction, string>;

export interface PlayerSettings {
  version: 1;
  controls: ControlBindings;
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
};

const GUEST_SETTINGS_KEY = 'dice.playerSettings.guest';
const ACCEPTED_KEY_CODE_RE = /^(Escape|Space|Key[A-Z]|Digit[0-9]|Numpad[0-9])$/;
const listeners = new Set<(settings: PlayerSettings) => void>();

let currentSettings: PlayerSettings = cloneSettings(DEFAULT_PLAYER_SETTINGS);

const settingsUrl = (path: string): string => `${SERVER_URL}${path}`;

const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

function cloneSettings(settings: PlayerSettings): PlayerSettings {
  return {
    version: 1,
    controls: { ...settings.controls },
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
    if (!isAcceptedControlCode(code)) return cloneSettings(DEFAULT_PLAYER_SETTINGS);
    controls[action] = code;
  }

  return hasDuplicateBindings(controls)
    ? cloneSettings(DEFAULT_PLAYER_SETTINGS)
    : { version: 1, controls };
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
  return { valid: true };
};

export const getPlayerSettings = (): PlayerSettings => cloneSettings(currentSettings);

export const onPlayerSettingsChange = (
  listener: (settings: PlayerSettings) => void,
): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const loadPlayerSettings = async (): Promise<PlayerSettings> => {
  const identity = await getAuthIdentity();
  if (identity?.authenticated && identity.accessToken) {
    const res = await fetch(settingsUrl('/auth/settings'), {
      headers: { Authorization: `Bearer ${identity.accessToken}` },
    });
    const payload = (await res.json().catch(() => null)) as unknown;
    if (!res.ok) throw new Error(readErrorMessage(payload) || `settings request failed: ${res.status}`);
    const settings = normalizePlayerSettings(isObject(payload) ? payload.settings : null);
    setCurrentSettings(settings);
    return getPlayerSettings();
  }

  setCurrentSettings(readGuestSettings());
  return getPlayerSettings();
};

export const savePlayerSettings = async (settings: PlayerSettings): Promise<PlayerSettings> => {
  const validation = validatePlayerSettings(settings);
  if (!validation.valid) throw new Error(validation.message);
  const normalized = normalizePlayerSettings(settings);

  const identity = await getAuthIdentity();
  if (identity?.authenticated && identity.accessToken) {
    const res = await fetch(settingsUrl('/auth/settings'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${identity.accessToken}`,
      },
      body: JSON.stringify({ settings: normalized }),
    });
    const payload = (await res.json().catch(() => null)) as unknown;
    if (!res.ok) throw new Error(readErrorMessage(payload) || `settings save failed: ${res.status}`);
    const saved = normalizePlayerSettings(isObject(payload) ? payload.settings : null);
    setCurrentSettings(saved);
    return getPlayerSettings();
  }

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

const readErrorMessage = (payload: unknown): string | null => {
  if (!isObject(payload)) return null;
  return typeof payload.message === 'string' && payload.message.length > 0 ? payload.message : null;
};
