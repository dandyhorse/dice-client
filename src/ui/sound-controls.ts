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

type AudioKey = keyof AudioSettings;

const clampVolume = (value: number): number => Math.max(0, Math.min(1, value));

export const createSoundSliders = (
  audio: AudioSettings,
  onChange: (audio: AudioSettings) => void,
  options: SoundSlidersOptions = {},
): HTMLDivElement => {
  const compact = options.compact === true;
  let draft: AudioSettings = {
    effectsVolume: clampVolume(audio.effectsVolume),
    musicVolume: clampVolume(audio.musicVolume),
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
  );
  return wrap;

  function createSlider(label: string, key: AudioKey): HTMLLabelElement {
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
    Object.assign(input.style, {
      width: '100%',
      accentColor: '#22c55e',
      background: SETTINGS_BUTTON_BG,
      borderRadius: UI_RADIUS,
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
};
