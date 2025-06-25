export default {
  entry: ['src/main.tsx'],
  project: ['src/**/*.{ts,tsx}'],
  ignore: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}', 'src/vite-env.d.ts'],
  ignoreDependencies: [
    // Vite plugins are used in config
    'vite-plugin-pwa',
    '@vitejs/plugin-react',
    // ESLint/Prettier are used via CLI
    'eslint-config-prettier',
    'eslint-plugin-prettier',
    'prettier-plugin-tailwindcss',
    // PostCSS plugins
    'autoprefixer',
    'postcss',
  ],
  ignoreWorkspaces: ['packages/cli'],
  rules: {
    files: 'error',
    dependencies: 'error',
    devDependencies: 'error',
    exports: 'error',
    types: 'error',
    nsExports: 'error',
    nsTypes: 'error',
    duplicates: 'error',
  },
}
