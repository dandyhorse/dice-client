const MOBILE_MODAL_Z_INDEX = '55';
const TOP_MENU_CONTROL_IDS = ['profile-top-control', 'lang-controls'] as const;

interface InertElement extends HTMLElement {
  inert: boolean;
}

interface InertRecord {
  element: InertElement;
  wasInert: boolean;
}

interface ButtonRecord {
  element: HTMLButtonElement;
  wasDisabled: boolean;
}

const releases = new WeakMap<HTMLElement, () => void>();

const isMobileRuntime = (): boolean =>
  document.documentElement.classList.contains('mobile-runtime');

/**
 * Turns an existing menu overlay into the common mobile modal surface.
 * The caller still owns close behaviour; this helper only owns geometry and
 * temporary background interactivity. Background controls stay visible and
 * disabled: mobile modal state must not selectively hide menu controls.
 */
export const applyMobileModalLayer = (
  overlay: HTMLElement,
  panel: HTMLElement,
): void => {
  if (!isMobileRuntime()) return;

  releases.get(overlay)?.();
  panel.classList.remove('responsive-ui-content');

  Object.assign(overlay.style, {
    zIndex: MOBILE_MODAL_Z_INDEX,
    padding: 'max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left))',
    boxSizing: 'border-box',
  } satisfies Partial<CSSStyleDeclaration>);
  Object.assign(panel.style, {
    maxWidth: '100%',
    maxHeight: '100%',
    overflowX: 'hidden',
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    touchAction: 'pan-y',
  } satisfies Partial<CSSStyleDeclaration>);

  const inerted = Array.from(document.body.children)
    .filter((child) => child !== overlay && child.id !== 'mobile-keyboard')
    .filter((child) => !TOP_MENU_CONTROL_IDS.includes(child.id as (typeof TOP_MENU_CONTROL_IDS)[number]))
    .filter((child): child is InertElement => child instanceof HTMLElement)
    .map((element): InertRecord => ({
      element,
      wasInert: element.inert,
    }));
  inerted.forEach(({ element }) => {
    element.inert = true;
  });

  // Browser `inert` owns background surfaces. Top controls must remain painted
  // under modal backdrop, so disable their actual buttons instead of inerting
  // their wrappers.
  const topButtons: ButtonRecord[] = TOP_MENU_CONTROL_IDS.flatMap((id) => {
    const root = document.getElementById(id);
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLButtonElement>('button')).map(
      (element) => ({ element, wasDisabled: element.disabled }),
    );
  });
  topButtons.forEach(({ element }) => {
    element.disabled = true;
  });

  releases.set(overlay, () => {
    inerted.forEach(({ element, wasInert }) => {
      element.inert = wasInert;
    });
    topButtons.forEach(({ element, wasDisabled }) => {
      element.disabled = wasDisabled;
    });
    releases.delete(overlay);
  });
};

export const releaseMobileModalLayer = (overlay: HTMLElement | null): void => {
  if (!overlay) return;
  releases.get(overlay)?.();
};
