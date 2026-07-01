import * as THREE from 'three';

import { DICE_RULE_ICON_URLS } from '../../../assets/asset-manifest';
import { assetPreloader } from '../../../assets/asset-preloader';
import { TABLE_WIDTH } from '../../../config';

const BOARD_WIDTH = 2.85;
const BOARD_DEPTH = 0.86;
const BOARD_THICKNESS = 0.08;
const BOARD_Y = 0.13;
const BOARD_Z = 0.18;
const BOARD_MARGIN = 0.34;
const BOARD_SLIDE_SPEED = 9;
const BOARD_ROTATION_SPEED = 12;
const BOARD_TEXTURE_WIDTH = 1024;
const BOARD_TEXTURE_HEIGHT = 256;
const BOARD_ICON_SIZE = 104;
const BOARD_BASE_ROT_X = THREE.MathUtils.degToRad(3.5);
const BOARD_BASE_ROT_Z = THREE.MathUtils.degToRad(-5);
const BOARD_MOUSE_ROT_MAX = THREE.MathUtils.degToRad(2.5);
const BOARD_HOVER_SCALE = 1.025;

const isInteractiveKeyboardTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) return false;
  if (target.closest('input, textarea, select, button')) return true;
  const editable = target.closest('[contenteditable]');
  return editable instanceof HTMLElement && editable.isContentEditable;
};

const damp = (current: number, target: number, speed: number, dt: number): number => {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-speed * dt));
};

export class RulesBoardService {
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly canvas: HTMLCanvasElement;
  private readonly group = new THREE.Group();
  private readonly bodyMesh: THREE.Mesh;
  private readonly faceMesh: THREE.Mesh;
  private readonly texture: THREE.CanvasTexture;
  private readonly materials: THREE.Material[];
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointerNdc = new THREE.Vector2(2, 2);
  private readonly hoverTargets: THREE.Object3D[];

  private shown = false;
  private hovered = false;
  private shownX = 0;
  private hiddenX = 0;

