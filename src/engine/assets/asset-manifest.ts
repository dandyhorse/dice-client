export type AssetGroup = 'menu' | 'gameplay';

export const DICE_TEXTURE_BASE_URL = '/assets/dice/plastered-stone-wall-1k/';
export const DICE_COLOR_MAP_URL = `${DICE_TEXTURE_BASE_URL}plastered_stone_wall_diff_1k.jpg`;
export const DICE_NORMAL_MAP_URL = `${DICE_TEXTURE_BASE_URL}plastered_stone_wall_nor_gl_1k.png`;
export const DICE_ROUGHNESS_MAP_URL = `${DICE_TEXTURE_BASE_URL}plastered_stone_wall_rough_1k.png`;

export const TABLE_TEXTURE_BASE_URL = '/assets/table/wood-cabinet-worn-long-1k/';
export const TABLE_COLOR_MAP_URL = `${TABLE_TEXTURE_BASE_URL}wood_cabinet_worn_long_diff_1k.jpg`;
export const TABLE_NORMAL_MAP_URL = `${TABLE_TEXTURE_BASE_URL}wood_cabinet_worn_long_nor_gl_1k.png`;
export const TABLE_ROUGHNESS_MAP_URL = `${TABLE_TEXTURE_BASE_URL}wood_cabinet_worn_long_rough_1k.png`;

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
    images: [DICE_COLOR_MAP_URL],
    textures: [
      DICE_NORMAL_MAP_URL,
      DICE_ROUGHNESS_MAP_URL,
      TABLE_COLOR_MAP_URL,
      TABLE_NORMAL_MAP_URL,
      TABLE_ROUGHNESS_MAP_URL,
    ],
    models: [],
  },
};
