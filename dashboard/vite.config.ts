import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Built output is served as static files directly by the MCP server's Hono
// app (see mcp-server/src/api/router.ts) — same origin as /api/*, so the
// dashboard never needs CORS or a separate host to configure.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    outDir: 'dist',
  },
})
