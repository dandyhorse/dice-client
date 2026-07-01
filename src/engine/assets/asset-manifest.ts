// Previous collision test sound: impactWood_medium_000.ogg
import diceCollisionSoundUrl from '../../../../assets/sounds/impactWood_medium_003.ogg?url';

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
const ostModules = import.meta.glob('../../../../assets/ost/*.{mp3,ogg,wav}', {
  eager: true,
  query: '?url',
  import: 'default',
});
const diceRuleIconModules = import.meta.glob('../../../../assets/dices/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

export const OST_TRACK_URLS = Object.entries(ostModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url as string);

export const DICE_RULE_ICON_URLS = [1, 2, 3, 4, 5, 6]
  .map((face) => diceRuleIconModules[`../../../../assets/dices/${face}.svg`] as string | undefined)
  .filter((url): url is string => typeof url === 'string');

export const DICE_COLLISION_SOUND_URL = diceCollisionSoundUrl;

export interface AssetGroupManifest {
  images: string[];
  textures: string[];
  models: string[];
}

export const ASSET_GROUPS: Record<AssetGroup, AssetGroupManifest> = {
  menu: {
    images: [DICE_COLOR_MAP_URL],
    textures: [DICE_NORMAL_MAP_URL, DICE_ROUGHNESS_MAP_URL],
    models: [],
  },
  gameplay: {
    images: [DICE_COLOR_MAP_URL, ...DICE_RULE_ICON_URLS],
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
