// Future accounts module. The active guest runtime intentionally does not import it.
import { SERVER_URL } from './engine/config';

const ACCESS_TOKEN_KEY = 'dice.auth.accessToken';
const REFRESH_TOKEN_KEY = 'dice.auth.refreshToken';
const ACCESS_EXPIRES_AT_KEY = 'dice.auth.accessExpiresAt';
const REFRESH_EXPIRES_AT_KEY = 'dice.auth.refreshExpiresAt';
const AUTH_USER_KEY = 'dice.auth.user';
let refreshPromise: Promise<AuthPayload | null> | null = null;

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

const authUrl = (path: string): string => `${SERVER_URL}${path}`;

class AuthRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

const isAuthUser = (value: unknown): value is AuthUser => {
  if (!isObject(value)) return false;
  return (
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    typeof value.username === 'string' &&
    value.username.length > 0 &&
    typeof value.displayName === 'string' &&
    value.displayName.length > 0
  );
};

const isAuthPayload = (value: unknown): value is AuthPayload => {
  if (!isObject(value)) return false;
  return (
    isAuthUser(value.user) &&
    typeof value.accessToken === 'string' &&
    value.accessToken.length > 0 &&
    typeof value.refreshToken === 'string' &&
    value.refreshToken.length > 0 &&
    typeof value.accessExpiresIn === 'number' &&
    Number.isFinite(value.accessExpiresIn) &&
    typeof value.refreshExpiresIn === 'number' &&
    Number.isFinite(value.refreshExpiresIn)
  );
};

const assertAuthPayload = (value: unknown): AuthPayload => {
  if (!isAuthPayload(value)) {
    throw new Error('auth server returned invalid user data');
  }
  return value;
};

const storedNumber = (key: string): number => {
  const raw = localStorage.getItem(key);
  return raw ? Number(raw) : 0;
};

export const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as unknown;
    if (isAuthUser(user)) return user;
  } catch {
    // Ignore and clear below.
  }
  localStorage.removeItem(AUTH_USER_KEY);
  return null;
};

const storeAuth = (payload: AuthPayload): AuthPayload => {
  assertAuthPayload(payload);
  const now = Date.now();
  localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
  localStorage.setItem(ACCESS_EXPIRES_AT_KEY, String(now + payload.accessExpiresIn * 1000));
  localStorage.setItem(REFRESH_EXPIRES_AT_KEY, String(now + payload.refreshExpiresIn * 1000));
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(payload.user));
  return payload;
};

const storeUser = (user: AuthUser): AuthUser => {
  if (!isAuthUser(user)) throw new Error('auth server returned invalid user data');
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  return user;
};

export const clearAuth = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ACCESS_EXPIRES_AT_KEY);
  localStorage.removeItem(REFRESH_EXPIRES_AT_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

const errorMessage = (payload: unknown): string | null => {
  if (!isObject(payload)) return null;
  return typeof payload.message === 'string' && payload.message.length > 0 ? payload.message : null;
};

const postAuth = async (path: string, body: unknown, accessToken?: string): Promise<unknown> => {
  const res = await fetch(authUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const payload = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    throw new AuthRequestError(
      errorMessage(payload) || `auth request failed: ${res.status}`,
      res.status,
    );
  }
  return payload;
};

const getAuth = async (path: string, accessToken: string): Promise<unknown> => {
  const res = await fetch(authUrl(path), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const payload = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    throw new AuthRequestError(
      errorMessage(payload) || `auth request failed: ${res.status}`,
      res.status,
    );
  }
  return payload;
};

export const registerAccount = async (input: {
  username: string;
  password: string;
}): Promise<AuthPayload> => {
  return storeAuth(assertAuthPayload(await postAuth('/auth/register', input)));
};

export const loginAccount = async (input: {
  username: string;
  password: string;
}): Promise<AuthPayload> => {
  return storeAuth(assertAuthPayload(await postAuth('/auth/login', input)));
};

export const refreshAuth = (): Promise<AuthPayload | null> => {
  if (refreshPromise) return refreshPromise;
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const refreshExpiresAt = storedNumber(REFRESH_EXPIRES_AT_KEY);
  if (!refreshToken || refreshExpiresAt <= Date.now()) {
    return Promise.resolve(null);
  }

  const request = postAuth('/auth/refresh', { refreshToken })
    .then((payload) => {
      const parsed = assertAuthPayload(payload);
      if (localStorage.getItem(REFRESH_TOKEN_KEY) !== refreshToken) return null;
      return storeAuth(parsed);
    })
    .catch((error: unknown) => {
      const invalidRefresh =
        error instanceof AuthRequestError &&
        (error.status === 400 || error.status === 401);
      if (!invalidRefresh) throw error;
      if (localStorage.getItem(REFRESH_TOKEN_KEY) === refreshToken) clearAuth();
      return null;
    });
  refreshPromise = request;
  void request
    .finally(() => {
      if (refreshPromise === request) refreshPromise = null;
    })
    .catch(() => undefined);
  return request;
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

export const refreshCurrentUser = async (): Promise<AuthUser | null> => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const accessExpiresAt = storedNumber(ACCESS_EXPIRES_AT_KEY);
  if (!accessToken || accessExpiresAt <= Date.now() + 30_000) {
    const refreshed = await refreshAuth();
    return refreshed?.user ?? null;
  }

  try {
    const payload = await getAuth('/auth/me', accessToken);
    if (isObject(payload) && isAuthUser(payload.user)) {
      return storeUser(payload.user);
    }
    throw new Error('auth server returned invalid user data');
  } catch (error) {
    const refreshed = await refreshAuth();
    if (refreshed) return refreshed.user;
    throw error;
  }
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
