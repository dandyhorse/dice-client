import { EventEmitter } from '../../event-emitter.class';
import { DEFAULT_PLAYER_SETTINGS, type ControlBindings } from '../../../../player-settings';

const isInteractiveKeyboardTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) return false;
  if (target.closest('input, textarea, select, button')) return true;
  const editable = target.closest('[contenteditable]');
  return editable instanceof HTMLElement && editable.isContentEditable;
};

export class TurnHotkeysService {
  readonly events = new EventEmitter();

  private enabled = false;
  private bindings: ControlBindings;

  constructor(bindings: ControlBindings = DEFAULT_PLAYER_SETTINGS.controls) {
    this.bindings = { ...bindings };
    window.addEventListener('keydown', this.onKeyDown);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setBindings(bindings: ControlBindings): void {
    this.bindings = { ...bindings };
  }

  destroy(): void {
    this.enabled = false;
    window.removeEventListener('keydown', this.onKeyDown);
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (!this.enabled) return;
    if (event.repeat || event.defaultPrevented) return;
    if (isInteractiveKeyboardTarget(event.target)) return;

    const action = this.actionForCode(event.code);
    if (!action) return;
    event.preventDefault();
    this.events.emit(action);
  };

  private actionForCode(code: string): 'select-all' | 'continue' | 'bank' | 'surrender' | null {
    if (code === this.bindings.selectAll) return 'select-all';
    if (code === this.bindings.continueTurn) return 'continue';
    if (code === this.bindings.bankTurn) return 'bank';
    if (code === this.bindings.surrender) return 'surrender';
    return null;
  }
}
