import type { AudioSettings } from '../player-settings';
import { t } from './i18n';
import {
  FONT_FAMILY,
  FONT_SIZE,
  SETTINGS_BUTTON_BG,
  UI_RADIUS,
  scaledPx,
} from './theme';

interface SoundSlidersOptions {
  compact?: boolean;
}

type AudioSliderKey = 'effectsVolume' | 'musicVolume';

const clampVolume = (value: number): number => Math.max(0, Math.min(1, value));

export const createSoundSliders = (
  audio: AudioSettings,
  onChange: (audio: AudioSettings) => void,
  options: SoundSlidersOptions = {},
): HTMLDivElement => {
  const compact = options.compact === true;
  let draft: AudioSettings = {
    masterVolume: clampVolume(audio.masterVolume),
    effectsVolume: clampVolume(audio.effectsVolume),
    musicVolume: clampVolume(audio.musicVolume),
    quickSearchClockEnabled: audio.quickSearchClockEnabled,
  };

  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    display: 'grid',
    gap: compact ? scaledPx(6) : scaledPx(10),
    minWidth: compact ? scaledPx(210) : '0',
    fontFamily: FONT_FAMILY.ui,
  } satisfies Partial<CSSStyleDeclaration>);

  wrap.append(
    createSlider(t('effects'), 'effectsVolume'),
    createSlider(t('music'), 'musicVolume'),
    createSwitch(t('quickSearchClock')),
  );
  return wrap;

  function createSlider(label: string, key: AudioSliderKey): HTMLLabelElement {
    const row = document.createElement('label');
    Object.assign(row.style, {
      display: 'grid',
      gridTemplateColumns: compact
        ? `${scaledPx(70)} minmax(${scaledPx(96)}, 1fr)`
        : '1fr',
      gap: compact ? scaledPx(8) : scaledPx(6),
      alignItems: 'center',
      color: '#d8d8e8',
      fontSize: compact ? FONT_SIZE.roomMeta : FONT_SIZE.label,
    } satisfies Partial<CSSStyleDeclaration>);

    const text = document.createElement('span');
    const updateText = (): void => {
      text.textContent = `${label} ${Math.round(draft[key] * 100)}%`;
    };
    Object.assign(text.style, {
      minWidth: '0',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    } satisfies Partial<CSSStyleDeclaration>);

    const input = document.createElement('input');
    input.type = 'range';
    input.min = '0';
    input.max = '100';
    input.step = '1';
    input.value = String(Math.round(draft[key] * 100));
    input.className = 'settings-sound-slider';
    Object.assign(input.style, {
      width: '100%',
      height: compact ? scaledPx(18) : scaledPx(22),
      background: 'transparent',
      margin: '0',
    } satisfies Partial<CSSStyleDeclaration>);
    input.addEventListener('input', () => {
      draft = {
        ...draft,
        [key]: clampVolume(Number(input.value) / 100),
      };
      updateText();
      onChange({ ...draft });
    });

    updateText();
    row.append(text, input);
    return row;
  }

  function createSwitch(label: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('role', 'switch');
    const update = (): void => {
      btn.setAttribute('aria-checked', String(draft.quickSearchClockEnabled));
      btn.textContent = `${label}: ${
        draft.quickSearchClockEnabled ? t('settingOn') : t('settingOff')
      }`;
      btn.style.background = SETTINGS_BUTTON_BG;
      btn.style.borderColor = draft.quickSearchClockEnabled
        ? 'rgba(255,255,255,0.28)'
        : 'rgba(255,255,255,0.14)';
      btn.style.color = draft.quickSearchClockEnabled
        ? '#f4f4f5'
        : 'rgba(216,216,232,0.68)';
    };
    Object.assign(btn.style, {
      width: '100%',
      minHeight: compact ? scaledPx(34) : scaledPx(42),
      padding: compact ? `${scaledPx(6)} ${scaledPx(8)}` : scaledPx(10),
      border: '1px solid rgba(255,255,255,0.18)',
      borderRadius: UI_RADIUS,
      color: '#d8d8e8',
      fontFamily: FONT_FAMILY.ui,
      fontSize: compact ? FONT_SIZE.roomMeta : FONT_SIZE.label,
      textAlign: 'left',
      cursor: 'pointer',
    } satisfies Partial<CSSStyleDeclaration>);
    btn.addEventListener('click', () => {
      draft = {
        ...draft,
        quickSearchClockEnabled: !draft.quickSearchClockEnabled,
      };
      update();
      onChange({ ...draft });
    });
    update();
    return btn;
  }
};
