import * as THREE from 'three';

import { ASSET_GROUPS, type AssetGroup } from './asset-manifest';

class AssetPreloader {
  private readonly textureLoader = new THREE.TextureLoader();
  private readonly images = new Map<string, HTMLImageElement>();
  private readonly textures = new Map<string, THREE.Texture>();
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

  private loadTexture(url: string): Promise<THREE.Texture> {
    const cached = this.textures.get(url);
    if (cached) return Promise.resolve(cached);

    return this.textureLoader.loadAsync(url).then((texture) => {
      this.textures.set(url, texture);
      return texture;
    });
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    const cached = this.images.get(url);
    if (cached) return Promise.resolve(cached);

    return new Promise<HTMLImageElement>((resolve, reject) => {
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
    });
  }

  private loadModelPlaceholder(_url: string): Promise<void> {
    return Promise.resolve();
  }
}

export const assetPreloader = new AssetPreloader();
