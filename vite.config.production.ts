import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Simplified production configuration for faster builds
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-180.png', 'icon-192.svg', 'icon-512.svg'],
      devOptions: {
        enabled: false
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 3000000, // Reduced for faster builds
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/manifest\.(json|webmanifest)$/, /^\/sw\.js$/, /^\/registerSW\.js$/]
      },
      manifest: {
        name: 'Sembalun - Indonesian Meditation App',
        short_name: 'Sembalun',
        description: 'Pengalaman meditasi Indonesia yang tenang dengan pelacakan kemajuan cairn',
        theme_color: '#6A8F6F',
        background_color: '#E1E8F0',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'id-ID',
        dir: 'ltr',
        categories: ['health', 'lifestyle', 'wellness', 'meditation'],
        prefer_related_applications: false,
        edge_side_panel: {
          preferred_width: 480
        },
        icons: [
          {
            src: '/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Meditasi Cepat',
            short_name: 'Meditasi',
            description: 'Mulai sesi meditasi 5 menit',
            url: '/meditation?quick=true',
            icons: [{ src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' }]
          },
          {
            name: 'Latihan Pernapasan',
            short_name: 'Pernapasan',
            description: 'Latihan pernapasan 3 menit',
            url: '/breathing?quick=true',
            icons: [{ src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' }]
          }
        ]
      }
    })
  ],
  build: {
    target: 'es2020',
    minify: 'esbuild', // Faster than terser
    sourcemap: false,
    cssCodeSplit: false, // Disable CSS splitting for faster builds
    assetsInlineLimit: 8192,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // Simplified chunking strategy
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['lucide-react', 'react-router-dom']
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    reportCompressedSize: false // Disable to speed up builds
  },
  server: {
    host: true,
    port: 3000
  },
  preview: {
    host: true,
    port: 4173
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none'
  }
})