import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.viewexif.com',
  output: 'static',
  trailingSlash: 'always',
  i18n: {
    locales: ['en', { path: 'de', codes: ['de'] }, { path: 'zh-cn', codes: ['zh-CN'] }],
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
      exclude: ['@colorhythm/exiftool-wasm'],
    },
    worker: { format: 'es' },
  },
});
