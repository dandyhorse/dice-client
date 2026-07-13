import { registerSW } from 'virtual:pwa-register';

export const installPwaRuntime = (): void => {
  if (!import.meta.env.PROD) return;
  registerSW();
};
