import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {
  CAMERA_FOV,
  CAMERA_TARGET,
  CAMERA_UP,
  CAMERA_X,
  CAMERA_Z,
  TABLE_DEPTH,
  TABLE_THICKNESS,
  TABLE_WIDTH,
  WALL_HEIGHT,
  WALL_INSET,
  WALL_THICKNESS,
  WORLD_GRAVITY,
} from '../../config';
import { DiceService } from './services/dice.service';
import { HudUiService } from './services/hud-ui.service';
import { NetworkService } from './services/network.service';
import { scoreRoll } from '../../../domain/scorer';
import type {
  MatchRollResultPayload,
  MatchStatePayload,
  RestPayload,
  RoomState,
  SnapshotPayload,
} from './services/network.service';
import { MATCH_PHASE, ROOM_MODE, ROOM_ROLE, ROOM_STATUS } from './services/network.service';
import { SelectionService } from './services/selection.service';
import { ShakeInputService } from './services/shake-input.service';

export type GameMode = 'local' | 'network';

export interface GameEngineOptions {
  mode?: GameMode;
  network?: NetworkService;
}

/**
 * Архитектура:
 *  - local mode: полная cannon-es симуляция на клиенте (старый рабочий путь)
 *  - network mode: НИКАКОЙ локальной физики. Клиент — чистое зеркало серверного state.
 *    Сервер шлёт dice-snapshot (p, q, v, w) с частотой SNAPSHOT_HZ, клиент
 *    между снапшотами экстраполирует по velocity/angular velocity. Оба клиента
 *    рендерят одну и ту же серверную симуляцию → видят ровно одно и то же.
 */
export class GameEngine {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  readonly physicsWorld: CANNON.World | null;
  readonly diceMaterial: CANNON.Material | null;
  readonly tableMaterial: CANNON.Material | null;

  readonly mode: GameMode;
  private readonly dice: DiceService;
  private readonly input: ShakeInputService;
  private readonly network: NetworkService | null;
  private readonly selection: SelectionService | null;
  private readonly hud: HudUiService | null;
  private currentRoomState: RoomState | null = null;
  private currentMatchState: MatchStatePayload | null = null;

  private lastTime = 0;
  private rafId: number | null = null;

