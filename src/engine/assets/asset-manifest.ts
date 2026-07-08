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
export const UI_ASSET_URLS = [
  '/assets/ui/background.png',
  '/assets/ui/MainLogo.svg',
  '/assets/ui/Button_L.svg',
  '/assets/ui/Button_L_overlay.svg',
  '/assets/ui/Button_S.svg',
  '/assets/ui/Button_S_overlay.svg',
  '/assets/ui/Small_frame.svg',
  '/assets/ui/avatar_mask.svg',
  '/assets/ui/settings.svg',
  '/assets/ui/sound.svg',
  '/assets/ui/sound_dropdown.svg',
  '/assets/ui/sound_picker.svg',
  '/assets/ui/language_dropdown.svg',
  '/assets/ui/status_frame.svg',
];
// Only OST tracks are routed as music; every /assets/sounds/* asset is an effect.
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
export const DICE_PICKUP_SOUND_URL = '/assets/sounds/hands_test.wav';
export const GAMEPLAY_BANK_SOUND_URL = '/assets/sounds/bank.wav';
export const GAMEPLAY_CONTINUE_SOUND_URL = '/assets/sounds/continue.wav';
export const UI_HOVER_SOUND_URL = '/assets/sounds/impactWood_medium_000.ogg';
export const UI_CLICK_SOUND_URL = '/assets/sounds/Timetick.ogg';
export const UI_LANGUAGE_CHANGE_SOUND_URL = '/assets/sounds/change_language.mp3';
export const UI_SETTINGS_OPEN_SOUND_URL = '/assets/sounds/FlippingPages.ogg';
export const UI_DROPDOWN_TOGGLE_SOUND_URL = '/assets/sounds/chain_02.ogg';
export const UI_QUICK_SEARCH_CLOCK_SOUND_URL = '/assets/sounds/clock.mp3';

export interface AssetGroupManifest {
  images: string[];
  textures: string[];
  models: string[];
}

export const ASSET_GROUPS: Record<AssetGroup, AssetGroupManifest> = {
  menu: {
    images: [DICE_COLOR_MAP_URL, TARGET_HAND_CURSOR_URL, ...UI_ASSET_URLS, ...AVATAR_URLS],
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
      ...UI_ASSET_URLS,
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
