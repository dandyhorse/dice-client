export const GAME_POPUP_CLOSE_EVENT = 'dice:close-game-popups';
export const TOP_MENU_DROPDOWN_CLOSE_EVENT = 'dice:close-top-menu-dropdowns';

export const GAME_BLOCKING_OVERLAY_SELECTORS = [
  '#settings-modal',
  '#profile-popup',
  '#auth-modal',
  '#room-list-modal',
  '#room-password-modal',
  '#hud-surrender-confirm',
].join(',');

export const closeGamePopups = (): void => {
  window.dispatchEvent(new Event(GAME_POPUP_CLOSE_EVENT));
};

export const requestTopMenuDropdownClose = (): void => {
  window.dispatchEvent(new Event(TOP_MENU_DROPDOWN_CLOSE_EVENT));
};

export const isGameInteractionBlocked = (): boolean =>
  document.querySelector(GAME_BLOCKING_OVERLAY_SELECTORS) !== null;

export const isInteractiveGameTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) return false;
  if (target.closest('input, textarea, select, button')) return true;
  if (target.closest(GAME_BLOCKING_OVERLAY_SELECTORS)) return true;
  const editable = target.closest('[contenteditable]');
  return editable instanceof HTMLElement && editable.isContentEditable;
};
