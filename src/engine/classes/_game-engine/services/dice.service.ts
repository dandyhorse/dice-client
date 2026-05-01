import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {
  DICE_COUNT,
  DICE_HALF_SIZE,
  DICE_MASS,
  DICE_SPACING,
  HOLD_HEIGHT,
  INTERPOLATION_DELAY_MS,
  TABLE_DEPTH,
  TABLE_WIDTH,
  THROW_ANGULAR_RANDOM,
  THROW_POSITION_PADDING,
  WALL_INSET,
} from '../../../config';
import type { DieStateFull } from './network.service';

interface LocalDie {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  spawnOffset: THREE.Vector3;
}

interface RemoteDie {
  mesh: THREE.Mesh;
  p: THREE.Vector3;
  q: THREE.Quaternion;
  v: THREE.Vector3;
  w: THREE.Vector3;
  lastUpdateMs: number;
  samples: RemoteSample[];
  sampleCursor: number;
  sampleCount: number;
}

interface RemoteSample {
  atMs: number;
  p: THREE.Vector3;
  q: THREE.Quaternion;
  v: THREE.Vector3;
  w: THREE.Vector3;
}

// Three.js BoxGeometry materials indexed in порядке: [+X, -X, +Y, -Y, +Z, -Z].
// Серверный маппинг (physics-world.class.ts FACE_AXES): +X=1, -X=6, +Y=2, -Y=5, +Z=3, -Z=4.
// Противоположные грани в сумме 7 (стандартная d6). Эта таблица — единственная
// точка истины визуального ↔ серверного соответствия; менять синхронно с сервером.
const FACE_VALUES_BY_MATERIAL_INDEX = [1, 6, 2, 5, 3, 4] as const;
const FACE_AXES: { axis: CANNON.Vec3; face: number }[] = [
  { axis: new CANNON.Vec3(1, 0, 0), face: 1 },
  { axis: new CANNON.Vec3(-1, 0, 0), face: 6 },
  { axis: new CANNON.Vec3(0, 1, 0), face: 2 },
  { axis: new CANNON.Vec3(0, -1, 0), face: 5 },
  { axis: new CANNON.Vec3(0, 0, 1), face: 3 },
  { axis: new CANNON.Vec3(0, 0, -1), face: 4 },
];

const PIP_LAYOUT: Record<number, [number, number][]> = {
  // координаты в долях [0..1], (x, y) от верх-лево
  1: [[0.5, 0.5]],
  2: [[0.25, 0.25], [0.75, 0.75]],
  3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
  4: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
  5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
  6: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.5], [0.75, 0.5], [0.25, 0.75], [0.75, 0.75]],
};

const TEXTURE_SIZE = 128;
const PIP_RADIUS_FRACTION = 0.09;
const FACE_BG = '#f5f5f0';
const FACE_PIP = '#1a1a1a';
const DICE_TEXTURE_BASE_URL = '/assets/dice/plastered-stone-wall-1k/';
const DICE_COLOR_MAP_URL = `${DICE_TEXTURE_BASE_URL}plastered_stone_wall_diff_1k.jpg`;
const DICE_NORMAL_MAP_URL = `${DICE_TEXTURE_BASE_URL}plastered_stone_wall_nor_gl_1k.png`;
const DICE_ROUGHNESS_MAP_URL = `${DICE_TEXTURE_BASE_URL}plastered_stone_wall_rough_1k.png`;
const DICE_BASE_BRIGHTNESS = 1.45;
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

let diceBaseImage: HTMLImageElement | null = null;
let diceBaseImageLoading = false;
let cachedFaceTextureEntries: FaceTextureEntry[] | null = null;
let cachedDiceSurfaceMaps: DiceSurfaceMaps | null = null;

