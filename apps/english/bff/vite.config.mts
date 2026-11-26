import devServer from '@hono/vite-dev-server';
import nodeAdapter from '@hono/vite-dev-server/node';
import { defaultServerConditions, defineConfig } from 'vite';

const PORT = Number(process.env['PORT'] ?? 3001);

const SSR_CONDITIONS = [...defaultServerConditions, '@learn-english/source'];

// argon2 loads a native binary, so it cannot be bundled. It is the one
// package the built server still loads from node_modules.
const NATIVE = ['argon2'];

export default defineConfig(({ command }) => ({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/apps/english/bff',

  // Dev runs the Hono app inside Vite, on the port the web's proxy expects.
  server: { port: PORT, host: 'localhost' },

  // Workspace libs export their TS source under this condition, the same one
  // tsconfig.base.json's customConditions uses, so no prior lib build.
  resolve: {
    conditions: ['@learn-english/source'],
  },

  ssr:
    command === 'build'
      ? {
          noExternal: true,
          external: NATIVE,
          resolve: { conditions: SSR_CONDITIONS },
        }
      : {
          resolve: { conditions: SSR_CONDITIONS },
          external: NATIVE,
          // Workspace libs resolve to .ts, so Vite must transform them.
          noExternal: [/^@learn-english\//],
        },

  build: {
    ssr: true,
    outDir: 'dist',
    emptyOutDir: true,
    target: 'node22',
    // @nx/vite/plugin infers a `build` target only when it finds an input
    // here, so the entry stays in rolldownOptions.
    rolldownOptions: {
      input: 'src/server.ts',
      output: { entryFileNames: 'main.js' },
    },
  },

  plugins: [devServer({ entry: 'src/main.ts', adapter: nodeAdapter })],
}));
