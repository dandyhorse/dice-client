export interface RulesBoardDesktopDragCallbacks {
  begin(): void;
  move(distanceX: number): void;
  commit(distanceX: number): void;
  cancel(): void;
}

/** Desktop-only close drag for the open rules board. */
export class RulesBoardDesktopDragService {
  private pointerId: number | null = null;
  private startX = 0;
  private readonly panel: HTMLElement;
  private readonly callbacks: RulesBoardDesktopDragCallbacks;

  constructor(
    panel: HTMLElement,
    callbacks: RulesBoardDesktopDragCallbacks,
  ) {
    this.panel = panel;
    this.callbacks = callbacks;
    panel.addEventListener('pointerdown', this.onPointerDown);
  }

  destroy(): void {
    this.panel.removeEventListener('pointerdown', this.onPointerDown);
    this.end();
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (!event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    this.pointerId = event.pointerId;
    this.startX = event.clientX;
    this.callbacks.begin();
    window.addEventListener('pointermove', this.onPointerMove, true);
    window.addEventListener('pointerup', this.onPointerUp, true);
    window.addEventListener('pointercancel', this.onPointerCancel, true);
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return;
    event.preventDefault();
    this.callbacks.move(Math.max(0, event.clientX - this.startX));
  };

  private onPointerUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return;
    const distance = event.clientX - this.startX;
    this.end();
    this.callbacks.commit(distance);
  };

  private onPointerCancel = (): void => {
    if (this.pointerId === null) return;
    this.end();
    this.callbacks.cancel();
  };

  private end(): void {
    this.pointerId = null;
    window.removeEventListener('pointermove', this.onPointerMove, true);
    window.removeEventListener('pointerup', this.onPointerUp, true);
    window.removeEventListener('pointercancel', this.onPointerCancel, true);
  }
}
