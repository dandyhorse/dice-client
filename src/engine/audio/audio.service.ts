import { Howl, Howler } from 'howler';

import { DICE_COLLISION_SOUND_URL } from '../assets/asset-manifest';
import type { AssetGroup } from '../assets/asset-manifest';

export type SoundId = 'dice-pickup' | 'dice-throw' | 'dice-collision';

interface SoundDef {
  src: string[];
  group: AssetGroup;
  volume: number;
  loop?: boolean;
  rateVariation?: number;
  cooldownMs?: number;
}

const SOUND_DEFS: Record<SoundId, SoundDef> = {
  'dice-pickup': {
    src: [],
    group: 'gameplay',
    volume: 0.45,
    rateVariation: 0.08,
    cooldownMs: 80,
  },
  'dice-throw': {
    src: [],
    group: 'gameplay',
    volume: 0.62,
    rateVariation: 0.06,
    cooldownMs: 120,
  },
  'dice-collision': {
    src: DICE_COLLISION_SOUND_URL ? [DICE_COLLISION_SOUND_URL] : [],
    group: 'gameplay',
    volume: 0.5,
    rateVariation: 0.1,
    cooldownMs: 35,
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
  private unlockBound = false;
  private effectsVolume = 1;

  setEffectsVolume(volume: number): void {
    this.effectsVolume = Math.max(0, Math.min(1, volume));
    for (const [id, howl] of this.howls) {
      howl.volume(SOUND_DEFS[id].volume * this.effectsVolume);
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
    howl.rate(variation, playId);
    howl.volume(
      Math.min(1, def.volume * this.effectsVolume * (options.volumeScale ?? 1)),
      playId,
    );
    return playId;
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
