import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {
  CAMERA_FOV,
  CAMERA_TARGET,
  CAMERA_UP,
  CAMERA_X,
  CAMERA_Z,
  DICE_DICE_FRICTION,
  DICE_DICE_RESTITUTION,
  DICE_HALF_SIZE,
  DICE_TABLE_CONTACT_RELAXATION,
  DICE_TABLE_CONTACT_STIFFNESS,
  DICE_TABLE_FRICTION,
  DICE_TABLE_RESTITUTION,
  REST_CORRECTION_MAX_PASSES,
  TABLE_DEPTH,
  TABLE_THICKNESS,
  TABLE_WIDTH,
  WALL_HEIGHT,
  WALL_INSET,
  WALL_THICKNESS,
  WORLD_GRAVITY,
} from '../../config';
import { assetPreloader } from '../../assets/asset-preloader';
import {
  BACKGROUND_TEXTURE_URL,
  TABLE_COLOR_MAP_URL,
  TABLE_NORMAL_MAP_URL,
  TABLE_ROUGHNESS_MAP_URL,
} from '../../assets/asset-manifest';
import { audioService } from '../../audio/audio.service';
import { BenchDiceService } from './services/bench-dice.service';
import { DiceService, type DiceCollisionKind } from './services/dice.service';
import { HudUiService } from './services/hud-ui.service';
import { NetworkService } from './services/network.service';
import { RulesBoardService } from './services/rules-board.service';
import { chooseFarkleBotMove, type FarkleBotDecision } from '../../../domain/farkle-bot';
import {
  createLocalMatch,
  isLocalMatchEnded,
  recordLocalMatchBank,
  recordLocalMatchBust,
  recordLocalMatchContinue,
} from '../../../domain/local-match';
import { isBust, scoreRoll, validateSelection } from '../../../domain/scorer';
import { onLanguageChange, t } from '../../../ui/i18n';
import { GAME_POPUP_CLOSE_EVENT } from '../../../ui/game-modal-state';
import { DEFAULT_PLAYER_SETTINGS, type PlayerSettings } from '../../../player-settings';
import type {
  MatchPhase,
  MatchRollResultPayload,
  MatchRematchStatePayload,
  MatchSelectionPreviewPayload,
  MatchStatePayload,
  MatchTurnResultPayload,
  RestPayload,
  RoomState,
  SnapshotPayload,
  DieStateFull,
} from './services/network.service';
import type { LocalMatchConfig, LocalMatchState } from '../../../domain/local-match';
import {
  DEFAULT_ROOM_OPTIONS,
  MATCH_FINISH_REASON,
  MATCH_PHASE,
  ROOM_MODE,
  ROOM_ROLE,
  ROOM_STATUS,
} from './services/network.service';
import { SelectionService } from './services/selection.service';
import { ShakeInputService, type HoldStartSource } from './services/shake-input.service';
import { TurnHotkeysService } from './services/turn-hotkeys.service';
import { UI_RADIUS } from '../../../ui/theme';
import { nextAvatarIndex } from '../../../avatars';
import type { EventEmitter } from '../event-emitter.class';
import {
  DEFAULT_DICE_PRESET,
  dicePresetForId,
  type DicePreset,
} from '../../../dice-presets';

export type GameMode = 'local' | 'network';

export interface GameEngineOptions {
  mode?: GameMode;
  network?: NetworkService;
  localMatchConfig?: LocalMatchConfig;
  playerSettings?: PlayerSettings;
  playerDisplayName?: string;
  onSurrender?: () => void;
  onExit?: () => void;
}

interface PerfStats {
  el: HTMLDivElement;
  lastUiMs: number;
  frames: number;
  frameMs: number;
  simMs: number;
  renderMs: number;
  lastSnapshotMs: number;
  snapshotGapMs: number;
  snapshotGaps: number;
  maxSnapshotGapMs: number;
}

const PERF_UPDATE_INTERVAL_MS = 500;
const TABLE_VIEWPORT_FILL = 0.72;
// Previous fuller visual rim: thickness 0.16, height 0.08.
const TABLE_RIM_THICKNESS = 0.08;
const TABLE_RIM_HEIGHT = 0.04;
const TABLE_RIM_COLOR = 0x2f1b12;
const DIRECTIONAL_LIGHT_Y = 9.5;
const CEILING_LIGHT_Y_OFFSET = 1.1;
const LIGHT_FORWARD_Z = -5.8;
const SHADOW_MAP_SIZE = 512;
const SHADOW_CAMERA_HALF_WIDTH = 9.5;
const SHADOW_CAMERA_HALF_DEPTH = 6.5;
const SHADOW_CAMERA_FAR = 25;
const PS1_RENDER_SCALE = 0.48;
const TABLE_PS1_TEXTURE_SIZE = 256;
const TABLE_PS1_DITHER_STRENGTH = 2;
const TABLE_PS1_COLOR_STEP = 24;
const BACKGROUND_PLANE_Y = -TABLE_THICKNESS - 0.03;
const BACKGROUND_VIEWPORT_OVERSCAN = 1.04;
const BACKGROUND_DARKEN_COLOR = 0x5a5a5a;
const FARKLE_ACTION_BLOCK_MS = 1200;
const LOCAL_BOT_ROLL_DELAY_MS = 700;
const LOCAL_BOT_DECISION_DELAY_MS = 800;
const LOCAL_ROOM_ID = 'local-singleplayer';
const LOCAL_ROOM_CODE = 'SOLO';
const LOCAL_HUMAN_USER_ID = 'local-human';
const LOCAL_BOT_USER_ID = 'local-bot';
const PERF_DEBUG_ENABLED = (): boolean => {
  const params = new URLSearchParams(window.location.search);
  if (params.has('perf')) return true;
  try {
    return window.localStorage.getItem('dice:perf') === '1';
  } catch {
    return false;
  }
};

