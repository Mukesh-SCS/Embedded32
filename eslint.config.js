import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/*.config.cjs',
      'docs/api/**',
      'embedded32-sdk-c/**',
      'embedded32-sdk-python/**',
      'examples/**',
      'embedded32-*/examples/**',
      'embedded32-*/**/*.mjs',
      'labs/**/starter/**',
      'apps/site/.next/**',
      'apps/site/out/**',
      'apps/site/public/api-ref/**',
      '.e2e-pages/**',
      'test-results/**',
      'playwright-report/**',
      'apps/site/next-env.d.ts',
      'apps/demo/src/traces.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextCoreWebVitals.map((config) => ({
    ...config,
    files: ['apps/site/src/**/*.{ts,tsx}'],
  })),
  {
    files: ['apps/site/src/**/*.{ts,tsx}'],
    settings: { next: { rootDir: 'apps/site' } },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['scripts/**/*.mjs', 'apps/*/scripts/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['embedded32-*/src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      'prefer-const': 'warn',
      'no-case-declarations': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    files: [
      '**/security/logSanitize.ts',
      '**/security/configPath.ts',
      'apps/site/src/lib/security.ts',
    ],
    rules: {
      'no-control-regex': 'off',
    },
  },
  {
    files: ['apps/site/tests/**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-control-regex': 'off',
    },
  },
  {
    files: ['embedded32-*/tests/**/*.ts', '**/*.test.ts', 'labs/**/solution/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      'prefer-const': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  }
);
