import { getLanguage, onLanguageChange, t, type Language } from './i18n';

type KeyboardPage = 'letters' | 'symbols';

const CYRILLIC_ROWS = [
  ['ё', 'й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ'],
  ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
  ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю'],
];

const LATIN_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

const NUMBER_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

const SYMBOL_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['@', '#', '€', '&', '-', '+', '(', ')', '/', ':'],
  ['[', ']', '{', '}', '%', '*', '=', '_', '?', '!'],
];

let mobileKeyboardEnabled = false;
let root: HTMLDivElement | null = null;
let keysRoot: HTMLDivElement | null = null;
let activeInput: HTMLInputElement | null = null;
let page: KeyboardPage = 'letters';
let letterLanguage: Language = 'ru';
let uppercase = true;

const isNumericInput = (input: HTMLInputElement): boolean => input.type === 'number';

const textRows = (): readonly (readonly string[])[] =>
  letterLanguage === 'ru' ? CYRILLIC_ROWS : LATIN_ROWS;

const clearActiveInput = (): void => {
  if (!activeInput) return;
  activeInput.classList.remove('mobile-keyboard-input-active');
  activeInput.removeAttribute('aria-expanded');
  if (document.activeElement === activeInput) activeInput.blur();
  activeInput = null;
};

const closeMobileKeyboard = (): void => {
  clearActiveInput();
  document.documentElement.classList.remove('mobile-keyboard-open');
  root?.setAttribute('aria-hidden', 'true');
};

const createKey = (
  label: string,
  action: () => void,
  className = '',
): HTMLButtonElement => {
  const key = document.createElement('button');
  key.type = 'button';
  key.className = `mobile-keyboard-key${className ? ` ${className}` : ''}`;
  key.textContent = label;
  key.addEventListener('click', action);
  return key;
};

const dispatchInput = (input: HTMLInputElement): void => {
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

const normaliseValue = (input: HTMLInputElement, nextValue: string): string => {
  let value = nextValue;
  if (input.autocapitalize === 'characters') value = value.toUpperCase();
  if (isNumericInput(input)) value = value.replace(/\D/gu, '');
  if (input.maxLength >= 0) value = value.slice(0, input.maxLength);
  return value;
};

const updateActiveValue = (nextValue: string): void => {
  const input = activeInput;
  if (!input || input.disabled) return;
  const value = normaliseValue(input, nextValue);
  if (input.value === value) return;
  input.value = value;
  dispatchInput(input);
};

const appendCharacter = (character: string): void => {
  const input = activeInput;
  if (!input) return;
  updateActiveValue(`${input.value}${character}`);
  if (uppercase && page === 'letters') {
    uppercase = false;
    renderKeyboard();
  }
};

const deleteCharacter = (): void => {
  const input = activeInput;
  if (!input) return;
  updateActiveValue(Array.from(input.value).slice(0, -1).join(''));
};

const submitActiveInput = (): void => {
  const input = activeInput;
  if (!input) return;
  input.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      bubbles: true,
      cancelable: true,
    }),
  );
  closeMobileKeyboard();
};

const renderRow = (
  values: readonly string[],
  extraStart?: HTMLButtonElement,
  extraEnd?: HTMLButtonElement,
): HTMLDivElement => {
  const row = document.createElement('div');
  row.className = 'mobile-keyboard-row';
  if (extraStart) row.appendChild(extraStart);
  for (const value of values) {
    const label = page === 'letters' && uppercase ? value.toUpperCase() : value;
    row.appendChild(createKey(label, () => appendCharacter(label)));
  }
  if (extraEnd) row.appendChild(extraEnd);
  return row;
};

const renderNumericKeyboard = (container: HTMLDivElement): void => {
  for (const row of NUMBER_ROWS) container.appendChild(renderRow(row));
  const controls = document.createElement('div');
  controls.className = 'mobile-keyboard-row mobile-keyboard-row--numeric-controls';
  controls.append(
    createKey('⌫', deleteCharacter, 'mobile-keyboard-key--action'),
    createKey('0', () => appendCharacter('0')),
    createKey(t('keyboardDone'), submitActiveInput, 'mobile-keyboard-key--done'),
  );
  container.appendChild(controls);
};

