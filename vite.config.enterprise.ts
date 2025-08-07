import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

// Enterprise production configuration for 10,000+ concurrent users
export default defineConfig({
  plugins: [
    react({
      // React optimizations for production
      babel: {
        plugins: [
          // Remove PropTypes in production
          ['babel-plugin-transform-remove-prop-types', { removeImport: true }],
          // Dead code elimination
          ['babel-plugin-transform-remove-dead-code']
        ]
      }
    }),
    
    // Advanced PWA configuration for enterprise scale
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Aggressive caching strategy
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff,woff2,mp3,wav,ogg,webp}',
          '**/audio/**/*',
          '**/images/**/*'
        ],
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // 50MB for audio files
        
        // Enhanced runtime caching for enterprise performance
        runtimeCaching: [
          // API caching with network-first strategy
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 300 // 5 minutes
              },
              networkTimeoutSeconds: 3,
              cacheKeyWillBeUsed: async ({ request }) => {
                // Custom cache key for authenticated requests
                const url = new URL(request.url);
                return `${url.pathname}${url.search}`;
              }
            }
          },
          
          // Audio files with cache-first strategy
          {
            urlPattern: /^https:\/\/.*\.(mp3|wav|ogg|m4a|flac)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'meditation-audio-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
              }
            }
          },
          
          // Supabase Storage with stale-while-revalidate
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-storage-cache',
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 24 * 60 * 60 // 1 day
              }
            }
          },
          
          // Google Fonts optimization
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
              }
            }
          },
          
          // Font files
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
              }
            }
          }
        ],
        
        // Service worker optimizations
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        
        // Advanced navigation handling
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/api\//, 
          /^\/auth\//, 
          /^\/manifest\.(json|webmanifest)$/, 
          /^\/sw\.js$/, 
          /^\/registerSW\.js$/,
          /^\/robots\.txt$/,
          /^\/sitemap\.xml$/
        ]
      },
      
      // Enhanced PWA manifest for enterprise features
      manifest: {
        name: 'Sembalun - Enterprise Meditation Platform',
        short_name: 'Sembalun',
        description: 'Enterprise-grade Indonesian meditation platform with advanced analytics and real-time features',
        theme_color: '#6A8F6F',
        background_color: '#E1E8F0',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        lang: 'id-ID',
        dir: 'ltr',
        
        // Enterprise PWA categories
        categories: ['health', 'lifestyle', 'wellness', 'meditation', 'business', 'productivity'],
        
        // Enhanced PWA features
        prefer_related_applications: false,
        edge_side_panel: {
          preferred_width: 480
        },
        
        // High-resolution icons for all platforms
        icons: [
          {
            src: '/icon-72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        
        // Enterprise shortcuts for power users
        shortcuts: [
          {
            name: 'Guided Meditation',
            short_name: 'Meditate',
            description: 'Start a guided meditation session',
            url: '/meditation?type=guided',
            icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }]
          },
          {
            name: 'Breathing Exercise',
            short_name: 'Breathe',
            description: 'Quick breathing exercise',
            url: '/breathing?quick=true',
            icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }]
          },
          {
            name: 'Progress Dashboard',
            short_name: 'Progress',
            description: 'View meditation progress and insights',
            url: '/analytics',
            icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }]
          },
          {
            name: 'Offline Sessions',
            short_name: 'Offline',
            description: 'Access downloaded meditation content',
            url: '/offline',
            icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }]
          }
        ]
      },
      
      // Development options for testing
      devOptions: {
        enabled: false,
        type: 'module'
      }
    }),
    
    // Bundle analyzer for performance optimization
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap'
    })
  ],
  
  // Enterprise build configuration
  build: {
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13'],
    minify: 'terser',
    sourcemap: false, // Disabled for security in production
    
    // Performance optimizations
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,
    
    // Enhanced Terser configuration for maximum compression
    terserOptions: {
      compress: {
        arguments: true,
        dead_code: true,
        drop_console: true,
        drop_debugger: true,
        passes: 2, // Multiple passes for better compression
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        unsafe_arrows: true,
        unsafe_methods: true,
        unused: true
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
    
    rollupOptions: {
      // Advanced manual chunking for optimal loading performance
      output: {
        manualChunks: (id: string) => {
          // Vendor libraries
          if (id.includes('node_modules')) {
            // React ecosystem (critical path)
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            if (id.includes('react-router')) {
              return 'router-vendor'
            }
            
            // Supabase (authentication critical)
            if (id.includes('@supabase/')) {
              return 'supabase-vendor'
            }
            
            // UI and visualization
            if (id.includes('lucide-react') || id.includes('recharts')) {
              return 'ui-vendor'
            }
            
            // Large individual libraries
            if (id.includes('date-fns') || id.includes('lodash')) {
              return 'utils-vendor'
            }
            
            return 'vendor-libs'
          }
          
          // Feature-based chunking for lazy loading
          if (id.includes('src/pages/')) {
            // Admin and analytics (rarely used)
            if (id.includes('Admin') || id.includes('Analytics') || id.includes('Multiagent')) {
              return 'admin-features'
            }
            
            // Core meditation features (frequently used)
            if (id.includes('Meditation') || id.includes('Breathing') || id.includes('Dashboard')) {
              return 'core-features'
            }
            
            // User management features
            if (id.includes('Profile') || id.includes('Settings') || id.includes('Account')) {
              return 'user-features'
            }
            
            // Content and courses
            if (id.includes('Content') || id.includes('Courses') || id.includes('Explore')) {
              return 'content-features'
            }
            
            // Onboarding (one-time use)
            if (id.includes('onboarding') || id.includes('Onboarding')) {
              return 'onboarding-features'
            }
          }
          
          // Service and context chunking
          if (id.includes('src/services/')) {
            if (id.includes('supabase') || id.includes('auth')) {
              return 'auth-services'
            }
            if (id.includes('audio') || id.includes('media')) {
              return 'media-services'
            }
            if (id.includes('offline') || id.includes('cache')) {
              return 'offline-services'
            }
            return 'app-services'
          }
          
          // UI components
          if (id.includes('src/components/ui/')) {
            return 'ui-components'
          }
          
          // Contexts and hooks
          if (id.includes('src/contexts/') || id.includes('src/hooks/')) {
            return 'app-state'
          }
          
          return 'app-core'
        },
        
        // Optimized file naming for caching
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name;
          return `js/${name}-[hash].js`
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash][extname]'
          
          const info = assetInfo.name.split('.')
          const extType = info[info.length - 1]
          
          // Organize by asset type for CDN optimization
          if (/\.(mp3|wav|ogg|flac|m4a)$/i.test(assetInfo.name)) {
            return 'audio/[name]-[hash][extname]'
          }
          if (/\.(png|jpe?g|svg|gif|webp|avif|ico)$/i.test(assetInfo.name)) {
            return 'images/[name]-[hash][extname]'
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return 'fonts/[name]-[hash][extname]'
          }
          if (extType === 'css') {
            return 'css/[name]-[hash][extname]'
          }
          
          return 'assets/[name]-[hash][extname]'
        }
      }
    },
    
    // Report compressed size for performance monitoring
    reportCompressedSize: true
  },
  
  // Server configuration for development
  server: {
    host: true,
    port: 3000,
    cors: true
  },
  
  // Preview server configuration
  preview: {
    host: true,
    port: 4173,
    cors: true
  },
  
  // Environment variable configuration
  define: {
    'process.env.NODE_ENV': '"production"',
    '__DEV__': 'false',
    '__PROD__': 'true'
  },
  
  // ESBuild optimizations
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none',
    treeShaking: true
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'lucide-react'
    ],
    exclude: ['@vite/env']
  }
})