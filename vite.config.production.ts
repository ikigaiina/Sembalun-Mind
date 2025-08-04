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
        clientsClaim: true
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
        categories: ['health', 'lifestyle', 'wellness', 'meditation'],
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
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
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