/**
 * Архитектура:
 *  - local mode: полная cannon-es симуляция на клиенте (старый рабочий путь)
 *  - network mode: НИКАКОЙ локальной физики. Клиент — чистое зеркало серверного state.
 *    Сервер шлёт dice-snapshot (p, q, v, w) с частотой SNAPSHOT_HZ, клиент
 *    рендерит короткий interpolation buffer, а extrapolation использует только
 *    как fallback при сетевом gap. Оба клиента видят один серверный бросок.
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
  private readonly turnHotkeys: TurnHotkeysService;
  private readonly network: NetworkService | null;
  private readonly selection: SelectionService | null;
  private readonly benchDice: BenchDiceService | null;
  private readonly hud: HudUiService | null;
  private readonly rulesBoard: RulesBoardService;
  private readonly localMatchConfig: LocalMatchConfig | null;
  private currentRoomState: RoomState | null = null;
  private currentMatchState: MatchStatePayload | null = null;
  private localMatchState: LocalMatchState | null = null;
  private localRolling = false;
  private localRestCorrectionPasses = 0;
  private localLastRolledFaces: number[] = [];
  private localBotDecision: FarkleBotDecision | null = null;
  private localBotSelectedDiceIndices: number[] = [];
  private localBotActionTimer: number | null = null;
  private pendingLocalBenchStagger = false;
  private networkLastRolledFaces: number[] = [];
  private pendingSelectionPreview: MatchSelectionPreviewPayload | null = null;
  private pendingNetworkAutoRoll = false;
  private networkActionsBlockedUntil = 0;
  private networkActionsBlockTimer: number | null = null;
  private readonly onSurrender?: () => void;
  private readonly onExit?: () => void;
  private readonly playerDisplayName: string;
  private readonly unsubscribeLanguage: () => void;
  private playerSettings: PlayerSettings;
  private networkRematchRequestedBy: string[] = [];
  private surrenderConfirmEl: HTMLDivElement | null = null;
  private readonly eventUnsubscribers: Array<() => void> = [];
  private tableVisualMesh: THREE.Mesh | null = null;
  private backgroundMesh: THREE.Mesh | null = null;
  private backgroundTexture: THREE.Texture | null = null;
  private readonly tableRimMeshes: THREE.Mesh[] = [];
  private readonly tableTextures: THREE.Texture[] = [];
  private readonly networkCollisionVelocities = new Map<number, THREE.Vector3>();
  private readonly networkCollisionLastPlayedMs = new Map<number, number>();
  private readonly networkCollisionPairsTouching = new Set<string>();
  private readonly networkCollisionPairLastPlayedMs = new Map<string, number>();
  private activeDicePreset: DicePreset = DEFAULT_DICE_PRESET;

  private lastTime = 0;
  private rafId: number | null = null;
  private perf: PerfStats | null = null;

  constructor(options: GameEngineOptions = {}) {
    this.mode = options.mode ?? 'local';
    this.network = options.network ?? null;
    this.localMatchConfig = this.mode === 'local' ? (options.localMatchConfig ?? null) : null;
    this.onSurrender = options.onSurrender;
    this.onExit = options.onExit;
    this.playerDisplayName = options.playerDisplayName?.trim() || t('player');
    this.unsubscribeLanguage = onLanguageChange(this.handleLanguageChange);
    this.playerSettings = options.playerSettings ?? DEFAULT_PLAYER_SETTINGS;
    this.activeDicePreset = dicePresetForId(this.playerSettings.profile.dicePresetId);
    audioService
      .preloadCollisionSounds([
        this.activeDicePreset.sounds.dice,
        this.activeDicePreset.sounds.surface,
        DEFAULT_DICE_PRESET.sounds.dice,
        DEFAULT_DICE_PRESET.sounds.surface,
      ])
      .catch(() => undefined);

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

    this.dice = new DiceService(this.scene, this.physicsWorld, this.diceMaterial, this.mode, {
      shadowsEnabled: this.areShadowsEnabled(),
      onCollision: this.handleDiceCollision,
      preset: this.activeDicePreset,
    });
    this.dice.spawn();
    const playerSettings = this.playerSettings;
    this.rulesBoard = new RulesBoardService(
      this.scene,
      this.camera,
      this.renderer.domElement,
      playerSettings.controls.showRules,
    );
    this.perf = this.createPerfStats();

    this.input = new ShakeInputService(
      this.renderer.domElement,
      this.camera,
      playerSettings.controls.throwDice,
    );
    this.turnHotkeys = new TurnHotkeysService(playerSettings.controls);
    this.listen(this.turnHotkeys.events, 'select-all', this.handleHotkeySelectAll);
    this.listen(this.turnHotkeys.events, 'continue', this.handleHotkeyContinue);
    this.listen(this.turnHotkeys.events, 'bank', this.handleHotkeyBank);
    this.listen(this.turnHotkeys.events, 'surrender', this.handleHotkeySurrender);
    window.addEventListener(GAME_POPUP_CLOSE_EVENT, this.handleCloseGamePopups);
    this.listen(this.input.events, 'hold-start', (_position: THREE.Vector3, source?: HoldStartSource) => {
      if (source === 'pointer') audioService.play('dice-pickup');
      this.dice.pickup();
    });
    this.listen(this.input.events, 'hold-cancel', () => this.dice.cancelPickup());
    this.listen(this.input.events, 'release', (velocity: THREE.Vector3, position: THREE.Vector3) => {
      if (this.mode === 'network' && this.network) {
        if (!this.network.sendRelease(velocity, position)) {
          this.dice.cancelPickup();
          this.hud?.showError(t('connectionLost'));
          return;
        }
        audioService.play('dice-throw');
        // В network mode release снимает hold-флаг; движение начнёт первый snapshot.
        this.dice.release(velocity, position);
      } else if (this.mode === 'local') {
        audioService.play('dice-throw');
        this.dice.release(velocity, position);
        if (this.localMatchState && !isLocalMatchEnded(this.localMatchState)) {
          this.localRolling = true;
          this.localRestCorrectionPasses = 0;
          this.localLastRolledFaces = [];
          this.localBotDecision = null;
          this.localBotSelectedDiceIndices = [];
          this.selection?.clearExternalSelection();
          this.selection?.disable();
          this.input.setEnabled(false);
          this.syncTurnHotkeysEnabled();
          this.hud?.setSelectionPreview(null);
          this.hud?.setSelectionState(0, false, 0);
          this.syncLocalMatchHud(MATCH_PHASE.ROLLING);
        }
      }
    });

    if (this.mode === 'network' && this.network) {
      const net = this.network;
      this.listen(net.events, 'dice-spawn', (snap: SnapshotPayload) => {
        this.recordSnapshot(performance.now());
        this.clearNetworkCollisionAudioState();
        this.dice.applySnapshot(snap.dice, performance.now());
      });
      this.listen(net.events, 'dice-snapshot', (snap: SnapshotPayload) => {
        const now = performance.now();
        this.recordSnapshot(now);
        this.dice.applySnapshot(snap.dice, now);
        this.handleNetworkCollisionAudio(snap.dice, now);
      });
      this.listen(net.events, 'dice-rest', (rest: RestPayload) => {
        const now = performance.now();
        this.recordSnapshot(now);
        // Rest — финальный снапшот без v/w (в бинарном формате они опущены — всегда нули).
        // Применяем той же логикой, кости замрут в авторитативной позе.
        // faceValue пока не используем в UI.
        const ZERO: [number, number, number] = [0, 0, 0];
        this.dice.applySnapshot(
          rest.dice.map((d) => ({ p: d.p, q: d.q, v: ZERO, w: ZERO })),
          now,
          { immediate: true },
        );
        this.clearNetworkCollisionAudioState();
      });

      this.currentRoomState = net.getRoomState();
      const ownUserId = net.getUserId() ?? '';
      const isTestRoom = this.currentRoomState?.mode === ROOM_MODE.TEST;
      if (this.currentRoomState) this.preloadRoomDicePresetSounds(this.currentRoomState);
      this.syncActiveDicePreset();
      this.selection = isTestRoom
        ? null
        : new SelectionService(this.renderer.domElement, this.camera, this.dice, this.scene);
      this.benchDice = isTestRoom ? null : new BenchDiceService(this.scene);
      this.hud = isTestRoom
        ? null
        : new HudUiService(
          ownUserId,
          playerSettings.controls,
          (event) => this.input.isPointerInsideThrowZone(event),
        );
      if (this.currentRoomState) this.hud?.setRoomState(this.currentRoomState);

      this.listen(net.events, 'room-state', (state: RoomState) => {
        this.currentRoomState = state;
        this.preloadRoomDicePresetSounds(state);
        this.syncActiveDicePreset();
        this.hud?.setRoomState(state);
        if (isTestRoom) this.input.setEnabled(this.canUseTestInput(ownUserId));
        this.syncTurnHotkeysEnabled();
      });

      if (isTestRoom) {
        this.listen(net.events, 'match-state', (state: MatchStatePayload) => {
          this.currentMatchState = state;
          this.syncActiveDicePreset();
          this.input.setEnabled(this.canUseTestInput(ownUserId));
        });
        this.input.setEnabled(this.canUseTestInput(ownUserId));
      } else {
        // Координация input vs selection: SELECTING на своём ходу включает клик
        // по костям и выключает hold/release; всё остальное — инверсно.
        // Без этого pickup() прячет кости как раз когда игрок хочет в них кликать.
        this.listen(net.events, 'match-state', (state: MatchStatePayload) => {
          const staggerBench = this.shouldStaggerBenchAppend(this.currentMatchState, state);
          this.currentMatchState = state;
          this.syncActiveDicePreset();
          if (state.phase !== MATCH_PHASE.SELECTING) this.networkLastRolledFaces = [];
          if (state.phase !== MATCH_PHASE.FINISHED) {
            this.networkRematchRequestedBy = [];
            this.hud?.setFinalRematchRequestedBy([]);
          }
          if (state.phase !== MATCH_PHASE.SELECTING || state.currentPlayer === ownUserId) {
            this.selection?.clearExternalSelection();
            this.pendingSelectionPreview = null;
            this.hud?.setSelectionPreview(null);
          }
          this.syncBenchDice(state.bench, staggerBench);
          this.hud?.setMatchState(state);
          this.applyPendingSelectionPreview();
          const isOwnPlayer = this.isOwnPlayer(ownUserId);
          const isMyTurn = state.currentPlayer === ownUserId;
          const isSelecting = state.phase === MATCH_PHASE.SELECTING;
          const isWaiting = state.phase === MATCH_PHASE.WAITING;
          if (!isOwnPlayer || this.areNetworkActionsBlocked()) {
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
          if (state.phase === MATCH_PHASE.FINISHED) {
            this.closeSurrenderConfirm();
            this.pendingNetworkAutoRoll = false;
            this.clearNetworkTurnDice();
            const rematchAvailable = this.isNetworkFinalRematchAvailable(state);
            if (!rematchAvailable) this.networkRematchRequestedBy = [];
            this.hud?.showFinalResult(
              state.winner === ownUserId ? 'WIN' : 'FARKLE',
              this.networkRematchRequestedBy,
              rematchAvailable,
            );
          }
          this.syncTurnHotkeysEnabled();
          this.tryNetworkAutoRoll();
        });

        this.listen(net.events, 'match-roll-result', (r: MatchRollResultPayload) => {
          if (r.bust) {
            this.networkLastRolledFaces = [];
            this.selection?.clearScoringOptions();
            this.blockNetworkActions(FARKLE_ACTION_BLOCK_MS);
            this.hud?.showError('BUST');
          } else {
            const canSelectRoll =
              this.currentMatchState?.currentPlayer === ownUserId && this.isOwnPlayer(ownUserId);
            this.networkLastRolledFaces = [...r.rolledFaces];
            if (canSelectRoll) {
              this.selection?.setScoringOptions(
                r.rolledFaces,
                scoreRoll(r.rolledFaces),
                true,
              );
            } else {
              this.selection?.clearScoringOptions();
            }
            this.hud?.setRollResult(r.rolledFaces);
          }
          this.syncTurnHotkeysEnabled();
        });

        this.listen(net.events, 'match-turn-result', (r: MatchTurnResultPayload) => {
          this.clearNetworkTurnDice();
          if (!r.bust && r.banked > 0) audioService.play('gameplay-bank');
        });

        this.listen(net.events, 'match-rematch-state', (payload: MatchRematchStatePayload) => {
          this.networkRematchRequestedBy = [...payload.requestedBy];
          this.hud?.setFinalRematchRequestedBy(payload.requestedBy);
        });

        this.listen(net.events, 'match-selection-preview', (payload: MatchSelectionPreviewPayload) => {
          if (!this.selection) return;
          if (payload.userId === ownUserId) return;
          const preview = this.withSelectionPreviewPoints(payload);
          this.hud?.setSelectionPreview(preview);
          this.pendingSelectionPreview = preview;
          this.applyPendingSelectionPreview();
        });

        this.listen(
          this.selection?.events,
          'selection-changed',
          (indices: number[], valid: boolean, points: number) => {
            this.hud?.setSelectionState(indices.length, valid, points);
            if (this.canUseNetworkSelectionControls()) {
              this.network?.sendSelectionPreview(indices);
            }
          },
        );

        this.listen(this.hud?.events, 'select-all-clicked', this.handleHotkeySelectAll);
        this.listen(this.hud?.events, 'continue-clicked', this.handleNetworkContinue);
        this.listen(this.hud?.events, 'bank-clicked', this.handleNetworkBank);
        this.listen(this.hud?.events, 'surrender-clicked', this.handleNetworkSurrender);
        this.listen(this.hud?.events, 'final-exit-clicked', this.handleNetworkFinalExit);
        this.listen(this.hud?.events, 'rematch-clicked', this.handleNetworkRematch);

        // До получения первого MATCH_STATE: shake-input выключен, чтобы игрок
        // не успел отправить release в неподтверждённой фазе. Включится в
        // обработчике выше, когда придёт состояние "WAITING + own turn".
        this.input.setEnabled(false);
      }
      net.replayLatestMatchData();
    } else if (this.mode === 'local' && this.localMatchConfig) {
      this.benchDice = new BenchDiceService(this.scene);
      this.selection = new SelectionService(this.renderer.domElement, this.camera, this.dice, this.scene);
      this.selection.disable();
      this.localMatchState = createLocalMatch();
      this.hud = new HudUiService(
        LOCAL_HUMAN_USER_ID,
        playerSettings.controls,
        (event) => this.input.isPointerInsideThrowZone(event),
      );
      this.syncLocalMatchHud(MATCH_PHASE.WAITING);

      this.listen(
        this.selection.events,
        'selection-changed',
        (indices: number[], valid: boolean, points: number) => {
          if (this.localMatchState?.currentPlayer !== 'human') return;
          this.hud?.setSelectionState(indices.length, valid, points);
        },
      );
      this.listen(this.hud.events, 'select-all-clicked', this.handleHotkeySelectAll);
      this.listen(this.hud.events, 'continue-clicked', this.handleLocalMatchContinue);
      this.listen(this.hud.events, 'bank-clicked', this.handleLocalMatchBank);
      this.listen(this.hud.events, 'surrender-clicked', this.handleHotkeySurrender);
      this.listen(this.hud.events, 'final-exit-clicked', () => this.onSurrender?.());
      this.enterLocalMatchTurn();
    } else {
      this.selection = null;
      this.benchDice = null;
      this.hud = null;
    }

    window.addEventListener('resize', this.onResize);
  }

  private listen<TArgs extends unknown[]>(
    events: EventEmitter | undefined,
    event: string,
    callback: (...args: TArgs) => void,
  ): void {
    if (!events) return;
    this.eventUnsubscribers.push(
      events.on(event, callback as (...args: any[]) => void),
    );
  }

  warmup(): void {
    this.renderer.compile(this.scene, this.camera);
    this.renderer.render(this.scene, this.camera);
  }

  private handleDiceCollision = (impact: number, kind: DiceCollisionKind): void => {
    audioService.playCollision(impact, kind, this.activeDicePreset.sounds[kind]);
  };

  private handleNetworkCollisionAudio(dice: DieStateFull[], now: number): void {
    for (let i = 0; i < dice.length; i++) {
      const state = dice[i]!;
      if (state.p[1] < -100) {
        this.networkCollisionVelocities.delete(i);
        continue;
      }

      const previous = this.networkCollisionVelocities.get(i);
      const current = new THREE.Vector3(state.v[0], state.v[1], state.v[2]);
      if (previous) {
        const nearTable = state.p[1] <= DICE_HALF_SIZE + 0.28;
        const verticalBounce = previous.y < -0.35 && current.y > 0.02;
        const speedDrop = previous.length() - current.length() > 1.2;
        const impact = Math.max(Math.abs(previous.y - current.y), previous.length() - current.length());
        const last = this.networkCollisionLastPlayedMs.get(i) ?? 0;

        if (nearTable && (verticalBounce || speedDrop) && impact >= 0.85 && now - last >= 90) {
          audioService.playCollision(impact, 'surface', this.activeDicePreset.sounds.surface);
          this.networkCollisionLastPlayedMs.set(i, now);
        }
      }

      this.networkCollisionVelocities.set(i, current);
    }
    this.handleNetworkDicePairCollisionAudio(dice, now);
  }

  private handleNetworkDicePairCollisionAudio(dice: DieStateFull[], now: number): void {
    const touchingNow = new Set<string>();
    const contactDistance = DICE_HALF_SIZE * 2.18;
    const contactDistanceSq = contactDistance * contactDistance;

    for (let i = 0; i < dice.length; i++) {
      const a = dice[i]!;
      if (a.p[1] < -100) continue;
      for (let j = i + 1; j < dice.length; j++) {
        const b = dice[j]!;
        if (b.p[1] < -100) continue;

        const dx = b.p[0] - a.p[0];
        const dy = b.p[1] - a.p[1];
        const dz = b.p[2] - a.p[2];
        if (Math.abs(dy) > DICE_HALF_SIZE * 1.6) continue;
        if (dx * dx + dy * dy + dz * dz > contactDistanceSq) continue;

        const key = `${i}:${j}`;
        touchingNow.add(key);
        if (this.networkCollisionPairsTouching.has(key)) continue;

        const relativeSpeed = Math.hypot(b.v[0] - a.v[0], b.v[1] - a.v[1], b.v[2] - a.v[2]);
        const last = this.networkCollisionPairLastPlayedMs.get(key) ?? 0;
        if (relativeSpeed >= 0.7 && now - last >= 90) {
          audioService.playCollision(relativeSpeed, 'dice', this.activeDicePreset.sounds.dice);
          this.networkCollisionPairLastPlayedMs.set(key, now);
        }
      }
    }

    this.networkCollisionPairsTouching.clear();
    for (const key of touchingNow) this.networkCollisionPairsTouching.add(key);
  }

  private clearNetworkCollisionAudioState(): void {
    this.networkCollisionVelocities.clear();
    this.networkCollisionLastPlayedMs.clear();
    this.networkCollisionPairsTouching.clear();
    this.networkCollisionPairLastPlayedMs.clear();
  }

  private syncActiveDicePreset(): void {
    const preset = this.resolveActiveDicePreset();
    if (preset.id === this.activeDicePreset.id) return;
    this.activeDicePreset = preset;
    this.dice.setPreset(preset);
  }

  private resolveActiveDicePreset(): DicePreset {
    if (this.mode === 'local') {
      return this.currentMatchState?.currentPlayer === LOCAL_HUMAN_USER_ID
        ? dicePresetForId(this.playerSettings.profile.dicePresetId)
        : DEFAULT_DICE_PRESET;
    }

    const currentPlayer = this.currentMatchState?.currentPlayer;
    const member = currentPlayer
      ? this.currentRoomState?.members.find((m) => m.userId === currentPlayer)
      : this.currentRoomState?.members.find((m) => m.role === ROOM_ROLE.PLAYER);
    return dicePresetForId(member?.dicePresetId);
  }

  private preloadRoomDicePresetSounds(state: RoomState): void {
    const sounds = state.members
      .map((member) => dicePresetForId(member.dicePresetId))
      .flatMap((preset) => [preset.sounds.dice, preset.sounds.surface]);
    audioService.preloadCollisionSounds(sounds).catch(() => undefined);
  }

  private shouldStaggerBenchAppend(
    previous: MatchStatePayload | null,
    next: MatchStatePayload,
  ): boolean {
    if (!previous) return false;
    if (previous.phase !== MATCH_PHASE.SELECTING || next.phase !== MATCH_PHASE.WAITING) {
      return false;
    }
    if (previous.currentPlayer !== next.currentPlayer) return false;
    if (next.turnPoints <= previous.turnPoints) return false;
    if (next.bench.length <= previous.bench.length) return false;
    return previous.bench.every((face, index) => next.bench[index] === face);
  }

  private syncBenchDice(faces: number[], staggerAdded = false): void {
    this.benchDice?.setFaces(faces, {
      staggerAdded,
      onFaceAdded: () => {
        audioService.play('gameplay-continue');
      },
    });
  }

  private localPlayerUserId(player: LocalMatchState['currentPlayer']): string {
    return player === 'human' ? LOCAL_HUMAN_USER_ID : LOCAL_BOT_USER_ID;
  }

  private createLocalRoomState(): RoomState | null {
    const state = this.localMatchState;
    const config = this.localMatchConfig;
    if (!state || !config) return null;

    return {
      id: LOCAL_ROOM_ID,
      code: LOCAL_ROOM_CODE,
      gameName: t('singleplayerGame'),
      hasPassword: false,
      ownerId: LOCAL_HUMAN_USER_ID,
      status: isLocalMatchEnded(state) ? ROOM_STATUS.FINISHED : ROOM_STATUS.ACTIVE,
      mode: ROOM_MODE.MATCH,
      options: {
        ...DEFAULT_ROOM_OPTIONS,
        targetScore: config.targetScore,
        minBank: config.minBank,
      },
      members: [
        {
          userId: LOCAL_HUMAN_USER_ID,
          displayName: this.playerDisplayName,
          avatarIndex: this.playerSettings.profile.avatarIndex,
          dicePresetId: this.playerSettings.profile.dicePresetId,
          role: ROOM_ROLE.PLAYER,
        },
        {
          userId: LOCAL_BOT_USER_ID,
          displayName: t('botPlayer'),
          avatarIndex: nextAvatarIndex(this.playerSettings.profile.avatarIndex),
          dicePresetId: DEFAULT_DICE_PRESET.id,
          role: ROOM_ROLE.PLAYER,
        },
      ],
    };
  }

  private createLocalMatchPayload(phase: MatchPhase): MatchStatePayload | null {
    const state = this.localMatchState;
    if (!state) return null;

    const winner =
      state.status === 'human-won'
        ? LOCAL_HUMAN_USER_ID
        : state.status === 'bot-won'
          ? LOCAL_BOT_USER_ID
          : '';

    return {
      phase,
      currentPlayer: this.localPlayerUserId(state.currentPlayer),
      turnPoints: state.turnPoints,
      remainingDice: state.activeDiceCount,
      bench: [...state.bench],
      totals: [
        { userId: LOCAL_HUMAN_USER_ID, total: state.players.human.totalScore },
        { userId: LOCAL_BOT_USER_ID, total: state.players.bot.totalScore },
      ],
      winner,
      finishReason: winner ? MATCH_FINISH_REASON.SCORE : MATCH_FINISH_REASON.NONE,
    };
  }

  private syncLocalMatchHud(phase: MatchPhase): void {
    if (this.mode !== 'local') return;
    const roomState = this.createLocalRoomState();
    const state = this.localMatchState;
    if (!roomState || !state) return;

    const matchState = this.createLocalMatchPayload(
      isLocalMatchEnded(state) ? MATCH_PHASE.FINISHED : phase,
    );
    if (!matchState) return;

    this.currentRoomState = roomState;
    this.currentMatchState = matchState;
    this.syncActiveDicePreset();
    this.syncBenchDice(matchState.bench, this.pendingLocalBenchStagger);
    this.pendingLocalBenchStagger = false;
    this.hud?.setRoomState(roomState);
    this.hud?.setMatchState(matchState);
  }

  private finishLocalMatchRoll(): void {
    const state = this.localMatchState;
    const config = this.localMatchConfig;
    if (!state || !config || isLocalMatchEnded(state)) return;
    this.localRolling = false;
    this.localRestCorrectionPasses = 0;
    const rolledFaces = this.dice.getLocalActiveFaces();
    this.localLastRolledFaces = rolledFaces;

    if (isBust(rolledFaces)) {
      this.localMatchState = recordLocalMatchBust(state);
      this.dice.resetLocalForNewTurn();
      this.selection?.clearExternalSelection();
      this.selection?.disable();
      this.hud?.setSelectionPreview(null);
      this.hud?.setSelectionState(0, false, 0);
      this.hud?.showError('BUST');
      this.scheduleLocalMatchTurnAfterFarkle();
      return;
    }

    this.hud?.setRollResult(rolledFaces);
    this.selection?.setScoringOptions(
      rolledFaces,
      scoreRoll(rolledFaces),
      state.currentPlayer === 'human',
    );

    if (state.currentPlayer === 'human') {
      this.selection?.enable();
      this.syncLocalMatchHud(MATCH_PHASE.SELECTING);
      this.syncTurnHotkeysEnabled();
      return;
    }

    this.selection?.disable();
    this.hud?.setSelectionState(0, false, 0);
    this.syncLocalMatchHud(MATCH_PHASE.SELECTING);
    this.prepareLocalBotDecision(rolledFaces);
  }

  private prepareLocalBotDecision(rolledFaces: number[]): void {
    const state = this.localMatchState;
    const config = this.localMatchConfig;
    if (!state || !config || state.currentPlayer !== 'bot') return;

    const decision = chooseFarkleBotMove({
      rolledFaces,
      activeDiceCount: state.activeDiceCount,
      turnPoints: state.turnPoints,
      botTotal: state.players.bot.totalScore,
      humanTotal: state.players.human.totalScore,
      targetScore: config.targetScore,
      minBank: config.minBank,
    });
    if (!decision) {
      this.localMatchState = recordLocalMatchBust(state);
      this.dice.resetLocalForNewTurn();
      this.hud?.setSelectionPreview(null);
      this.hud?.setSelectionState(0, false, 0);
      this.hud?.showError('BUST');
      this.scheduleLocalMatchTurnAfterFarkle();
      return;
    }

    const activeIndices = this.dice.getLocalActiveIndices();
    const selectedDiceIndices = decision.rollIndices
      .map((rollIndex) => activeIndices[rollIndex])
      .filter((index): index is number => index !== undefined);

    this.localBotDecision = decision;
    this.localBotSelectedDiceIndices = selectedDiceIndices;
    this.selection?.setExternalSelection(selectedDiceIndices);
    this.hud?.setSelectionPreview({
      userId: LOCAL_BOT_USER_ID,
      indices: selectedDiceIndices,
      valid: true,
      points: decision.points,
    });
    this.clearLocalBotActionTimer();
    this.localBotActionTimer = window.setTimeout(() => {
      this.localBotActionTimer = null;
      this.applyLocalBotDecision();
    }, LOCAL_BOT_DECISION_DELAY_MS);
  }

  private applyLocalBotDecision(): void {
    const decision = this.localBotDecision;
    const state = this.localMatchState;
    if (!decision || !state || state.currentPlayer !== 'bot' || isLocalMatchEnded(state)) return;
    const selected = [...this.localBotSelectedDiceIndices];
    this.localBotDecision = null;
    this.localBotSelectedDiceIndices = [];
    if (decision.action === 'bank') {
      this.applyLocalMatchBank(decision.points, decision.rollIndices.length);
    } else {
      this.applyLocalMatchContinue(decision.points, selected, decision.rollIndices);
    }
  }

  private handleLocalMatchContinue = (): void => {
    const validation = this.getLocalMatchSelectionValidation();
    const selection = this.selection;
    if (!selection || validation === null || validation.valid !== true) {
      if (validation?.valid === false) this.hud?.showError(validation.reason);
      return;
    }
    this.applyLocalMatchContinue(
      validation.points,
      selection.getSelectedIndices(),
      selection.getSelectedRollIndices(),
    );
  };

  private handleLocalMatchBank = (): void => {
    const validation = this.getLocalMatchSelectionValidation();
    const selection = this.selection;
    const state = this.localMatchState;
    const config = this.localMatchConfig;
    if (!selection || !state || !config || validation === null || validation.valid !== true) {
      if (validation?.valid === false) this.hud?.showError(validation.reason);
      return;
    }
    if (state.turnPoints + validation.points < config.minBank) {
      this.hud?.showError(`${t('minBank')}: ${config.minBank}`);
      return;
    }
    this.applyLocalMatchBank(validation.points, selection.getSelectedIndices().length);
  };

  private applyLocalMatchContinue(
    points: number,
    selectedDiceIndices: number[],
    selectedRollIndices: number[],
  ): void {
    const state = this.localMatchState;
    if (!state || isLocalMatchEnded(state)) return;

    const selected = new Set(selectedDiceIndices);
    const remaining = this.dice.getLocalActiveIndices().filter((index) => !selected.has(index));
    const selectedFaces = selectedRollIndices
      .map((rollIndex) => this.localLastRolledFaces[rollIndex])
      .filter((face): face is number => typeof face === 'number');
    this.localMatchState = recordLocalMatchContinue(
      state,
      points,
      selectedFaces.length,
      selectedFaces,
    );
    this.pendingLocalBenchStagger = selectedFaces.length > 0;
    if (remaining.length === 0 || this.localMatchState.activeDiceCount === 6) {
      this.dice.resetLocalForNewTurn();
    } else {
      this.dice.setLocalActiveIndices(remaining);
    }
    this.clearLocalMatchRollUi();
    this.enterLocalMatchTurn();
  }

  private applyLocalMatchBank(points: number, diceUsed: number): void {
    const state = this.localMatchState;
    const config = this.localMatchConfig;
    if (!state || !config || isLocalMatchEnded(state)) return;
    audioService.play('gameplay-bank');
    this.localMatchState = recordLocalMatchBank(state, config, points, diceUsed);
    this.dice.resetLocalForNewTurn();
    this.clearLocalMatchRollUi();
    this.enterLocalMatchTurn();
  }

  private clearLocalMatchRollUi(): void {
    this.localLastRolledFaces = [];
    this.localBotDecision = null;
    this.localBotSelectedDiceIndices = [];
    this.selection?.clearExternalSelection();
    this.selection?.disable();
    this.hud?.setSelectionPreview(null);
    this.hud?.setSelectionState(0, false, 0);
  }

  private enterLocalMatchTurn(): void {
    const state = this.localMatchState;
    if (!state) return;
    this.clearLocalBotActionTimer();

    if (isLocalMatchEnded(state)) {
      this.localRolling = false;
      this.closeSurrenderConfirm();
      this.input.setEnabled(false);
      this.selection?.disable();
      this.syncLocalMatchHud(MATCH_PHASE.FINISHED);
      this.hud?.showFinalResult(state.status === 'human-won' ? 'WIN' : 'FARKLE', [], false);
      this.syncTurnHotkeysEnabled();
      return;
    }

    this.selection?.disable();
    this.syncLocalMatchHud(MATCH_PHASE.WAITING);
    if (state.currentPlayer === 'human') {
      this.input.setEnabled(true);
    } else {
      this.input.setEnabled(false);
      this.scheduleLocalBotRoll();
    }
    this.syncTurnHotkeysEnabled();
  }

  private scheduleLocalBotRoll(): void {
    this.clearLocalBotActionTimer();
    this.localBotActionTimer = window.setTimeout(() => {
      this.localBotActionTimer = null;
      const state = this.localMatchState;
      if (!state || state.currentPlayer !== 'bot' || isLocalMatchEnded(state) || this.localRolling) {
        return;
      }
      this.input.setEnabled(true);
      this.input.triggerAutomatedThrow();
      this.input.setEnabled(false);
    }, LOCAL_BOT_ROLL_DELAY_MS);
  }

  private scheduleLocalMatchTurnAfterFarkle(): void {
    this.clearLocalBotActionTimer();
    this.localBotActionTimer = window.setTimeout(() => {
      this.localBotActionTimer = null;
      this.enterLocalMatchTurn();
    }, FARKLE_ACTION_BLOCK_MS);
  }

  private clearLocalBotActionTimer(): void {
    if (this.localBotActionTimer !== null) clearTimeout(this.localBotActionTimer);
    this.localBotActionTimer = null;
  }

  private handleLocalActiveRest(): void {
    if (!this.localRolling) return;
    if (this.localRestCorrectionPasses < REST_CORRECTION_MAX_PASSES) {
      const corrected = this.dice.resolveLocalRestAmbiguities();
      if (corrected) {
        this.localRestCorrectionPasses += 1;
        return;
      }
    }
    if (this.localMatchState) this.finishLocalMatchRoll();
  }

  private handleHotkeySelectAll = (): void => {
    if (!this.canUseTurnHotkeys()) return;
    const selection = this.selection;
    if (!selection) return;
    if (selection.getSelectedIndices().length > 0) {
      selection.clear();
      return;
    }
    selection.selectAllAvailable();
  };

  private handleHotkeyContinue = (): void => {
    if (this.mode === 'local') {
      if (!this.canSubmitLocalMatchSelection()) return;
      this.handleLocalMatchContinue();
      return;
    }

    if (!this.canUseNetworkHotkeys() || !this.canSubmitNetworkSelection()) return;
    this.handleNetworkContinue();
  };

  private handleHotkeyBank = (): void => {
    if (this.mode === 'local') {
      if (!this.canSubmitLocalMatchBank()) return;
      this.handleLocalMatchBank();
      return;
    }

    if (!this.canUseNetworkHotkeys() || !this.canSubmitNetworkBank()) return;
    this.handleNetworkBank();
  };

  private handleHotkeySurrender = (): void => {
    if (!this.canUseSurrender()) return;
    this.showSurrenderConfirm();
  };

  private handleCloseGamePopups = (): void => {
    this.closeSurrenderConfirm();
  };

  private handleSurrenderConfirmKeyDown = (event: KeyboardEvent): void => {
    if (event.code !== 'Escape') return;
    if (event.repeat) return;
    event.preventDefault();
    event.stopPropagation();
    this.closeSurrenderConfirm();
  };

  private showSurrenderConfirm(): void {
    if (this.surrenderConfirmEl !== null || !this.canUseSurrender()) return;

    const overlay = document.createElement('div');
    overlay.id = 'hud-surrender-confirm';
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '40',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'rgba(21,20,20,0.5)',
      pointerEvents: 'auto',
      boxSizing: 'border-box',
    } satisfies Partial<CSSStyleDeclaration>);

    const panel = document.createElement('div');
    Object.assign(panel.style, {
      width: 'min(540px, calc(100vw - 48px))',
      padding: '27px',
      borderRadius: UI_RADIUS,
      background: '#151414',
      color: '#fff',
      boxShadow: '0 18px 48px rgba(0,0,0,0.38)',
      textAlign: 'center',
      boxSizing: 'border-box',
    } satisfies Partial<CSSStyleDeclaration>);

    const question = document.createElement('div');
    question.dataset.surrenderConfirmQuestion = 'true';
    question.textContent = t('surrenderConfirm');
    Object.assign(question.style, {
      fontSize: '30px',
      lineHeight: '1.25',
      marginBottom: '24px',
    } satisfies Partial<CSSStyleDeclaration>);

    const actions = document.createElement('div');
    Object.assign(actions.style, {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'nowrap',
      gap: '15px',
    } satisfies Partial<CSSStyleDeclaration>);

    const makeConfirmButton = (label: string, kind: 'yes' | 'no'): HTMLButtonElement => {
      const btn = document.createElement('button');
      btn.classList.add('menu-frame-button', 'menu-frame-button-small', 'menu-frame-button-small-large');
      const text = document.createElement('span');
      text.dataset.surrenderConfirmLabel = kind;
      text.textContent = label;
      Object.assign(btn.style, {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      } satisfies Partial<CSSStyleDeclaration>);
      Object.assign(text.style, {
        position: 'relative',
        zIndex: '1',
      } satisfies Partial<CSSStyleDeclaration>);
      btn.appendChild(text);
      return btn;
    };

    const yesBtn = makeConfirmButton(t('confirmYes'), 'yes');
    yesBtn.classList.add('menu-frame-button-danger');
    const noBtn = makeConfirmButton(t('confirmNo'), 'no');
    yesBtn.addEventListener('click', () => {
      this.closeSurrenderConfirm();
      if (!this.canUseSurrender()) return;
      if (this.mode === 'network') {
        this.submitNetworkSurrender();
        return;
      }
      this.onSurrender?.();
    });
    noBtn.addEventListener('click', () => this.closeSurrenderConfirm());
    overlay.addEventListener('click', (event) => {
      if (event.target !== overlay) return;
      this.closeSurrenderConfirm();
    });

    actions.append(yesBtn, noBtn);
    panel.append(question, actions);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    this.surrenderConfirmEl = overlay;
    window.addEventListener('keydown', this.handleSurrenderConfirmKeyDown, true);
  }

  private closeSurrenderConfirm(): void {
    window.removeEventListener('keydown', this.handleSurrenderConfirmKeyDown, true);
    this.surrenderConfirmEl?.remove();
    this.surrenderConfirmEl = null;
  }

  private updateSurrenderConfirmLanguage(): void {
    const overlay = this.surrenderConfirmEl;
    if (!overlay) return;
    const question = overlay.querySelector<HTMLElement>(
      '[data-surrender-confirm-question="true"]',
    );
    if (question) question.textContent = t('surrenderConfirm');
    const yes = overlay.querySelector<HTMLElement>('[data-surrender-confirm-label="yes"]');
    if (yes) yes.textContent = t('confirmYes');
    const no = overlay.querySelector<HTMLElement>('[data-surrender-confirm-label="no"]');
    if (no) no.textContent = t('confirmNo');
  }

  private handleLanguageChange = (): void => {
    this.updateSurrenderConfirmLanguage();

    if (this.mode === 'local') {
      const phase = this.currentMatchState?.phase ?? (
        this.localRolling ? MATCH_PHASE.ROLLING : MATCH_PHASE.WAITING
      );
      this.syncLocalMatchHud(phase);
      return;
    }

    if (this.currentRoomState) this.hud?.setRoomState(this.currentRoomState);
    if (this.currentMatchState) this.hud?.setMatchState(this.currentMatchState);
  };

  private handleNetworkContinue = (): void => {
    const selection = this.selection;
    const network = this.network;
    if (!selection || !network || !this.canSubmitNetworkSelection()) return;
    const indices = selection.getSelectedIndices();
    network
      .sendSelectDice(indices)
      .then(() => {
        this.pendingNetworkAutoRoll = this.playerSettings.gameplay.autoRollAfterContinue;
        this.networkLastRolledFaces = [];
        this.pendingSelectionPreview = null;
        selection.clearExternalSelection();
        selection.clear();
        this.syncTurnHotkeysEnabled();
        this.tryNetworkAutoRoll();
      })
      .catch((e: Error) => this.hud?.showError(e.message));
  };

  private handleNetworkBank = (): void => {
    const selection = this.selection;
    const network = this.network;
    if (!selection || !network || !this.canSubmitNetworkBank()) return;
    const indices = selection.getSelectedIndices();
    network
      .sendBank(indices)
      .then(() => {
        this.pendingNetworkAutoRoll = false;
        this.networkLastRolledFaces = [];
        this.pendingSelectionPreview = null;
        selection.clearExternalSelection();
        selection.clear();
        this.syncTurnHotkeysEnabled();
      })
      .catch((e: Error) => this.hud?.showError(e.message));
  };

  private handleNetworkSurrender = (): void => {
    if (!this.canUseSurrender()) return;
    this.showSurrenderConfirm();
  };

  private submitNetworkSurrender = (): void => {
    const network = this.network;
    if (!network || !this.canUseSurrender()) return;
    this.pendingNetworkAutoRoll = false;
    this.input.setEnabled(false);
    this.selection?.disable();
    this.turnHotkeys.setEnabled(false);
    network
      .leaveRoom()
      .catch(() => undefined)
      .finally(() => this.onExit?.());
  };

  private handleNetworkFinalExit = (): void => {
    const network = this.network;
    this.pendingNetworkAutoRoll = false;
    if (!network) {
      this.onExit?.();
      return;
    }
    network
      .leaveRoom()
      .catch(() => undefined)
      .finally(() => this.onExit?.());
  };

  private handleNetworkRematch = (): void => {
    const network = this.network;
    const state = this.currentMatchState;
    const ownUserId = network?.getUserId() ?? '';
    if (
      !network ||
      state?.phase !== MATCH_PHASE.FINISHED ||
      !this.isNetworkFinalRematchAvailable(state) ||
      ownUserId.length === 0
    ) {
      return;
    }
    if (!this.networkRematchRequestedBy.includes(ownUserId)) {
      this.networkRematchRequestedBy = [...this.networkRematchRequestedBy, ownUserId];
      this.hud?.setFinalRematchRequestedBy(this.networkRematchRequestedBy);
    }
    network.sendRematch().catch((e: Error) => {
      this.networkRematchRequestedBy = this.networkRematchRequestedBy.filter(
        (userId) => userId !== ownUserId,
      );
      this.hud?.setFinalRematchRequestedBy(this.networkRematchRequestedBy);
      this.hud?.showError(e.message);
    });
  };

  private syncTurnHotkeysEnabled(): void {
    this.turnHotkeys.setEnabled(this.canUseTurnHotkeys() || this.canUseSurrender());
  }

  private canUseTurnHotkeys(): boolean {
    if (this.mode === 'local') return this.canUseLocalMatchHotkeys();
    return this.canUseNetworkHotkeys();
  }

  private canUseSurrender(): boolean {
    if (this.mode === 'local') {
      return this.localMatchState !== null && !isLocalMatchEnded(this.localMatchState);
    }

    const state = this.currentMatchState;
    const ownUserId = this.network?.getUserId() ?? '';
    return (
      state !== null &&
      state.phase !== MATCH_PHASE.FINISHED &&
      ownUserId.length > 0 &&
      !this.areNetworkActionsBlocked() &&
      this.isOwnPlayer(ownUserId)
    );
  }

  private canUseNetworkAutoRoll(): boolean {
    const state = this.currentMatchState;
    const ownUserId = this.network?.getUserId() ?? '';
    return (
      this.mode === 'network' &&
      state !== null &&
      !this.areNetworkActionsBlocked() &&
      state.phase === MATCH_PHASE.WAITING &&
      state.currentPlayer === ownUserId &&
      this.isOwnPlayer(ownUserId)
    );
  }

  private tryNetworkAutoRoll(): void {
    if (!this.pendingNetworkAutoRoll) return;
    if (!this.canUseNetworkAutoRoll()) return;
    this.pendingNetworkAutoRoll = false;
    this.input.triggerKeyboardThrow();
    this.syncTurnHotkeysEnabled();
  }

  private blockNetworkActions(durationMs: number): void {
    if (this.mode !== 'network') return;
    const until = performance.now() + durationMs;
    this.networkActionsBlockedUntil = Math.max(this.networkActionsBlockedUntil, until);
    this.input.setEnabled(false);
    this.selection?.disable();
    this.syncTurnHotkeysEnabled();
    if (this.networkActionsBlockTimer !== null) clearTimeout(this.networkActionsBlockTimer);
    this.networkActionsBlockTimer = window.setTimeout(() => {
      this.networkActionsBlockTimer = null;
      this.syncNetworkInputState();
      this.syncTurnHotkeysEnabled();
      this.tryNetworkAutoRoll();
    }, durationMs);
  }

  private clearNetworkTurnDice(): void {
    if (this.mode !== 'network') return;
    this.networkLastRolledFaces = [];
    this.pendingSelectionPreview = null;
    this.dice.hideRemoteDice();
    this.selection?.clearExternalSelection();
    this.selection?.clear();
    this.selection?.disable();
    this.benchDice?.setFaces([]);
    this.hud?.setSelectionPreview(null);
    this.hud?.setSelectionState(0, false, 0);
    this.clearNetworkCollisionAudioState();
  }

  private areNetworkActionsBlocked(): boolean {
    return this.mode === 'network' && performance.now() < this.networkActionsBlockedUntil;
  }

  private syncNetworkInputState(): void {
    const state = this.currentMatchState;
    const ownUserId = this.network?.getUserId() ?? '';
    if (this.mode !== 'network' || !state || !this.selection) {
      this.input.setEnabled(false);
      this.selection?.disable();
      return;
    }

    const isOwnPlayer = this.isOwnPlayer(ownUserId);
    const isMyTurn = state.currentPlayer === ownUserId;
    const isSelecting = state.phase === MATCH_PHASE.SELECTING;
    const isWaiting = state.phase === MATCH_PHASE.WAITING;
    if (!isOwnPlayer || this.areNetworkActionsBlocked()) {
      this.input.setEnabled(false);
      this.selection.disable();
    } else if (isMyTurn && isSelecting) {
      this.input.setEnabled(false);
      this.selection.enable();
    } else if (isMyTurn && isWaiting) {
      this.input.setEnabled(true);
      this.selection.disable();
    } else {
      this.input.setEnabled(false);
      this.selection.disable();
    }
  }

  private canUseLocalMatchHotkeys(): boolean {
    const state = this.localMatchState;
    return (
      this.mode === 'local' &&
      state !== null &&
      state.currentPlayer === 'human' &&
      !isLocalMatchEnded(state) &&
      !this.localRolling &&
      this.selection !== null &&
      this.localLastRolledFaces.length > 0
    );
  }

  private canUseNetworkSelectionControls(): boolean {
    const state = this.currentMatchState;
    const ownUserId = this.network?.getUserId() ?? '';
    return (
      this.mode === 'network' &&
      this.selection !== null &&
      state !== null &&
      !this.areNetworkActionsBlocked() &&
      state.phase === MATCH_PHASE.SELECTING &&
      state.currentPlayer === ownUserId &&
      this.isOwnPlayer(ownUserId) &&
      this.networkLastRolledFaces.length > 0
    );
  }

  private canUseNetworkHotkeys(): boolean {
    return this.canUseNetworkSelectionControls();
  }

  private getLocalMatchSelectionValidation():
    | ReturnType<typeof validateSelection>
    | null {
    const selection = this.selection;
    if (!this.canUseLocalMatchHotkeys() || !selection) return null;
    return validateSelection(
      this.localLastRolledFaces,
      selection.getSelectedRollIndices(),
    );
  }

  private getLocalMatchSelectionPoints(): number | null {
    const validation = this.getLocalMatchSelectionValidation();
    return validation?.valid === true ? validation.points : null;
  }

  private canSubmitLocalMatchSelection(): boolean {
    return this.getLocalMatchSelectionPoints() !== null;
  }

  private canSubmitLocalMatchBank(): boolean {
    const points = this.getLocalMatchSelectionPoints();
    const state = this.localMatchState;
    const config = this.localMatchConfig;
    if (points === null || state === null || config === null) return false;
    return state.turnPoints + points >= config.minBank;
  }

  private getNetworkSelectionPoints(): number | null {
    const selection = this.selection;
    if (!this.canUseNetworkSelectionControls() || !selection) return null;
    const validation = validateSelection(
      this.networkLastRolledFaces,
      selection.getSelectedRollIndices(),
    );
    return validation.valid === true ? validation.points : null;
  }

  private canSubmitNetworkSelection(): boolean {
    return this.getNetworkSelectionPoints() !== null;
  }

  private canSubmitNetworkBank(): boolean {
    const points = this.getNetworkSelectionPoints();
    const state = this.currentMatchState;
    if (points === null || state === null) return false;
    const minBank = this.currentRoomState?.options.minBank ?? DEFAULT_ROOM_OPTIONS.minBank;
    return state.turnPoints + points >= minBank;
  }

  private isOwnPlayer(ownUserId: string): boolean {
    const member = this.currentRoomState?.members.find((m) => m.userId === ownUserId);
    return member?.role === ROOM_ROLE.PLAYER;
  }

  private isNetworkFinalRematchAvailable(state: MatchStatePayload | null): boolean {
    const ownUserId = this.network?.getUserId() ?? '';
    const ownMember = this.currentRoomState?.members.find(
      (member) => member.userId === ownUserId,
    );
    return (
      state !== null &&
      state.phase === MATCH_PHASE.FINISHED &&
      state.finishReason === MATCH_FINISH_REASON.SCORE &&
      ownMember?.role === ROOM_ROLE.PLAYER
    );
  }

  private withSelectionPreviewPoints(
    payload: MatchSelectionPreviewPayload,
  ): MatchSelectionPreviewPayload {
    if (payload.points > 0 || payload.indices.length === 0 || this.networkLastRolledFaces.length === 0) {
      return payload;
    }

    const rollIndexByDieIndex = new Map<number, number>();
    this.dice.getActiveDiceMeshes().forEach((entry, rollIndex) => {
      rollIndexByDieIndex.set(entry.index, rollIndex);
    });
    const rollIndices = payload.indices.map((index) => rollIndexByDieIndex.get(index) ?? -1);
    const validation = validateSelection(this.networkLastRolledFaces, rollIndices);
    return {
      ...payload,
      valid: validation.valid === true,
      points: validation.valid === true ? validation.points : 0,
    };
  }

  private applyPendingSelectionPreview(): void {
    const payload = this.pendingSelectionPreview;
    const state = this.currentMatchState;
    if (!payload || !this.selection || !state) return;

    if (state.phase !== MATCH_PHASE.SELECTING || state.currentPlayer !== payload.userId) {
      if (payload.indices.length === 0) this.selection.clearExternalSelection();
      this.pendingSelectionPreview = null;
      return;
    }

    if (payload.indices.length === 0) {
      this.selection.clearExternalSelection();
      this.pendingSelectionPreview = null;
    } else {
      this.selection.setExternalSelection(payload.indices);
    }
  }

  private canUseTestInput(ownUserId: string): boolean {
    const member = this.currentRoomState?.members.find((m) => m.userId === ownUserId);
    const roomActive = this.currentRoomState?.status === ROOM_STATUS.ACTIVE;
    const rolling = this.currentMatchState?.phase === MATCH_PHASE.ROLLING;
    return member?.role === ROOM_ROLE.PLAYER && roomActive && !rolling;
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
    this.closeSurrenderConfirm();
    this.unsubscribeLanguage();
    this.clearLocalBotActionTimer();
    if (this.networkActionsBlockTimer !== null) clearTimeout(this.networkActionsBlockTimer);
    this.networkActionsBlockTimer = null;
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener(GAME_POPUP_CLOSE_EVENT, this.handleCloseGamePopups);
    for (const unsubscribe of this.eventUnsubscribers.splice(0)) unsubscribe();
    this.turnHotkeys.destroy();
    this.input.destroy();
    this.selection?.destroy();
    this.benchDice?.destroy();
    this.hud?.destroy();
    this.rulesBoard.destroy();
    this.dice.destroy();
    this.clearNetworkCollisionAudioState();
    this.perf?.el.remove();
    if (this.tableVisualMesh) {
      this.tableVisualMesh.geometry.dispose();
      const materials = Array.isArray(this.tableVisualMesh.material)
        ? this.tableVisualMesh.material
        : [this.tableVisualMesh.material];
      for (const material of materials) material.dispose();
    }
    const rimMaterials = new Set<THREE.Material>();
    for (const mesh of this.tableRimMeshes) {
      mesh.geometry.dispose();
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const material of materials) rimMaterials.add(material);
    }
    for (const material of rimMaterials) material.dispose();
    if (this.backgroundMesh) {
      this.backgroundMesh.geometry.dispose();
      const materials = Array.isArray(this.backgroundMesh.material)
        ? this.backgroundMesh.material
        : [this.backgroundMesh.material];
      for (const material of materials) material.dispose();
    }
    for (const texture of this.tableTextures) texture.dispose();
    this.backgroundTexture?.dispose();
    this.renderer.domElement.remove();
    this.renderer.dispose();
  }

  setPlayerSettings(settings: PlayerSettings): void {
    this.playerSettings = settings;
    this.input.setThrowKeyCode(settings.controls.throwDice);
    this.rulesBoard.setToggleKeyCode(settings.controls.showRules);
    this.turnHotkeys.setBindings(settings.controls);
    this.hud?.setControls(settings.controls);
  }

  private areShadowsEnabled(): boolean {
    return this.mode === 'local';
  }

  private createScene(): THREE.Scene {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a22);

    const shadows = this.areShadowsEnabled();
    const ambient = new THREE.AmbientLight(0xf0f2ff, 0.46);
    const directional = new THREE.DirectionalLight(0xfff5da, 0.72);
    directional.position.set(0.001, DIRECTIONAL_LIGHT_Y, LIGHT_FORWARD_Z);
    directional.castShadow = shadows;
    if (shadows) {
      directional.shadow.mapSize.width = SHADOW_MAP_SIZE;
      directional.shadow.mapSize.height = SHADOW_MAP_SIZE;
      directional.shadow.bias = -0.0001;
      directional.shadow.normalBias = 0;
      directional.shadow.radius = 2;

      directional.shadow.camera.left = -SHADOW_CAMERA_HALF_WIDTH;
      directional.shadow.camera.right = SHADOW_CAMERA_HALF_WIDTH;
      directional.shadow.camera.top = SHADOW_CAMERA_HALF_DEPTH;
      directional.shadow.camera.bottom = -SHADOW_CAMERA_HALF_DEPTH;
      directional.shadow.camera.near = 0.5;
      directional.shadow.camera.far = SHADOW_CAMERA_FAR;
    }

    const ceilingLight = new THREE.PointLight(0xfff1d0, 1.4, 14, 1.2);
    ceilingLight.position.set(0, WALL_HEIGHT - CEILING_LIGHT_Y_OFFSET, LIGHT_FORWARD_Z);

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
      antialias: false,
      powerPreference: 'high-performance',
    });
    renderer.domElement.style.width = '100vw';
    renderer.domElement.style.height = '100vh';
    renderer.domElement.style.imageRendering = 'pixelated';
    renderer.setPixelRatio(1);
    this.setRendererPixelSize(renderer);
    renderer.shadowMap.enabled = this.areShadowsEnabled();
    if (renderer.shadowMap.enabled) renderer.shadowMap.type = THREE.BasicShadowMap;
    return renderer;
  }

  private setRendererPixelSize(renderer: THREE.WebGLRenderer): void {
    const width = Math.max(320, Math.floor(window.innerWidth * PS1_RENDER_SCALE));
    const height = Math.max(180, Math.floor(window.innerHeight * PS1_RENDER_SCALE));
    renderer.setSize(width, height, false);
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
        friction: DICE_TABLE_FRICTION,
        restitution: DICE_TABLE_RESTITUTION,
        contactEquationStiffness: DICE_TABLE_CONTACT_STIFFNESS,
        contactEquationRelaxation: DICE_TABLE_CONTACT_RELAXATION,
      }),
    );

    this.physicsWorld.addContactMaterial(
      new CANNON.ContactMaterial(this.diceMaterial, this.diceMaterial, {
        friction: DICE_DICE_FRICTION,
        restitution: DICE_DICE_RESTITUTION,
      }),
    );
  }

  private computeCameraY(aspect = this.camera.aspect): number {
    const tanHalf = Math.tan((CAMERA_FOV * Math.PI) / 360);
    const hForDepth = TABLE_DEPTH / 2 / tanHalf;
    const hForWidth = TABLE_WIDTH / 2 / (tanHalf * aspect);
    return Math.max(hForDepth, hForWidth) / TABLE_VIEWPORT_FILL;
  }

  private createPlayArea(withBodies: boolean): void {
    this.createBackgroundPlane();
    this.createTable(withBodies);
    this.createTableRim();
    this.createWalls(withBodies);
    if (withBodies) this.createCeiling();
  }

  private createBackgroundPlane(): void {
    const texture = this.createBackgroundTexture();
    this.backgroundTexture = texture;
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: BACKGROUND_DARKEN_COLOR,
      map: texture,
      depthWrite: false,
      depthTest: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = BACKGROUND_PLANE_Y;
    mesh.renderOrder = -10;
    this.scene.add(mesh);
    this.backgroundMesh = mesh;
    this.updateBackgroundPlaneSize();
  }

  private updateBackgroundPlaneSize(): void {
    if (!this.backgroundMesh) return;
    const distance = this.camera.position.y - BACKGROUND_PLANE_Y;
    const visibleDepth =
      2 * distance * Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2);
    const visibleWidth = visibleDepth * this.camera.aspect;
    this.backgroundMesh.scale.set(
      visibleWidth * BACKGROUND_VIEWPORT_OVERSCAN,
      visibleDepth * BACKGROUND_VIEWPORT_OVERSCAN,
      1,
    );
  }

  private createBackgroundTexture(): THREE.Texture {
    const texture = assetPreloader.getTextureClone(BACKGROUND_TEXTURE_URL);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  private createTable(withBody: boolean): void {
    const geometry = new THREE.BoxGeometry(1, TABLE_THICKNESS, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: this.createTableTexture(TABLE_COLOR_MAP_URL, THREE.SRGBColorSpace, true),
      normalMap: this.createTableTexture(TABLE_NORMAL_MAP_URL),
      roughnessMap: this.createTableTexture(TABLE_ROUGHNESS_MAP_URL),
      roughness: 1.0,
      metalness: 0.0,
      normalScale: new THREE.Vector2(0.35, 0.35),
      flatShading: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, -TABLE_THICKNESS / 2, 0);
    mesh.receiveShadow = this.areShadowsEnabled();
    this.scene.add(mesh);
    this.tableVisualMesh = mesh;
    this.updateVisualTableSize();

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

  private createTableTexture(
    url: string,
    colorSpace?: THREE.ColorSpace,
    ps1Quantize = false,
  ): THREE.Texture {
    const texture = assetPreloader.getTextureClone(url);
    if (ps1Quantize) this.applyPs1TablePalette(texture);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.anisotropy = 1;
    if (colorSpace) texture.colorSpace = colorSpace;
    this.tableTextures.push(texture);
    return texture;
  }

  private applyPs1TablePalette(texture: THREE.Texture): void {
    const image = texture.image as HTMLImageElement | undefined;
    if (!image || image.naturalWidth <= 0 || image.naturalHeight <= 0) return;
    const canvas = document.createElement('canvas');
    canvas.width = TABLE_PS1_TEXTURE_SIZE;
    canvas.height = TABLE_PS1_TEXTURE_SIZE;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < data.data.length; i += 4) {
      const cell = i / 4;
      const x = cell % canvas.width;
      const y = Math.floor(cell / canvas.width);
      const checker = (x + y) % 2 === 0 ? 1 : -1;
      const dither = checker * TABLE_PS1_DITHER_STRENGTH;
      data.data[i] = this.quantizeTableChannel(data.data[i]!, dither);
      data.data[i + 1] = this.quantizeTableChannel(data.data[i + 1]!, dither);
      data.data[i + 2] = this.quantizeTableChannel(data.data[i + 2]!, dither);
    }

    ctx.putImageData(data, 0, 0);
    texture.image = canvas;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
  }

  private quantizeTableChannel(value: number, dither: number): number {
    return Math.max(
      0,
      Math.min(
        255,
        Math.round((value + dither) / TABLE_PS1_COLOR_STEP) * TABLE_PS1_COLOR_STEP,
      ),
    );
  }

  private updateVisualTableSize(): void {
    if (!this.tableVisualMesh) return;
    const visualWidth = TABLE_WIDTH;
    const visualDepth = TABLE_DEPTH;
    this.tableVisualMesh.scale.set(visualWidth, 1, visualDepth);
    for (const texture of this.tableTextures) {
      texture.repeat.set(visualWidth / TABLE_WIDTH, visualDepth / TABLE_DEPTH);
    }
  }

  private createTableRim(): void {
    const material = new THREE.MeshStandardMaterial({
      color: TABLE_RIM_COLOR,
      roughness: 1,
      metalness: 0,
      flatShading: true,
    });
    const halfW = TABLE_WIDTH / 2;
    const halfD = TABLE_DEPTH / 2;
    const y = TABLE_RIM_HEIGHT / 2;
    const bars: { size: [number, number, number]; pos: [number, number, number] }[] = [
      {
        size: [TABLE_WIDTH, TABLE_RIM_HEIGHT, TABLE_RIM_THICKNESS],
        pos: [0, y, -halfD + TABLE_RIM_THICKNESS / 2],
      },
      {
        size: [TABLE_WIDTH, TABLE_RIM_HEIGHT, TABLE_RIM_THICKNESS],
        pos: [0, y, halfD - TABLE_RIM_THICKNESS / 2],
      },
      {
        size: [TABLE_RIM_THICKNESS, TABLE_RIM_HEIGHT, TABLE_DEPTH - TABLE_RIM_THICKNESS * 2],
        pos: [-halfW + TABLE_RIM_THICKNESS / 2, y, 0],
      },
      {
        size: [TABLE_RIM_THICKNESS, TABLE_RIM_HEIGHT, TABLE_DEPTH - TABLE_RIM_THICKNESS * 2],
        pos: [halfW - TABLE_RIM_THICKNESS / 2, y, 0],
      },
    ];

    for (const bar of bars) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...bar.size), material);
      mesh.position.set(...bar.pos);
      mesh.castShadow = this.areShadowsEnabled();
      mesh.receiveShadow = this.areShadowsEnabled();
      this.scene.add(mesh);
      this.tableRimMeshes.push(mesh);
    }
  }

  private createWalls(withBody: boolean): void {
    const playHalfW = TABLE_WIDTH / 2 - WALL_INSET;
    const playHalfD = TABLE_DEPTH / 2 - WALL_INSET;
    const halfH = WALL_HEIGHT / 2;
    const halfT = WALL_THICKNESS / 2;
    const wallY = halfH;

    const walls: { halfExtents: [number, number, number]; pos: [number, number, number] }[] = [
      { halfExtents: [playHalfW + halfT, halfH, halfT], pos: [0, wallY, -playHalfD - halfT] },
      { halfExtents: [playHalfW + halfT, halfH, halfT], pos: [0, wallY, playHalfD + halfT] },
      { halfExtents: [halfT, halfH, playHalfD + halfT], pos: [playHalfW + halfT, wallY, 0] },
      { halfExtents: [halfT, halfH, playHalfD + halfT], pos: [-playHalfW - halfT, wallY, 0] },
    ];

    if (!withBody || !this.physicsWorld || !this.tableMaterial) return;

    for (const w of walls) {
      const body = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(...w.halfExtents)),
        material: this.tableMaterial,
        position: new CANNON.Vec3(...w.pos),
      });
      this.physicsWorld.addBody(body);
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
    this.setRendererPixelSize(this.renderer);
    this.updateBackgroundPlaneSize();
    this.updateVisualTableSize();
    this.rulesBoard.updateLayout();
  };

  private gameLoop = (): void => {
    const frameStartMs = performance.now();
    const currentTime = frameStartMs;
    let deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (deltaTime > 0.1 || Number.isNaN(deltaTime) || !Number.isFinite(deltaTime)) {
      deltaTime = 1 / 60;
    }

    const simStartMs = performance.now();
    this.input.update(currentTime);

    if (this.mode === 'local' && this.physicsWorld) {
      if (this.localRolling) this.dice.applyLocalAssistForces();
      this.physicsWorld.step(1 / 60, deltaTime, 3);
      if (this.localRolling) this.dice.applyLocalContactKicks();
      this.dice.syncMeshes(currentTime);
      if (this.localRolling && this.dice.areLocalActiveDiceAtRest()) {
        this.handleLocalActiveRest();
      }
    } else {
      // network: interpolation buffer + короткий extrapolation fallback.
      this.dice.extrapolate(currentTime);
    }
    this.selection?.updateMarkers();
    this.rulesBoard.update(deltaTime);
    const simMs = performance.now() - simStartMs;

    const renderStartMs = performance.now();
    this.renderer.render(this.scene, this.camera);
    const renderMs = performance.now() - renderStartMs;
    this.updatePerfStats(performance.now(), performance.now() - frameStartMs, simMs, renderMs);
    this.rafId = requestAnimationFrame(this.gameLoop);
  };

  private createPerfStats(): PerfStats | null {
    if (!PERF_DEBUG_ENABLED()) return null;
    const el = document.createElement('div');
    el.style.cssText = [
      'position:fixed',
      'left:8px',
      'bottom:8px',
      'z-index:50',
      'padding:6px 8px',
      `border-radius:${UI_RADIUS}`,
      'background:rgba(0,0,0,.72)',
      'color:#dfffe0',
      'font:12px/1.35 monospace',
      'white-space:pre',
      'pointer-events:none',
    ].join(';');
    el.textContent = 'perf...';
    document.body.appendChild(el);
    return {
      el,
      lastUiMs: performance.now(),
      frames: 0,
      frameMs: 0,
      simMs: 0,
      renderMs: 0,
      lastSnapshotMs: 0,
      snapshotGapMs: 0,
      snapshotGaps: 0,
      maxSnapshotGapMs: 0,
    };
  }

  private recordSnapshot(now: number): void {
    const perf = this.perf;
    if (!perf) return;
    if (perf.lastSnapshotMs > 0) {
      const gap = now - perf.lastSnapshotMs;
      perf.snapshotGapMs += gap;
      perf.snapshotGaps += 1;
      perf.maxSnapshotGapMs = Math.max(perf.maxSnapshotGapMs, gap);
    }
    perf.lastSnapshotMs = now;
  }

  private updatePerfStats(now: number, frameMs: number, simMs: number, renderMs: number): void {
    const perf = this.perf;
    if (!perf) return;
    perf.frames += 1;
    perf.frameMs += frameMs;
    perf.simMs += simMs;
    perf.renderMs += renderMs;

    const elapsedMs = now - perf.lastUiMs;
    if (elapsedMs < PERF_UPDATE_INTERVAL_MS) return;

    const frames = Math.max(1, perf.frames);
    const fps = (perf.frames * 1000) / elapsedMs;
    const avgSnapshotGap = perf.snapshotGaps > 0 ? perf.snapshotGapMs / perf.snapshotGaps : 0;
    perf.el.textContent = [
      `fps ${fps.toFixed(0)}  frame ${(perf.frameMs / frames).toFixed(1)}ms`,
      `sim ${(perf.simMs / frames).toFixed(2)}ms  render ${(perf.renderMs / frames).toFixed(2)}ms`,
      `calls ${this.renderer.info.render.calls}  tris ${this.renderer.info.render.triangles}`,
      `snap gap ${avgSnapshotGap.toFixed(1)}ms  max ${perf.maxSnapshotGapMs.toFixed(1)}ms`,
    ].join('\n');

    perf.lastUiMs = now;
    perf.frames = 0;
    perf.frameMs = 0;
    perf.simMs = 0;
    perf.renderMs = 0;
    perf.snapshotGapMs = 0;
    perf.snapshotGaps = 0;
    perf.maxSnapshotGapMs = 0;
  }
}
