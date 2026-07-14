import * as THREE from 'three';
import { CLOSED_HAND_CURSOR_URL, OPEN_HAND_CURSOR_URL } from '../../../assets/asset-manifest';
import { setCustomCursorVariant } from '../../../../ui/custom-cursor';
import {
  isGameplayInteractionBlocked,
  isInteractiveGameTarget,
  requestTopMenuDropdownClose,
} from '../../../../ui/game-modal-state';
import { EventEmitter } from '../../event-emitter.class';
import {
  DICE_COUNT,
  DICE_HALF_SIZE,
  DICE_SPACING,
  HOLD_HEIGHT,
  TABLE_DEPTH,
  TABLE_WIDTH,
  THROW_DOWNWARD_BIAS,
  THROW_LINEAR_SCALE,
  THROW_MAX_SPEED,
  THROW_MIN_SPEED,
  THROW_POSITION_PADDING,
  VELOCITY_BUFFER_MS,
  WALL_INSET,
} from '../../../config';

interface Sample {
  pos: THREE.Vector3;
  time: number;
}

export type HoldStartSource = 'pointer' | 'keyboard';

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const randomBetween = (min: number, max: number): number => min + (max - min) * Math.random();

const SPACE_THROW_SPEED_SCALE = 0.41;
const SPACE_THROW_UPWARD_SPEED = 3.7;
const SPACE_THROW_START_DEPTH_MIN = 0.58;
const SPACE_THROW_START_DEPTH_MAX = 0.76;
const SPACE_THROW_START_CROSS_AXIS_SPREAD = 0.22;
const SPACE_THROW_TARGET_DEPTH_MIN = 0.08;
const SPACE_THROW_TARGET_DEPTH_MAX = 0.28;
const SPACE_THROW_TARGET_CROSS_AXIS_SPREAD = 0.25;
const DEFAULT_THROW_KEY_CODE = 'Space';
const OPEN_HAND_CURSOR = `url("${OPEN_HAND_CURSOR_URL}") 64 64, grab`;
const CLOSED_HAND_CURSOR = `url("${CLOSED_HAND_CURSOR_URL}") 64 64, grabbing`;

export class ShakeInputService {
  readonly events = new EventEmitter();

  private isHolding = false;
  private enabled = true;
  private throwKeyCode = DEFAULT_THROW_KEY_CODE;
  private samples: Sample[] = [];
  private currentPos = new THREE.Vector3();
  private lastEmittedPos = new THREE.Vector3();
  private lastSpeed = 0;
  private releaseCursorSuppressed = false;
  private pointerOverTable = false;
  private readonly defaultCursor: string;