  constructor(options: GameEngineOptions = {}) {
    this.mode = options.mode ?? 'local';
    this.network = options.network ?? null;

    this.scene = this.createScene();
    this.camera = this.createCamera();
    this.renderer = this.createRenderer();

    if (this.mode === 'local') {
      this.physicsWorld = this.createPhysicsWorld();
      this.diceMaterial = new CANNON.Material('dice');
      this.tableMaterial = new CANNON.Material('table');
      this.setupContactMaterials();
      this.createPlayArea(true);
    } else {
      this.physicsWorld = null;
      this.diceMaterial = null;
      this.tableMaterial = null;
      // network mode — только визуалы стола/стен, без body. Физика на сервере.
      this.createPlayArea(false);
    }

    this.dice = new DiceService(this.scene, this.physicsWorld, this.diceMaterial, this.mode);
    this.dice.spawn();

    this.input = new ShakeInputService(this.renderer.domElement, this.camera);
    this.input.events.on('hold-start', () => {
      this.dice.pickup();
    });
    this.input.events.on('release', (velocity: THREE.Vector3, position: THREE.Vector3) => {
      // dice.release() для обоих режимов: в local — спавн с импульсом, в network —
      // только снять hold-флаг (см. dice.service.ts), чтобы первый снапшот сервера
      // мог вернуть visible=true. Без этого кости остаются скрытыми после броска.
      this.dice.release(velocity, position);
      if (this.mode === 'network' && this.network) {
        // Чистый state-sync: отправляем инпут серверу, локально ничего не крутим.
        // Сервер вернёт стрим снапшотов, с первым — кости появятся и полетят.
        this.network.sendRelease(velocity, position);
      }
    });

    if (this.mode === 'network' && this.network) {
      const net = this.network;
      net.events.on('dice-spawn', (snap: SnapshotPayload) => {
        this.dice.applySnapshot(snap.dice, performance.now());
      });
      net.events.on('dice-snapshot', (snap: SnapshotPayload) => {
        this.dice.applySnapshot(snap.dice, performance.now());
      });
      net.events.on('dice-rest', (rest: RestPayload) => {
        // Rest — финальный снапшот без v/w (в бинарном формате они опущены — всегда нули).
        // Применяем той же логикой, кости замрут в авторитативной позе.
        // faceValue пока не используем в UI.
        const ZERO: [number, number, number] = [0, 0, 0];
        this.dice.applySnapshot(
          rest.dice.map((d) => ({ p: d.p, q: d.q, v: ZERO, w: ZERO })),
          performance.now(),
        );
      });

      this.currentRoomState = net.getRoomState();
      const ownUserId = net.getUserId() ?? '';
      const isTestRoom = this.currentRoomState?.mode === ROOM_MODE.TEST;
      this.selection = isTestRoom
        ? null
        : new SelectionService(this.renderer.domElement, this.camera, this.dice);
      this.hud = isTestRoom ? null : new HudUiService(ownUserId);
      if (this.currentRoomState) this.hud?.setRoomState(this.currentRoomState);

      net.events.on('room-state', (state: RoomState) => {
        this.currentRoomState = state;
        this.hud?.setRoomState(state);
        if (isTestRoom) this.input.setEnabled(this.canUseTestInput(ownUserId));
      });

      if (isTestRoom) {
        net.events.on('match-state', (state: MatchStatePayload) => {
          this.currentMatchState = state;
          this.input.setEnabled(this.canUseTestInput(ownUserId));
        });
        this.input.setEnabled(this.canUseTestInput(ownUserId));
      } else {
        // Координация input vs selection: SELECTING на своём ходу включает клик
        // по костям и выключает hold/release; всё остальное — инверсно.
        // Без этого pickup() прячет кости как раз когда игрок хочет в них кликать.
        net.events.on('match-state', (state: MatchStatePayload) => {
          this.currentMatchState = state;
          this.hud?.setMatchState(state);
          const isOwnPlayer = this.isOwnPlayer(ownUserId);
          const isMyTurn = state.currentPlayer === ownUserId;
          const isSelecting = state.phase === MATCH_PHASE.SELECTING;
          const isWaiting = state.phase === MATCH_PHASE.WAITING;
          if (!isOwnPlayer || state.paused) {
            this.input.setEnabled(false);
            this.selection?.disable();
          } else if (isMyTurn && isSelecting) {
            this.input.setEnabled(false);
            this.selection?.enable();
          } else if (isMyTurn && isWaiting) {
            this.input.setEnabled(true);
            this.selection?.disable();
          } else {
            this.input.setEnabled(false);
            this.selection?.disable();
          }
        });

        // BUST оверлей + scoring-подсказка для игрока: HUD сохранит rolledFaces
        // и при фазе SELECTING покажет какие комбинации scoring (правила Farkle
        // непрозрачны — single 2/3/4/6 не scoring и т.п., без подсказки игрок
        // тыкает Continue с невалидным выбором и получает ack-error каждый раз).
        net.events.on('match-roll-result', (r: MatchRollResultPayload) => {
          if (r.bust) {
            this.selection?.clearScoringOptions();
            this.hud?.showError('BUST');
          } else {
            const canSelectRoll =
              this.currentMatchState?.currentPlayer === ownUserId && this.isOwnPlayer(ownUserId);
            if (canSelectRoll) {
              this.selection?.setScoringOptions(r.rolledFaces, scoreRoll(r.rolledFaces));
            } else {
              this.selection?.clearScoringOptions();
            }
            this.hud?.setRollResult(r.rolledFaces);
          }
        });

        this.selection?.events.on('selection-changed', (indices: number[], valid: boolean) => {
          this.hud?.setSelectionState(indices.length, valid);
        });

        this.hud?.events.on('continue-clicked', () => {
          const sel = this.selection;
          if (!sel) return;
          const indices = sel.getSelectedIndices();
          if (indices.length === 0) return;
          net
            .sendSelectDice(indices)
            .then(() => sel.clear())
            .catch((e: Error) => this.hud?.showError(e.message));
        });

        this.hud?.events.on('bank-clicked', () => {
          const sel = this.selection;
          if (!sel) return;
          const indices = sel.getSelectedIndices();
          if (indices.length === 0) return;
          net
            .sendBank(indices)
            .then(() => sel.clear())
            .catch((e: Error) => this.hud?.showError(e.message));
        });

        // До получения первого MATCH_STATE: shake-input выключен, чтобы игрок
        // не успел отправить release в неподтверждённой фазе. Включится в
        // обработчике выше, когда придёт состояние "WAITING + own turn".
        this.input.setEnabled(false);
      }
    } else {
      this.selection = null;
      this.hud = null;
    }

    window.addEventListener('resize', this.onResize);
  }

