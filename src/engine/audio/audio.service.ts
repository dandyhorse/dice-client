import { Howl, Howler } from 'howler';

import {
  DICE_COLLISION_SOUND_URL,
  DICE_PICKUP_SOUND_URL,
  GAMEPLAY_BANK_SOUND_URL,
  GAMEPLAY_CONTINUE_SOUND_URL,
  UI_CLICK_SOUND_URL,
  UI_DROPDOWN_TOGGLE_SOUND_URL,
  UI_HOVER_SOUND_URL,
  UI_LANGUAGE_CHANGE_SOUND_URL,
  UI_QUICK_SEARCH_CLOCK_SOUND_URL,
  UI_SETTINGS_OPEN_SOUND_URL,
} from '../assets/asset-manifest';
import type { AssetGroup } from '../assets/asset-manifest';

export type SoundId =
  | 'dice-pickup'
  | 'dice-throw'
  | 'dice-collision'
  | 'gameplay-bank'
  | 'gameplay-continue'
  | 'ui-hover'
  | 'ui-click'
  | 'ui-dropdown-toggle'
  | 'ui-language-change'
  | 'ui-quick-search-clock'
  | 'ui-settings-open';

interface SoundDef {
  src: string[];
  group: AssetGroup;
  bus: 'effects';
  volume: number;
  loop?: boolean;
  baseRate?: number;
  rateVariation?: number;
  cooldownMs?: number;
}

const SOUND_DEFS: Record<SoundId, SoundDef> = {
  'dice-pickup': {
    src: DICE_PICKUP_SOUND_URL ? [DICE_PICKUP_SOUND_URL] : [],
    group: 'gameplay',
    bus: 'effects',
    volume: 0.42,
    baseRate: 0.72,
    rateVariation: 0.035,
    cooldownMs: 80,
  },
  'dice-throw': {
    src: [],
    group: 'gameplay',
    bus: 'effects',
    volume: 0.62,
    rateVariation: 0.06,
    cooldownMs: 120,
  },
  'dice-collision': {
    src: DICE_COLLISION_SOUND_URL ? [DICE_COLLISION_SOUND_URL] : [],
    group: 'gameplay',
    bus: 'effects',
    volume: 0.5,
    rateVariation: 0.1,
    cooldownMs: 35,
  },
  'gameplay-bank': {
    src: GAMEPLAY_BANK_SOUND_URL ? [GAMEPLAY_BANK_SOUND_URL] : [],
    group: 'gameplay',
    bus: 'effects',
    volume: 0.45,
    rateVariation: 0,
    cooldownMs: 80,
  },
  'gameplay-continue': {
    src: GAMEPLAY_CONTINUE_SOUND_URL ? [GAMEPLAY_CONTINUE_SOUND_URL] : [],
    group: 'gameplay',
    bus: 'effects',
    volume: 0.45,
    rateVariation: 0,
    cooldownMs: 80,
  },
  'ui-hover': {
    src: UI_HOVER_SOUND_URL ? [UI_HOVER_SOUND_URL] : [],
    group: 'menu',
    bus: 'effects',
    volume: 0.18,
    baseRate: 0.72,
    rateVariation: 0.035,
    cooldownMs: 45,
  },
  'ui-click': {
    src: UI_CLICK_SOUND_URL ? [UI_CLICK_SOUND_URL] : [],
    group: 'menu',
    bus: 'effects',
    volume: 0.32,
    rateVariation: 0,
    cooldownMs: 35,
  },
  'ui-dropdown-toggle': {
    src: UI_DROPDOWN_TOGGLE_SOUND_URL ? [UI_DROPDOWN_TOGGLE_SOUND_URL] : [],
    group: 'menu',
    bus: 'effects',
    volume: 0.17,
    rateVariation: 0,
    cooldownMs: 80,
  },
  'ui-language-change': {
    src: UI_LANGUAGE_CHANGE_SOUND_URL ? [UI_LANGUAGE_CHANGE_SOUND_URL] : [],
    group: 'menu',
    bus: 'effects',
    volume: 0.17,
    rateVariation: 0,
    cooldownMs: 35,
  },
  'ui-settings-open': {
    src: UI_SETTINGS_OPEN_SOUND_URL ? [UI_SETTINGS_OPEN_SOUND_URL] : [],
    group: 'menu',
    bus: 'effects',
    volume: 0.65,
    rateVariation: 0,
    cooldownMs: 80,
  },
  'ui-quick-search-clock': {
    src: UI_QUICK_SEARCH_CLOCK_SOUND_URL ? [UI_QUICK_SEARCH_CLOCK_SOUND_URL] : [],
    group: 'menu',
    bus: 'effects',
    volume: 0.24,
    loop: true,
    rateVariation: 0,
  },
};

