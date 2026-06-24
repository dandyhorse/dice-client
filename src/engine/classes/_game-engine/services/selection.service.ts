import * as THREE from 'three';

import { EventEmitter } from '../../event-emitter.class';
import { DiceService } from './dice.service';
import { validateSelection, type ScoringOption } from '../../../../domain/scorer';

const HIGHLIGHT_PRIORITY = {
  straight: 3,
  kind: 2,
  single: 1,
} as const;

const MARKER_COLOR = 0xffd166;
const MARKER_Y = 0.018;
const MARKER_INNER_RADIUS = 0.31;
const MARKER_OUTER_RADIUS = 0.398;
const MARKER_HINT_OPACITY = 0.18;
const MARKER_SELECTED_OPACITY = 0.78;

type HighlightKind = keyof typeof HIGHLIGHT_PRIORITY;

interface DieHighlight {
  kind: HighlightKind;
  priority: number;
}

/**
 * Click-to-select для костей. Включается только в фазе SELECTING своего хода.
 *
 * Индексы выбора — snapshot-id кости (`remoteDice[]` index). `rolledFaces`
 * приходит в порядке активных видимых костей, поэтому scoring-позиции
 * переводятся в snapshot-id перед подсветкой, а выбранные snapshot-id — обратно
 * в позиции `rolledFaces` для локальной проверки.
 *
 * Подсветка не меняет материалы куба: выбранные/доступные кости отмечаются
 * плоскими кругами на поверхности стола под текущей позицией mesh.
 */
export class SelectionService {
  readonly events = new EventEmitter();

  private readonly raycaster = new THREE.Raycaster();
  private readonly ndc = new THREE.Vector2();
  private readonly selected = new Set<number>();
  private readonly externalSelected = new Set<number>();
  /** Порядок выбора (для UX-стабильности возвращаем индексы в порядке кликов). */
  private readonly orderedSelection: number[] = [];
  private readonly selectable = new Set<number>();
  private readonly highlights = new Map<number, DieHighlight>();
  private readonly rollIndexBySnapshotIndex = new Map<number, number>();
  private readonly markers = new Map<number, THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>>();
  private readonly markerGeometry = new THREE.RingGeometry(
    MARKER_INNER_RADIUS,
    MARKER_OUTER_RADIUS,
    40,
  );
  private rolledFaces: number[] = [];
  private enabled = false;

  private readonly canvas: HTMLCanvasElement;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly dice: DiceService;
  private readonly scene: THREE.Scene;

  constructor(
    canvas: HTMLCanvasElement,
    camera: THREE.PerspectiveCamera,
    dice: DiceService,
    scene: THREE.Scene,
  ) {
    this.canvas = canvas;
    this.camera = camera;
    this.dice = dice;
    this.scene = scene;
    canvas.addEventListener('mouseup', this.onMouseUp);
  }

  enable(): void {
    this.enabled = true;
    this.updateMarkers();
  }

  disable(): void {
    this.enabled = false;
    this.clearScoringOptions();
  }

  getSelectedIndices(): number[] {
    return [...this.orderedSelection];
  }

  getSelectedRollIndices(): number[] {
    return this.orderedSelection.map((index) => this.rollIndexBySnapshotIndex.get(index) ?? -1);
  }

  clear(): void {
    this.selected.clear();
    this.orderedSelection.length = 0;
    this.updateMarkers();
    this.emitSelectionChanged();
  }

  selectAllAvailable(): void {
    if (!this.enabled) return;
    this.selected.clear();
    this.orderedSelection.length = 0;

    for (const entry of this.dice.getActiveDiceMeshes()) {
      if (!this.selectable.has(entry.index)) continue;
      this.selected.add(entry.index);
      this.orderedSelection.push(entry.index);
    }

    this.updateMarkers();
    this.emitSelectionChanged();
  }

  setScoringOptions(rolledFaces: number[], options: ScoringOption[], showHighlights = true): void {
    this.clearScoringOptions(false);
    this.rolledFaces = [...rolledFaces];
    const active = this.dice.getActiveDiceMeshes();
    for (let rollIndex = 0; rollIndex < this.rolledFaces.length; rollIndex++) {
      const snapshotIndex = active[rollIndex]?.index ?? rollIndex;
      this.rollIndexBySnapshotIndex.set(snapshotIndex, rollIndex);
    }

    for (const option of options) {
      const kind = this.kindForOption(option);
      const priority = HIGHLIGHT_PRIORITY[kind];
      for (const rollIndex of option.dieIndices) {
        const snapshotIndex = active[rollIndex]?.index ?? rollIndex;
        this.selectable.add(snapshotIndex);
        const current = this.highlights.get(snapshotIndex);
        if (showHighlights && (!current || priority > current.priority)) {
          this.highlights.set(snapshotIndex, { kind, priority });
        }
      }
    }

    this.updateMarkers();
    this.emitSelectionChanged();
  }

