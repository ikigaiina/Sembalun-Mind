import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Ultra-safe deployment configuration to prevent variable hoisting issues
export default defineConfig({
  plugins: [
    react({
      // Safer React configuration to prevent hoisting issues
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      // Disable React Fast Refresh in production to avoid hoisting issues
      fastRefresh: false,
      // More conservative Babel configuration
      babel: {
        compact: false, // Preserve code structure to avoid hoisting
        minified: false, // Disable Babel minification
        assumptions: {
          // Conservative assumptions to prevent variable hoisting
          setPublicClassFields: false,
          privateFieldsAsProperties: false,
          constantSuper: false,
          noDocumentAll: false,
          noNewArrows: false
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
        // Fixed glob pattern
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 5000000, // Increased to 5MB for safer bundling
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
    // Safer build target to prevent hoisting issues
    target: ['es2020', 'chrome80', 'firefox78', 'safari14', 'edge88'],
    // Enable safer minification for production
    minify: 'esbuild', // Use ESBuild minifier (safer than Terser for hoisting issues)
    // Always include sourcemaps for debugging
    sourcemap: true,
    // Disable CSS code splitting to prevent load order issues
    cssCodeSplit: false,
    // Conservative asset inline limit
    assetsInlineLimit: 4096,
    // Conservative chunk size warning
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      // Prevent aggressive tree shaking that can cause hoisting
      treeshake: {
        preset: 'safest', // Use safest preset to prevent hoisting
        moduleSideEffects: true, // Preserve side effects to maintain execution order
        propertyReadSideEffects: true, // Preserve property access side effects
        tryCatchDeoptimization: true, // Preserve try-catch structure
        unknownGlobalSideEffects: true // Be conservative about global side effects
      },
      
      // Override with ultra-safe configuration
      makeAbsoluteExternalsRelative: false,
      preserveEntrySignatures: 'strict', // Preserve entry signatures to maintain order
      
      // Input configuration
      input: {
        main: 'index.html'
      },
      
      output: {
        // CRITICAL: Safe manual chunking to reduce bundle size while preventing hoisting
        manualChunks: {
          // Core React (essential, load first)
          'react-core': ['react', 'react-dom'],
          // Router (feature chunk)
          'react-router': ['react-router-dom'],
          // Large UI libraries
          'ui-heavy': ['framer-motion'],
          // Utility libraries  
          'ui-utils': ['lucide-react', 'clsx', 'class-variance-authority', 'tailwind-merge']
        },
        
        // Ultra-safe output options to preserve execution order
        hoistTransitiveImports: false, // Prevent import hoisting
        minifyInternalExports: false, // Preserve export names
        generatedCode: {
          preset: 'es2015', // Use older preset for better compatibility
          arrowFunctions: false, // Avoid arrow functions that can be hoisted
          constBindings: false, // Use var instead of const to avoid TDZ
          objectShorthand: false, // Avoid object shorthand that can be hoisted
          symbols: false, // Disable symbols to avoid hoisting issues
        },
        
        // Preserve variable names and structure
        preserveModules: false,
        preserveModulesRoot: undefined,
        
        // Conservative file naming
        chunkFileNames: (chunkInfo) => {
          // Simple naming to avoid complex chunking
          return 'js/chunk-[hash].js';
        },
        entryFileNames: 'js/entry-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/asset-[hash][extname]';
          const ext = assetInfo.name.split('.').pop();
          if (/^(css)$/i.test(ext)) return 'css/[name]-[hash].css';
          if (/^(png|jpe?g|gif|svg|ico|webp)$/i.test(ext)) return 'images/[name]-[hash][extname]';
          if (/^(mp3|wav|ogg|m4a|flac)$/i.test(ext)) return 'audio/[name]-[hash][extname]';
          return 'assets/[name]-[hash][extname]';
        },
        
        // CRITICAL: Safer variable handling to prevent "Cannot access before initialization"  
        strict: false, // Disable strict mode that can cause TDZ issues
        freeze: false, // Don't freeze objects to avoid hoisting issues
        
        // Output format optimized for safety
        format: 'es',
        indent: '  ', // Preserve indentation for better debugging
        compact: false // Don't compact code to preserve structure
      }
    },
    // Disable size reporting for faster builds
    reportCompressedSize: false,
    
    // Conservative output directory
    outDir: 'dist',
    emptyOutDir: true,
    
    // Asset handling
    assetsDir: 'assets'
  },
  
  // Environment variables for safer builds
  define: {
    'process.env.NODE_ENV': '"production"',
    global: 'globalThis',
    // Disable React DevTools to prevent hoisting issues
    '__REACT_DEVTOOLS_GLOBAL_HOOK__': 'undefined',
    'globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__': 'undefined'
  },
  
  // ESBuild configuration for safer transformation
  esbuild: {
    // Ultra-conservative ESBuild settings to prevent hoisting
    target: 'es2020',
    format: 'esm',
    platform: 'browser',
    
    // Conservative optimizations that prevent hoisting
    treeShaking: true, // Enable tree shaking but with conservative settings
    minify: true, // Enable minification for smaller bundles
    minifyIdentifiers: true, // Safe identifier minification
    minifySyntax: false, // Disable syntax minification to prevent hoisting
    minifyWhitespace: true,
    
    // Preserve all names and structure
    keepNames: true,
    mangleProps: undefined,
    mangleQuoted: false,
    mangleCache: undefined,
    
    // Preserve legal comments and structure
    legalComments: 'inline',
    sourcemap: true,
    sourceRoot: '',
    sourcesContent: true,
    
    // Disable drops that can cause hoisting
    drop: [], // Don't drop anything to maintain execution order
    dropLabels: [],
    
    // Conservative JSX handling
    jsx: 'automatic',
    jsxDev: false,
    jsxFactory: undefined,
    jsxFragment: undefined,
    jsxImportSource: 'react',
    jsxSideEffects: true, // Preserve JSX side effects
    
    // Preserve original code structure
    charset: 'utf8',
    tsconfigRaw: undefined,
    
    // Banner to ensure proper initialization order
    banner: `/* Sembalun Mind - Safe Build Configuration */`,
    footer: `/* End Safe Build */`
  },
  
  // Additional safety configurations
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
  
  // Optimization dependencies to prevent hoisting issues
  optimizeDeps: {
    // Force pre-bundling of critical dependencies to prevent hoisting
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'scheduler/tracing'
    ],
    // Exclude problematic packages
    exclude: [
      '@vite/client',
      '@vite/env'
    ],
    // ESBuild options for dependency optimization  
    esbuildOptions: {
      target: 'es2020',
      keepNames: true,
      treeShaking: false,
      minifyIdentifiers: false,
      minifySyntax: false
    }
  },
  
  // Prevent any CSS/Asset processing that might cause hoisting
  css: {
    devSourcemap: true,
    preprocessorOptions: {},
    modules: false,
    postcss: undefined // Let PostCSS handle this if configured
  },
  
  // Worker configuration to prevent hoisting issues
  worker: {
    format: 'es',
    plugins: () => [], // Function that returns array of plugins
    rollupOptions: {
      treeshake: false,
      output: {
        hoistTransitiveImports: false
      }
    }
  },
  
  // Disable experimental features that might cause hoisting
  experimental: {
    renderBuiltUrl: undefined
  }
})