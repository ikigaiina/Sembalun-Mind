import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  const isProd = mode === 'production'
  
  return {
  plugins: [
    react(),
    // Bundle analyzer (production builds only)
    ...(isProd ? [visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap'
    })] : []),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-180.png', 'icon-192.svg', 'icon-512.svg', 'vite.svg'],
      devOptions: {
        enabled: false
      },
      mode: isProd ? 'production' : 'development',
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,mp3,wav,ogg}'],
        maximumFileSizeToCacheInBytes: 5000000, // Increased for audio files
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/manifest\.(json|webmanifest)$/, /^\/sw\.js$/, /^\/registerSW\.js$/],
        runtimeCaching: [
          // Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          
          // Audio files
          {
            urlPattern: /\.(?:mp3|wav|ogg|flac|m4a)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          },
          // Images
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          },
          // API calls
          {
            urlPattern: /^https:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24
              },
              networkTimeoutSeconds: 3
            }
          }
        ]
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
    target: 'es2020', // Better compatibility while maintaining performance
    minify: isProd ? 'terser' : false, // Only minify in production
    sourcemap: isDev, // Enable sourcemaps in development
    cssCodeSplit: true,
    // Performance optimizations
    assetsInlineLimit: 4096, // Inline small assets as base64
    chunkSizeWarningLimit: 1500, // Increased for complex app
    rollupOptions: {
      treeshake: {
        preset: 'recommended',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
      },
      output: {
        // Advanced manual chunking strategy for optimal loading
        manualChunks: (id: string) => {
          // Core React ecosystem (Critical path - load first)
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-core'
          }
          if (id.includes('react-router')) {
            return 'react-router'
          }

          

          // Feature-based chunking for better code splitting
          
          // Authentication feature
          if (id.includes('src/components/auth') || 
              id.includes('src/contexts/AuthContext') ||
              id.includes('src/services/authService') ||
              id.includes('src/hooks/useAuth')) {
            return 'feature-auth'
          }

          // Audio/Media feature (large multimedia chunk)
          if (id.includes('src/services/audioService') ||
              id.includes('src/services/audioCacheService') ||
              id.includes('src/services/audioBookmarkService') ||
              id.includes('src/services/textToSpeechService') ||
              id.includes('src/components/ui/AudioPlayer') ||
              id.includes('src/components/ui/EnhancedAudioPlayer') ||
              id.includes('src/hooks/useBackgroundAudio')) {
            return 'feature-audio'
          }

          // Content and courses feature
          if (id.includes('src/services/contentDatabase') ||
              id.includes('src/services/courseService') ||
              id.includes('src/services/siyContentService') ||
              id.includes('src/components/ui/CoursePlayer') ||
              id.includes('src/components/ui/ContentLibrary') ||
              id.includes('src/components/ui/SIYModulePlayer')) {
            return 'feature-content'
          }

          // Progress tracking and analytics
          if (id.includes('src/services/userProgressService') ||
              id.includes('src/services/progressService') ||
              id.includes('src/services/achievementService') ||
              id.includes('src/services/habitAnalyticsService') ||
              id.includes('src/components/analytics')) {
            return 'feature-progress'
          }

          // Offline functionality
          if (id.includes('src/services/offlineStorageService') ||
              id.includes('src/services/offlineSyncService') ||
              id.includes('src/services/sessionDownloadService') ||
              id.includes('src/contexts/OfflineContext') ||
              id.includes('src/hooks/useOffline')) {
            return 'feature-offline'
          }

          // Meditation and breathing features
          if (id.includes('src/pages/Meditation') ||
              id.includes('src/pages/BreathingSession') ||
              id.includes('src/components/ui/BreathingGuide') ||
              id.includes('src/components/ui/MeditationTimer') ||
              id.includes('src/utils/breathingPatterns')) {
            return 'feature-meditation'
          }

          // Onboarding flow (can be lazy loaded)
          if (id.includes('src/pages/onboarding') ||
              id.includes('src/components/onboarding') ||
              id.includes('src/contexts/OnboardingContext')) {
            return 'feature-onboarding'
          }

          // Account management (less frequently used)
          if (id.includes('src/components/account') ||
              id.includes('src/pages/Profile') ||
              id.includes('src/pages/Settings')) {
            return 'feature-account'
          }

          // Admin and multiagent (rarely used)
          if (id.includes('src/components/admin') ||
              id.includes('src/components/multiagent') ||
              id.includes('src/services/multiagentTaskService') ||
              id.includes('src/services/multiagentAgentService')) {
            return 'feature-admin'
          }

          // Core UI components (shared across features)
          if (id.includes('src/components/ui') && 
              !id.includes('AudioPlayer') && 
              !id.includes('CoursePlayer') &&
              !id.includes('SIYModulePlayer')) {
            return 'ui-shared'
          }

          // Utility services (small, frequently used)
          if (id.includes('src/services/notesService') ||
              id.includes('src/services/bookmarkService') ||
              id.includes('src/services/cairnService') ||
              id.includes('src/utils/analytics') ||
              id.includes('src/utils/recommendations')) {
            return 'utils-core'
          }

          // Large vendor libraries
          if (id.includes('node_modules')) {
            // Group smaller libraries together
            const smallLibs = ['date-fns', 'lodash', 'uuid', 'classnames', 'clsx'];
            if (smallLibs.some(lib => id.includes(lib))) {
              return 'vendor-utils'
            }
            // Keep large libraries separate
            return 'vendor-libs'
          }

          // Default chunk for remaining modules
          return 'app-core'
        },
        chunkFileNames: () => {
          return `js/[name]-[hash].js`
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return `assets/[name]-[hash][extname]`
          const info = assetInfo.name.split('.')
          const extType = info[info.length - 1]
          if (/\.(mp3|wav|ogg|flac)$/i.test(assetInfo.name)) {
            return `audio/[name]-[hash][extname]`
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash][extname]`
          }
          if (extType === 'css') {
            return `css/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        }
      }
    },
    reportCompressedSize: false, // Disabled for faster builds
    // Enhanced Terser configuration for maximum compression
    terserOptions: {
      compress: {
        arguments: true,
        drop_console: isProd,
        drop_debugger: isProd,
        pure_funcs: isProd ? ['console.log', 'console.info', 'console.debug', 'console.warn'] : [],
        passes: 1, // Reduced for faster builds
        unsafe_arrows: true,
        unsafe_methods: true,
        unsafe_proto: true
      },
      mangle: {
        safari10: true,
        properties: {
          regex: /^_/
        }
      },
      format: {
        comments: false
      }
    },
  },
  server: {
    host: true,
    port: 3000
  },
  preview: {
    host: true,
    port: 4173
  },
  // Environment-specific optimizations
  define: {
    __DEV__: isDev,
    __PROD__: isProd,
    'process.env.NODE_ENV': JSON.stringify(mode)
  },
  // Development-specific optimizations
  ...(isDev && {
    build: {
      sourcemap: true,
      minify: false,
      rollupOptions: {
        output: {
          manualChunks: undefined // Disable chunking in development for faster builds
        }
      }
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        
      ],
      exclude: ['@vite/env']
    }
  }),
  // Production-specific optimizations
  ...(isProd && {
    esbuild: {
      drop: ['console', 'debugger'],
      legalComments: 'none'
    }
  })
}})
