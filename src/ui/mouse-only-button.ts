const isKeyboardActivation = (event: KeyboardEvent): boolean =>
  event.code === 'Space' ||
  event.code === 'Enter' ||
  event.key === ' ' ||
  event.key === 'Enter' ||
  event.key === 'Spacebar';

export const bindMouseOnlyClick = (btn: HTMLButtonElement, onClick: () => void): void => {
  btn.type = 'button';
  btn.tabIndex = -1;

  btn.addEventListener('mousedown', (event) => {
    event.preventDefault();
  });

  btn.addEventListener('keydown', (event) => {
    if (!isKeyboardActivation(event)) return;
    event.preventDefault();
    event.stopPropagation();
  });

  btn.addEventListener('keyup', (event) => {
    if (!isKeyboardActivation(event)) return;
    event.preventDefault();
    event.stopPropagation();
  });

  btn.addEventListener('click', (event) => {
    btn.blur();
    if (event.detail === 0) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick();
    btn.blur();
  });
};
