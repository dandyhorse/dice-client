import { EventEmitter } from '../../event-emitter.class';
import { DEFAULT_PLAYER_SETTINGS, type ControlBindings } from '../../../../player-settings';
import {
  isGameplayInteractionBlocked,
  isInteractiveGameTarget,
  requestTopMenuDropdownClose,
} from '../../../../ui/game-modal-state';

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
    if (isInteractiveGameTarget(event.target) || isGameplayInteractionBlocked()) return;

    const action = this.actionForCode(event.code);
    if (!action) return;
    event.preventDefault();
    requestTopMenuDropdownClose();
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