const drawFaceTexture = (entry: FaceTextureEntry): void => {
  const { ctx, value } = entry;
  ctx.fillStyle = FACE_BG;
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  if (diceBaseImage) {
    ctx.filter = `brightness(${DICE_BASE_BRIGHTNESS}) contrast(95%)`;
    ctx.drawImage(diceBaseImage, 0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
    ctx.filter = 'none';
  }
  ctx.fillStyle = FACE_PIP;
  const r = TEXTURE_SIZE * PIP_RADIUS_FRACTION;
  for (const [fx, fy] of PIP_LAYOUT[value] ?? []) {
    ctx.beginPath();
    ctx.arc(fx * TEXTURE_SIZE, fy * TEXTURE_SIZE, r, 0, Math.PI * 2);
    ctx.fill();
  }
  entry.texture.needsUpdate = true;
};

const ensureDiceBaseImageLoaded = (): void => {
  if (diceBaseImage || diceBaseImageLoading) return;
  diceBaseImageLoading = true;
  const image = new Image();
  image.onload = () => {
    diceBaseImage = image;
    diceBaseImageLoading = false;
    for (const entry of cachedFaceTextureEntries ?? []) drawFaceTexture(entry);
  };
  image.onerror = () => {
    diceBaseImageLoading = false;
  };
  image.src = DICE_COLOR_MAP_URL;
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
  ensureDiceBaseImageLoaded();
  return entry;
};

const getFaceTextures = (): THREE.CanvasTexture[] => {
  if (!cachedFaceTextureEntries) {
    cachedFaceTextureEntries = FACE_VALUES_BY_MATERIAL_INDEX.map((v) => createPipTexture(v));
  }
  return cachedFaceTextureEntries.map((entry) => entry.texture);
};

const getDiceSurfaceMaps = (): DiceSurfaceMaps => {
  if (cachedDiceSurfaceMaps) return cachedDiceSurfaceMaps;
  const loader = new THREE.TextureLoader();
  const normalMap = loader.load(DICE_NORMAL_MAP_URL);
  const roughnessMap = loader.load(DICE_ROUGHNESS_MAP_URL);
  for (const texture of [normalMap, roughnessMap]) {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.anisotropy = 1;
  }
  cachedDiceSurfaceMaps = { normalMap, roughnessMap };
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

const createDiceVisualGeometry = (size: number): THREE.BoxGeometry => {
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
  return geometry;
};

const PARKED_Y = -1000;
const REMOTE_SAMPLE_CAPACITY = 8;
const INTERPOLATION_DELAY_RAMP_MS = 120;

// Максимальное время экстраполяции без свежего снапшота. Если сервер молчит
// дольше этого, кости не продолжают лететь — застывают на последнем известном
// состоянии (иначе при drop'е пакетов вылетели бы за арену).
const MAX_EXTRAPOLATION_MS = 250;

export type DiceMode = 'local' | 'network';

export interface DiceServiceOptions {
  shadowsEnabled?: boolean;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export class DiceService {
  private scene: THREE.Scene;
  private world: CANNON.World | null;
  private material: CANNON.Material | null;
  private readonly mode: DiceMode;
  private readonly shadowsEnabled: boolean;
  private isHeld = false;
  private interpolationRampStartMs = 0;
  private readonly tmpDeltaQ = new THREE.Quaternion();

  // В local mode — массив LocalDie (cannon body + mesh).
  // В network mode — массив RemoteDie (только mesh + state от сервера).
  private localDice: LocalDie[] = [];
  private localActiveIndices: number[] = [];
  private remoteDice: RemoteDie[] = [];

  constructor(
    scene: THREE.Scene,
    world: CANNON.World | null,
    material: CANNON.Material | null,
    mode: DiceMode = 'local',
    options: DiceServiceOptions = {},
  ) {
    this.scene = scene;
    this.world = world;
    this.material = material;
    this.mode = mode;
    this.shadowsEnabled = options.shadowsEnabled ?? mode === 'local';
  }

  spawn(): void {
    const size = DICE_HALF_SIZE * 2;
    const geometry = createDiceVisualGeometry(size);

    for (let i = 0; i < DICE_COUNT; i++) {
      const materials = createFaceMaterials();
      const mesh = new THREE.Mesh(geometry, materials);
      mesh.castShadow = this.shadowsEnabled;
      mesh.receiveShadow = this.shadowsEnabled;
      this.scene.add(mesh);

      const offsetX = (i - (DICE_COUNT - 1) / 2) * DICE_SPACING;

      if (this.mode === 'local') {
        const body = new CANNON.Body({
          mass: DICE_MASS,
          shape: new CANNON.Box(new CANNON.Vec3(DICE_HALF_SIZE, DICE_HALF_SIZE, DICE_HALF_SIZE)),
          material: this.material ?? undefined,
          linearDamping: 0.1,
          angularDamping: 0.1,
        });
        body.allowSleep = true;
        // Sync с dice-server/src/engine/classes/physics-world.class.ts (0.25/0.2):
        // local mode и network mode дают одинаковый тайминг rest, без затяжной паузы.
        body.sleepSpeedLimit = 0.25;
        body.sleepTimeLimit = 0.2;
        if (this.world) this.world.addBody(body);

        body.position.set(offsetX, DICE_HALF_SIZE + 0.05, 0);
        mesh.position.copy(body.position as unknown as THREE.Vector3);

        this.localDice.push({
          mesh,
          body,
          spawnOffset: new THREE.Vector3(offsetX, 0, 0),
        });
      } else {
        mesh.position.set(offsetX, DICE_HALF_SIZE + 0.05, 0);
        // В network mode до первого snapshot'а кости не показываем — первый
        // dice-spawn от сервера даст их реальную позицию. Иначе мигнут в локальных.
        mesh.visible = false;

        this.remoteDice.push({
          mesh,
          p: mesh.position.clone(),
          q: new THREE.Quaternion(),
          v: new THREE.Vector3(),
          w: new THREE.Vector3(),
          lastUpdateMs: 0,
          samples: this.createRemoteSamples(),
          sampleCursor: 0,
          sampleCount: 0,
        });
      }
    }
    if (this.mode === 'local') this.localActiveIndices = this.allLocalIndices();
  }

  pickup(): void {
    if (this.isHeld) return;
    this.isHeld = true;
    if (this.mode === 'local') {
      const active = new Set(this.localActiveIndices);
      for (let i = 0; i < this.localDice.length; i++) {
        if (!active.has(i)) continue;
        const die = this.localDice[i]!;
        die.mesh.visible = false;
        die.body.type = CANNON.Body.KINEMATIC;
        die.body.velocity.setZero();
        die.body.angularVelocity.setZero();
        die.body.force.setZero();
        die.body.torque.setZero();
        die.body.position.set(0, PARKED_Y, 0);
        die.body.sleep();
      }
      return;
    }
    // network: прячем меши. Сервер получит mousedown'а не видит, но
    // пока не придёт первый снапшот (начала нового броска) — кости скрыты.
    for (const die of this.remoteDice) {
      die.mesh.visible = false;
      this.clearRemoteSamples(die);
      // Обнуляем velocity чтобы extrapolate не уводил мешь в сторону
      // на случай запоздалого снапшота с velocity != 0.
      die.v.set(0, 0, 0);
      die.w.set(0, 0, 0);
    }
    this.interpolationRampStartMs = 0;
  }

  release(velocity: THREE.Vector3, position: THREE.Vector3): void {
    if (!this.isHeld) return;
    // Снимаем hold-флаг ВСЕГДА (и в network mode тоже) — иначе applySnapshot
    // не сможет вернуть visible=true и кости останутся скрытыми после броска.
    this.isHeld = false;
    if (this.mode !== 'local') return; // network: ждём первый snapshot, кости появятся там
    const active = this.localActiveIndices.length > 0 ? this.localActiveIndices : this.allLocalIndices();
    const activeSet = new Set(active);
    for (let i = 0; i < this.localDice.length; i++) {
      if (activeSet.has(i)) continue;
      this.parkLocalDie(this.localDice[i]!);
    }
    const center = (active.length - 1) / 2;
    const releasePosition = this.clampReleasePosition(position, active.length);
    for (let slot = 0; slot < active.length; slot++) {
      const die = this.localDice[active[slot]!]!;
      die.mesh.visible = true;
      die.body.type = CANNON.Body.DYNAMIC;
      die.body.position.set(
        releasePosition.x + (slot - center) * DICE_SPACING,
        releasePosition.y,
        releasePosition.z + die.spawnOffset.z,
      );
      die.body.quaternion.setFromAxisAngle(
        new CANNON.Vec3(Math.random(), Math.random(), Math.random()).unit(),
        Math.random() * Math.PI * 2,
      );
      die.body.wakeUp();
      die.body.velocity.set(velocity.x, velocity.y, velocity.z);
      die.body.angularVelocity.set(
        (Math.random() - 0.5) * THROW_ANGULAR_RANDOM,
        (Math.random() - 0.5) * THROW_ANGULAR_RANDOM,
        (Math.random() - 0.5) * THROW_ANGULAR_RANDOM,
      );
      die.mesh.position.set(die.body.position.x, die.body.position.y, die.body.position.z);
      die.mesh.quaternion.set(
        die.body.quaternion.x,
        die.body.quaternion.y,
        die.body.quaternion.z,
        die.body.quaternion.w,
      );
    }
  }

  private clampReleasePosition(position: THREE.Vector3, diceCount: number): THREE.Vector3 {
    const maxOffsetX = ((diceCount - 1) / 2) * DICE_SPACING;
    const limitX = Math.max(
      0,
      TABLE_WIDTH / 2 - WALL_INSET - maxOffsetX - DICE_HALF_SIZE - THROW_POSITION_PADDING,
    );
    const limitZ = Math.max(
      0,
      TABLE_DEPTH / 2 - WALL_INSET - DICE_HALF_SIZE - THROW_POSITION_PADDING,
    );
    return new THREE.Vector3(
      clamp(Number.isFinite(position.x) ? position.x : 0, -limitX, limitX),
      HOLD_HEIGHT,
      clamp(Number.isFinite(position.z) ? position.z : 0, -limitZ, limitZ),
    );
  }

  syncMeshes(): void {
    if (this.mode !== 'local') return;
    for (const die of this.localDice) {
      if (!die.mesh.visible) continue;
      die.mesh.position.set(die.body.position.x, die.body.position.y, die.body.position.z);
      die.mesh.quaternion.set(
        die.body.quaternion.x,
        die.body.quaternion.y,
        die.body.quaternion.z,
        die.body.quaternion.w,
      );
    }
  }

  getActiveDiceMeshes(): { mesh: THREE.Mesh; index: number }[] {
    if (this.mode === 'network') return this.getActiveRemoteMeshes();
    const out: { mesh: THREE.Mesh; index: number }[] = [];
    for (const index of this.localActiveIndices) {
      const die = this.localDice[index];
      if (!die?.mesh.visible) continue;
      out.push({ mesh: die.mesh, index });
    }
    return out;
  }

  getDiceMeshes(): { mesh: THREE.Mesh; index: number }[] {
    if (this.mode === 'network') return this.getRemoteMeshes();
    return this.localDice.map((die, index) => ({ mesh: die.mesh, index }));
  }

  getLocalActiveIndices(): number[] {
    return [...this.localActiveIndices];
  }

  setLocalActiveIndices(indices: number[]): void {
    if (this.mode !== 'local') return;
    const active = new Set<number>();
    for (const index of indices) {
      if (Number.isInteger(index) && index >= 0 && index < this.localDice.length) {
        active.add(index);
      }
    }
    this.localActiveIndices = active.size > 0 ? [...active].sort((a, b) => a - b) : this.allLocalIndices();
    const activeSet = new Set(this.localActiveIndices);
    for (let i = 0; i < this.localDice.length; i++) {
      const die = this.localDice[i]!;
      if (!activeSet.has(i)) {
        this.parkLocalDie(die);
      } else if (!die.mesh.visible || die.body.position.y < -100) {
        this.resetLocalDieToSpawn(i, die);
      }
    }
  }

  resetLocalForNewTurn(): void {
    if (this.mode !== 'local') return;
    this.localActiveIndices = this.allLocalIndices();
    for (let i = 0; i < this.localDice.length; i++) {
      this.resetLocalDieToSpawn(i, this.localDice[i]!);
    }
  }

  areLocalActiveDiceAtRest(): boolean {
    if (this.mode !== 'local') return false;
    return this.localActiveIndices.every((index) => {
      const die = this.localDice[index];
      return die !== undefined && die.body.sleepState === CANNON.Body.SLEEPING;
    });
  }

  getLocalActiveFaces(): number[] {
    if (this.mode !== 'local') return [];
    return this.localActiveIndices.map((index) => this.readFaceValue(this.localDice[index]!.body));
  }

  /**
   * network mode: принять снапшот серверного state. Пишет внутреннее состояние,
   * `extrapolate()` на следующем кадре отрендерит буферизированное состояние.
   */
  applySnapshot(dice: DieStateFull[], now: number, options: { immediate?: boolean } = {}): void {
    if (this.mode !== 'network') return;
    // ВАЖНО: isHeld здесь НЕ сбрасываем — это делает release(). Иначе любой snapshot
    // (например, опоздавший REST от прошлого броска) сорвёт hold и кости замерцают,
    // пока игрок держит мышь. Hold снимается только явным mouseup → release-event.
    // В бинарном протоколе id кости = её индекс в массиве (см. protocol/types).
    const n = Math.min(dice.length, this.remoteDice.length);
    for (let i = 0; i < n; i++) {
      const state = dice[i]!;
      const die = this.remoteDice[i]!;
      die.p.set(state.p[0], state.p[1], state.p[2]);
      die.q.set(state.q[0], state.q[1], state.q[2], state.q[3]);
      die.v.set(state.v[0], state.v[1], state.v[2]);
      die.w.set(state.w[0], state.w[1], state.w[2]);
      die.lastUpdateMs = now;
      // Кости, отложенные сервером в bench (turn-based), запаркованы в y < -100
      // (BENCH_Y = -1000). Их не рендерим. Это автоматически сжимает активный
      // пул в 6-1 = 5 кубиков и т.д. без отдельного opcode'а.
      if (state.p[1] < -100) {
        die.mesh.visible = false;
        this.clearRemoteSamples(die);
        continue;
      }

      if (this.isHeld) continue; // игрок держит — state обновили, mesh оставляем спрятанным

      const wasEmpty = die.sampleCount === 0;
      if (options.immediate) this.clearRemoteSamples(die);
      this.pushRemoteSample(die, now);
      if (wasEmpty && !options.immediate) this.interpolationRampStartMs = now;

      die.mesh.visible = true;
      // Первый/финальный state пишем сразу. Обычные rolling-снапшоты дальше
      // идут через interpolation buffer, чтобы не ловить jitter от сети.
      if (wasEmpty || options.immediate) {
        die.mesh.position.copy(die.p);
        die.mesh.quaternion.copy(die.q);
      }
    }
  }

  /**
   * network mode: получить mesh'и активных (не bench) костей в индексации
   * snapshot'а. Используется SelectionService для raycast'а — ему нужны как
   * сами объекты для пересечения, так и их snapshot-индексы (которые сервер
   * ожидает в MATCH_SELECT_DICE/MATCH_BANK).
   *
   * Невидимые (bench) кости пропускаются — Raycaster их и так не возьмёт,
   * но фильтр здесь оставлен явным, чтобы snapshot-индекс соответствовал
   * именно положению в `remoteDice[]` (как и ждёт сервер).
   */
  getActiveRemoteMeshes(): { mesh: THREE.Mesh; index: number }[] {
    if (this.mode !== 'network') return [];
    const out: { mesh: THREE.Mesh; index: number }[] = [];
    for (let i = 0; i < this.remoteDice.length; i++) {
      const die = this.remoteDice[i]!;
      if (!die.mesh.visible) continue;
      out.push({ mesh: die.mesh, index: i });
    }
    return out;
  }

  getRemoteMeshes(): { mesh: THREE.Mesh; index: number }[] {
    if (this.mode !== 'network') return [];
    return this.remoteDice.map((die, index) => ({ mesh: die.mesh, index }));
  }

  /**
   * network mode: рендерит state с небольшой задержкой от реального времени.
   * Нормальный путь — interpolation между двумя серверными снапшотами; если
   * следующий снапшот опаздывает, коротко extrapolate'им от последнего.
   */
  extrapolate(now: number): void {
    if (this.mode !== 'network') return;
    const renderAtMs = now - this.getInterpolationDelayMs(now);
    for (const die of this.remoteDice) {
      if (!die.mesh.visible) continue;
      if (die.sampleCount === 0) continue;

      const first = this.getRemoteSample(die, 0);
      const last = this.getRemoteSample(die, die.sampleCount - 1);
      if (!first || !last) continue;

      if (renderAtMs <= first.atMs) {
        die.mesh.position.copy(first.p);
        die.mesh.quaternion.copy(first.q);
        continue;
      }

      let prev = first;
      let next: RemoteSample | null = null;
      for (let i = 1; i < die.sampleCount; i++) {
        const sample = this.getRemoteSample(die, i);
        if (!sample) break;
        if (sample.atMs >= renderAtMs) {
          next = sample;
          break;
        }
        prev = sample;
      }

      if (next) {
        const spanMs = Math.max(1, next.atMs - prev.atMs);
        const alpha = Math.min(1, Math.max(0, (renderAtMs - prev.atMs) / spanMs));
        die.mesh.position.lerpVectors(prev.p, next.p, alpha);
        die.mesh.quaternion.copy(prev.q).slerp(next.q, alpha);
      } else {
        this.renderExtrapolated(die, last, renderAtMs);
      }
    }
  }

  private createRemoteSamples(): RemoteSample[] {
    return Array.from({ length: REMOTE_SAMPLE_CAPACITY }, () => ({
      atMs: 0,
      p: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      v: new THREE.Vector3(),
      w: new THREE.Vector3(),
    }));
  }

  private getInterpolationDelayMs(now: number): number {
    if (this.interpolationRampStartMs <= 0) return INTERPOLATION_DELAY_MS;
    const elapsed = now - this.interpolationRampStartMs;
    if (elapsed >= INTERPOLATION_DELAY_RAMP_MS) return INTERPOLATION_DELAY_MS;
    return INTERPOLATION_DELAY_MS * Math.max(0, elapsed / INTERPOLATION_DELAY_RAMP_MS);
  }

  private clearRemoteSamples(die: RemoteDie): void {
    die.sampleCursor = 0;
    die.sampleCount = 0;
  }

  private pushRemoteSample(die: RemoteDie, atMs: number): void {
    const sample = die.samples[die.sampleCursor]!;
    sample.atMs = atMs;
    sample.p.copy(die.p);
    sample.q.copy(die.q);
    sample.v.copy(die.v);
    sample.w.copy(die.w);
    die.sampleCursor = (die.sampleCursor + 1) % REMOTE_SAMPLE_CAPACITY;
    die.sampleCount = Math.min(REMOTE_SAMPLE_CAPACITY, die.sampleCount + 1);
  }

  private getRemoteSample(die: RemoteDie, index: number): RemoteSample | null {
    if (index < 0 || index >= die.sampleCount) return null;
    const oldest = (die.sampleCursor - die.sampleCount + REMOTE_SAMPLE_CAPACITY) % REMOTE_SAMPLE_CAPACITY;
    return die.samples[(oldest + index) % REMOTE_SAMPLE_CAPACITY] ?? null;
  }

  private renderExtrapolated(die: RemoteDie, sample: RemoteSample, renderAtMs: number): void {
    const dtMs = renderAtMs - sample.atMs;
    if (dtMs <= 0 || dtMs > MAX_EXTRAPOLATION_MS) {
      die.mesh.position.copy(sample.p);
      die.mesh.quaternion.copy(sample.q);
      return;
    }

    const dt = dtMs / 1000;
    die.mesh.position.set(
      sample.p.x + sample.v.x * dt,
      sample.p.y + sample.v.y * dt,
      sample.p.z + sample.v.z * dt,
    );

    const wLenSq = sample.w.lengthSq();
    if (wLenSq <= 1e-12) {
      die.mesh.quaternion.copy(sample.q);
      return;
    }

    const wLen = Math.sqrt(wLenSq);
    const halfAngle = (wLen * dt) / 2;
    const s = Math.sin(halfAngle) / wLen;
    this.tmpDeltaQ.set(sample.w.x * s, sample.w.y * s, sample.w.z * s, Math.cos(halfAngle));
    die.mesh.quaternion.multiplyQuaternions(this.tmpDeltaQ, sample.q);
  }

  private allLocalIndices(): number[] {
    return Array.from({ length: this.localDice.length }, (_, i) => i);
  }

  private parkLocalDie(die: LocalDie): void {
    die.mesh.visible = false;
    die.body.type = CANNON.Body.KINEMATIC;
    die.body.velocity.setZero();
    die.body.angularVelocity.setZero();
    die.body.force.setZero();
    die.body.torque.setZero();
    die.body.position.set(0, PARKED_Y, 0);
    die.body.sleep();
  }

  private resetLocalDieToSpawn(index: number, die: LocalDie): void {
    const offsetX = (index - (this.localDice.length - 1) / 2) * DICE_SPACING;
    die.mesh.visible = true;
    die.body.type = CANNON.Body.DYNAMIC;
    die.body.velocity.setZero();
    die.body.angularVelocity.setZero();
    die.body.force.setZero();
    die.body.torque.setZero();
    die.body.position.set(offsetX, DICE_HALF_SIZE + 0.05, 0);
    die.body.quaternion.set(0, 0, 0, 1);
    die.body.wakeUp();
    die.mesh.position.set(die.body.position.x, die.body.position.y, die.body.position.z);
    die.mesh.quaternion.set(0, 0, 0, 1);
  }

  private readFaceValue(body: CANNON.Body): number {
    const up = new CANNON.Vec3(0, 1, 0);
    let bestDot = -Infinity;
    let bestFace = 1;
    for (const { axis, face } of FACE_AXES) {
      const rotated = body.quaternion.vmult(axis);
      const dot = rotated.dot(up);
      if (dot > bestDot) {
        bestDot = dot;
        bestFace = face;
      }
    }
    return bestFace;
  }
}
