import * as THREE from 'three';

import { DICE_RULE_ICON_URLS } from '../../../assets/asset-manifest';
import { assetPreloader } from '../../../assets/asset-preloader';
import { TABLE_WIDTH } from '../../../config';

const BOARD_WIDTH = 4.8;
const BOARD_DEPTH = 5.2;
const BOARD_THICKNESS = 0.08;
const BOARD_Y = 0.13;
const BOARD_Z = 0.18;
const BOARD_MARGIN = 0.34;
const BOARD_SLIDE_SPEED = 9;
const BOARD_ROTATION_SPEED = 12;
const BOARD_TILT_FULL_DISTANCE_PX = 600;
const BOARD_BASE_ROT_Z = THREE.MathUtils.degToRad(30);
const BOARD_MAX_TILT = THREE.MathUtils.degToRad(18);
const BOARD_LEFT_MAX_TILT = THREE.MathUtils.degToRad(10);
const BOARD_TEXTURE_WIDTH = 4096;
const BOARD_TEXTURE_HEIGHT = 4096;
const BOARD_ICON_SIZE = 128;

const KIND_SCORE_ROWS = [
  { face: 1, scores: [1000, 2000, 4000, 8000] },
  { face: 2, scores: [200, 400, 800, 1600] },
  { face: 3, scores: [300, 600, 1200, 2400] },
  { face: 4, scores: [400, 800, 1600, 3200] },
  { face: 5, scores: [500, 1000, 2000, 4000] },
  { face: 6, scores: [600, 1200, 2400, 4800] },
] as const;