  clearScoringOptions(emit = true): void {
    this.selected.clear();
    this.orderedSelection.length = 0;
    this.selectable.clear();
    this.highlights.clear();
    this.rollIndexBySnapshotIndex.clear();
    this.rolledFaces = [];
    this.updateMarkers();
    if (emit) this.emitSelectionChanged();
  }

  setExternalSelection(indices: number[]): void {
    this.externalSelected.clear();
    for (const index of indices) {
      if (Number.isInteger(index) && index >= 0) this.externalSelected.add(index);
    }
    this.updateMarkers();
  }

  clearExternalSelection(): void {
    if (this.externalSelected.size === 0) return;
    this.externalSelected.clear();
    this.updateMarkers();
  }

  updateMarkers(): void {
    const dice = this.dice.getDiceMeshes();
    const present = new Set<number>();

    for (const entry of dice) {
      present.add(entry.index);
      const marker = this.ensureMarker(entry.index);
      const visible = entry.mesh.visible;
      const isSelected = this.selected.has(entry.index);
      const isExternal = this.externalSelected.has(entry.index);
      const isHint = this.enabled && this.highlights.has(entry.index);
      const shouldShow = visible && (isSelected || isExternal || isHint);

      marker.visible = shouldShow;
      if (!shouldShow) continue;

      marker.position.set(entry.mesh.position.x, MARKER_Y, entry.mesh.position.z);
      marker.material.opacity =
        isSelected || isExternal ? MARKER_SELECTED_OPACITY : MARKER_HINT_OPACITY;
    }

    for (const [index, marker] of this.markers) {
      if (present.has(index)) continue;
      marker.visible = false;
    }
  }

  destroy(): void {
    this.enabled = false;
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
    this.clearScoringOptions(false);
    this.clearExternalSelection();
    for (const marker of this.markers.values()) {
      marker.removeFromParent();
      marker.material.dispose();
    }
    this.markers.clear();
    this.markerGeometry.dispose();
  }

  private onMouseUp = (event: MouseEvent): void => {
    if (!this.enabled) return;
    if (event.button !== 0) return;

    const rect = this.canvas.getBoundingClientRect();
    this.ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.ndc, this.camera);

    const active = this.dice.getActiveDiceMeshes();
    if (active.length === 0) return;

    const meshes = active.map((a) => a.mesh);
    const hits = this.raycaster.intersectObjects(meshes, false);
    if (hits.length === 0) return;

    const hitMesh = hits[0]!.object as THREE.Mesh;
    const entry = active.find((a) => a.mesh === hitMesh);
    if (!entry) return;
    if (!this.selectable.has(entry.index)) return;

    this.toggle(entry.index);
  };

  private toggle(index: number): void {
    if (this.selected.has(index)) {
      this.selected.delete(index);
      const pos = this.orderedSelection.indexOf(index);
      if (pos >= 0) this.orderedSelection.splice(pos, 1);
    } else {
      this.selected.add(index);
      this.orderedSelection.push(index);
    }
    this.updateMarkers();
    this.emitSelectionChanged();
  }

  private ensureMarker(index: number): THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial> {
    const existing = this.markers.get(index);
    if (existing) return existing;

    const material = new THREE.MeshBasicMaterial({
      color: MARKER_COLOR,
      transparent: true,
      opacity: MARKER_HINT_OPACITY,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
    });
    const marker = new THREE.Mesh(this.markerGeometry, material);
    marker.rotation.x = -Math.PI / 2;
    marker.visible = false;
    marker.renderOrder = 2;
    this.scene.add(marker);
    this.markers.set(index, marker);
    return marker;
  }

  private emitSelectionChanged(): void {
    const indices = [...this.orderedSelection];
    const rollIndices = this.getSelectedRollIndices();
    const validation =
      indices.length > 0 ? validateSelection(this.rolledFaces, rollIndices) : null;
    const valid = validation?.valid === true;
    const points = validation?.valid === true ? validation.points : 0;
    this.events.emit('selection-changed', indices, valid, points);
  }

  private kindForOption(option: ScoringOption): HighlightKind {
    if (option.label.startsWith('straight')) return 'straight';
    if (option.label.includes('of-a-kind')) return 'kind';
    return 'single';
  }
}
