const AVATAR_FILENAMES = [
  '1_1.png',
  '1_2.png',
  '1_3.png',
  '1_4.png',
  '1_5.png',
  '2_1.png',
  '2_2.png',
  '2_3.png',
  '2_4.png',
  '2_5.png',
  '3_1.png',
  '3_2.png',
  '3_3.png',
  '3_4.png',
  '3_5.png',
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