const STRAIGHT_ROWS = [
  { faces: [1, 2, 3, 4, 5], points: 500 },
  { faces: [2, 3, 4, 5, 6], points: 750 },
  { faces: [1, 2, 3, 4, 5, 6], points: 1500 },
] as const;

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
  private readonly yawGroup = new THREE.Group();
  private readonly pitchGroup = new THREE.Group();
  private readonly bodyMesh: THREE.Mesh;
  private readonly faceMesh: THREE.Mesh;
  private readonly texture: THREE.CanvasTexture;
  private readonly materials: THREE.Material[];
  private readonly panelWorldPosition = new THREE.Vector3();
  private readonly panelScreenPosition = new THREE.Vector2();
  private readonly pointerCanvasPosition = new THREE.Vector2();

  private shown = false;
  private shownX = 0;
  private hiddenX = 0;
  private hasPointer = false;

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
    this.texture.anisotropy = 8;

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a1b12,
      roughness: 0.88,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    const faceMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: this.texture,
      roughness: 0.72,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    this.materials = [bodyMaterial, faceMaterial];

    this.bodyMesh = new THREE.Mesh(
      new THREE.BoxGeometry(BOARD_WIDTH, BOARD_THICKNESS, BOARD_DEPTH),
      bodyMaterial,
    );
    this.bodyMesh.castShadow = false;
    this.bodyMesh.receiveShadow = false;

    this.faceMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(BOARD_WIDTH * 0.94, BOARD_DEPTH * 0.9),
      faceMaterial,
    );
    this.faceMesh.rotation.x = -Math.PI / 2;
    this.faceMesh.position.y = BOARD_THICKNESS / 2 + 0.004;

    this.pitchGroup.add(this.bodyMesh, this.faceMesh);
    this.yawGroup.add(this.pitchGroup);
    this.yawGroup.rotation.z = BOARD_BASE_ROT_Z;
    this.group.add(this.yawGroup);
    this.group.position.set(0, BOARD_Y, BOARD_Z);
    this.group.rotation.set(0, 0, 0);
    this.group.scale.setScalar(1);
    this.updateLayout();
    this.group.position.x = this.hiddenX;
    this.scene.add(this.group);

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('pointermove', this.onPointerMove, true);
  }

  update(dt: number): void {
    const targetX = this.shown ? this.shownX : this.hiddenX;
    this.group.position.x = damp(this.group.position.x, targetX, BOARD_SLIDE_SPEED, dt);

    const targetTilt = this.targetTilt();
    this.group.rotation.set(0, 0, 0);
    this.pitchGroup.rotation.x = damp(this.pitchGroup.rotation.x, targetTilt.x, BOARD_ROTATION_SPEED, dt);
    this.yawGroup.rotation.z = damp(this.yawGroup.rotation.z, targetTilt.z, BOARD_ROTATION_SPEED, dt);
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
    window.removeEventListener('pointermove', this.onPointerMove, true);
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
    ctx.imageSmoothingQuality = 'high';

    ctx.fillStyle = '#17110e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 18;
    ctx.strokeRect(72, 72, canvas.width - 144, canvas.height - 144);

    ctx.fillStyle = '#f7ead7';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = '700 164px Georgia, serif';
    ctx.fillText('ПРАВИЛА FARKLE', canvas.width / 2, 300);

    ctx.font = '400 68px Georgia, serif';
    ctx.fillStyle = 'rgba(247,234,215,0.74)';
    ctx.fillText('Комбинации и очки за выбор костей', canvas.width / 2, 410);

    let y = 610;
    y = this.drawSectionTitle(ctx, 'ОДИНОЧНЫЕ', y);
    y = this.drawRuleRow(ctx, y, [1], 'Одна единица', '100');
    y = this.drawRuleRow(ctx, y, [5], 'Одна пятёрка', '50');
    y = this.drawPlainRow(ctx, y, 'Одиночные 2 / 3 / 4 / 6', '0');

    y += 90;
    y = this.drawSectionTitle(ctx, 'ОДИНАКОВЫЕ', y);
    y = this.drawKindHeader(ctx, y);
    for (const row of KIND_SCORE_ROWS) {
      y = this.drawKindRow(ctx, y, row.face, row.scores);
    }

    y += 90;
    y = this.drawSectionTitle(ctx, 'СТРИТЫ', y);
    for (const row of STRAIGHT_ROWS) {
      y = this.drawRuleRow(ctx, y, row.faces, row.faces.join('-'), String(row.points));
    }

    y += 90;
    y = this.drawSectionTitle(ctx, 'НЕ СЧИТАЕТСЯ В V1', y);
    this.drawPlainRow(ctx, y, 'Три пары / full house / два трипла', '0');

    return new THREE.CanvasTexture(canvas);
  }

  private drawSectionTitle(ctx: CanvasRenderingContext2D, text: string, y: number): number {
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(160, y - 88, BOARD_TEXTURE_WIDTH - 320, 118);
    ctx.fillStyle = '#f3d08a';
    ctx.font = '700 76px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 210, y - 30);
    return y + 110;
  }

  private drawRuleRow(
    ctx: CanvasRenderingContext2D,
    y: number,
    faces: readonly number[],
    label: string,
    points: string,
  ): number {
    this.drawDiceSequence(ctx, faces, 220, y - BOARD_ICON_SIZE / 2, BOARD_ICON_SIZE);
    ctx.fillStyle = '#f7ead7';
    ctx.font = '500 76px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 1120, y);
    ctx.fillStyle = '#ffd88a';
    ctx.font = '700 86px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.fillText(points, BOARD_TEXTURE_WIDTH - 220, y);
    this.drawRowDivider(ctx, y + 92);
    return y + 184;
  }

  private drawPlainRow(ctx: CanvasRenderingContext2D, y: number, label: string, points: string): number {
    ctx.fillStyle = '#f7ead7';
    ctx.font = '500 76px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 220, y);
    ctx.fillStyle = '#ffd88a';
    ctx.font = '700 86px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.fillText(points, BOARD_TEXTURE_WIDTH - 220, y);
    this.drawRowDivider(ctx, y + 92);
    return y + 184;
  }

  private drawKindHeader(ctx: CanvasRenderingContext2D, y: number): number {
    const columns = [1700, 2220, 2740, 3260];
    ctx.fillStyle = 'rgba(247,234,215,0.72)';
    ctx.font = '700 68px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('3x', columns[0], y);
    ctx.fillText('4x', columns[1], y);
    ctx.fillText('5x', columns[2], y);
    ctx.fillText('6x', columns[3], y);
    this.drawRowDivider(ctx, y + 76);
    return y + 142;
  }

  private drawKindRow(
    ctx: CanvasRenderingContext2D,
    y: number,
    face: number,
    scores: readonly number[],
  ): number {
    const columns = [1700, 2220, 2740, 3260];
    this.drawDiceSequence(ctx, [face, face, face], 220, y - BOARD_ICON_SIZE / 2, BOARD_ICON_SIZE);
    ctx.fillStyle = '#f7ead7';
    ctx.font = '500 76px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Грань ${face}`, 760, y);

    ctx.fillStyle = '#ffd88a';
    ctx.font = '700 72px Georgia, serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < scores.length; i++) {
      ctx.fillText(String(scores[i]), columns[i], y);
    }
    this.drawRowDivider(ctx, y + 84);
    return y + 168;
  }

  private drawDiceSequence(
    ctx: CanvasRenderingContext2D,
    faces: readonly number[],
    x: number,
    y: number,
    size: number,
  ): void {
    let nextX = x;
    for (const face of faces) {
      const url = DICE_RULE_ICON_URLS[face - 1];
      if (!url) continue;
      const image = assetPreloader.getImage(url);
      ctx.drawImage(image, nextX, y, size, size);
      nextX += size + 20;
    }
  }

  private drawRowDivider(ctx: CanvasRenderingContext2D, y: number): void {
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(160, y);
    ctx.lineTo(BOARD_TEXTURE_WIDTH - 160, y);
    ctx.stroke();
  }

  private visibleHalfWidthAtBoard(): number {
    const distance = Math.max(0.001, this.camera.position.y - BOARD_Y);
    const visibleDepth =
      2 * distance * Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2);
    return (visibleDepth * this.camera.aspect) / 2;
  }

  private panelScreenCenter(): THREE.Vector2 {
    this.group.updateWorldMatrix(true, false);
    this.panelWorldPosition.setFromMatrixPosition(this.group.matrixWorld);
    this.panelWorldPosition.project(this.camera);
    this.panelScreenPosition.set(
      ((this.panelWorldPosition.x + 1) / 2) * this.canvas.clientWidth,
      ((-this.panelWorldPosition.y + 1) / 2) * this.canvas.clientHeight,
    );
    return this.panelScreenPosition;
  }

  private targetTilt(): { x: number; z: number } {
    if (!this.hasPointer) return { x: 0, z: BOARD_BASE_ROT_Z };

    const panelCenter = this.panelScreenCenter();
    const dx = this.pointerCanvasPosition.x - panelCenter.x;
    const dy = this.pointerCanvasPosition.y - panelCenter.y;

    return {
      x: THREE.MathUtils.clamp(
        (dy / BOARD_TILT_FULL_DISTANCE_PX) * BOARD_MAX_TILT,
        -BOARD_MAX_TILT,
        BOARD_MAX_TILT,
      ),
      z: THREE.MathUtils.clamp(
        (-dx / BOARD_TILT_FULL_DISTANCE_PX) * BOARD_MAX_TILT,
        -BOARD_MAX_TILT,
        BOARD_LEFT_MAX_TILT,
      ) + BOARD_BASE_ROT_Z,
    };
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat || event.defaultPrevented || event.code !== 'KeyH') return;
    if (isInteractiveKeyboardTarget(event.target)) return;
    event.preventDefault();
    this.shown = !this.shown;
  };

  private onPointerMove = (event: PointerEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.pointerCanvasPosition.set(event.clientX - rect.left, event.clientY - rect.top);
    this.hasPointer = true;
  };
}
