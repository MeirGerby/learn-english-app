import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { conditions: ['@learn-english/source'] },
  ssr: { resolve: { conditions: ['@learn-english/source'] } },
  test: {
    include: ['src/**/*.spec.ts'],
    setupFiles: ['src/test/unit-setup.ts'],
    server: { deps: { inline: [/@learn-english\//] } },
  },
});