const renderLettersKeyboard = (container: HTMLDivElement): void => {
  const rows = textRows();
  container.appendChild(renderRow(rows[0]));
  container.appendChild(renderRow(rows[1]));
  container.appendChild(
    renderRow(
      rows[2],
      createKey('⇧', () => {
        uppercase = !uppercase;
        renderKeyboard();
      }, uppercase
        ? 'mobile-keyboard-key--action mobile-keyboard-key--active'
        : 'mobile-keyboard-key--action'),
      createKey('⌫', deleteCharacter, 'mobile-keyboard-key--action'),
    ),
  );

  const controls = document.createElement('div');
  controls.className = 'mobile-keyboard-row mobile-keyboard-row--bottom';
  const alternateLanguage = letterLanguage === 'ru' ? 'EN' : 'RU';
  controls.append(
    createKey('123', () => {
      page = 'symbols';
      renderKeyboard();
    }, 'mobile-keyboard-key--action'),
    createKey(alternateLanguage, () => {
      letterLanguage = letterLanguage === 'ru' ? 'en' : 'ru';
      renderKeyboard();
    }, 'mobile-keyboard-key--action'),
    createKey(t('keyboardSpace'), () => appendCharacter(' '), 'mobile-keyboard-key--space'),
    createKey(t('keyboardDone'), submitActiveInput, 'mobile-keyboard-key--done'),
  );
  container.appendChild(controls);
};

const renderSymbolsKeyboard = (container: HTMLDivElement): void => {
  for (const row of SYMBOL_ROWS) container.appendChild(renderRow(row));
  const controls = document.createElement('div');
  controls.className = 'mobile-keyboard-row mobile-keyboard-row--bottom';
  controls.append(
    createKey('ABC', () => {
      page = 'letters';
      renderKeyboard();
    }, 'mobile-keyboard-key--action'),
    createKey('⌫', deleteCharacter, 'mobile-keyboard-key--action'),
    createKey(t('keyboardSpace'), () => appendCharacter(' '), 'mobile-keyboard-key--space'),
    createKey(t('keyboardDone'), submitActiveInput, 'mobile-keyboard-key--done'),
  );
  container.appendChild(controls);
};

const renderKeyboard = (): void => {
  const container = keysRoot;
  const input = activeInput;
  if (!container || !input) return;
  container.replaceChildren();
  if (isNumericInput(input)) {
    renderNumericKeyboard(container);
    return;
  }
  if (page === 'symbols') {
    renderSymbolsKeyboard(container);
    return;
  }
  renderLettersKeyboard(container);
};

const activateMobileKeyboard = (input: HTMLInputElement): void => {
  if (!mobileKeyboardEnabled || input.disabled || !input.isConnected) return;
  if (activeInput !== input) clearActiveInput();
  activeInput = input;
  page = 'letters';
  letterLanguage = getLanguage();
  uppercase = true;
  input.classList.add('mobile-keyboard-input-active');
  input.setAttribute('aria-expanded', 'true');
  root?.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add('mobile-keyboard-open');
  renderKeyboard();
};

const createRoot = (): void => {
  if (root) return;
  root = document.createElement('div');
  root.id = 'mobile-keyboard';
  root.setAttribute('aria-hidden', 'true');
  root.setAttribute('aria-label', t('keyboardLabel'));
  keysRoot = document.createElement('div');
  keysRoot.className = 'mobile-keyboard-keys';
  root.appendChild(keysRoot);
  document.body.appendChild(root);
};

export const installMobileKeyboard = (enabled: boolean): void => {
  mobileKeyboardEnabled = enabled;
  if (!enabled) return;
  createRoot();

  document.addEventListener('pointerdown', (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (root?.contains(target)) return;
    if (
      target instanceof HTMLInputElement &&
      target.dataset.mobileKeyboardInput === 'true'
    ) return;
    closeMobileKeyboard();
  }, true);

  window.addEventListener('orientationchange', () => {
    if (!window.matchMedia('(orientation: landscape)').matches) closeMobileKeyboard();
  });
  onLanguageChange(() => {
    if (!activeInput) return;
    letterLanguage = getLanguage();
    renderKeyboard();
  });
};

export const prepareMobileTextInput = (input: HTMLInputElement): HTMLInputElement => {
  if (!mobileKeyboardEnabled) return input;
  input.readOnly = true;
  input.inputMode = 'none';
  input.dataset.mobileKeyboardInput = 'true';
  input.setAttribute('aria-haspopup', 'dialog');
  input.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    activateMobileKeyboard(input);
  });
  input.addEventListener('click', (event) => event.preventDefault());
  input.addEventListener('focus', () => activateMobileKeyboard(input));
  input.addEventListener('contextmenu', (event) => event.preventDefault());
  return input;
};

export { closeMobileKeyboard };
