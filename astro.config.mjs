import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.viewexif.com',
  output: 'static',
  trailingSlash: 'always',
  i18n: {
    locales: ['en', { path: 'de', codes: ['de'] }, { path: 'fr', codes: ['fr'] }, { path: 'zh-cn', codes: ['zh-CN'] }],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    // The package contains a large generated runtime. Vite's development
    // dependency optimizer can split it through an internal rolldown helper,
    // which is not available inside a module Worker. Serve its real ESM in
    // development; production still receives the normal lazy worker chunk.
    optimizeDeps: {
      include: ['hash-wasm'],
      // Each icon is a standalone ESM object. Serve it directly so a newly
      // visited tool cannot lose hydration to an outdated optimized icon URL.
      exclude: ['@colorhythm/exiftool-wasm', '@iconify-icons/lucide'],
    },
    worker: { format: 'es' },
  },
});