  private isOwnPlayer(ownUserId: string): boolean {
    const member = this.currentRoomState?.members.find((m) => m.userId === ownUserId);
    return member?.role === ROOM_ROLE.PLAYER;
  }

  private canUseTestInput(ownUserId: string): boolean {
    const member = this.currentRoomState?.members.find((m) => m.userId === ownUserId);
    const roomActive = this.currentRoomState?.status === ROOM_STATUS.ACTIVE;
    const rolling = this.currentMatchState?.phase === MATCH_PHASE.ROLLING;
    const paused =
      this.currentMatchState?.paused === true ||
      this.currentRoomState?.status === ROOM_STATUS.PAUSED;
    return member?.role === ROOM_ROLE.PLAYER && member.online && roomActive && !paused && !rolling;
  }

  start(): void {
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.gameLoop);
  }

  stop(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  destroy(): void {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    this.input.destroy();
    this.selection?.destroy();
    this.hud?.destroy();
    this.renderer.domElement.remove();
    this.renderer.dispose();
  }

  private createScene(): THREE.Scene {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a22);

    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(0.001, 18, 0.001);
    directional.castShadow = true;
    directional.shadow.mapSize.width = 2048;
    directional.shadow.mapSize.height = 2048;
    directional.shadow.bias = -0.0005;

    const shadowSize = 20;
    directional.shadow.camera.left = -shadowSize;
    directional.shadow.camera.right = shadowSize;
    directional.shadow.camera.top = shadowSize;
    directional.shadow.camera.bottom = -shadowSize;
    directional.shadow.camera.near = 0.5;
    directional.shadow.camera.far = 60;

    const ceilingLight = new THREE.PointLight(0xfff1d0, 1.4, 14, 1.2);
    ceilingLight.position.set(0, WALL_HEIGHT - 0.3, 0);

    scene.add(ambient);
    scene.add(directional);
    scene.add(ceilingLight);
    return scene;
  }

  private createCamera(): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(
      CAMERA_FOV,
      window.innerWidth / window.innerHeight,
      0.1,
      200,
    );
    camera.up.set(...CAMERA_UP);
    camera.position.set(CAMERA_X, this.computeCameraY(camera.aspect), CAMERA_Z);
    camera.lookAt(...CAMERA_TARGET);
    return camera;
  }

  private createRenderer(): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    return renderer;
  }

  private createPhysicsWorld(): CANNON.World {
    const world = new CANNON.World({
      gravity: new CANNON.Vec3(0, WORLD_GRAVITY, 0),
    });
    world.broadphase = new CANNON.SAPBroadphase(world);
    world.quatNormalizeSkip = 2;
    world.allowSleep = true;
    (world.solver as CANNON.GSSolver).iterations = 10;
    return world;
  }

  private setupContactMaterials(): void {
    if (!this.physicsWorld || !this.diceMaterial || !this.tableMaterial) return;
    this.physicsWorld.addContactMaterial(
      new CANNON.ContactMaterial(this.diceMaterial, this.tableMaterial, {
        friction: 0.45,
        restitution: 0.35,
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 3,
      }),
    );

    this.physicsWorld.addContactMaterial(
      new CANNON.ContactMaterial(this.diceMaterial, this.diceMaterial, {
        friction: 0.25,
        restitution: 0.25,
      }),
    );
  }

  private computeCameraY(aspect = this.camera.aspect): number {
    const tanHalf = Math.tan((CAMERA_FOV * Math.PI) / 360);
    const hForDepth = TABLE_DEPTH / 2 / tanHalf;
    const hForWidth = TABLE_WIDTH / 2 / (tanHalf * aspect);
    return Math.max(hForDepth, hForWidth);
  }

  private createPlayArea(withBodies: boolean): void {
    this.createTable(withBodies);
    this.createWalls(withBodies);
    if (withBodies) this.createCeiling();
  }

  private createTable(withBody: boolean): void {
    const geometry = new THREE.BoxGeometry(TABLE_WIDTH, TABLE_THICKNESS, TABLE_DEPTH);
    const material = new THREE.MeshStandardMaterial({
      color: 0x2c5530,
      roughness: 0.95,
      metalness: 0.0,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, -TABLE_THICKNESS / 2, 0);
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    if (withBody && this.physicsWorld && this.tableMaterial) {
      const body = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(
          new CANNON.Vec3(TABLE_WIDTH / 2, TABLE_THICKNESS / 2, TABLE_DEPTH / 2),
        ),
        material: this.tableMaterial,
        position: new CANNON.Vec3(0, -TABLE_THICKNESS / 2, 0),
      });
      this.physicsWorld.addBody(body);
    }
  }

  private createWalls(withBody: boolean): void {
    const playHalfW = TABLE_WIDTH / 2 - WALL_INSET;
    const playHalfD = TABLE_DEPTH / 2 - WALL_INSET;
    const halfH = WALL_HEIGHT / 2;
    const halfT = WALL_THICKNESS / 2;
    const wallY = halfH;

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x5c4a3a,
      roughness: 0.7,
      metalness: 0.05,
    });

    const walls: { halfExtents: [number, number, number]; pos: [number, number, number] }[] = [
      { halfExtents: [playHalfW + halfT, halfH, halfT], pos: [0, wallY, -playHalfD - halfT] },
      { halfExtents: [playHalfW + halfT, halfH, halfT], pos: [0, wallY, playHalfD + halfT] },
      { halfExtents: [halfT, halfH, playHalfD + halfT], pos: [playHalfW + halfT, wallY, 0] },
      { halfExtents: [halfT, halfH, playHalfD + halfT], pos: [-playHalfW - halfT, wallY, 0] },
    ];

    for (const w of walls) {
      if (withBody && this.physicsWorld && this.tableMaterial) {
        const body = new CANNON.Body({
          mass: 0,
          shape: new CANNON.Box(new CANNON.Vec3(...w.halfExtents)),
          material: this.tableMaterial,
          position: new CANNON.Vec3(...w.pos),
        });
        this.physicsWorld.addBody(body);
      }

      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w.halfExtents[0] * 2, w.halfExtents[1] * 2, w.halfExtents[2] * 2),
        wallMaterial,
      );
      mesh.position.set(...w.pos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
    }
  }

  private createCeiling(): void {
    if (!this.physicsWorld || !this.tableMaterial) return;
    const playHalfW = TABLE_WIDTH / 2 - WALL_INSET;
    const playHalfD = TABLE_DEPTH / 2 - WALL_INSET;
    const halfT = WALL_THICKNESS / 2;

    const body = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(playHalfW, halfT, playHalfD)),
      material: this.tableMaterial,
      position: new CANNON.Vec3(0, WALL_HEIGHT + halfT, 0),
    });
    this.physicsWorld.addBody(body);
  }

  private onResize = (): void => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.position.y = this.computeCameraY();
    this.camera.lookAt(...CAMERA_TARGET);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private gameLoop = (): void => {
    const currentTime = performance.now();
    let deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (deltaTime > 0.1 || Number.isNaN(deltaTime) || !Number.isFinite(deltaTime)) {
      deltaTime = 1 / 60;
    }

    this.input.update(currentTime);

    if (this.mode === 'local' && this.physicsWorld) {
      this.physicsWorld.step(1 / 60, deltaTime, 3);
      this.dice.syncMeshes();
    } else {
      // network: чистая экстраполяция от последнего серверного state.
      this.dice.extrapolate(currentTime);
    }

    this.renderer.render(this.scene, this.camera);
    this.rafId = requestAnimationFrame(this.gameLoop);
  };
}
