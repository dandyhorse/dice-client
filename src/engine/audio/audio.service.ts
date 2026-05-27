import { Howl, Howler } from 'howler';

import type { AssetGroup } from '../assets/asset-manifest';

export type SoundId = 'dice-pickup' | 'dice-throw' | 'dice-collision' | 'menu-music';

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
    src: [],
    group: 'gameplay',
    volume: 0.5,
    rateVariation: 0.12,
    cooldownMs: 70,
  },
  'menu-music': {
    src: [],
    group: 'menu',
    volume: 0.34,
    loop: true,
  },
};

interface PlayOptions {
  volumeScale?: number;
}

class AudioService {
  private readonly howls = new Map<SoundId, Howl>();
  private readonly groupPromises = new Map<AssetGroup, Promise<void>>();
  private readonly lastPlayedAt = new Map<SoundId, number>();
  private currentMusic: SoundId | null = null;
  private unlockBound = false;

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
    howl.volume(Math.min(1, def.volume * (options.volumeScale ?? 1)), playId);
    return playId;
  }

  playCollision(impact: number): void {
    const volumeScale = Math.max(0.25, Math.min(1, impact / 5));
    this.play('dice-collision', { volumeScale });
  }

  playMusic(id: Extract<SoundId, 'menu-music'>): void {
    if (this.currentMusic === id) return;
    this.stopMusic();
    const howl = this.howls.get(id);
    if (!howl) return;
    howl.play();
    this.currentMusic = id;
  }

  stopMusic(): void {
    if (!this.currentMusic) return;
    this.howls.get(this.currentMusic)?.stop();
    this.currentMusic = null;
  }

  private load(id: SoundId): Promise<void> {
    if (this.howls.has(id)) return Promise.resolve();
    const def = SOUND_DEFS[id];
    if (def.src.length === 0) return Promise.resolve();

    return new Promise<void>((resolve) => {
      const howl = new Howl({
        src: def.src,
        volume: def.volume,
        loop: def.loop ?? false,
        preload: true,
        onload: () => resolve(),
        onloaderror: (_soundId, error) => {
          console.warn(`[Audio] Failed to load ${id}:`, error);
          resolve();
        },
      });
      this.howls.set(id, howl);
    });
  }
}

export const audioService = new AudioService();
