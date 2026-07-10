import * as THREE from 'three';

import type { DicePresetTrail } from '../../../../dice-presets';

interface TrailSegment {
  start: THREE.Vector3;
  end: THREE.Vector3;
  y: number;
  width: number;
  color: number;
  createdAtMs: number;
  lifetimeMs: number;
  opacity: number;
}

const MAX_SEGMENTS = 128;
const MAX_SEGMENTS_PER_FRAME = 16;

export class DiceTrailRenderer {
  private readonly segments: TrailSegment[] = [];
  private readonly anchors = new Map<THREE.Mesh, THREE.Vector3>();
  private readonly start = new THREE.Vector3();
  private readonly end = new THREE.Vector3();
  private readonly position = new THREE.Vector3();
  private readonly scale = new THREE.Vector3();
  private readonly quaternion = new THREE.Quaternion();
  private readonly matrix = new THREE.Matrix4();
  private readonly color = new THREE.Color();
  private readonly up = new THREE.Vector3(0, 1, 0);
  private readonly scene: THREE.Scene;
  private mesh: THREE.InstancedMesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  updateMesh(mesh: THREE.Mesh, now: number, trail: DicePresetTrail): void {
    if (!mesh.visible || mesh.position.y < -100 || !trail.enabled) {
      this.clearAnchor(mesh);
      return;
    }

    const anchor = this.anchors.get(mesh);
    if (!anchor) {
      this.setAnchor(mesh);
      return;
    }

    this.start.copy(anchor);
    this.end.copy(mesh.position);
    this.start.y = trail.y;
    this.end.y = trail.y;
    const dx = this.end.x - this.start.x;
    const dz = this.end.z - this.start.z;
    const distanceSq = dx * dx + dz * dz;
    if (distanceSq < trail.minDistanceSq) return;

    const distance = Math.sqrt(distanceSq);
    const segmentCount = Math.min(
      MAX_SEGMENTS_PER_FRAME,
      Math.max(1, Math.ceil(distance / trail.maxSegment)),
    );
    const coveredDistance = Math.min(distance, segmentCount * trail.maxSegment);
    const startRatio = 1 - coveredDistance / distance;
    for (let i = 0; i < segmentCount; i++) {
      const fromRatio = startRatio + ((1 - startRatio) * i) / segmentCount;
      const toRatio = startRatio + ((1 - startRatio) * (i + 1)) / segmentCount;
      const segmentStart = new THREE.Vector3(
        anchor.x + dx * fromRatio,
        trail.y,
        anchor.z + dz * fromRatio,
      );
      const segmentEnd = new THREE.Vector3(
        anchor.x + dx * toRatio,
        trail.y,
        anchor.z + dz * toRatio,
      );
      this.addSegment(segmentStart, segmentEnd, now, trail);
    }
    anchor.copy(mesh.position);
  }

  tick(now: number): void {
    for (let i = this.segments.length - 1; i >= 0; i--) {
      const segment = this.segments[i]!;
      if (now - segment.createdAtMs >= segment.lifetimeMs) this.segments.splice(i, 1);
    }
    this.sync(now);
  }

  setAnchor(mesh: THREE.Mesh): void {
    const anchor = this.anchors.get(mesh);
    if (anchor) anchor.copy(mesh.position);
    else this.anchors.set(mesh, mesh.position.clone());
  }

  clearAnchor(mesh: THREE.Mesh): void {
    this.anchors.delete(mesh);
  }

  clear(): void {
    this.segments.length = 0;
    this.anchors.clear();
    if (this.mesh) this.mesh.count = 0;
  }

  destroy(): void {
    this.clear();
    if (!this.mesh) return;
    this.mesh.removeFromParent();
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.mesh = null;
  }

  private addSegment(
    start: THREE.Vector3,
    end: THREE.Vector3,
    now: number,
    trail: DicePresetTrail,
  ): void {
    if (start.distanceToSquared(end) <= 1e-12) return;
    this.segments.push({
      start,
      end,
      y: trail.y,
      width: trail.width,
      color: trail.color,
      createdAtMs: now,
      lifetimeMs: trail.lifetimeMs,
      opacity: trail.opacity,
    });
    if (this.segments.length > MAX_SEGMENTS) this.segments.shift();
    this.ensureMesh();
  }

  private ensureMesh(): void {
    if (this.mesh) return;
    const geometry = new THREE.PlaneGeometry(1, 1);
    geometry.rotateX(-Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.InstancedMesh(geometry, material, MAX_SEGMENTS);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.count = 0;
    mesh.frustumCulled = false;
    mesh.renderOrder = 3;
    this.scene.add(mesh);
    this.mesh = mesh;
  }

  private sync(now: number): void {
    const mesh = this.mesh;
    if (!mesh) return;
    mesh.count = this.segments.length;
    for (let i = 0; i < this.segments.length; i++) {
      const segment = this.segments[i]!;
      const dx = segment.end.x - segment.start.x;
      const dz = segment.end.z - segment.start.z;
      this.position.set(
        (segment.start.x + segment.end.x) / 2,
        segment.y,
        (segment.start.z + segment.end.z) / 2,
      );
      this.quaternion.setFromAxisAngle(this.up, -Math.atan2(dz, dx));
      this.scale.set(Math.hypot(dx, dz), 1, segment.width);
      this.matrix.compose(this.position, this.quaternion, this.scale);
      mesh.setMatrixAt(i, this.matrix);
      const fade = Math.max(0, 1 - (now - segment.createdAtMs) / segment.lifetimeMs);
      this.color.set(segment.color).multiplyScalar(segment.opacity * fade);
      mesh.setColorAt(i, this.color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }
}
