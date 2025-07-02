import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // Main entry points for Next.js app router
  entry: [
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'src/app/providers.tsx',
    'src/app/**/page.tsx',
    'src/app/**/layout.tsx',
    'src/app/**/loading.tsx',
    'src/app/**/error.tsx',
    'src/app/**/not-found.tsx',
    'src/app/global-error.tsx',
    'src/middleware.ts',
    'next.config.mjs',
    'tailwind.config.ts',
    'src/lib/supabase/client.ts',
    'src/lib/supabase/server.ts',
  ],

  // Project files to analyze
  project: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/types/database.types.ts',
  ],

  // Ignore certain patterns to avoid false positives
  ignore: [
    'dist/**',
    'build/**',
    '.next/**',
    'node_modules/**',
    'supabase/migrations/**',
    'supabase/functions/**',
    // Ignore foundational utility files that may have future-use exports
    'src/lib/auth.ts', // Contains auth utilities for future protected routes
    'src/types/*.ts', // Type definitions may be for future features
  ],

  // Workspace configuration
  workspaces: {
    '.': {
      // Entry points specific to this workspace
      entry: [
        'src/app/**/{page,layout,loading,error,not-found,global-error}.tsx',
        'src/lib/supabase/client.ts',
        'src/lib/supabase/server.ts',
      ],
      
      // Project files
      project: ['src/**/*.{ts,tsx}'],
      
      // Conservative ignore patterns to avoid false positives
      ignore: [
        'src/**/*.stories.{ts,tsx}',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/types/database.types.ts', // Generated file
        'src/lib/auth.ts', // Foundational auth utilities
        'src/types/auth.types.ts', // Type definitions for future use
      ],
       
      // Next.js specific configuration
      next: {
        entry: [
          'src/app/layout.tsx',
          'src/app/page.tsx',
          'src/app/**/page.tsx',
          'src/app/**/layout.tsx',
          'src/middleware.ts',
        ],
      },
      
      // TypeScript configuration
      typescript: {
        entry: ['src/types/*.ts'],
      },
      
      // Tailwind CSS configuration
      tailwind: {
        entry: ['tailwind.config.ts'],
        project: ['src/**/*.{ts,tsx}'],
      },
      
      // ESLint configuration
      eslint: {
        entry: ['.eslintrc.json'],
      },
      
      // Prettier configuration
      prettier: {
        entry: ['prettier.config.js'],
      },
    },
  },

  // Conservative rules to focus on real issues, not future-use code
  rules: {
    // Focus on genuine issues
    unresolved: 'off', // Sometimes Next.js has unresolved imports
    duplicates: 'error', // Detect duplicate dependencies
    unlisted: 'error', // Dependencies used but not listed in package.json
    dependencies: 'error', // Unused dependencies
    
    // Be lenient with exports that may be for future use
    exports: 'off', // Don't flag unused exports (foundational utilities)
    types: 'off', // Don't flag unused types (may be for future features)
    nsExports: 'off', // Don't flag unused namespace exports
    nsTypes: 'off', // Don't flag unused namespace types
    classMembers: 'warn', // Only warn about unused class members
    enumMembers: 'warn', // Only warn about unused enum members
  },

  // Include configuration for common Next.js patterns
  includeEntryExports: true,
  
  // Exclude certain dependencies from analysis
  ignoreDependencies: [
    // ESLint plugins used through configuration but not directly imported
    '@typescript-eslint/eslint-plugin', // Used through ESLint rules in .eslintrc.json
    // Bundle analysis tools used via CLI but not directly imported
    'webpack-bundle-analyzer', // Used for bundle analysis via npx
    // PostCSS plugins used in postcss.config.mjs but not directly imported
    'cssnano', // Used in production builds via PostCSS configuration
    // PWA dependencies used by next-pwa plugin but not directly imported
    'next-pwa', // Used in next.config.mjs for PWA functionality
    // Keep these as they're genuinely used in build/dev but not directly imported
  ],

  // Exclude certain binaries
  ignoreBinaries: [
    'supabase', // Used in development but not listed in package.json scripts
  ],
};

export default config; 