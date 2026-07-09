import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { createDiceMesh } from '../engine/assets/dice-visual.factory';

const CAMERA_Z = 6.2;
const DICE_SIZE = 1.35;
const MENU_DICE_MODEL_URL = '/assets/dice/stone-dice-model/stone-dice.glb';
const POINTER_EASE = 0.035;
const DICE_PARALLAX_X = 0.08;
const DICE_PARALLAX_Y = 0.045;
const BACKGROUND_PARALLAX_X = 6;
const BACKGROUND_PARALLAX_Y = 4;
const DICE_ROTATION_X = 0.07;
const DICE_ROTATION_Y = 0.11;
const MENU_DICE_SHADE = 'rgba(21, 20, 20, 0.6)';

export class MenuDiceScene {
  private static modelTemplateLoading: Promise<THREE.Group | null> | null = null;

  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 50);
  private readonly renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  private readonly shadeElement = document.createElement('div');
  private readonly dice: THREE.Object3D[] = [];
  private readonly diceGroup = new THREE.Group();
  private readonly pointerTarget = new THREE.Vector2();
  private readonly pointer = new THREE.Vector2();
  private rafId: number | null = null;
  private lastTime = 0;

  static async create(): Promise<MenuDiceScene> {
    return new MenuDiceScene(await MenuDiceScene.loadModelTemplate());
  }

  private static loadModelTemplate(): Promise<THREE.Group | null> {
    if (!MenuDiceScene.modelTemplateLoading) {
      const loader = new GLTFLoader();
      MenuDiceScene.modelTemplateLoading = loader
        .loadAsync(MENU_DICE_MODEL_URL)
        .then((gltf) => MenuDiceScene.createNormalizedModelTemplate(gltf.scene))
        .catch(() => null);
    }
    return MenuDiceScene.modelTemplateLoading;
  }

  private static createNormalizedModelTemplate(model: THREE.Object3D): THREE.Group {
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const wrap = new THREE.Group();

    model.position.sub(center);
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = false;
      child.receiveShadow = false;
    });

    wrap.add(model);
    wrap.scale.setScalar(DICE_SIZE / maxAxis);
    return wrap;
  }

  private constructor(modelTemplate: THREE.Group | null) {
    this.renderer.setPixelRatio(1);
    this.renderer.domElement.id = 'menu-dice-canvas';
    Object.assign(this.renderer.domElement.style, {
      position: 'fixed',
      inset: '0',
      width: '100vw',
      height: '100vh',
      zIndex: '1',
      pointerEvents: 'none',
    } satisfies Partial<CSSStyleDeclaration>);
    this.shadeElement.id = 'menu-dice-shade';
    Object.assign(this.shadeElement.style, {
      position: 'fixed',
      inset: '0',
      width: '100vw',
      height: '100vh',
      zIndex: '2',
      background: MENU_DICE_SHADE,
      pointerEvents: 'none',
    } satisfies Partial<CSSStyleDeclaration>);

    this.scene.background = null;
    this.camera.position.set(0, 0.4, CAMERA_Z);
    this.camera.lookAt(0, 0, 0);

    const ambient = new THREE.AmbientLight(0xf0f2ff, 0.52);
    const key = new THREE.DirectionalLight(0xfff0d0, 1.1);
    key.position.set(2.8, 4.2, 5);
    const rim = new THREE.PointLight(0x80d5ff, 1.1, 10);
    rim.position.set(-3.4, -0.8, 3.6);
    this.scene.add(ambient, key, rim, this.diceGroup);

    if (modelTemplate) {
      this.addModelDice(modelTemplate);
    } else {
      this.addFallbackDice();
    }
    this.onResize();
  }

  mount(parent: HTMLElement = document.body): void {
    if (!this.renderer.domElement.parentElement) parent.appendChild(this.renderer.domElement);
    if (!this.shadeElement.parentElement) parent.appendChild(this.shadeElement);
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
    this.setBackgroundParallax(0, 0);
    this.shadeElement.remove();
    this.renderer.domElement.remove();
    this.renderer.dispose();
  }

  private addFallbackDice(): void {
    const left = createDiceMesh(DICE_SIZE);
    const right = createDiceMesh(DICE_SIZE);
    this.addDicePair(left, right);
  }

  private addModelDice(template: THREE.Group): void {
    const left = template.clone(true);
    const right = template.clone(true);
    this.addDicePair(left, right);
  }

  private addDicePair(left: THREE.Object3D, right: THREE.Object3D): void {
    left.position.set(-1.08, -0.22, 0);
    left.rotation.set(0.34, -0.66, 0.18);
    right.position.set(1.08, 0.15, -0.25);
    right.rotation.set(-0.22, 0.52, -0.12);

    this.dice.push(left, right);
    this.diceGroup.add(left, right);
  }

  private loop = (now: number): void => {
    const dt = Math.min(0.05, Math.max(0, (now - this.lastTime) / 1000));
    this.lastTime = now;
    this.pointer.lerp(this.pointerTarget, POINTER_EASE);
    this.diceGroup.position.x += (this.pointer.x * DICE_PARALLAX_X - this.diceGroup.position.x) * 0.035;
    this.diceGroup.position.y += (this.pointer.y * DICE_PARALLAX_Y - this.diceGroup.position.y) * 0.035;
    this.setBackgroundParallax(
      this.pointer.x * BACKGROUND_PARALLAX_X,
      this.pointer.y * BACKGROUND_PARALLAX_Y,
    );
    this.camera.position.set(0, 0.4, CAMERA_Z);
    this.camera.lookAt(0, 0, 0);

    for (let i = 0; i < this.dice.length; i++) {
      const die = this.dice[i]!;
      const dir = i === 0 ? 1 : -1;
      die.rotation.x += dt * DICE_ROTATION_X * dir;
      die.rotation.y += dt * DICE_ROTATION_Y * -dir;
    }

    this.renderer.render(this.scene, this.camera);
    this.rafId = requestAnimationFrame(this.loop);
  };

  private onPointerMove = (event: MouseEvent | PointerEvent): void => {
    this.pointerTarget.x = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
    this.pointerTarget.y = -((event.clientY / Math.max(1, window.innerHeight)) * 2 - 1);
  };

  private setBackgroundParallax(x: number, y: number): void {
    document.documentElement.style.setProperty('--menu-bg-x', `${x.toFixed(2)}px`);
    document.documentElement.style.setProperty('--menu-bg-y', `${y.toFixed(2)}px`);
  }

  private onResize = (): void => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(
      Math.max(320, window.innerWidth),
      Math.max(180, window.innerHeight),
      false,
    );
  };
}
