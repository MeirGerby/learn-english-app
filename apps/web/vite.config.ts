import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/learn-english-app/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  optimizeDeps: {
    // @learn-english/shared is a linked workspace package, so Vite dev
    // wouldn't otherwise pre-bundle it - but its compiled dist/ output is
    // CommonJS (built for apps/api's Node consumption), and a raw browser
    // ESM import of a CJS module can't statically resolve named exports.
    // Forcing it through the esbuild optimizer synthesizes proper ESM
    // named exports, matching what Vite's production build already does
    // for CJS deps via Rollup's commonjs interop.
    include: ['@learn-english/shared'],
  },
})
