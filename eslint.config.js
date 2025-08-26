import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['build', '**/*.test.*', '**/__mocks__']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // 'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // 'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
      'no-unused-vars': ['warn'],
      'no-async-promise-executor': ['warn'],
      'no-unused-private-class-members': ['warn'],
      'no-unsafe-finally': ['warn'],
    },
  },
])
