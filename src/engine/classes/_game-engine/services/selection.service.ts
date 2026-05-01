import * as THREE from 'three';

import { EventEmitter } from '../../event-emitter.class';
import { DiceService } from './dice.service';
import { validateSelection, type ScoringOption } from '../../../../domain/scorer';

const NO_HIGHLIGHT = { color: 0x000000, intensity: 0 };

const HIGHLIGHTS = {
  straight: { color: 0x38c172, intensity: 0.18, selectedColor: 0x76f0a0, selectedIntensity: 0.55 },
  kind: { color: 0x4488ff, intensity: 0.2, selectedColor: 0x6aa6ff, selectedIntensity: 0.58 },
  single: { color: 0xf2b84b, intensity: 0.18, selectedColor: 0xffd166, selectedIntensity: 0.52 },
} as const;

type HighlightKind = keyof typeof HIGHLIGHTS;

interface DieHighlight {
  kind: HighlightKind;
  priority: number;
}

/**
 * Click-to-select для костей. Включается только в фазе SELECTING своего хода.
 *
 * Слушает `mouseup` (а не `mousedown`) на canvas — чтобы не конфликтовать
 * с hold/release ShakeInputService (который сам выключен в SELECTING, но
 * слушать одно и то же событие — лишний риск). Левая кнопка только.
 *
 * Индексы выбора — snapshot-id кости (`remoteDice[]` index). `rolledFaces`
 * приходит в порядке активных видимых костей, поэтому scoring-позиции
 * переводятся в snapshot-id перед подсветкой, а выбранные snapshot-id — обратно
 * в позиции `rolledFaces` для локальной проверки.
 *
 * Подсветка — emissive на материалах граней. Каждая кость имеет 6
 * MeshStandardMaterial (по числу faces); меняем emissive на всех 6.
 */
export class SelectionService {
  readonly events = new EventEmitter();

  private readonly raycaster = new THREE.Raycaster();
  private readonly ndc = new THREE.Vector2();
  private readonly selected = new Set<number>();
  /** Порядок выбора (для UX-стабильности возвращаем индексы в порядке кликов). */
  private readonly orderedSelection: number[] = [];
  private readonly selectable = new Set<number>();
  private readonly highlights = new Map<number, DieHighlight>();
  private readonly rollIndexBySnapshotIndex = new Map<number, number>();
  private rolledFaces: number[] = [];
  private enabled = false;

  private readonly canvas: HTMLCanvasElement;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly dice: DiceService;

  constructor(canvas: HTMLCanvasElement, camera: THREE.PerspectiveCamera, dice: DiceService) {
    this.canvas = canvas;
    this.camera = camera;
    this.dice = dice;
    canvas.addEventListener('mouseup', this.onMouseUp);
  }

  enable(): void {
    this.enabled = true;
    this.applyAllHighlights();
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
    this.applyAllHighlights();
    this.emitSelectionChanged();
  }

  setScoringOptions(rolledFaces: number[], options: ScoringOption[]): void {
    this.clearScoringOptions(false);
    this.rolledFaces = [...rolledFaces];
    const active = this.dice.getActiveDiceMeshes();
    for (let rollIndex = 0; rollIndex < this.rolledFaces.length; rollIndex++) {
      const snapshotIndex = active[rollIndex]?.index ?? rollIndex;
      this.rollIndexBySnapshotIndex.set(snapshotIndex, rollIndex);
    }

    for (const option of options) {
      const kind = this.kindForOption(option);
      const priority = this.priorityForKind(kind);
      for (const rollIndex of option.dieIndices) {
        const snapshotIndex = active[rollIndex]?.index ?? rollIndex;
        this.selectable.add(snapshotIndex);
        const current = this.highlights.get(snapshotIndex);
        if (!current || priority > current.priority) {
          this.highlights.set(snapshotIndex, { kind, priority });
        }
      }
    }

    this.applyAllHighlights();
    this.emitSelectionChanged();
  }

  clearScoringOptions(emit = true): void {
    this.selected.clear();
    this.orderedSelection.length = 0;
    this.selectable.clear();
    this.highlights.clear();
    this.rollIndexBySnapshotIndex.clear();
    this.rolledFaces = [];
    this.clearAllHighlights();
    if (emit) this.emitSelectionChanged();
  }

  destroy(): void {
    this.enabled = false;
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
    this.clearScoringOptions(false);
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

    this.toggle(entry.index, hitMesh);
  };

  private toggle(index: number, mesh: THREE.Mesh): void {
    if (this.selected.has(index)) {
      this.selected.delete(index);
      const pos = this.orderedSelection.indexOf(index);
      if (pos >= 0) this.orderedSelection.splice(pos, 1);
    } else {
      this.selected.add(index);
      this.orderedSelection.push(index);
    }
    this.applyHighlight(index, mesh);
    this.emitSelectionChanged();
  }

  private applyAllHighlights(): void {
    for (const entry of this.dice.getDiceMeshes()) {
      this.applyHighlight(entry.index, entry.mesh);
    }
  }

  private clearAllHighlights(): void {
    for (const entry of this.dice.getDiceMeshes()) {
      this.applyMaterialHighlight(entry.mesh, NO_HIGHLIGHT.color, NO_HIGHLIGHT.intensity);
    }
  }

  private applyHighlight(index: number, mesh: THREE.Mesh): void {
    const info = this.highlights.get(index);
    if (!info) {
      this.applyMaterialHighlight(mesh, NO_HIGHLIGHT.color, NO_HIGHLIGHT.intensity);
      return;
    }

    const palette = HIGHLIGHTS[info.kind];
    const selected = this.selected.has(index);
    this.applyMaterialHighlight(
      mesh,
      selected ? palette.selectedColor : palette.color,
      selected ? palette.selectedIntensity : palette.intensity,
    );
  }

  private applyMaterialHighlight(mesh: THREE.Mesh, color: number, intensity: number): void {
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of materials) {
      const std = m as THREE.MeshStandardMaterial;
      if (!std.emissive) continue;
      std.emissive.setHex(color);
      std.emissiveIntensity = intensity;
      std.needsUpdate = true;
    }
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

  private priorityForKind(kind: HighlightKind): number {
    switch (kind) {
      case 'straight':
        return 3;
      case 'kind':
        return 2;
      case 'single':
        return 1;
      default:
        return 0;
    }
  }

}
