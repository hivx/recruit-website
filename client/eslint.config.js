// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettierPlugin from 'eslint-plugin-prettier'
import importPlugin from 'eslint-plugin-import'
import prettierConfig from 'eslint-config-prettier'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores([
    'eslint.config.js',
    'dist',
    'build',
    'coverage',
    'node_modules',
    '**/*.min.js',
    '*.config.*',
  ]),

  {
    files: ['**/*.{ts,tsx}'],

    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,   // <-- TYPE AWARE
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      prettierConfig,
    ],

    plugins: {
      prettier: prettierPlugin,
      import: importPlugin,
    },

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        project: './tsconfig.eslint.json',         // <-- REQUIRED
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      // Base
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      eqeqeq: 'warn',
      curly: 'warn',
      'prefer-const': 'warn',
      'no-var': 'error',

      // Import
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'warn',

      // React
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // TS typed rules
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',

      // Prettier
      'prettier/prettier': 'warn',
    },
  },
])
