// Previous collision test sound: impactWood_medium_000.ogg
import { AVATAR_URLS } from '../../avatars';

export type AssetGroup = 'menu' | 'gameplay';

export const DICE_TEXTURE_BASE_URL = '/assets/dice/plastered-stone-wall-1k/';
export const DICE_COLOR_MAP_URL = `${DICE_TEXTURE_BASE_URL}plastered_stone_wall_diff_1k.webp`;
export const DICE_NORMAL_MAP_URL = `${DICE_TEXTURE_BASE_URL}plastered_stone_wall_nor_gl_1k.webp`;
export const DICE_ROUGHNESS_MAP_URL = `${DICE_TEXTURE_BASE_URL}plastered_stone_wall_rough_1k.webp`;

export const TABLE_TEXTURE_BASE_URL = '/assets/table/wood-cabinet-worn-long-1k/';
export const TABLE_COLOR_MAP_URL = `${TABLE_TEXTURE_BASE_URL}wood_cabinet_worn_long_diff_1k.webp`;
export const TABLE_NORMAL_MAP_URL = `${TABLE_TEXTURE_BASE_URL}wood_cabinet_worn_long_nor_gl_1k.webp`;
export const TABLE_ROUGHNESS_MAP_URL = `${TABLE_TEXTURE_BASE_URL}wood_cabinet_worn_long_rough_1k.webp`;
export const BACKGROUND_TEXTURE_URL = '/assets/background/background_texture_2.webp';
export const RULES_BOARD_TEXTURE_URL = '/assets/rules.svg';
export const TARGET_HAND_CURSOR_URL = '/assets/cursors/target-hand.png';
export const OPEN_HAND_CURSOR_URL = '/assets/cursors/open-hand.png';
export const CLOSED_HAND_CURSOR_URL = '/assets/cursors/close-hand.png';
export const OST_TRACK_URLS: readonly string[] = [
  '/assets/ost/tavern_1.mp3',
  '/assets/ost/tavern_2.mp3',
  '/assets/ost/tavern_3.mp3',
  '/assets/ost/tavern_4.mp3',
  '/assets/ost/tavern_5.mp3',
  '/assets/ost/tavern_6.mp3',
  '/assets/ost/tavern_7.mp3',
  '/assets/ost/tavern_8.mp3',
];
export const DICE_RULE_ICON_URLS = [1, 2, 3, 4, 5, 6].map(
  (face) => `/assets/dices/${face}.svg`,
);
export const DICE_COLLISION_SOUND_URL = '/assets/sounds/impactWood_medium_003.ogg';

export interface AssetGroupManifest {
  images: string[];
  textures: string[];
  models: string[];
}

export const ASSET_GROUPS: Record<AssetGroup, AssetGroupManifest> = {
  menu: {
    images: [DICE_COLOR_MAP_URL, TARGET_HAND_CURSOR_URL, ...AVATAR_URLS],
    textures: [DICE_NORMAL_MAP_URL, DICE_ROUGHNESS_MAP_URL],
    models: [],
  },
  gameplay: {
    images: [
      DICE_COLOR_MAP_URL,
      ...DICE_RULE_ICON_URLS,
      RULES_BOARD_TEXTURE_URL,
      TARGET_HAND_CURSOR_URL,
      OPEN_HAND_CURSOR_URL,
      CLOSED_HAND_CURSOR_URL,
      ...AVATAR_URLS,
    ],
    textures: [
      DICE_NORMAL_MAP_URL,
      DICE_ROUGHNESS_MAP_URL,
      TABLE_COLOR_MAP_URL,
      TABLE_NORMAL_MAP_URL,
      TABLE_ROUGHNESS_MAP_URL,
      BACKGROUND_TEXTURE_URL,
    ],
    models: [],
  },
};
