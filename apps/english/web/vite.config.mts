import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const BFF_URL = process.env['BFF_URL'] ?? 'http://localhost:3001';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/apps/english/web',

  // GitHub Pages serves the site under /learn-english-app/.
  base: '/learn-english-app/',

  server: {
    port: Number(process.env['PORT'] ?? 5173),
    host: 'localhost',
    // In development the BFF is reached through this proxy, same origin.
    // A production build calls VITE_API_URL instead.
    proxy: {
      '/trpc': BFF_URL,
      '/materials': BFF_URL,
    },
  },
  preview: {
    port: 4173,
    host: 'localhost',
  },

  // Workspace libs export their TS source under this condition, the same one
  // tsconfig.base.json's customConditions uses, so no prior lib build.
  resolve: {
    conditions: ['@learn-english/source'],
  },

  plugins: [
    // Must come before @vitejs/plugin-react.
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routeTreeFileHeader: [
        '/* oxlint-disable */',
        '// @ts-nocheck',
        '// noinspection JSUnusedGlobalSymbols',
      ],
    }),
    react(),
    tailwindcss(),
  ],

  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
  },
}));
