import * as THREE from 'three';

import { createDiceMesh } from '../../../assets/dice-visual.factory';
import { DICE_HALF_SIZE, TABLE_WIDTH } from '../../../config';

const FACE_AXES: Record<number, THREE.Vector3> = {
  1: new THREE.Vector3(1, 0, 0),
  6: new THREE.Vector3(-1, 0, 0),
  2: new THREE.Vector3(0, 1, 0),
  5: new THREE.Vector3(0, -1, 0),
  3: new THREE.Vector3(0, 0, 1),
  4: new THREE.Vector3(0, 0, -1),
};

const WORLD_UP = new THREE.Vector3(0, 1, 0);
const DICE_SIZE = DICE_HALF_SIZE * 2;
const SLOT_SPACING = 0.62;
const COLUMN_SPACING = 0.54;
const DICE_PER_COLUMN = 6;
const BENCH_X = -TABLE_WIDTH / 2 - 0.82;
const BENCH_Y = DICE_HALF_SIZE + 0.04;
const BENCH_STAGGER_DELAY_MS = 90;

interface SetFacesOptions {
  staggerAdded?: boolean;
  onFaceAdded?: (face: number) => void;
}

export class BenchDiceService {
  private readonly dice: THREE.Mesh[] = [];
  private readonly currentFaces: number[] = [];
  private readonly animationTimers: number[] = [];
  private readonly scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.ensureDiceCount(DICE_PER_COLUMN);
  }

  setFaces(faces: number[], options: SetFacesOptions = {}): void {
    const normalized = faces.filter((face) => face >= 1 && face <= 6);
    if (
      normalized.length === this.currentFaces.length &&
      normalized.every((face, index) => face === this.currentFaces[index])
    ) {
      return;
    }

    const previousFaces = [...this.currentFaces];
    this.clearAnimationTimers();
    this.currentFaces.length = 0;
    this.currentFaces.push(...normalized);
    this.ensureDiceCount(normalized.length);

    const canStaggerAdded =
      options.staggerAdded === true &&
      normalized.length > previousFaces.length &&
      previousFaces.every((face, index) => normalized[index] === face);

    if (canStaggerAdded) {
      this.renderFaces(previousFaces, normalized.length);
      for (let i = previousFaces.length; i < normalized.length; i += 1) {
        const timer = window.setTimeout(() => {
          this.renderFaces(normalized.slice(0, i + 1), normalized.length);
          options.onFaceAdded?.(normalized[i]!);
        }, (i - previousFaces.length) * BENCH_STAGGER_DELAY_MS);
        this.animationTimers.push(timer);
      }
      return;
    }

    this.renderFaces(normalized);
  }

  private renderFaces(faces: number[], layoutCount = faces.length): void {
    this.ensureDiceCount(layoutCount);
    for (let i = 0; i < this.dice.length; i++) {
      const mesh = this.dice[i]!;
      if (i >= faces.length) {
        mesh.visible = false;
        continue;
      }

      const column = Math.floor(i / DICE_PER_COLUMN);
      const row = i % DICE_PER_COLUMN;
      const rowsInColumn = Math.min(
        DICE_PER_COLUMN,
        layoutCount - column * DICE_PER_COLUMN,
      );
      const startZ = -((rowsInColumn - 1) * SLOT_SPACING) / 2;
      mesh.visible = true;
      mesh.position.set(
        BENCH_X - column * COLUMN_SPACING,
        BENCH_Y,
        startZ + row * SLOT_SPACING,
      );
      this.orientFaceUp(mesh, faces[i]!);
    }
  }

  clear(): void {
    this.setFaces([]);
  }

  destroy(): void {
    this.clearAnimationTimers();
    for (const mesh of this.dice) {
      mesh.removeFromParent();
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      for (const material of materials) material.dispose();
    }
    this.dice.length = 0;
    this.currentFaces.length = 0;
  }

  private orientFaceUp(mesh: THREE.Mesh, face: number): void {
    const axis = FACE_AXES[face] ?? FACE_AXES[1]!;
    mesh.quaternion.setFromUnitVectors(axis, WORLD_UP);
  }

  private ensureDiceCount(count: number): void {
    while (this.dice.length < count) {
      const mesh = createDiceMesh(DICE_SIZE, { shadowsEnabled: false });
      mesh.visible = false;
      mesh.renderOrder = 1;
      this.scene.add(mesh);
      this.dice.push(mesh);
    }
  }

  private clearAnimationTimers(): void {
    for (const timer of this.animationTimers) clearTimeout(timer);
    this.animationTimers.length = 0;
  }
}
