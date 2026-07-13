import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      injectRegister: false,
      registerType: 'autoUpdate',
      pwaAssets: false,
      includeAssets: [
        'favicon.svg',
        'favicon-64.png',
        'favicon-128.png',
        'favicon-256.png',
        'favicon-512.png',
        'pwa-icon-192.png',
        'pwa-icon-512.png',
      ],
      manifest: {
        id: '/',
        name: 'Farklepit',
        short_name: 'Farklepit',
        description: 'Farkle dice with 3D physics and online matches.',
        lang: 'ru',
        start_url: '/',
        scope: '/',
        display: 'fullscreen',
        orientation: 'landscape',
        theme_color: '#151414',
        background_color: '#151414',
        icons: [
          {
            src: '/pwa-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/pwa-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/auth(?:\/|$)/,
          /^\/ws(?:\/|$)/,
          /^\/downloads(?:\/|$)/,
        ],
        globPatterns: [
          '**/*.{html,js,css,woff2}',
          'favicon-*.png',
          'favicon.svg',
          'pwa-icon-*.png',
          'assets/ui/**/*.{svg,png}',
          'assets/lang/*.png',
          'assets/fonts/*.ttf',
          'assets/dice/stone-dice-model/*.glb',
          'assets/dice/stone-dice-texture-1k/*.webp',
        ],
        globIgnores: ['assets/ost/**', 'assets/sounds/**'],
      },
    }),
  ],
  server: {
    port: 5174,
    strictPort: true,
  },
});
