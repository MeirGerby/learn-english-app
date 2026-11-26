import { readdirSync } from 'node:fs';
import { defineConfig } from 'oxlint';

const contexts = readdirSync(new URL('./apps', import.meta.url), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

// Who may import whom. A project's `type:` tag says what layer it is, its
// `scope:` tag says which app owns it. Shared libs carry `scope:shared`.
const depConstraints = [
  {
    sourceTag: '*',
    onlyDependOnLibsWithTags: ['/^type:/'],
  },
  ...contexts.map((context) => ({
    sourceTag: `scope:${context}`,
    onlyDependOnLibsWithTags: [`scope:${context}`, 'scope:shared'],
  })),
  {
    sourceTag: 'scope:shared',
    onlyDependOnLibsWithTags: ['scope:shared'],
  },
  {
    sourceTag: 'type:web',
    onlyDependOnLibsWithTags: ['type:contract', 'type:ui', 'type:util'],
  },
  {
    sourceTag: 'type:bff',
    onlyDependOnLibsWithTags: [
      'type:server',
      'type:contract',
      'type:data',
      'type:util',
    ],
  },
  {
    sourceTag: 'type:server',
    onlyDependOnLibsWithTags: [
      'type:server',
      'type:contract',
      'type:data',
      'type:util',
    ],
  },
  {
    sourceTag: 'type:contract',
    onlyDependOnLibsWithTags: ['type:data', 'type:util'],
  },
  {
    sourceTag: 'type:ui',
    onlyDependOnLibsWithTags: ['type:util'],
  },
  {
    sourceTag: 'type:data',
    onlyDependOnLibsWithTags: ['type:util'],
  },
  {
    sourceTag: 'type:util',
    onlyDependOnLibsWithTags: [],
  },
];

const moduleBoundaries = (
  allow: string[],
): [
  'error',
  {
    enforceBuildableLibDependency: boolean;
    allow: string[];
    depConstraints: typeof depConstraints;
  },
] => [
  'error',
  {
    enforceBuildableLibDependency: true,
    allow,
    depConstraints,
  },
];

export default defineConfig({
  ignorePatterns: [
    '.agents/**',
    '.claude/**',
    '.codex/**',
    '**/dist/**',
    '**/routeTree.gen.ts',
    'libs/ts/db/src/word-data.ts',
  ],
  jsPlugins: ['@nx/oxlint/boundaries-plugin'],
  plugins: [
    'eslint',
    'typescript',
    'unicorn',
    'oxc',
    'react',
    'jsx-a11y',
    'import',
    'vitest',
  ],
  options: {
    typeAware: true,
  },
  categories: {
    correctness: 'error',
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/refs': 'off',
    'react/set-state-in-effect': 'off',
    'react/incompatible-library': 'off',
    'jsx-a11y/prefer-tag-over-role': 'off',
    'jsx-a11y/no-autofocus': 'off',
    'typescript/no-floating-promises': 'error',
    'typescript/no-misused-promises': 'error',
    'typescript/await-thenable': 'error',
    'typescript/switch-exhaustiveness-check': [
      'error',
      { considerDefaultExhaustiveForUnions: true },
    ],
    'eslint/eqeqeq': ['error', 'always', { null: 'ignore' }],
    'eslint/require-await': 'error',
    'eslint/no-console': 'error',
    'import/no-cycle': 'error',
    'oxc/no-accumulating-spread': 'error',
    '@nx/enforce-module-boundaries': moduleBoundaries([]),
  },
  overrides: [
    // A web app imports the AppRouter type of its own BFF. Nx forbids
    // app -> app imports, so the pair is allowed here on purpose: the two
    // ship together, and the alternative is a hand-written copy of the type.
    ...contexts.map((context) => ({
      files: [`apps/${context}/web/**/*.ts`, `apps/${context}/web/**/*.tsx`],
      rules: {
        '@nx/enforce-module-boundaries': moduleBoundaries([
          `^@learn-english/${context}-bff$`,
        ]),
      },
    })),
    {
      files: [
        'apps/*/web/src/*.{ts,tsx}',
        'apps/*/web/src/{components,context,features,hooks,lib}/**',
      ],
      rules: {
        'unicorn/filename-case': [
          'error',
          { case: 'kebabCase', ignore: ['^routeTree\\.gen\\.ts$'] },
        ],
      },
    },
    {
      files: [
        '**/src/main.{ts,tsx}',
        '**/src/server.ts',
        'libs/ts/bff/src/server/**',
        'libs/ts/db/src/migrate.ts',
        'libs/ts/db/src/seed.ts',
        'libs/ts/logging/**',
        'libs/ts/db/src/env-file.ts',
        // The web has no log shipping; a warning in the browser console is
        // the diagnostic for a failed background write.
        'apps/*/web/src/lib/**',
        'apps/*/web/scripts/**',
      ],
      rules: {
        'eslint/no-console': 'off',
      },
    },
  ],
});
