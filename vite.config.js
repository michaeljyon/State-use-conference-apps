import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import event from './event/event.js';
import { BRANDS, getBrand } from './src/brands/brands.js';
import devApi from './dev/api-plugin.js';

// Which preset to build: VITE_BRAND env var, else event.brand.
const brandId = process.env.VITE_BRAND && BRANDS[process.env.VITE_BRAND] ? process.env.VITE_BRAND : event.brand;
const brand = getBrand(brandId);
const fill = s => String(s || '').replaceAll('{org}', brand.short).replaceAll('{event}', event.shortName);

export default defineConfig({
  define: { __BRAND_ID__: JSON.stringify(brand.id) },
  plugins: [
    react(),
    devApi(),
    {
      name: 'brand-html',
      transformIndexHtml: html => html
        .replaceAll('%THEME%', brand.colors.primary)
        .replaceAll('%TITLE%', `${event.shortName} · ${event.dateLabel}`)
        .replaceAll('%APPNAME%', event.shortName)
        .replaceAll('%DESC%', fill(`${event.name}: agenda, speakers, sponsors, venue map and more.`))
        .replaceAll('%ICON%', brand.icons[192])
        .replaceAll('%APPLE%', brand.icons.apple),
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [`brands/${brand.id}/*`, 'materials/*'],
      manifest: {
        name: `${event.shortName} · ${brand.short}`,
        short_name: event.shortName,
        description: fill(`${event.name}. Agenda, speakers, sponsors, venue map and the ${event.challenge?.name || 'Challenge'}.`),
        start_url: '/', scope: '/', display: 'standalone', orientation: 'portrait',
        theme_color: brand.colors.primary, background_color: '#FFFFFF', lang: 'en',
        icons: [
          { src: brand.icons[192], sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: brand.icons[512], sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: brand.icons.maskable, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html}', `brands/${brand.id}/*.png`],
        globIgnores: ['brands/!(' + brand.id + ')/**'],
        importScripts: ['/sw-extra.js'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          { urlPattern: /\.woff2$/, handler: 'CacheFirst', options: { cacheName: 'fonts', expiration: { maxEntries: 30 } } },
          { urlPattern: /\/materials\/.*\.pdf$/, handler: 'NetworkFirst', options: { cacheName: 'materials', expiration: { maxEntries: 40 } } },
          { urlPattern: /\/api\/photos\/[^/]+$/, handler: 'CacheFirst', options: { cacheName: 'photos', expiration: { maxEntries: 200, maxAgeSeconds: 86400 * 7 } } },
          { urlPattern: /\/(?:sponsors|people|brands)\/.*\.(?:png|jpg|svg|webp)$/, handler: 'StaleWhileRevalidate', options: { cacheName: 'images' } },
        ],
      },
    }),
  ],
});
