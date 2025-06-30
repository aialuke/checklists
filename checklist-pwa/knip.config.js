export default {
  // Enhanced entry points - include test files as entries
  entry: ['src/main.tsx', 'src/test/**/*.{test,spec}.{ts,tsx}'],

  project: ['src/**/*.{ts,tsx}'],

  // ✅ FIX: Path mapping synchronized with tsconfig.json
  paths: {
    '@/*': ['src/*'],
  },

  ignore: [
    'src/vite-env.d.ts',
    'dist/**/*',
    'coverage/**/*',
    'playwright-report/**/*',
    'test-results/**/*',
  ],

  // ✅ FIX: Enable plugin auto-detection (replaces manual dependency management)
  vite: true, // Auto-detects vite-plugin-pwa, @vitejs/plugin-react
  vitest: true, // Auto-detects @vitest/*, jsdom, @testing-library/*
  storybook: true, // Auto-detects @storybook/* packages and resolves addon-docs
  playwright: true, // Auto-detects @playwright/test
  eslint: true, // Auto-detects eslint-* packages
  typescript: true, // Auto-detects TypeScript config dependencies

  // ✅ FIX: Minimal manual ignores (plugins handle most dependencies)
  ignoreDependencies: [
    // Only truly indirect dependencies that plugins can't detect
    'lint-staged', // Git hooks
    'chromatic', // Visual testing service (no stories yet)
  ],

  // Remove non-existent workspace
  // ignoreWorkspaces: ['packages/cli'], // ✅ REMOVED: workspace doesn't exist

  // Component library optimized rules
  rules: {
    files: 'error',
    dependencies: 'error',
    devDependencies: 'error',
    exports: 'warn', // More permissive for component library
    types: 'error',
    nsExports: 'warn', // More permissive for component library
    nsTypes: 'warn', // More permissive for component library
    duplicates: 'error',
  },

  // Handle component library patterns
  ignoreExportsUsedInFile: {
    interface: true,
    type: true,
  },
}
