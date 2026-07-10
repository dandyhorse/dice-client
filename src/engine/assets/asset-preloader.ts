import type * as THREE from 'three';

import { ASSET_GROUPS, type AssetGroup } from './asset-manifest';

const ASSET_LOAD_TIMEOUT_MS = 15_000;

const withAssetTimeout = <T>(promise: Promise<T>, url: string): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(
      () => reject(new Error(`Timed out loading asset: ${url}`)),
      ASSET_LOAD_TIMEOUT_MS,
    );
    promise.then(
      (value) => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timeoutId);
        reject(error);
      },
    );
  });

class AssetPreloader {
  private textureLoader: THREE.TextureLoader | null = null;
  private readonly images = new Map<string, HTMLImageElement>();
  private readonly textures = new Map<string, THREE.Texture>();
  private readonly imagePromises = new Map<string, Promise<HTMLImageElement>>();
  private readonly texturePromises = new Map<string, Promise<THREE.Texture>>();
  private readonly groupPromises = new Map<AssetGroup, Promise<void>>();
  private readonly loadedGroups = new Set<AssetGroup>();

  preloadGroup(group: AssetGroup): Promise<void> {
    const done = this.groupPromises.get(group);
    if (done) return done;

    const manifest = ASSET_GROUPS[group];
    const promise = Promise.all([
      ...manifest.images.map((url) => this.loadImage(url)),
      ...manifest.textures.map((url) => this.loadTexture(url)),
      ...manifest.models.map((url) => this.loadModelPlaceholder(url)),
    ]).then(() => {
      this.loadedGroups.add(group);
    });

    this.groupPromises.set(group, promise);
    void promise.catch(() => {
      if (this.groupPromises.get(group) === promise) this.groupPromises.delete(group);
      this.loadedGroups.delete(group);
    });
    return promise;
  }

  isGroupLoaded(group: AssetGroup): boolean {
    return this.loadedGroups.has(group);
  }

  getImage(url: string): HTMLImageElement {
    const image = this.images.get(url);
    if (!image) throw new Error(`Image asset is not preloaded: ${url}`);
    return image;
  }

  getImageOrNull(url: string): HTMLImageElement | null {
    return this.images.get(url) ?? null;
  }

  getTexture(url: string): THREE.Texture {
    const texture = this.textures.get(url);
    if (!texture) throw new Error(`Texture asset is not preloaded: ${url}`);
    return texture;
  }

  getTextureClone(url: string): THREE.Texture {
    const clone = this.getTexture(url).clone();
    clone.needsUpdate = true;
    return clone;
  }

  private async loadTexture(url: string): Promise<THREE.Texture> {
    const cached = this.textures.get(url);
    if (cached) return cached;
    const pending = this.texturePromises.get(url);
    if (pending) return pending;

    const promise = withAssetTimeout(
      this.getTextureLoader()
      .then((loader) => loader.loadAsync(url))
      .then((texture) => {
        this.textures.set(url, texture);
        return texture;
      }),
      url,
    );
    this.texturePromises.set(url, promise);
    void promise.finally(() => {
      if (this.texturePromises.get(url) === promise) this.texturePromises.delete(url);
    }).catch(() => undefined);
    return promise;
  }

  private async getTextureLoader(): Promise<THREE.TextureLoader> {
    if (this.textureLoader) return this.textureLoader;
    const { TextureLoader } = await import('three');
    this.textureLoader = new TextureLoader();
    return this.textureLoader;
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    const cached = this.images.get(url);
    if (cached) return Promise.resolve(cached);
    const pending = this.imagePromises.get(url);
    if (pending) return pending;

    const promise = withAssetTimeout(new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        const decode = image.decode?.();
        if (!decode) {
          this.images.set(url, image);
          resolve(image);
          return;
        }
        decode
          .catch(() => undefined)
          .then(() => {
            this.images.set(url, image);
            resolve(image);
          });
      };
      image.onerror = () => reject(new Error(`Failed to load image asset: ${url}`));
      image.src = url;
    }), url);
    this.imagePromises.set(url, promise);
    void promise.finally(() => {
      if (this.imagePromises.get(url) === promise) this.imagePromises.delete(url);
    }).catch(() => undefined);
    return promise;
  }

  private loadModelPlaceholder(_url: string): Promise<void> {
    return Promise.resolve();
  }
}

export const assetPreloader = new AssetPreloader();
