import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {
  DICE_COUNT,
  DICE_HALF_SIZE,
  DICE_MASS,
  DICE_SPACING,
  THROW_ANGULAR_RANDOM,
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
}

// Three.js BoxGeometry materials indexed in порядке: [+X, -X, +Y, -Y, +Z, -Z].
// Серверный маппинг (physics-world.class.ts FACE_AXES): +X=1, -X=6, +Y=2, -Y=5, +Z=3, -Z=4.
// Противоположные грани в сумме 7 (стандартная d6). Эта таблица — единственная
// точка истины визуального ↔ серверного соответствия; менять синхронно с сервером.
const FACE_VALUES_BY_MATERIAL_INDEX = [1, 6, 2, 5, 3, 4] as const;

const PIP_LAYOUT: Record<number, [number, number][]> = {
  // координаты в долях [0..1], (x, y) от верх-лево
  1: [[0.5, 0.5]],
  2: [[0.25, 0.25], [0.75, 0.75]],
  3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
  4: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
  5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
  6: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.5], [0.75, 0.5], [0.25, 0.75], [0.75, 0.75]],
};

const TEXTURE_SIZE = 256;
const PIP_RADIUS_FRACTION = 0.085;
const FACE_BG = '#f5f5f0';
const FACE_PIP = '#1a1a1a';

const createPipTexture = (value: number): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = FACE_BG;
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  ctx.fillStyle = FACE_PIP;
  const r = TEXTURE_SIZE * PIP_RADIUS_FRACTION;
  for (const [fx, fy] of PIP_LAYOUT[value] ?? []) {
    ctx.beginPath();
    ctx.arc(fx * TEXTURE_SIZE, fy * TEXTURE_SIZE, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
};

let cachedFaceTextures: THREE.CanvasTexture[] | null = null;
const getFaceTextures = (): THREE.CanvasTexture[] => {
  if (cachedFaceTextures) return cachedFaceTextures;
  cachedFaceTextures = FACE_VALUES_BY_MATERIAL_INDEX.map((v) => createPipTexture(v));
  return cachedFaceTextures;
};

const PARKED_Y = -1000;

// Максимальное время экстраполяции без свежего снапшота. Если сервер молчит
// дольше этого, кости не продолжают лететь — застывают на последнем известном
// состоянии (иначе при drop'е пакетов вылетели бы за арену).
const MAX_EXTRAPOLATION_MS = 250;

export type DiceMode = 'local' | 'network';

export class DiceService {
  private scene: THREE.Scene;
  private world: CANNON.World | null;
  private material: CANNON.Material | null;
  private readonly mode: DiceMode;
  private isHeld = false;

  // В local mode — массив LocalDie (cannon body + mesh).
  // В network mode — массив RemoteDie (только mesh + state от сервера).
  private localDice: LocalDie[] = [];
  private remoteDice: RemoteDie[] = [];

  constructor(
    scene: THREE.Scene,
    world: CANNON.World | null,
    material: CANNON.Material | null,
    mode: DiceMode = 'local',
  ) {
    this.scene = scene;
    this.world = world;
    this.material = material;
    this.mode = mode;
  }

  spawn(): void {
    const size = DICE_HALF_SIZE * 2;
    const geometry = new THREE.BoxGeometry(size, size, size);

    const faceTextures = getFaceTextures();
    for (let i = 0; i < DICE_COUNT; i++) {
      const materials = faceTextures.map(
        (texture) =>
          new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.4,
            metalness: 0.05,
          }),
      );
      const mesh = new THREE.Mesh(geometry, materials);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
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
        });
      }
    }
  }

  pickup(): void {
    if (this.isHeld) return;
    this.isHeld = true;
    if (this.mode === 'local') {
      for (const die of this.localDice) {
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
      // Обнуляем velocity чтобы extrapolate не уводил мешь в сторону
      // на случай запоздалого снапшота с velocity != 0.
      die.v.set(0, 0, 0);
      die.w.set(0, 0, 0);
    }
  }

  release(velocity: THREE.Vector3, position: THREE.Vector3): void {
    if (!this.isHeld) return;
    // Снимаем hold-флаг ВСЕГДА (и в network mode тоже) — иначе applySnapshot
    // не сможет вернуть visible=true и кости останутся скрытыми после броска.
    this.isHeld = false;
    if (this.mode !== 'local') return; // network: ждём первый snapshot, кости появятся там
    for (const die of this.localDice) {
      die.mesh.visible = true;
      die.body.type = CANNON.Body.DYNAMIC;
      die.body.position.set(
        position.x + die.spawnOffset.x,
        position.y + die.spawnOffset.y,
        position.z + die.spawnOffset.z,
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

  /**
   * network mode: принять снапшот серверного state. Пишет внутреннее состояние,
   * `extrapolate()` на следующем кадре положит его в меш. На первом снапшоте
   * снимает isHeld — если пользователь держал кости, бросок начался.
   */
  applySnapshot(dice: DieStateFull[], now: number): void {
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
        continue;
      }
      if (this.isHeld) continue; // игрок держит — state обновили, mesh оставляем спрятанным
      die.mesh.visible = true;
      // Сразу пишем в меш, чтобы при снапшоте с v=0 (rest) не было кадра со
      // старой позой до следующего extrapolate тика.
      die.mesh.position.copy(die.p);
      die.mesh.quaternion.copy(die.q);
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
   * network mode: между снапшотами. Экстраполирует position/orientation от
   * последнего известного state + velocity * dt. Даёт плавность при jitter'е
   * серверной рассылки (snapshot HZ ≈ RAF HZ, но гапсы покрываются extrapolate).
   */
  extrapolate(now: number): void {
    if (this.mode !== 'network') return;
    for (const die of this.remoteDice) {
      if (!die.mesh.visible) continue;
      const dtMs = now - die.lastUpdateMs;
      if (dtMs <= 0 || dtMs > MAX_EXTRAPOLATION_MS) {
        die.mesh.position.copy(die.p);
        die.mesh.quaternion.copy(die.q);
        continue;
      }
      const dt = dtMs / 1000;
      die.mesh.position.set(
        die.p.x + die.v.x * dt,
        die.p.y + die.v.y * dt,
        die.p.z + die.v.z * dt,
      );
      const angle = die.w.length() * dt;
      if (angle > 1e-6) {
        const axisX = die.w.x / die.w.length();
        const axisY = die.w.y / die.w.length();
        const axisZ = die.w.z / die.w.length();
        const s = Math.sin(angle / 2);
        const c = Math.cos(angle / 2);
        const deltaQ = new THREE.Quaternion(axisX * s, axisY * s, axisZ * s, c);
        die.mesh.quaternion.multiplyQuaternions(deltaQ, die.q);
      } else {
        die.mesh.quaternion.copy(die.q);
      }
    }
  }
}
