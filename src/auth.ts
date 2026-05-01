import { SERVER_URL } from './engine/config';

const ACCESS_TOKEN_KEY = 'dice.auth.accessToken';
const REFRESH_TOKEN_KEY = 'dice.auth.refreshToken';
const ACCESS_EXPIRES_AT_KEY = 'dice.auth.accessExpiresAt';
const REFRESH_EXPIRES_AT_KEY = 'dice.auth.refreshExpiresAt';
const AUTH_USER_KEY = 'dice.auth.user';

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
}

interface AuthPayload {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
}

export interface AuthIdentity {
  userId: string;
  displayName: string;
  accessToken?: string;
  authenticated: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  displayName: string;
  wins: number;
  losses: number;
  rating: number;
}

const authUrl = (path: string): string => `${SERVER_URL}${path}`;

const storedNumber = (key: string): number => {
  const raw = localStorage.getItem(key);
  return raw ? Number(raw) : 0;
};

export const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

const storeAuth = (payload: AuthPayload): AuthPayload => {
  const now = Date.now();
  localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
  localStorage.setItem(ACCESS_EXPIRES_AT_KEY, String(now + payload.accessExpiresIn * 1000));
  localStorage.setItem(REFRESH_EXPIRES_AT_KEY, String(now + payload.refreshExpiresIn * 1000));
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(payload.user));
  return payload;
};

export const clearAuth = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ACCESS_EXPIRES_AT_KEY);
  localStorage.removeItem(REFRESH_EXPIRES_AT_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

const postAuth = async <T>(path: string, body: unknown, accessToken?: string): Promise<T> => {
  const res = await fetch(authUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const payload = (await res.json().catch(() => ({}))) as { message?: string };
  if (!res.ok) throw new Error(payload.message || `auth request failed: ${res.status}`);
  return payload as T;
};

export const registerAccount = async (input: {
  username: string;
  password: string;
  guestId: string;
}): Promise<AuthPayload> => {
  return storeAuth(await postAuth<AuthPayload>('/auth/register', input));
};

export const loginAccount = async (input: {
  username: string;
  password: string;
}): Promise<AuthPayload> => {
  return storeAuth(await postAuth<AuthPayload>('/auth/login', input));
};

export const refreshAuth = async (): Promise<AuthPayload | null> => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const refreshExpiresAt = storedNumber(REFRESH_EXPIRES_AT_KEY);
  if (!refreshToken || refreshExpiresAt <= Date.now()) {
    clearAuth();
    return null;
  }
  try {
    return storeAuth(await postAuth<AuthPayload>('/auth/refresh', { refreshToken }));
  } catch {
    clearAuth();
    return null;
  }
};

export const logoutAccount = async (): Promise<void> => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  clearAuth();
  try {
    await postAuth('/auth/logout', { refreshToken }, accessToken ?? undefined);
  } catch {
    // Local logout should not be blocked by a stale token or offline server.
  }
};

export const getLeaderboard = async (limit = 20): Promise<LeaderboardEntry[]> => {
  const res = await fetch(authUrl(`/stats/leaderboard?limit=${encodeURIComponent(String(limit))}`));
  const payload = (await res.json().catch(() => ({}))) as {
    leaders?: LeaderboardEntry[];
    message?: string;
  };
  if (!res.ok) throw new Error(payload.message || `leaderboard request failed: ${res.status}`);
  return payload.leaders ?? [];
};

export const getAuthIdentity = async (): Promise<AuthIdentity | null> => {
  const user = getStoredUser();
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const accessExpiresAt = storedNumber(ACCESS_EXPIRES_AT_KEY);
  if (user && accessToken && accessExpiresAt > Date.now() + 30_000) {
    return {
      userId: user.id,
      displayName: user.username,
      accessToken,
      authenticated: true,
    };
  }

  const refreshed = await refreshAuth();
  if (!refreshed) return null;
  return {
    userId: refreshed.user.id,
    displayName: refreshed.user.username,
    accessToken: refreshed.accessToken,
    authenticated: true,
  };
};
