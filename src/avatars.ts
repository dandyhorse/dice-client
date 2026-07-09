const AVATAR_FILENAMES = [
  'player-avatar-01.png',
  'player-avatar-02.png',
  'player-avatar-03.png',
  'player-avatar-04.png',
  'player-avatar-05.png',
  'player-avatar-06.png',
  'player-avatar-07.png',
  'player-avatar-08.png',
  'player-avatar-09.png',
  'player-avatar-10.png',
  'player-avatar-11.png',
  'player-avatar-12.png',
  'player-avatar-13.png',
  'player-avatar-14.png',
  'player-avatar-15.png',
] as const;

export const DEFAULT_AVATAR_INDEX = 0;
export const MAX_AVATAR_INDEX = 0xffff;

export const AVATAR_URLS = AVATAR_FILENAMES.map((name) => `/assets/avatars/${name}`);

export const normalizeAvatarIndex = (
  value: unknown,
  availableCount = AVATAR_URLS.length,
): number => {
  const index = typeof value === 'number' ? value : Number.NaN;
  if (!Number.isInteger(index) || index < 0 || index > MAX_AVATAR_INDEX) {
    return DEFAULT_AVATAR_INDEX;
  }
  if (availableCount <= 0 || index >= availableCount) return DEFAULT_AVATAR_INDEX;
  return index;
};

export const avatarUrlForIndex = (value: unknown): string | null => {
  const index = normalizeAvatarIndex(value);
  return AVATAR_URLS[index] ?? AVATAR_URLS[DEFAULT_AVATAR_INDEX] ?? null;
};

export const nextAvatarIndex = (value: unknown): number => {
  if (AVATAR_URLS.length <= 1) return DEFAULT_AVATAR_INDEX;
  return (normalizeAvatarIndex(value) + 1) % AVATAR_URLS.length;
};
