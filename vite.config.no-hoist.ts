import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// ULTRA-CONSERVATIVE CONFIGURATION TO ELIMINATE ALL HOISTING ISSUES
// This configuration prioritizes correctness over bundle size
// Bundle size may be 10MB+ but will work without ReferenceErrors

export default defineConfig({
  plugins: [
    react({
      // Ultra-safe React configuration - NO transformations that could hoist
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      fastRefresh: false, // Completely disabled to prevent any hoisting
      
      // NO BABEL TRANSFORMATIONS - Babel can cause hoisting issues
      babel: {
        compact: false, // Never compact code
        minified: false, // Never minify via Babel
        comments: true, // Preserve all comments
        retainLines: true, // Keep exact line structure
        
        // Most conservative assumptions possible
        assumptions: {
          setPublicClassFields: false,
          privateFieldsAsProperties: false,
          constantSuper: false,
          noDocumentAll: false,
          noNewArrows: false,
          noClassCalls: false,
          ignoreFunctionLength: false,
          ignoreToPrimitiveHint: false,
          objectRestNoSymbols: false,
          pureGetters: false,
          setComputedProperties: false,
          skipForOfIteratorClosing: false,
          superIsCallableConstructor: false
        },
        
        // NO presets or plugins that could cause hoisting
        presets: [],
        plugins: []
      }
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-180.png', 'icon-192.svg', 'icon-512.svg'],
      devOptions: {
        enabled: false
      },
      workbox: {
        // Conservative glob patterns - no complex bundling
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 50000000, // 50MB - accommodate large unminified bundles
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
    // MOST CONSERVATIVE BUILD TARGET - older JavaScript for maximum compatibility
    target: ['es2015'], // ES2015 avoids many modern hoisting optimizations
    
    // CRITICAL: NO MINIFICATION WHATSOEVER
    minify: false, // COMPLETELY DISABLED - no minification at all
    
    // ALWAYS include sourcemaps for debugging
    sourcemap: true,
    
    // NO CSS code splitting - single CSS bundle
    cssCodeSplit: false,
    
    // NEVER inline assets - keep everything separate
    assetsInlineLimit: 0,
    
    // No chunk size warnings - we accept large bundles
    chunkSizeWarningLimit: 50000, // 50MB chunks are acceptable
    
    rollupOptions: {
      // CRITICAL: DISABLE ALL TREE SHAKING AND OPTIMIZATIONS
      treeshake: false, // COMPLETELY DISABLED - no tree shaking at all
      
      // CRITICAL: Prevent any hoisting or reordering
      makeAbsoluteExternalsRelative: false,
      preserveEntrySignatures: 'strict', // Preserve exact entry signatures
      preserveSymlinks: true, // Don't resolve symlinks
      
      // Single entry point to avoid complex chunking
      input: {
        main: 'index.html'
      },
      
      output: {
        // CRITICAL: NO MANUAL CHUNKING - everything in one bundle if possible
        manualChunks: undefined, // Single bundle - no chunking at all
        
        // CRITICAL: DISABLE ALL HOISTING AND OPTIMIZATIONS
        hoistTransitiveImports: false, // NEVER hoist imports
        minifyInternalExports: false, // NEVER minify exports
        preserveModules: false, // Don't preserve ES modules
        
        // MOST CONSERVATIVE CODE GENERATION
        generatedCode: {
          preset: 'es5', // Use ES5 preset for maximum safety
          arrowFunctions: false, // NO arrow functions (use regular functions)
          constBindings: false, // NO const/let - only var declarations
          objectShorthand: false, // NO object shorthand syntax
          reservedNamesAsProps: true, // Handle reserved names safely
          symbols: false // NO symbols
        },
        
        // File naming and structure preservation handled above
        
        // Simple file naming - no complex hashing
        chunkFileNames: 'js/chunk.js',
        entryFileNames: 'js/entry.js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/asset[extname]';
          const ext = assetInfo.name.split('.').pop();
          if (ext === 'css') return 'css/[name].css';
          if (/^(png|jpe?g|gif|svg|ico|webp)$/i.test(ext)) return 'images/[name][extname]';
          if (/^(mp3|wav|ogg|m4a|flac)$/i.test(ext)) return 'audio/[name][extname]';
          return 'assets/[name][extname]';
        },
        
        // CRITICAL: SAFEST OUTPUT FORMAT
        format: 'iife', // Use IIFE format for maximum compatibility and safety
        name: 'SembalunMind', // Global variable name for IIFE
        
        // NEVER compact or optimize output
        compact: false, // Keep code readable and uncompacted
        indent: '  ', // Preserve indentation for debugging
        
        // CRITICAL: DISABLE STRICT MODE TO AVOID TDZ ISSUES
        strict: false, // NO strict mode - avoid temporal dead zone issues
        freeze: false, // Don't freeze objects
        
        // NO variable reordering or optimization
        interop: 'auto', // Handle interop safely
        externalLiveBindings: false, // Disable live bindings
        inlineDynamicImports: true, // Inline dynamic imports to avoid lazy loading issues
        
        // Preserve all exports and imports as-is
        exports: 'auto',
        dynamicImportInCjs: false
      },
      
      // DISABLE all external optimizations
      external: [], // No external dependencies
      
      // Rollup plugin options - minimal processing
      plugins: [],
      
      // Input options - conservative settings
      context: 'window', // Use window context for browser
      moduleContext: {}, // No module context transformations
      
      // CRITICAL: No experimental features
      experimentalCacheExpiry: 0,
      experimentalLogSideEffects: false
    },
    
    // Disable size reporting for faster builds
    reportCompressedSize: false,
    
    // Conservative output directory
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    
    // CRITICAL: Copy all public files as-is
    copyPublicDir: true
  },
  
  // Environment variables for debugging builds
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.DEBUG': '"true"',
    global: 'window', // Use window instead of globalThis
    
    // Disable all React optimizations that could cause hoisting
    '__REACT_DEVTOOLS_GLOBAL_HOOK__': 'undefined',
    'globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__': 'undefined',
    '__DEV__': 'false',
    '__PROD__': 'true'
  },
  
  // CRITICAL: NO ESBUILD TRANSFORMATIONS AT ALL
  esbuild: false, // COMPLETELY DISABLED - no esbuild processing
  
  // CRITICAL: NO DEPENDENCY OPTIMIZATION
  optimizeDeps: {
    // Don't pre-bundle anything - use dependencies as-is
    include: [], // No forced includes
    exclude: ['*'], // Exclude everything from optimization
    
    // Disable esbuild for dependency optimization
    esbuildOptions: {
      target: 'es5',
      keepNames: true,
      treeShaking: false,
      minify: false,
      minifyIdentifiers: false,
      minifySyntax: false,
      minifyWhitespace: false
    },
    
    // Force no bundling
    force: false,
    holdUntilCrawlEnd: false
  },
  
  // CSS processing - minimal
  css: {
    devSourcemap: true,
    preprocessorOptions: {},
    modules: false,
    postcss: undefined, // No PostCSS processing
    transformer: 'postcss', // Use PostCSS but don't optimize
    lightningcss: undefined // No Lightning CSS
  },
  
  // JSON processing - no transformations
  json: {
    namedExports: false,
    stringify: false
  },
  
  // Server configuration for development
  server: {
    host: true,
    port: 3000,
    strictPort: false,
    hmr: false, // Disable HMR to avoid hoisting issues
    watch: {
      usePolling: true
    }
  },
  
  preview: {
    host: true,
    port: 4173,
    strictPort: false
  },
  
  // Worker configuration - ultra-safe
  worker: {
    format: 'iife',
    plugins: () => [], // Function returning empty array
    rollupOptions: {
      treeshake: false,
      output: {
        format: 'iife',
        compact: false,
        hoistTransitiveImports: false,
        minifyInternalExports: false,
        generatedCode: {
          preset: 'es5',
          constBindings: false,
          arrowFunctions: false
        }
      }
    }
  },
  
  // DISABLE all experimental features that might cause hoisting
  experimental: {
    renderBuiltUrl: undefined
  },
  
  // Legacy options for maximum compatibility
  legacy: {
    buildSsrCjsExternalHeuristics: false,
    buildRollupPluginCommonjs: undefined
  },
  
  // Environment handling - conservative
  envPrefix: 'VITE_',
  envDir: process.cwd(),
  
  // Build context
  mode: 'production',
  base: '/',
  publicDir: 'public',
  cacheDir: 'node_modules/.vite',
  
  // Logging
  logLevel: 'info',
  clearScreen: true,
  
  // App type
  appType: 'spa'
})