import {
  DEFAULT_DICE_PRESET_ID,
  normalizeDicePresetId,
  type DicePresetId,
} from './network/protocol/types';

export interface DicePresetVisual {
  colorMapUrl: string;
  normalMapUrl: string;
  roughnessMapUrl: string;
  faceBackground: string;
  pipColor: string;
  brightness: number;
  contrast: number;
}

export interface DicePresetCollisionSound {
  url: string;
  volume: number;
  baseRate?: number;
  rateVariation?: number;
  cooldownMs: number;
}

export interface DicePresetTrail {
  enabled: boolean;
  color: number;
  opacity: number;
  lifetimeMs: number;
  width: number;
  y: number;
  minDistanceSq: number;
  maxSegment: number;
}

export interface DicePreset {
  id: DicePresetId;
  name: {
    en: string;
    ru: string;
  };
  visual: DicePresetVisual;
  sounds: {
    dice: DicePresetCollisionSound;
    surface: DicePresetCollisionSound;
  };
  trail: DicePresetTrail;
  modelUrl?: string;
}

const DICE_TEXTURE_BASE_URL = '/assets/dice/plastered-stone-wall-1k/';
export const DEFAULT_DICE_COLOR_MAP_URL = `${DICE_TEXTURE_BASE_URL}plastered_stone_wall_diff_1k.webp`;
export const DEFAULT_DICE_NORMAL_MAP_URL = `${DICE_TEXTURE_BASE_URL}plastered_stone_wall_nor_gl_1k.webp`;
export const DEFAULT_DICE_ROUGHNESS_MAP_URL = `${DICE_TEXTURE_BASE_URL}plastered_stone_wall_rough_1k.webp`;

export const DICE_PRESETS: readonly DicePreset[] = [
  {
    id: 'classic-stone',
    name: {
      en: 'Classic stone',
      ru: 'Классический камень',
    },
    visual: {
      colorMapUrl: DEFAULT_DICE_COLOR_MAP_URL,
      normalMapUrl: DEFAULT_DICE_NORMAL_MAP_URL,
      roughnessMapUrl: DEFAULT_DICE_ROUGHNESS_MAP_URL,
      faceBackground: '#f5f5f0',
      pipColor: '#1a1a1a',
      brightness: 1.45,
      contrast: 0.95,
    },
    sounds: {
      dice: {
        url: '/assets/sounds/stones_04.ogg',
        volume: 0.5,
        cooldownMs: 35,
      },
      surface: {
        url: '/assets/sounds/impactWood_medium_003.ogg',
        volume: 0.5,
        rateVariation: 0.1,
        cooldownMs: 35,
      },
    },
    trail: {
      enabled: true,
      color: 0xffffff,
      opacity: 0.72,
      lifetimeMs: 500,
      width: 0.045,
      y: 0.025,
      minDistanceSq: 0.0016,
      maxSegment: 0.55,
    },
  },
  {
    id: 'ivory-glow',
    name: {
      en: 'Ivory glow',
      ru: 'Слоновая кость',
    },
    visual: {
      colorMapUrl: DEFAULT_DICE_COLOR_MAP_URL,
      normalMapUrl: DEFAULT_DICE_NORMAL_MAP_URL,
      roughnessMapUrl: DEFAULT_DICE_ROUGHNESS_MAP_URL,
      faceBackground: '#fff2d3',
      pipColor: '#2f2116',
      brightness: 1.18,
      contrast: 1.08,
    },
    sounds: {
      dice: {
        url: '/assets/sounds/stones_04.ogg',
        volume: 0.46,
        cooldownMs: 35,
      },
      surface: {
        url: '/assets/sounds/impactWood_light_004.ogg',
        volume: 0.42,
        rateVariation: 0.08,
        cooldownMs: 35,
      },
    },
    trail: {
      enabled: true,
      color: 0xffd166,
      opacity: 0.78,
      lifetimeMs: 650,
      width: 0.06,
      y: 0.026,
      minDistanceSq: 0.0016,
      maxSegment: 0.62,
    },
  },
];

export const DEFAULT_DICE_PRESET = DICE_PRESETS.find(
  (preset) => preset.id === DEFAULT_DICE_PRESET_ID,
)!;

export const dicePresetForId = (value: unknown): DicePreset =>
  DICE_PRESETS.find((preset) => preset.id === normalizeDicePresetId(value)) ??
  DEFAULT_DICE_PRESET;

export const dicePresetName = (preset: DicePreset, language: 'en' | 'ru'): string =>
  language === 'ru' ? preset.name.ru : preset.name.en;

export const DICE_PRESET_IMAGE_URLS = Array.from(
  new Set(DICE_PRESETS.map((preset) => preset.visual.colorMapUrl)),
);

export const DICE_PRESET_TEXTURE_URLS = Array.from(
  new Set(
    DICE_PRESETS.flatMap((preset) => [
      preset.visual.normalMapUrl,
      preset.visual.roughnessMapUrl,
    ]).filter((url): url is string => typeof url === 'string' && url.length > 0),
  ),
);

export const DICE_PRESET_SOUND_URLS = Array.from(
  new Set(DICE_PRESETS.flatMap((preset) => [preset.sounds.dice.url, preset.sounds.surface.url])),
);
