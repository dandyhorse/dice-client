// Previous collision test sound: ui-hover-wood-impact.ogg
import { AVATAR_URLS } from '../../avatars';
import {
  DEFAULT_DICE_COLOR_MAP_URL,
  DEFAULT_DICE_NORMAL_MAP_URL,
  DEFAULT_DICE_ROUGHNESS_MAP_URL,
  DICE_PRESET_IMAGE_URLS,
  DICE_PRESET_TEXTURE_URLS,
} from '../../dice-presets';

export type AssetGroup = 'menu' | 'gameplay';

export const DICE_COLOR_MAP_URL = DEFAULT_DICE_COLOR_MAP_URL;
export const DICE_NORMAL_MAP_URL = DEFAULT_DICE_NORMAL_MAP_URL;
export const DICE_ROUGHNESS_MAP_URL = DEFAULT_DICE_ROUGHNESS_MAP_URL;

export const TABLE_TEXTURE_BASE_URL = '/assets/table/wood-table-texture-1k/';
export const TABLE_COLOR_MAP_URL = `${TABLE_TEXTURE_BASE_URL}wood-table-color.webp`;
export const TABLE_NORMAL_MAP_URL = `${TABLE_TEXTURE_BASE_URL}wood-table-normal.webp`;
export const TABLE_ROUGHNESS_MAP_URL = `${TABLE_TEXTURE_BASE_URL}wood-table-roughness.webp`;
export const BACKGROUND_TEXTURE_URL = '/assets/background/gameplay-background-texture.webp';
// Static rules texture kept for rollback; runtime rules board is generated from dice icons + i18n.
export const RULES_BOARD_TEXTURE_URL = '/assets/rules-board-static.svg';
export const TARGET_HAND_CURSOR_URL = '/assets/cursors/cursor-target-hand.png';
export const OPEN_HAND_CURSOR_URL = '/assets/cursors/cursor-hand-open.png';
export const CLOSED_HAND_CURSOR_URL = '/assets/cursors/cursor-hand-closed.png';
export const UI_ASSET_URLS = [
  '/assets/ui/main-menu-background.png',
  '/assets/ui/main-logo.svg',
  '/assets/ui/menu-button-large-frame.svg',
  '/assets/ui/menu-button-large-hover-overlay.svg',
  '/assets/ui/menu-button-small-frame.svg',
  '/assets/ui/menu-button-small-hover-overlay.svg',
  '/assets/ui/small-icon-frame.svg',
  '/assets/ui/avatar-frame-mask.svg',
  '/assets/ui/settings-icon.svg',
  '/assets/ui/sound-icon.svg',
  '/assets/ui/sound-dropdown-frame.svg',
  '/assets/ui/sound-slider-thumb.svg',
  '/assets/ui/language-dropdown-frame.svg',
  '/assets/ui/status-message-frame.svg',
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
  (face) => `/assets/dice-rule-icons/dice-rule-face-${face}.svg`,
);
export const DICE_DICE_COLLISION_SOUND_URL = '/assets/sounds/dice-collision-stone.ogg';
export const DICE_SURFACE_COLLISION_SOUND_URL = '/assets/sounds/dice-surface-impact-wood.ogg';
export const DICE_PICKUP_SOUND_URL = '/assets/sounds/dice-pickup-hand.wav';
export const DICE_THROW_SOUND_URL = '/assets/sounds/dice-release-throw.ogg';
export const GAMEPLAY_BANK_SOUND_URL = '/assets/sounds/gameplay-bank-score.wav';
export const GAMEPLAY_CONTINUE_SOUND_URL = '/assets/sounds/gameplay-continue-lock.ogg';
export const UI_HOVER_SOUND_URL = '/assets/sounds/ui-hover-wood-impact.ogg';
export const UI_CLICK_SOUND_URL = '/assets/sounds/ui-click-tick.ogg';
export const UI_LANGUAGE_CHANGE_SOUND_URL = '/assets/sounds/ui-language-change.mp3';
export const UI_SETTINGS_OPEN_SOUND_URL = '/assets/sounds/ui-open-panel-pages.ogg';
export const UI_DROPDOWN_TOGGLE_SOUND_URL = '/assets/sounds/ui-dropdown-chain.ogg';
export const UI_QUICK_SEARCH_CLOCK_SOUND_URL = '/assets/sounds/ui-quick-search-clock-loop.mp3';

export interface AssetGroupManifest {
  images: string[];
  textures: string[];
  models: string[];
}

export const ASSET_GROUPS: Record<AssetGroup, AssetGroupManifest> = {
  menu: {
    images: [...DICE_PRESET_IMAGE_URLS, TARGET_HAND_CURSOR_URL, ...UI_ASSET_URLS, ...AVATAR_URLS],
    textures: DICE_PRESET_TEXTURE_URLS,
    models: [],
  },
  gameplay: {
    images: [
      ...DICE_PRESET_IMAGE_URLS,
      ...DICE_RULE_ICON_URLS,
      // RULES_BOARD_TEXTURE_URL,
      TARGET_HAND_CURSOR_URL,
      OPEN_HAND_CURSOR_URL,
      CLOSED_HAND_CURSOR_URL,
      ...UI_ASSET_URLS,
      ...AVATAR_URLS,
    ],
    textures: [
      ...DICE_PRESET_TEXTURE_URLS,
      TABLE_COLOR_MAP_URL,
      TABLE_NORMAL_MAP_URL,
      TABLE_ROUGHNESS_MAP_URL,
      BACKGROUND_TEXTURE_URL,
    ],
    models: [],
  },
};
