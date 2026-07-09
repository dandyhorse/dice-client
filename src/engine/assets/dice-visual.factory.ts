import * as THREE from 'three';

import { DEFAULT_DICE_PRESET, type DicePresetVisual } from '../../dice-presets';
import { assetPreloader } from './asset-preloader';

// Three.js BoxGeometry materials indexed in порядке: [+X, -X, +Y, -Y, +Z, -Z].
// Серверный маппинг (physics-world.class.ts FACE_AXES): +X=1, -X=6, +Y=2, -Y=5, +Z=3, -Z=4.
// Противоположные грани в сумме 7 (стандартная d6).
export const FACE_VALUES_BY_MATERIAL_INDEX = [1, 6, 2, 5, 3, 4] as const;

const PIP_LAYOUT: Record<number, [number, number][]> = {
  1: [[0.5, 0.5]],
  2: [[0.25, 0.25], [0.75, 0.75]],
  3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
  4: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
  5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
  6: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.5], [0.75, 0.5], [0.25, 0.75], [0.75, 0.75]],
};

const TEXTURE_SIZE = 128;
const PIP_RADIUS_FRACTION = 0.09;
const VISUAL_EDGE_SOFTNESS = 0.035;
const VISUAL_EDGE_START = 0.68;
const VISUAL_WOBBLE = 0.0114;

interface FaceTextureEntry {
  value: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
}

interface DiceSurfaceMaps {
  normalMap: THREE.Texture;
  roughnessMap: THREE.Texture;
}

let cachedFaceTextureEntries: FaceTextureEntry[] | null = null;
let cachedDiceSurfaceMaps: DiceSurfaceMaps | null = null;
let cachedDiceSurfaceMapsKey = '';
let cachedGeometrySize = 0;
let cachedGeometry: THREE.BoxGeometry | null = null;
let activeVisual: DicePresetVisual = DEFAULT_DICE_PRESET.visual;

export interface DiceMeshOptions {
  shadowsEnabled?: boolean;
}

export const createDiceMesh = (size: number, options: DiceMeshOptions = {}): THREE.Mesh => {
  const mesh = new THREE.Mesh(getDiceVisualGeometry(size), createFaceMaterials());
  mesh.castShadow = options.shadowsEnabled ?? false;
  mesh.receiveShadow = options.shadowsEnabled ?? false;
  return mesh;
};

export const refreshDiceFaceTextures = (): void => {
  for (const entry of cachedFaceTextureEntries ?? []) drawFaceTexture(entry);
};

export const setDiceVisualPreset = (visual: DicePresetVisual): void => {
  activeVisual = visual;
  refreshDiceFaceTextures();
};

const drawFaceTexture = (entry: FaceTextureEntry): void => {
  const { ctx, value } = entry;
  ctx.fillStyle = activeVisual.faceBackground;
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

  const baseImage = assetPreloader.getImageOrNull(activeVisual.colorMapUrl);
  if (baseImage) {
    ctx.filter = `brightness(${activeVisual.brightness}) contrast(${Math.round(
      activeVisual.contrast * 100,
    )}%)`;
    ctx.drawImage(baseImage, 0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
    ctx.filter = 'none';
  }

  ctx.fillStyle = activeVisual.pipColor;
  const r = TEXTURE_SIZE * PIP_RADIUS_FRACTION;
  for (const [fx, fy] of PIP_LAYOUT[value] ?? []) {
    ctx.beginPath();
    ctx.arc(fx * TEXTURE_SIZE, fy * TEXTURE_SIZE, r, 0, Math.PI * 2);
    ctx.fill();
  }
  entry.texture.needsUpdate = true;
};

const createPipTexture = (value: number): FaceTextureEntry => {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  const ctx = canvas.getContext('2d')!;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.anisotropy = 4;
  const entry = { value, canvas, ctx, texture: tex };
  drawFaceTexture(entry);
  return entry;
};

const getFaceTextures = (): THREE.CanvasTexture[] => {
  if (!cachedFaceTextureEntries) {
    cachedFaceTextureEntries = FACE_VALUES_BY_MATERIAL_INDEX.map((v) => createPipTexture(v));
  } else {
    refreshDiceFaceTextures();
  }
  return cachedFaceTextureEntries.map((entry) => entry.texture);
};

const getDiceSurfaceMaps = (): DiceSurfaceMaps => {
  const key = `${activeVisual.normalMapUrl}|${activeVisual.roughnessMapUrl}`;
  if (cachedDiceSurfaceMaps && cachedDiceSurfaceMapsKey === key) return cachedDiceSurfaceMaps;

  const normalMap = assetPreloader.getTextureClone(activeVisual.normalMapUrl);
  const roughnessMap = assetPreloader.getTextureClone(activeVisual.roughnessMapUrl);
  for (const texture of [normalMap, roughnessMap]) {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.anisotropy = 1;
  }
  cachedDiceSurfaceMaps = { normalMap, roughnessMap };
  cachedDiceSurfaceMapsKey = key;
  return cachedDiceSurfaceMaps;
};

const createFaceMaterials = (): THREE.MeshStandardMaterial[] => {
  const surfaceMaps = getDiceSurfaceMaps();
  return getFaceTextures().map(
    (texture) =>
      new THREE.MeshStandardMaterial({
        map: texture,
        normalMap: surfaceMaps.normalMap,
        roughnessMap: surfaceMaps.roughnessMap,
        roughness: 1.0,
        metalness: 0.0,
        normalScale: new THREE.Vector2(0.076, 0.076),
        flatShading: true,
      }),
  );
};

const deterministicNoise = (x: number, y: number, z: number): number => {
  const n = Math.sin(x * 157.31 + y * 311.17 + z * 613.73) * 43758.5453;
  return n - Math.floor(n);
};

const getDiceVisualGeometry = (size: number): THREE.BoxGeometry => {
  if (cachedGeometry && cachedGeometrySize === size) return cachedGeometry;

  const geometry = new THREE.BoxGeometry(size, size, size, 4, 4, 4);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const half = size / 2;
  const softness = size * VISUAL_EDGE_SOFTNESS;
  const wobble = size * VISUAL_WOBBLE;

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const ax = Math.abs(x) / half;
    const ay = Math.abs(y) / half;
    const az = Math.abs(z) / half;
    const ex = Math.max(0, (ax - VISUAL_EDGE_START) / (1 - VISUAL_EDGE_START));
    const ey = Math.max(0, (ay - VISUAL_EDGE_START) / (1 - VISUAL_EDGE_START));
    const ez = Math.max(0, (az - VISUAL_EDGE_START) / (1 - VISUAL_EDGE_START));
    const nx = Math.sign(x);
    const ny = Math.sign(y);
    const nz = Math.sign(z);
    const n = deterministicNoise(x, y, z) - 0.5;

    position.setXYZ(
      i,
      x - nx * softness * (ey + ez) * 0.5 + nx * n * wobble * ey * ez,
      y - ny * softness * (ex + ez) * 0.5 + ny * n * wobble * ex * ez,
      z - nz * softness * (ex + ey) * 0.5 + nz * n * wobble * ex * ey,
    );
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  cachedGeometrySize = size;
  cachedGeometry = geometry;
  return geometry;
};
