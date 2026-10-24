import { fileURLToPath, URL } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * The development server is the single public entry point: browser requests to
 * /api are proxied to the FastAPI service, so the SPA and the API share an
 * origin and session cookies/headers behave the same in development and later.
 *
 * Ports and the proxy target come from the environment so the container setup
 * can place the app on whatever host port is expected.
 */
const port = Number(process.env.PORT ?? 5173)
const apiTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port,
    strictPort: false,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port,
  },
})
