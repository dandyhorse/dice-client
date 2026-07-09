import { OST_TRACK_URLS } from '../assets/asset-manifest';

const MUSIC_BASE_VOLUME = 0.34;
const NEXT_PRELOAD_REMAINING_SECONDS = 25;
const CROSSFADE_SECONDS = 1.2;

class MusicService {
  private current: HTMLAudioElement | null = null;
  private next: HTMLAudioElement | null = null;
  private currentIndex = 0;
  private nextIndex = 0;
  private playing = false;
  private transitioning = false;
  private unlockBound = false;
  private fadeRafId: number | null = null;
  private musicVolume = 1;

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (!this.transitioning && this.current)
      this.current.volume = this.targetVolume();
    if (!this.transitioning && this.next) this.next.volume = 0;
  }

  start(): void {
    if (OST_TRACK_URLS.length === 0) return;
    if (!this.current) {
      this.currentIndex = this.pickRandomTrackIndex();
      this.current = this.createAudio(
        this.currentIndex,
        'auto',
        this.targetVolume(),
      );
    }
    this.bindUnlockListeners();
    void this.playCurrent();
  }

  private async playCurrent(): Promise<void> {
    if (!this.current) return;
    try {
      await this.current.play();
      this.playing = true;
      this.unbindUnlockListeners();
    } catch {
      this.playing = false;
      this.bindUnlockListeners();
    }
  }

  private bindUnlockListeners(): void {
    if (this.unlockBound) return;
    this.unlockBound = true;
    window.addEventListener('pointerdown', this.onUnlockGesture, true);
    window.addEventListener('keydown', this.onUnlockGesture, true);
  }

  private unbindUnlockListeners(): void {
    if (!this.unlockBound) return;
    this.unlockBound = false;
    window.removeEventListener('pointerdown', this.onUnlockGesture, true);
    window.removeEventListener('keydown', this.onUnlockGesture, true);
  }

  private onUnlockGesture = (): void => {
    this.start();
  };

  private createAudio(
    trackIndex: number,
    preload: HTMLAudioElement['preload'],
    volume: number,
  ): HTMLAudioElement {
    const audio = new Audio(OST_TRACK_URLS[trackIndex]!);
    audio.preload = preload;
    audio.volume = volume;
    audio.loop = true;
    audio.setAttribute('playsinline', '');
    audio.addEventListener('timeupdate', this.onTimeUpdate);
    audio.addEventListener('ended', this.onEnded);
    return audio;
  }

  private onTimeUpdate = (event: Event): void => {
    if (
      event.currentTarget !== this.current ||
      !this.current ||
      OST_TRACK_URLS.length <= 1
    )
      return;
    if (!Number.isFinite(this.current.duration) || this.current.duration <= 0)
      return;

    const remaining = this.current.duration - this.current.currentTime;
    if (remaining <= NEXT_PRELOAD_REMAINING_SECONDS) this.prepareNextTrack();
    if (
      remaining <= CROSSFADE_SECONDS &&
      this.next &&
      !this.transitioning &&
      this.playing
    ) {
      this.crossfadeToNext();
    }
  };

  private onEnded = (event: Event): void => {
    const currentAudio = this.current;
    if (
      event.currentTarget !== currentAudio ||
      !currentAudio ||
      OST_TRACK_URLS.length <= 1
    ) {
      return;
    }
    if (this.transitioning) {
      if (this.next) this.finishSwitch(currentAudio, this.next);
      return;
    }
    this.switchToNext();
  };

  private prepareNextTrack(): void {
    if (this.next || OST_TRACK_URLS.length <= 1) return;
    this.nextIndex = this.pickRandomTrackIndex(this.currentIndex);
    this.next = this.createAudio(this.nextIndex, 'auto', 0);
    this.next.load();
  }

  private crossfadeToNext(): void {
    const from = this.current;
    const to = this.next;
    if (!from || !to) return;
    this.transitioning = true;
    to.currentTime = 0;
    to.volume = 0;
    void to
      .play()
      .then(() => this.animateCrossfade(from, to))
      .catch(() => {
        this.transitioning = false;
        this.playNextOnCurrentElement(from);
      });
  }

  private animateCrossfade(from: HTMLAudioElement, to: HTMLAudioElement): void {
    const startMs = performance.now();
    const durationMs = CROSSFADE_SECONDS * 1000;
    const tick = (nowMs: number): void => {
      const t = Math.min(1, (nowMs - startMs) / durationMs);
      const volume = this.targetVolume();
      from.volume = volume * (1 - t);
      to.volume = volume * t;
      if (t < 1) {
        this.fadeRafId = requestAnimationFrame(tick);
        return;
      }
      this.finishSwitch(from, to);
    };
    this.fadeRafId = requestAnimationFrame(tick);
  }

  private switchToNext(): void {
    const from = this.current;
    this.nextIndex = this.next
      ? this.nextIndex
      : this.pickRandomTrackIndex(this.currentIndex);
    const to = this.next ?? this.createAudio(this.nextIndex, 'auto', 0);
    to.volume = this.targetVolume();
    void to
      .play()
      .then(() => {
        if (from) this.finishSwitch(from, to);
      })
      .catch(() => {
        if (from && from !== to) {
          this.playNextOnCurrentElement(from);
          return;
        }
        this.handlePlayBlocked();
      });
  }

  private playNextOnCurrentElement(audio: HTMLAudioElement): void {
    if (OST_TRACK_URLS.length === 0) return;
    if (this.fadeRafId !== null) cancelAnimationFrame(this.fadeRafId);
    this.fadeRafId = null;
    const targetIndex = this.next
      ? this.nextIndex
      : this.pickRandomTrackIndex(this.currentIndex);
    if (this.next && this.next !== audio) this.releaseAudio(this.next);
    this.next = null;
    this.transitioning = false;
    this.current = audio;
    this.currentIndex = targetIndex;
    audio.volume = this.targetVolume();
    audio.loop = true;
    audio.src = OST_TRACK_URLS[targetIndex]!;
    audio.load();
    void audio
      .play()
      .then(() => {
        this.playing = true;
        this.unbindUnlockListeners();
      })
      .catch(() => this.handlePlayBlocked());
  }

  private handlePlayBlocked(): void {
    this.playing = false;
    this.bindUnlockListeners();
  }

  private finishSwitch(from: HTMLAudioElement, to: HTMLAudioElement): void {
    if (this.fadeRafId !== null) cancelAnimationFrame(this.fadeRafId);
    this.fadeRafId = null;
    this.releaseAudio(from);
    to.volume = this.targetVolume();
    to.loop = true;
    this.current = to;
    this.currentIndex = this.nextIndex;
    this.next = null;
    this.playing = true;
    this.transitioning = false;
  }

  private releaseAudio(audio: HTMLAudioElement): void {
    audio.pause();
    audio.removeEventListener('timeupdate', this.onTimeUpdate);
    audio.removeEventListener('ended', this.onEnded);
    audio.removeAttribute('src');
    audio.load();
  }

  private pickRandomTrackIndex(excludeIndex: number | null = null): number {
    if (OST_TRACK_URLS.length <= 1) return 0;
    let index = 0;
    do {
      index = Math.floor(Math.random() * OST_TRACK_URLS.length);
    } while (index === excludeIndex);
    return index;
  }

  private targetVolume(): number {
    return MUSIC_BASE_VOLUME * this.musicVolume;
  }
}

export const musicService = new MusicService();
