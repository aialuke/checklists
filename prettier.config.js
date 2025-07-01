module.exports = {
  // Core formatting
  semi: true,
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  trailingComma: 'es5',
  
  // Spacing and brackets
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  
  // JSX specific
  jsxSingleQuote: true,
  
  // Line endings (normalize across platforms)
  endOfLine: 'lf',
  
  // File specific overrides
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },
  ],
  
  // Enhanced Tailwind plugin (must be last)
  plugins: ['prettier-plugin-tailwindcss'],
  
  // Tailwind plugin options
  tailwindConfig: './tailwind.config.ts',
  tailwindFunctions: ['clsx', 'cn', 'cva'],
}