  private readonly raycaster = new THREE.Raycaster();
  private readonly holdPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -HOLD_HEIGHT);
  private readonly ndc = new THREE.Vector2();
  private readonly tmpHit = new THREE.Vector3();

  private canvas: HTMLCanvasElement;
  private camera: THREE.PerspectiveCamera;

  constructor(
    canvas: HTMLCanvasElement,
    camera: THREE.PerspectiveCamera,
    throwKeyCode = DEFAULT_THROW_KEY_CODE,
  ) {
    this.canvas = canvas;
    this.camera = camera;
    this.throwKeyCode = throwKeyCode;
    this.defaultCursor = canvas.style.cursor;
    this.updateCursor();
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerleave', this.onPointerLeave);
    canvas.addEventListener('pointercancel', this.onPointerCancel);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('keydown', this.onKeyDown);
    canvas.addEventListener('contextmenu', this.onContextMenu);
  }

  update(currentTime: number): void {
    const cutoff = currentTime - VELOCITY_BUFFER_MS;
    while (this.samples.length > 0 && this.samples[0]!.time < cutoff) {
      this.samples.shift();
    }
  }

  /**
   * Включить/выключить приём pointer-событий. Используется turn-based слоем,
   * чтобы не дать игроку "брать" кости в фазе SELECTING (там работает
   * SelectionService — клик по кости вместо hold/release). Также блокируется
   * в чужой ход. По умолчанию `true`.
   *
   * При выключении посреди удержания — корректно отменяем hold (без emit'а
   * release), чтобы в DiceService не остался "висящий" isHeld.
   */
  setEnabled(enabled: boolean): void {
    if (this.enabled === enabled) return;
    this.enabled = enabled;
    this.releaseCursorSuppressed = false;
    if (!enabled) this.cancelHold();
    if (!enabled) this.pointerOverTable = false;
    this.updateCursor();
  }

  setThrowKeyCode(code: string): void {
    this.throwKeyCode = code;
  }

  triggerKeyboardThrow(): void {
    if (!this.enabled) return;
    if (isGameplayInteractionBlocked()) return;
    if (this.isHolding) return;
    this.emitSpaceThrow();
  }

  triggerAutomatedThrow(): void {
    if (!this.enabled) return;
    if (this.isHolding) return;
    this.emitSpaceThrow();
  }

  isPointerInsideThrowZone(event: PointerEvent): boolean {
    if (!this.enabled) return false;
    if (event.target !== this.canvas) return false;
    const rect = this.canvas.getBoundingClientRect();
    this.ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.ndc, this.camera);
    const hit = this.raycaster.ray.intersectPlane(this.holdPlane, this.tmpHit);
    if (!hit) return false;
    const { limitX, limitZ } = this.getThrowZoneLimits();
    return (
      hit.x >= -limitX &&
      hit.x <= limitX &&
      hit.z >= -limitZ &&
      hit.z <= limitZ
    );
  }

  destroy(): void {
    this.setEnabled(false);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerleave', this.onPointerLeave);
    this.canvas.removeEventListener('pointercancel', this.onPointerCancel);
    this.canvas.removeEventListener('contextmenu', this.onContextMenu);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('keydown', this.onKeyDown);
    this.samples.length = 0;
    this.canvas.style.cursor = this.defaultCursor;
  }

  private onContextMenu = (event: MouseEvent): void => {
    event.preventDefault();
  };

  private onPointerDown = (event: PointerEvent): void => {
    if (!this.enabled) return;
    if (isGameplayInteractionBlocked()) return;
    if (!event.isPrimary || event.button !== 0) return;
    if (!this.projectToHoldPlane(event) || !this.pointerOverTable) {
      this.updateCursor();
      return;
    }
    if (event.pointerType === 'touch') event.preventDefault();
    this.canvas.setPointerCapture(event.pointerId);
    this.releaseCursorSuppressed = false;
    this.isHolding = true;
    this.updateCursor();
    this.samples.length = 0;
    this.pushSample(performance.now());
    this.lastEmittedPos.copy(this.currentPos);
    this.events.emit('hold-start', this.currentPos.clone(), 'pointer' satisfies HoldStartSource);
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (!this.enabled) return;
    if (!event.isPrimary) return;
    if (isGameplayInteractionBlocked()) {
      this.cancelHold();
      this.pointerOverTable = false;
      this.updateCursor();
      return;
    }
    if (!this.projectToHoldPlane(event)) {
      this.updateCursor();
      return;
    }
    this.updateCursor();
    if (!this.isHolding) return;
    const now = performance.now();

    const prev = this.samples[this.samples.length - 1];
    if (prev) {
      const dt = Math.max(0.001, (now - prev.time) / 1000);
      const dist = this.currentPos.distanceTo(prev.pos);
      this.lastSpeed = dist / dt;
    }

    this.pushSample(now);
    this.events.emit('hold-move', this.currentPos.clone(), this.lastSpeed);
  };

  private onPointerLeave = (): void => {
    this.pointerOverTable = false;
    this.updateCursor();
  };

  private onPointerUp = (event: PointerEvent): void => {
    if (!this.enabled) return;
    if (!event.isPrimary) return;
    if (isGameplayInteractionBlocked()) {
      this.cancelHold();
      this.updateCursor();
      return;
    }
    if (event.button !== 0 || !this.isHolding) return;
    this.isHolding = false;
    this.releaseCursorSuppressed = true;
    this.updateCursor();

    const now = performance.now();
    this.update(now);

    const velocity = new THREE.Vector3();
    if (this.samples.length >= 2) {
      const first = this.samples[0]!;
      const last = this.samples[this.samples.length - 1]!;
      const dt = Math.max(0.001, (last.time - first.time) / 1000);
      velocity.subVectors(last.pos, first.pos).divideScalar(dt);
    }

    velocity.multiplyScalar(THROW_LINEAR_SCALE);

    if (velocity.length() < THROW_MIN_SPEED) {
      const camForward = new THREE.Vector3();
      this.camera.getWorldDirection(camForward);
      camForward.y = 0;
      camForward.normalize().multiplyScalar(THROW_MIN_SPEED);
      velocity.add(camForward);
    }

    velocity.y += THROW_DOWNWARD_BIAS;

    if (velocity.length() > THROW_MAX_SPEED) {
      velocity.setLength(THROW_MAX_SPEED);
    }

    this.samples.length = 0;
    this.events.emit('release', velocity, this.currentPos.clone(), 'pointer' satisfies HoldStartSource);
  };

  private onPointerCancel = (event: PointerEvent): void => {
    if (!event.isPrimary) return;
    this.cancelHold();
    this.pointerOverTable = false;
    this.updateCursor();
  };

  private onKeyDown = (event: KeyboardEvent): void => {
    if (!this.enabled) return;
    if (event.code !== this.throwKeyCode) return;
    if (event.repeat || event.defaultPrevented) return;
    if (this.isHolding) return;
    if (isInteractiveGameTarget(event.target) || isGameplayInteractionBlocked()) return;

    event.preventDefault();
    requestTopMenuDropdownClose();
    this.triggerKeyboardThrow();
  };

  private emitSpaceThrow(): void {
    this.isHolding = true;
    this.releaseCursorSuppressed = false;
    this.updateCursor();
    this.samples.length = 0;
    const throwSetup = this.createSpaceThrow();
    this.currentPos.copy(throwSetup.position);
    this.lastEmittedPos.copy(this.currentPos);
    this.events.emit('hold-start', this.currentPos.clone(), 'keyboard' satisfies HoldStartSource);

    if (!this.enabled || !this.isHolding) return;
    this.isHolding = false;
    this.releaseCursorSuppressed = true;
    this.updateCursor();

    this.events.emit(
      'release',
      throwSetup.velocity,
      this.currentPos.clone(),
      'keyboard' satisfies HoldStartSource,
    );
  }

  private cancelHold(): void {
    if (!this.isHolding) return;
    this.isHolding = false;
    this.samples.length = 0;
    this.lastSpeed = 0;
    this.events.emit('hold-cancel');
  }

  private updateCursor(): void {
    if (!this.enabled || this.releaseCursorSuppressed || !this.pointerOverTable) {
      this.canvas.style.cursor = this.defaultCursor;
      setCustomCursorVariant('target');
      return;
    }
    this.canvas.style.cursor = this.isHolding ? CLOSED_HAND_CURSOR : OPEN_HAND_CURSOR;
    setCustomCursorVariant(this.isHolding ? 'closed' : 'open');
  }

  /*
   * IMPORTANT: do not delete. Tested alternate cursor flow:
   * keep `open-hand` after release until roll resolution, not just until mouseup.
   *
   * Shape:
   * - add `private rollResolving = false`
   * - add `setRollResolving(resolving: boolean): void`
   * - `updateCursor()` priority:
   *   `isHolding` -> close hand
   *   `enabled || rollResolving` -> open hand
   *   otherwise -> target-hand/default
   * - `GameEngine` sets resolving true on release / `MATCH_STATE.ROLLING`
   * - `GameEngine` sets resolving false on local faces read, network
   *   `MATCH_ROLL_RESULT`, non-ROLLING fallback, room close, turn cleanup.
   *
   * Reverted because target-hand immediately after release felt better in play.
   */

  private createSpaceThrow(): { position: THREE.Vector3; velocity: THREE.Vector3 } {
    const maxGroupOffsetX = ((DICE_COUNT - 1) / 2) * DICE_SPACING;
    const limitX = Math.max(
      0,
      TABLE_WIDTH / 2 - WALL_INSET - maxGroupOffsetX - DICE_HALF_SIZE - THROW_POSITION_PADDING,
    );
    const limitZ = Math.max(
      0,
      TABLE_DEPTH / 2 - WALL_INSET - DICE_HALF_SIZE - THROW_POSITION_PADDING,
    );

    const side = Math.floor(Math.random() * 4);
    const start = new THREE.Vector3(0, HOLD_HEIGHT, 0);
    const target = new THREE.Vector3(0, HOLD_HEIGHT, 0);
    const startDepth = randomBetween(SPACE_THROW_START_DEPTH_MIN, SPACE_THROW_START_DEPTH_MAX);
    const targetDepth = randomBetween(SPACE_THROW_TARGET_DEPTH_MIN, SPACE_THROW_TARGET_DEPTH_MAX);
    const startSpreadX = limitX * SPACE_THROW_START_CROSS_AXIS_SPREAD;
    const startSpreadZ = limitZ * SPACE_THROW_START_CROSS_AXIS_SPREAD;
    const spreadX = limitX * SPACE_THROW_TARGET_CROSS_AXIS_SPREAD;
    const spreadZ = limitZ * SPACE_THROW_TARGET_CROSS_AXIS_SPREAD;

    if (side === 0) {
      start.set(randomBetween(-startSpreadX, startSpreadX), HOLD_HEIGHT, limitZ * startDepth);
      target.set(randomBetween(-spreadX, spreadX), HOLD_HEIGHT, -limitZ * targetDepth);
    } else if (side === 1) {
      start.set(randomBetween(-startSpreadX, startSpreadX), HOLD_HEIGHT, -limitZ * startDepth);
      target.set(randomBetween(-spreadX, spreadX), HOLD_HEIGHT, limitZ * targetDepth);
    } else if (side === 2) {
      start.set(-limitX * startDepth, HOLD_HEIGHT, randomBetween(-startSpreadZ, startSpreadZ));
      target.set(limitX * targetDepth, HOLD_HEIGHT, randomBetween(-spreadZ, spreadZ));
    } else {
      start.set(limitX * startDepth, HOLD_HEIGHT, randomBetween(-startSpreadZ, startSpreadZ));
      target.set(-limitX * targetDepth, HOLD_HEIGHT, randomBetween(-spreadZ, spreadZ));
    }

    const velocity = target.sub(start);
    velocity.y = 0;
    if (velocity.lengthSq() <= 1e-6) {
      velocity.set(0, 0, -1);
    } else {
      velocity.normalize();
    }
    velocity.multiplyScalar(THROW_MAX_SPEED * SPACE_THROW_SPEED_SCALE);
    velocity.y = SPACE_THROW_UPWARD_SPEED;
    if (velocity.length() > THROW_MAX_SPEED) {
      velocity.setLength(THROW_MAX_SPEED);
    }
    return { position: start, velocity };
  }

  private pushSample(time: number): void {
    this.samples.push({ pos: this.currentPos.clone(), time });
  }

  private projectToHoldPlane(event: PointerEvent): boolean {
    const rect = this.canvas.getBoundingClientRect();
    this.ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.ndc, this.camera);
    const hit = this.raycaster.ray.intersectPlane(this.holdPlane, this.tmpHit);
    if (!hit) {
      this.pointerOverTable = false;
      return false;
    }
    this.currentPos.copy(hit);
    this.pointerOverTable = this.isCurrentPosInsideThrowZone();
    this.clampCurrentPosToThrowZone();
    return true;
  }

  private isCurrentPosInsideThrowZone(): boolean {
    const { limitX, limitZ } = this.getThrowZoneLimits();
    return (
      this.currentPos.x >= -limitX &&
      this.currentPos.x <= limitX &&
      this.currentPos.z >= -limitZ &&
      this.currentPos.z <= limitZ
    );
  }

  private clampCurrentPosToThrowZone(): void {
    const { limitX, limitZ } = this.getThrowZoneLimits();
    this.currentPos.x = clamp(this.currentPos.x, -limitX, limitX);
    this.currentPos.y = HOLD_HEIGHT;
    this.currentPos.z = clamp(this.currentPos.z, -limitZ, limitZ);
  }

  private getThrowZoneLimits(): { limitX: number; limitZ: number } {
    return {
      limitX: Math.max(
        0,
        TABLE_WIDTH / 2 - WALL_INSET - DICE_HALF_SIZE - THROW_POSITION_PADDING,
      ),
      limitZ: Math.max(
        0,
        TABLE_DEPTH / 2 - WALL_INSET - DICE_HALF_SIZE - THROW_POSITION_PADDING,
      ),
    };
  }
}
