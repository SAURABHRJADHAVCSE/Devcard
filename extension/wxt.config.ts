import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  // Don't auto-launch a browser on `wxt dev` — load .output/chrome-mv3-dev
  // unpacked once yourself; HMR still works on every save after that.
  webExt: {
    disabled: true,
  },
  // Pinned instead of WXT's default "first free port from 3000" — a drifting
  // port makes an already-loaded extension's manifest (baked with the old
  // port's CSP) mismatch the new dev server on every restart, breaking HMR
  // until you manually reload the extension in chrome://extensions.
  dev: {
    server: {
      port: 6367,
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: 'Devcard',
    description: 'One knowledge base. Every platform in sync.',
    permissions: ['storage'],
    host_permissions: ['http://localhost:6366/*'],
  },
});
