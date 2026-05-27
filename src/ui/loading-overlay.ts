import { FONT_FAMILY } from './theme';

const LOADING_OVERLAY_ID = 'loading-overlay';
let visibleRequests = 0;

export const showLoadingOverlay = (label = 'LOADING'): void => {
  visibleRequests += 1;
  let overlay = document.getElementById(LOADING_OVERLAY_ID) as HTMLDivElement | null;
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = LOADING_OVERLAY_ID;
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `<div class="loading-dots">${label}<span>.</span><span>.</span><span>.</span></div>`;
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    display: 'grid',
    placeItems: 'center',
    zIndex: '1000',
    background: '#050507',
    color: '#f4f4f5',
    fontFamily: FONT_FAMILY.title,
    fontSize: 'clamp(28px, 6vw, 58px)',
    letterSpacing: '0.16em',
    userSelect: 'none',
  } satisfies Partial<CSSStyleDeclaration>);
};

export const hideLoadingOverlay = (): void => {
  visibleRequests = Math.max(0, visibleRequests - 1);
  if (visibleRequests > 0) return;
  document.getElementById(LOADING_OVERLAY_ID)?.remove();
};
