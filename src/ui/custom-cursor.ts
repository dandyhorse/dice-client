import {
  CLOSED_HAND_CURSOR_URL,
  OPEN_HAND_CURSOR_URL,
  TARGET_HAND_CURSOR_URL,
} from '../engine/assets/asset-manifest';

type CustomCursorVariant = 'target' | 'open' | 'closed';

const HAND_CURSOR_SIZE_PX = 147;
const TARGET_CURSOR_SIZE_PX = 50;
const CURSORS: Record<
  CustomCursorVariant,
  {
    url: string;
    sizePx: number;
    hotspotX: number;
    hotspotY: number;
  }
> = {
  target: {
    url: TARGET_HAND_CURSOR_URL,
    sizePx: TARGET_CURSOR_SIZE_PX,
    hotspotX: 25,
    hotspotY: 6,
  },
  open: {
    url: OPEN_HAND_CURSOR_URL,
    sizePx: HAND_CURSOR_SIZE_PX,
    hotspotX: 74,
    hotspotY: 74,
  },
  closed: {
    url: CLOSED_HAND_CURSOR_URL,
    sizePx: HAND_CURSOR_SIZE_PX,
    hotspotX: 74,
    hotspotY: 74,
  },
};

let cursorEl: HTMLDivElement | null = null;
let currentVariant: CustomCursorVariant = 'target';
let lastX = 0;
let lastY = 0;
let hasPointer = false;
let domObserver: MutationObserver | null = null;

export function installCustomCursor(): void {
  if (cursorEl !== null) return;

  cursorEl = document.createElement('div');
  cursorEl.id = 'custom-cursor';
  cursorEl.setAttribute('aria-hidden', 'true');
  Object.assign(cursorEl.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: `${TARGET_CURSOR_SIZE_PX}px`,
    height: `${TARGET_CURSOR_SIZE_PX}px`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '0 0',
    backgroundSize: 'contain',
    display: 'none',
    pointerEvents: 'none',
    zIndex: '2147483647',
    willChange: 'transform, background-image, width, height',
  } satisfies Partial<CSSStyleDeclaration>);

  document.body.appendChild(cursorEl);
  applyCursorVariant();

  window.addEventListener('pointermove', onPointerMove, true);
  window.addEventListener('pointerdown', onPointerMove, true);
  window.addEventListener('blur', hideCursor);
  document.addEventListener('mouseleave', hideCursor);
  if (domObserver === null) {
    domObserver = new MutationObserver(applyCursorVariant);
    domObserver.observe(document.body, { childList: true, subtree: true });
  }
}

export function setCustomCursorVariant(variant: CustomCursorVariant): void {
  currentVariant = variant;
  applyCursorVariant();
}

function onPointerMove(event: PointerEvent): void {
  if (event.pointerType === 'touch') {
    hideCursor();
    return;
  }
  lastX = event.clientX;
  lastY = event.clientY;
  hasPointer = true;
  document.body.classList.add('custom-cursor-enabled');
  applyCursorPosition();
}

function hideCursor(): void {
  hasPointer = false;
  document.body.classList.remove('custom-cursor-enabled');
  if (cursorEl !== null) cursorEl.style.display = 'none';
}

function applyCursorVariant(): void {
  if (cursorEl === null) return;
  applyCursorPosition();
}

function applyCursorPosition(): void {
  if (cursorEl === null || !hasPointer) return;
  const cursor = CURSORS[getVisibleVariant()];
  cursorEl.style.width = `${cursor.sizePx}px`;
  cursorEl.style.height = `${cursor.sizePx}px`;
  cursorEl.style.backgroundImage = `url("${cursor.url}")`;
  cursorEl.style.display = 'block';
  cursorEl.style.transform = `translate3d(${lastX - cursor.hotspotX}px, ${
    lastY - cursor.hotspotY
  }px, 0)`;
}

function getVisibleVariant(): CustomCursorVariant {
  if (currentVariant === 'target') return 'target';
  const target = document.elementFromPoint(lastX, lastY);
  return target instanceof HTMLCanvasElement ? currentVariant : 'target';
}
