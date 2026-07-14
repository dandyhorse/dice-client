export const MOBILE_GAMEPLAY_GRID_ID = 'mobile-gameplay-grid';
export const MOBILE_GAMEPLAY_EDGE_OFFSET = 'var(--mobile-gameplay-edge-offset)';
export const MOBILE_GAMEPLAY_RAIL_WIDTH = 'var(--mobile-gameplay-rail-width)';
export const MOBILE_GAMEPLAY_RAIL_WIDTH_VARIABLE = '--mobile-gameplay-rail-width';
export const MOBILE_TOP_MENU_SCALE_VARIABLE = '--mobile-top-menu-scale';
export const MOBILE_GAMEPLAY_TOP_MENU_RENDERED_EVENT =
  'dice:mobile-gameplay-top-menu-rendered';

const MOBILE_TOP_MENU_SCALE = 1.2;

export const mobileTopMenuScale = (): number => MOBILE_TOP_MENU_SCALE;