interface PlayOptions {
  volumeScale?: number;
}

const AUDIO_PRELOAD_TIMEOUT_MS = 1200;

class AudioService {
  private readonly howls = new Map<SoundId, Howl>();
  private readonly groupPromises = new Map<AssetGroup, Promise<void>>();
  private readonly lastPlayedAt = new Map<SoundId, number>();
  private readonly loopPlayIds = new Map<SoundId, number>();
  private unlockBound = false;
  private effectsVolume = 1;

  setEffectsVolume(volume: number): void {
    this.effectsVolume = Math.max(0, Math.min(1, volume));
    for (const [id, howl] of this.howls) {
      const def = SOUND_DEFS[id];
      if (def.bus !== 'effects') continue;
      howl.volume(def.volume * this.effectsVolume);
      const loopPlayId = this.loopPlayIds.get(id);
      if (loopPlayId !== undefined) {
        howl.volume(def.volume * this.effectsVolume, loopPlayId);
      }
    }
  }

  bindUnlockListeners(): void {
    if (this.unlockBound) return;
    this.unlockBound = true;
    const unlock = (): void => {
      void Howler.ctx?.resume?.();
      window.removeEventListener('pointerdown', unlock, true);
      window.removeEventListener('keydown', unlock, true);
    };
    window.addEventListener('pointerdown', unlock, true);
    window.addEventListener('keydown', unlock, true);
  }

  preloadGroup(group: AssetGroup): Promise<void> {
    const current = this.groupPromises.get(group);
    if (current) return current;

    const promise = Promise.all(
      Object.entries(SOUND_DEFS)
        .filter(([, def]) => def.group === group)
        .map(([id]) => this.load(id as SoundId)),
    ).then(() => undefined);
    this.groupPromises.set(group, promise);
    return promise;
  }

  play(id: SoundId, options: PlayOptions = {}): number | null {
    const howl = this.howls.get(id);
    if (!howl) return null;

    const def = SOUND_DEFS[id];
    const now = performance.now();
    const last = this.lastPlayedAt.get(id) ?? 0;
    if (def.cooldownMs && now - last < def.cooldownMs) return null;
    this.lastPlayedAt.set(id, now);

    const playId = howl.play();
    const variation = def.rateVariation
      ? 1 + (Math.random() - 0.5) * 2 * def.rateVariation
      : 1;
    howl.rate((def.baseRate ?? 1) * variation, playId);
    howl.volume(
      Math.min(1, def.volume * this.effectsVolume * (options.volumeScale ?? 1)),
      playId,
    );
    return playId;
  }

  playLoop(id: SoundId): number | null {
    const howl = this.howls.get(id);
    if (!howl) return null;

    const currentPlayId = this.loopPlayIds.get(id);
    if (currentPlayId !== undefined && howl.playing(currentPlayId)) {
      return currentPlayId;
    }

    const def = SOUND_DEFS[id];
    const playId = howl.play();
    howl.rate(def.baseRate ?? 1, playId);
    howl.volume(Math.min(1, def.volume * this.effectsVolume), playId);
    this.loopPlayIds.set(id, playId);
    return playId;
  }

  stop(id: SoundId): void {
    const howl = this.howls.get(id);
    if (!howl) return;

    const playId = this.loopPlayIds.get(id);
    if (playId !== undefined) {
      howl.stop(playId);
      this.loopPlayIds.delete(id);
      return;
    }
    howl.stop();
  }

  playCollision(impact: number): void {
    const volumeScale = Math.max(0.25, Math.min(1, impact / 5));
    this.play('dice-collision', { volumeScale });
  }

  private load(id: SoundId): Promise<void> {
    if (this.howls.has(id)) return Promise.resolve();
    const def = SOUND_DEFS[id];
    if (def.src.length === 0) return Promise.resolve();

    return new Promise<void>((resolve) => {
      let settled = false;
      const settle = (): void => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        resolve();
      };
      const timeoutId = window.setTimeout(settle, AUDIO_PRELOAD_TIMEOUT_MS);
      const howl = new Howl({
        src: def.src,
        volume: def.volume * this.effectsVolume,
        loop: def.loop ?? false,
        preload: true,
        onload: settle,
        onloaderror: (_soundId, error) => {
          console.warn(`[Audio] Failed to load ${id}:`, error);
          settle();
        },
      });
      this.howls.set(id, howl);
    });
  }
}

export const audioService = new AudioService();