  constructor(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    canvas: HTMLCanvasElement,
  ) {
    this.scene = scene;
    this.camera = camera;
    this.canvas = canvas;
    this.texture = this.createRulesTexture();
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.minFilter = THREE.LinearFilter;

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a1b12,
      roughness: 0.88,
      metalness: 0,
      flatShading: true,
    });
    const faceMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: this.texture,
      roughness: 0.72,
      metalness: 0,
      flatShading: true,
    });
    this.materials = [bodyMaterial, faceMaterial];

    this.bodyMesh = new THREE.Mesh(
      new THREE.BoxGeometry(BOARD_WIDTH, BOARD_THICKNESS, BOARD_DEPTH),
      bodyMaterial,
    );
    this.bodyMesh.castShadow = false;
    this.bodyMesh.receiveShadow = false;

    this.faceMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(BOARD_WIDTH * 0.92, BOARD_DEPTH * 0.72),
      faceMaterial,
    );
    this.faceMesh.rotation.x = -Math.PI / 2;
    this.faceMesh.position.y = BOARD_THICKNESS / 2 + 0.004;

    this.group.add(this.bodyMesh, this.faceMesh);
    this.group.position.set(0, BOARD_Y, BOARD_Z);
    this.group.rotation.set(BOARD_BASE_ROT_X, 0, BOARD_BASE_ROT_Z);
    this.group.scale.setScalar(1);
    this.hoverTargets = [this.faceMesh, this.bodyMesh];
    this.updateLayout();
    this.group.position.x = this.hiddenX;
    this.scene.add(this.group);

    window.addEventListener('keydown', this.onKeyDown);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerleave', this.onPointerLeave);
  }

  update(dt: number): void {
    const targetX = this.shown ? this.shownX : this.hiddenX;
    this.group.position.x = damp(this.group.position.x, targetX, BOARD_SLIDE_SPEED, dt);

    this.hovered = this.shown && this.isPointerOverBoard();
    const pointerTiltX = THREE.MathUtils.clamp(
      this.pointerNdc.y * BOARD_MOUSE_ROT_MAX,
      -BOARD_MOUSE_ROT_MAX,
      BOARD_MOUSE_ROT_MAX,
    );
    const pointerTiltZ = THREE.MathUtils.clamp(
      -this.pointerNdc.x * BOARD_MOUSE_ROT_MAX,
      -BOARD_MOUSE_ROT_MAX,
      BOARD_MOUSE_ROT_MAX,
    );
    const targetRotX = this.hovered ? 0 : BOARD_BASE_ROT_X + pointerTiltX;
    const targetRotZ = this.hovered ? 0 : BOARD_BASE_ROT_Z + pointerTiltZ;
    this.group.rotation.x = damp(this.group.rotation.x, targetRotX, BOARD_ROTATION_SPEED, dt);
    this.group.rotation.z = damp(this.group.rotation.z, targetRotZ, BOARD_ROTATION_SPEED, dt);

    const targetScale = this.hovered ? BOARD_HOVER_SCALE : 1;
    const nextScale = damp(this.group.scale.x, targetScale, BOARD_ROTATION_SPEED, dt);
    this.group.scale.setScalar(nextScale);
  }

  updateLayout(): void {
    const visibleHalfW = this.visibleHalfWidthAtBoard();
    const preferredShownX = TABLE_WIDTH / 2 + BOARD_WIDTH / 2 + BOARD_MARGIN;
    const maxVisibleX = visibleHalfW - BOARD_WIDTH / 2 - BOARD_MARGIN;
    this.shownX = Math.min(preferredShownX, maxVisibleX);
    this.hiddenX = visibleHalfW + BOARD_WIDTH / 2 + BOARD_MARGIN;
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerleave', this.onPointerLeave);
    this.scene.remove(this.group);
    this.bodyMesh.geometry.dispose();
    this.faceMesh.geometry.dispose();
    this.texture.dispose();
    for (const material of this.materials) material.dispose();
  }

  private createRulesTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = BOARD_TEXTURE_WIDTH;
    canvas.height = BOARD_TEXTURE_HEIGHT;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;

    const gradient = ctx.createLinearGradient(0, 0, BOARD_TEXTURE_WIDTH, BOARD_TEXTURE_HEIGHT);
    gradient.addColorStop(0, '#25150f');
    gradient.addColorStop(0.55, '#120d0b');
    gradient.addColorStop(1, '#2d1b12');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    const gap = 26;
    const totalWidth = DICE_RULE_ICON_URLS.length * BOARD_ICON_SIZE + (DICE_RULE_ICON_URLS.length - 1) * gap;
    let x = (canvas.width - totalWidth) / 2;
    const y = (canvas.height - BOARD_ICON_SIZE) / 2;
    for (const url of DICE_RULE_ICON_URLS) {
      const image = assetPreloader.getImage(url);
      ctx.drawImage(image, x, y, BOARD_ICON_SIZE, BOARD_ICON_SIZE);
      x += BOARD_ICON_SIZE + gap;
    }

    return new THREE.CanvasTexture(canvas);
  }

  private visibleHalfWidthAtBoard(): number {
    const distance = Math.max(0.001, this.camera.position.y - BOARD_Y);
    const visibleDepth =
      2 * distance * Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2);
    return (visibleDepth * this.camera.aspect) / 2;
  }

  private isPointerOverBoard(): boolean {
    if (this.pointerNdc.x < -1 || this.pointerNdc.x > 1 || this.pointerNdc.y < -1 || this.pointerNdc.y > 1) {
      return false;
    }
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    return this.raycaster.intersectObjects(this.hoverTargets, false).length > 0;
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat || event.defaultPrevented || event.code !== 'KeyH') return;
    if (isInteractiveKeyboardTarget(event.target)) return;
    event.preventDefault();
    this.shown = !this.shown;
  };

  private onPointerMove = (event: PointerEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };

  private onPointerLeave = (): void => {
    this.pointerNdc.set(2, 2);
  };
}
