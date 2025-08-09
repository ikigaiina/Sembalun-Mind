import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Production-optimized deployment configuration with safer bundling
// This configuration enables minification while preventing hoisting issues
export default defineConfig({
  plugins: [
    react({
      // Production React configuration with safe bundling
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      fastRefresh: false, // Disabled in production
      babel: {
        compact: true, // Enable compaction for smaller bundles
        minified: true, // Enable Babel minification
        assumptions: {
          // Safe assumptions that don't cause hoisting
          setPublicClassFields: true,
          privateFieldsAsProperties: false,
          constantSuper: true,
          noDocumentAll: true,
          noNewArrows: false // Keep arrow functions safe
        }
      }
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-180.png', 'icon-192.svg', 'icon-512.svg'],
      devOptions: {
        enabled: false
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 3000000,
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/manifest\.(json|webmanifest)$/, /^\/sw\.js$/, /^\/registerSW\.js$/]
      },
      manifest: {
        name: 'Sembalun Mind',
        short_name: 'Sembalun',
        description: 'Indonesian Meditation App with Cultural Wisdom',
        theme_color: '#6A8F6F',
        background_color: '#E1E8F0',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'id-ID',
        categories: ['health', 'lifestyle', 'wellness'],
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
    // Safer build target for production
    target: ['es2020', 'chrome80', 'firefox78', 'safari14', 'edge88'],
    
    // Enable minification with safer options
    minify: 'esbuild', // Use ESBuild for safer minification than Terser
    
    // Enable sourcemaps for debugging in production
    sourcemap: true,
    
    // Conservative CSS code splitting
    cssCodeSplit: true,
    
    // Reasonable asset limits
    assetsInlineLimit: 8192,
    chunkSizeWarningLimit: 1500,
    
    rollupOptions: {
      // Conservative tree shaking to prevent hoisting
      treeshake: {
        preset: 'recommended', // Balanced between safety and optimization
        moduleSideEffects: true, // Preserve side effects
        propertyReadSideEffects: true, // Preserve property access side effects
        tryCatchDeoptimization: true, // Preserve try-catch structure
        unknownGlobalSideEffects: false // Allow some optimization for globals
      },
      
      // Entry configuration
      input: {
        main: 'index.html'
      },
      
      output: {
        // Safe chunking strategy
        manualChunks: {
          // Core React (critical path - separate chunk)
          'react-core': ['react', 'react-dom'],
          // Router (feature chunk)
          'react-router': ['react-router-dom'],
          // UI libraries (shared chunk) 
          'ui-libs': ['lucide-react', 'framer-motion'],
          // Utilities (small chunk)
          'utils': ['clsx', 'class-variance-authority', 'tailwind-merge']
        },
        
        // Safe output options
        hoistTransitiveImports: false, // Prevent import hoisting
        minifyInternalExports: false, // Preserve export names for debugging
        
        // Conservative code generation
        generatedCode: {
          preset: 'es2015',
          arrowFunctions: true, // Safe to use in production
          constBindings: false, // Use var to avoid TDZ
          objectShorthand: true, // Safe for modern browsers
          symbols: false // Avoid symbols for broader compatibility
        },
        
        // File naming with optimization
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/entry-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/asset-[hash][extname]';
          const ext = assetInfo.name.split('.').pop();
          if (/^(css)$/i.test(ext)) return 'css/[name]-[hash].css';
          if (/^(png|jpe?g|gif|svg|ico|webp)$/i.test(ext)) return 'images/[name]-[hash][extname]';
          if (/^(mp3|wav|ogg|m4a|flac)$/i.test(ext)) return 'audio/[name]-[hash][extname]';
          return 'assets/[name]-[hash][extname]';
        },
        
        // Production output format
        format: 'es',
        compact: true, // Enable compaction for smaller files
        
        // Safe variable handling in production
        strict: false, // Avoid strict mode TDZ issues
        freeze: false, // Don't freeze objects
        namespaceToStringTag: false // Disable namespace toString
      }
    },
    
    // Enable size reporting for optimization insights
    reportCompressedSize: true,
    
    // Output configuration
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets'
  },
  
  // Environment variables
  define: {
    'process.env.NODE_ENV': '"production"',
    global: 'globalThis',
    '__REACT_DEVTOOLS_GLOBAL_HOOK__': 'undefined',
    'globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__': 'undefined'
  },
  
  // ESBuild configuration for safer production minification
  esbuild: {
    target: 'es2020',
    format: 'esm',
    platform: 'browser',
    
    // Safe minification options
    minify: true,
    minifyIdentifiers: true, // Safe to minify identifiers in production
    minifySyntax: true, // Safe syntax minification
    minifyWhitespace: true,
    
    // Preserve critical names to avoid hoisting issues
    keepNames: false, // Allow name minification for smaller bundles
    
    // Conservative drops for production
    drop: ['console', 'debugger'], // Remove console logs and debuggers
    dropLabels: [],
    
    // JSX configuration
    jsx: 'automatic',
    jsxImportSource: 'react',
    jsxSideEffects: false, // Allow JSX optimization
    
    // Legal comments handling
    legalComments: 'none', // Remove legal comments for smaller bundles
    sourcemap: true,
    
    // Tree shaking configuration
    treeShaking: true, // Enable tree shaking for smaller bundles
    
    // Banner for production identification
    banner: {
      js: `/* Sembalun Mind Production Build */`
    }
  },
  
  // Server configuration
  server: {
    host: true,
    port: 3000,
    strictPort: false
  },
  
  preview: {
    host: true,
    port: 4173,
    strictPort: false
  },
  
  // Optimized dependency pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom'
    ],
    exclude: [
      '@vite/client',
      '@vite/env'
    ],
    esbuildOptions: {
      target: 'es2020',
      keepNames: false, // Allow name minification for deps
      treeShaking: true,
      minifyIdentifiers: true,
      minifySyntax: true
    }
  },
  
  // CSS configuration
  css: {
    devSourcemap: false, // Disable CSS sourcemaps in production
    preprocessorOptions: {},
    modules: false
  },
  
  // Worker configuration
  worker: {
    format: 'es',
    plugins: [],
    rollupOptions: {
      output: {
        format: 'es',
        compact: true
      }
    }
  }
})