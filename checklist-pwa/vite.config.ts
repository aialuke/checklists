import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

dotenv.config()

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Enterprise Checklist Manager',
        short_name: 'Checklists',
        description: 'Mobile-first enterprise checklist management system',
        theme_color: '#FDF351', // Primary yellow from design system
        background_color: '#FFFCFF', // Surface base from design system
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300, // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],
      },
    }),
    visualizer({
      open: true,
      filename: 'stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          'ui-vendor': ['@headlessui/react', 'lucide-react'],
          'query-vendor': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          'pages-admin': ['./src/pages/admin/DashboardPage.tsx'],
          'pages-manager': ['./src/pages/manager/DashboardPage.tsx'],
          'components-ui': ['./src/components/ui/index.ts'],
          'stores-queries': ['./src/queries/authQueries.ts', './src/queries/checklistQueries.ts', './src/queries/notificationQueries.ts', './src/queries/offlineQueries.ts'],
        },
      },
    },
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Performance budgets (2024 standards)
    chunkSizeWarningLimit: 150, // 150KB warning threshold
    reportCompressedSize: true,
    assetsInlineLimit: 4096, // 4KB inline limit for assets
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js'],
  },
})
