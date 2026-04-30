import * as THREE from 'three';
import { EventEmitter } from '../../event-emitter.class';
import {
  HOLD_HEIGHT,
  THROW_DOWNWARD_BIAS,
  THROW_LINEAR_SCALE,
  THROW_MAX_SPEED,
  THROW_MIN_SPEED,
  VELOCITY_BUFFER_MS,
} from '../../../config';

interface Sample {
  pos: THREE.Vector3;
  time: number;
}

export class ShakeInputService {
  readonly events = new EventEmitter();

  private isHolding = false;
  private enabled = true;
  private samples: Sample[] = [];
  private currentPos = new THREE.Vector3();
  private lastEmittedPos = new THREE.Vector3();
  private lastSpeed = 0;

  private readonly raycaster = new THREE.Raycaster();
  private readonly holdPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -HOLD_HEIGHT);
  private readonly ndc = new THREE.Vector2();
  private readonly tmpHit = new THREE.Vector3();

  private canvas: HTMLCanvasElement;
  private camera: THREE.PerspectiveCamera;

  constructor(canvas: HTMLCanvasElement, camera: THREE.PerspectiveCamera) {
    this.canvas = canvas;
    this.camera = camera;
    canvas.addEventListener('mousedown', this.onMouseDown);
    canvas.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    canvas.addEventListener('contextmenu', this.onContextMenu);
  }

  update(currentTime: number): void {
    const cutoff = currentTime - VELOCITY_BUFFER_MS;
    while (this.samples.length > 0 && this.samples[0]!.time < cutoff) {
      this.samples.shift();
    }
  }

  /**
   * Включить/выключить приём mouse-событий. Используется turn-based слоем,
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
    if (!enabled && this.isHolding) {
      this.isHolding = false;
      this.samples.length = 0;
    }
  }

  destroy(): void {
    this.setEnabled(false);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('contextmenu', this.onContextMenu);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.samples.length = 0;
  }

  private onContextMenu = (event: MouseEvent): void => {
    event.preventDefault();
  };

  private onMouseDown = (event: MouseEvent): void => {
    if (!this.enabled) return;
    if (event.button !== 0) return;
    if (!this.projectToHoldPlane(event)) return;
    this.isHolding = true;
    this.samples.length = 0;
    this.pushSample(performance.now());
    this.lastEmittedPos.copy(this.currentPos);
    this.events.emit('hold-start', this.currentPos.clone());
  };

  private onMouseMove = (event: MouseEvent): void => {
    if (!this.enabled) return;
    if (!this.isHolding) return;
    if (!this.projectToHoldPlane(event)) return;
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

  private onMouseUp = (event: MouseEvent): void => {
    if (!this.enabled) return;
    if (event.button !== 0 || !this.isHolding) return;
    this.isHolding = false;

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
    this.events.emit('release', velocity, this.currentPos.clone());
  };

  private pushSample(time: number): void {
    this.samples.push({ pos: this.currentPos.clone(), time });
  }

  private projectToHoldPlane(event: MouseEvent): boolean {
    const rect = this.canvas.getBoundingClientRect();
    this.ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.ndc, this.camera);
    const hit = this.raycaster.ray.intersectPlane(this.holdPlane, this.tmpHit);
    if (!hit) return false;
    this.currentPos.copy(hit);
    return true;
  }
}
