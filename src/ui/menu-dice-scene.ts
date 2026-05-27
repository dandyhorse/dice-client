import * as THREE from 'three';

import { createDiceMesh } from '../engine/assets/dice-visual.factory';

const CAMERA_Z = 6.2;
const DICE_SIZE = 1.18;
const POINTER_EASE = 0.08;

export class MenuDiceScene {
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 50);
  private readonly renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance',
  });
  private readonly dice: THREE.Mesh[] = [];
  private readonly pointerTarget = new THREE.Vector2();
  private readonly pointer = new THREE.Vector2();
  private rafId: number | null = null;
  private lastTime = 0;

  constructor() {
    this.renderer.setPixelRatio(1);
    this.renderer.domElement.id = 'menu-dice-canvas';
    Object.assign(this.renderer.domElement.style, {
      position: 'fixed',
      inset: '0',
      width: '100vw',
      height: '100vh',
      zIndex: '1',
      pointerEvents: 'none',
      imageRendering: 'pixelated',
    } satisfies Partial<CSSStyleDeclaration>);

    this.scene.background = null;
    this.camera.position.set(0, 0.4, CAMERA_Z);
    this.camera.lookAt(0, 0, 0);

    const ambient = new THREE.AmbientLight(0xf0f2ff, 0.52);
    const key = new THREE.DirectionalLight(0xfff0d0, 1.1);
    key.position.set(2.8, 4.2, 5);
    const rim = new THREE.PointLight(0x80d5ff, 1.1, 10);
    rim.position.set(-3.4, -0.8, 3.6);
    this.scene.add(ambient, key, rim);

    const left = createDiceMesh(DICE_SIZE);
    left.position.set(-1.35, -0.25, 0);
    left.rotation.set(0.34, -0.66, 0.18);

    const right = createDiceMesh(DICE_SIZE);
    right.position.set(1.35, 0.18, -0.25);
    right.rotation.set(-0.22, 0.52, -0.12);

    this.dice.push(left, right);
    this.scene.add(left, right);
    this.onResize();
  }

  mount(parent: HTMLElement = document.body): void {
    if (!this.renderer.domElement.parentElement) parent.appendChild(this.renderer.domElement);
    window.addEventListener('resize', this.onResize);
    window.addEventListener('mousemove', this.onPointerMove);
    window.addEventListener('pointermove', this.onPointerMove);
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
  }

  destroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onPointerMove);
    window.removeEventListener('pointermove', this.onPointerMove);
    this.renderer.domElement.remove();
    this.renderer.dispose();
  }

  private loop = (now: number): void => {
    const dt = Math.min(0.05, Math.max(0, (now - this.lastTime) / 1000));
    this.lastTime = now;
    this.pointer.lerp(this.pointerTarget, POINTER_EASE);
    this.camera.position.x = this.pointer.x * 0.42;
    this.camera.position.y = 0.4 + this.pointer.y * 0.22;
    this.camera.lookAt(this.pointer.x * 0.18, this.pointer.y * 0.1, 0);

    for (let i = 0; i < this.dice.length; i++) {
      const die = this.dice[i]!;
      const dir = i === 0 ? 1 : -1;
      die.rotation.x += dt * 0.18 * dir;
      die.rotation.y += dt * 0.28 * -dir;
      die.position.x += (this.pointer.x * 0.16 * dir - (die.position.x - (i === 0 ? -1.35 : 1.35))) * 0.035;
      die.position.y += (this.pointer.y * 0.1 - die.position.y + (i === 0 ? -0.25 : 0.18)) * 0.035;
    }

    this.renderer.render(this.scene, this.camera);
    this.rafId = requestAnimationFrame(this.loop);
  };

  private onPointerMove = (event: MouseEvent | PointerEvent): void => {
    this.pointerTarget.x = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
    this.pointerTarget.y = -((event.clientY / Math.max(1, window.innerHeight)) * 2 - 1);
  };

  private onResize = (): void => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(
      Math.max(320, Math.floor(window.innerWidth * 0.62)),
      Math.max(180, Math.floor(window.innerHeight * 0.62)),
      false,
    );
  };
}
