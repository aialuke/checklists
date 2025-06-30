import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import storybook from 'eslint-plugin-storybook'
import importPlugin from 'eslint-plugin-import-x'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier/flat'

export default tseslint.config([
  {
    // Global ignores - must be first and separate
    ignores: [
      'dist/**/*',
      'build/**/*', 
      'coverage/**/*',
      '*.min.js',
      'node_modules/**/*',
      '.next/**/*',
      '.vercel/**/*',
    ],
  },
  {
    // Base config for all files
    files: ['**/*.{ts,tsx,js,jsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: {
          allowDefaultProject: ['.storybook/*.ts', '.storybook/*.tsx'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
      react: {
        version: 'detect',
      },
    },
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/array-type': ['error', { default: 'array' }],
    },
  },

  // import-x plugin configuration
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      'import-x': importPlugin,
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // --- Foundational Rules ---
      'import-x/no-unresolved': 'error',
      'import-x/export': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/no-useless-path-segments': ['warn', { noUselessIndex: true }],
      'import-x/no-commonjs': 'error',
      'import-x/no-amd': 'error',
      'import-x/first': 'error',
      'import-x/no-absolute-path': 'error',

      // --- Import Order Rule ---
      'import-x/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            { pattern: '@/components/**', group: 'internal', position: 'after' },
            { pattern: '@/containers/**', group: 'internal', position: 'after' },
            { pattern: '@/hooks/**', group: 'internal', position: 'after' },
            { pattern: '@/pages/**', group: 'internal', position: 'after' },
            { pattern: '@/router/**', group: 'internal', position: 'after' },
            { pattern: '@/services/**', group: 'internal', position: 'after' },
            { pattern: '@/stores/**', group: 'internal', position: 'after' },
            { pattern: '@/styles/**', group: 'internal', position: 'after' },
            { pattern: '@/utils/**', group: 'internal', position: 'after' },
          ],
          pathGroupsExcludedImportTypes: ['react'],
        },
      ],

      // --- Architectural & Code Quality Rules ---
      'import-x/no-internal-modules': ['warn', {
        allow: [
          '@/components/ui/*',
          '@/components/*/',
          '@/stores/*',
          '@/utils/*',
          '@/test/utils/*',
          '../ui/*', // Component-to-UI relative imports
          '../src/*', // Config file relative imports
          '../../components/*', // Page-to-component relative imports
          '../../stores/*', // Component-to-store relative imports
          './mocks/*', // Test mock imports
          'zustand/react/shallow', // Zustand shallow selector
          'msw/*', // Test mocking
          'eslint-config-prettier/*', // Config files
        ],
      }],
      'import-x/no-restricted-paths': ['error', {
        zones: [
          {
            target: '@/components/ui/**/*',
            from: [
              '@/hooks/**/*',
              '@/containers/**/*',
              '@/pages/**/*',
              '@/services/**/*',
              '@/stores/**/*',
            ],
            message: 'UI components in @/components/ui should not import from application logic directories. They should be dumb and receive all data via props.',
          },
          {
            target: '@/components/**/*',
            from: '@/pages/**/*',
            message: 'Components should not import pages. This creates a circular dependency.',
          },
        ],
      }],
      // Phase 11: Import-X Configuration Tuning - Allow default exports for React ecosystem
      'import-x/no-default-export': 'off', // React components typically use default exports
      'import-x/no-self-import': 'error',
    },
  },

  // React-specific config
  {
    files: ['**/*.{tsx,jsx}'],
    plugins: {
      react,
      'jsx-a11y': jsxA11y,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off', // TypeScript handles this
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },

  // Test files config
  {
    files: ['**/*.{test,spec}.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn', // More lenient in tests
    },
  },

  // Storybook files config
  {
    files: ['**/*.stories.{ts,tsx}', '.storybook/**/*.{ts,tsx}'],
    plugins: { storybook },
    rules: {
      ...storybook.configs.recommended.rules,
    },
  },

  // Disable type checking for JS files
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // Config files - relaxed import rules
  {
    files: [
      '**/*.config.js',
      '**/*.config.ts', 
      'eslint.config.js',
      '.storybook/**/*.{ts,tsx}',
      'vite.config.d.ts',
      'playwright.config.ts',
    ],
    rules: {
      'import-x/order': 'off', // Config files can have flexible import order
      'import-x/no-internal-modules': 'off', // Config files may need deep imports
    },
    extends: [tseslint.configs.disableTypeChecked],
  },

  // MUST BE LAST - Prettier integration
  eslintConfigPrettier,
]);