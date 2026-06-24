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
const BENCH_X = -TABLE_WIDTH / 2 - 0.82;
const BENCH_Y = DICE_HALF_SIZE + 0.04;

export class BenchDiceService {
  private readonly dice: THREE.Mesh[] = [];
  private readonly currentFaces: number[] = [];
  private readonly scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    for (let i = 0; i < 6; i++) {
      const mesh = createDiceMesh(DICE_SIZE, { shadowsEnabled: false });
      mesh.visible = false;
      mesh.renderOrder = 1;
      this.scene.add(mesh);
      this.dice.push(mesh);
    }
  }

  setFaces(faces: number[]): void {
    const normalized = faces.filter((face) => face >= 1 && face <= 6).slice(0, this.dice.length);
    if (
      normalized.length === this.currentFaces.length &&
      normalized.every((face, index) => face === this.currentFaces[index])
    ) {
      return;
    }

    this.currentFaces.length = 0;
    this.currentFaces.push(...normalized);
    const startZ = -((normalized.length - 1) * SLOT_SPACING) / 2;

    for (let i = 0; i < this.dice.length; i++) {
      const mesh = this.dice[i]!;
      if (i >= normalized.length) {
        mesh.visible = false;
        continue;
      }

      mesh.visible = true;
      mesh.position.set(BENCH_X, BENCH_Y, startZ + i * SLOT_SPACING);
      this.orientFaceUp(mesh, normalized[i]!);
    }
  }

  clear(): void {
    this.setFaces([]);
  }

  destroy(): void {
    for (const mesh of this.dice) {
      mesh.removeFromParent();
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const material of materials) material.dispose();
    }
    this.dice.length = 0;
    this.currentFaces.length = 0;
  }

  private orientFaceUp(mesh: THREE.Mesh, face: number): void {
    const axis = FACE_AXES[face] ?? FACE_AXES[1]!;
    mesh.quaternion.setFromUnitVectors(axis, WORLD_UP);
  }
}
