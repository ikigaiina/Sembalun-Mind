/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/**/*.{ts,tsx}',
      ],
      exclude: [
        'src/**/*.d.ts',
        'src/test/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'node_modules/',
        '**/*.config.*',
        'dist/',
        'build/'
      ],
      // Coverage thresholds for Indonesian meditation platform
      thresholds: {
        global: {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75,
        },
        // Higher thresholds for critical Indonesian cultural components
        'src/components/cultural/**/*.{ts,tsx}': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        // Accessibility components require high coverage
        'src/components/ui/**/*.{ts,tsx}': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    
    // Test timeouts optimized for Indonesian testing
    testTimeout: 15000,
    hookTimeout: 15000,
    
    // Include Indonesian cultural tests
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    
    // Exclude node_modules and build outputs
    exclude: [
      'node_modules',
      'dist',
      '.next',
      '.nuxt',
      '.vercel',
      '.output',
      '**/coverage/**',
    ],
    
    // Indonesian localization and cultural test support
    env: {
      VITE_TEST_ENVIRONMENT: 'testing',
      VITE_CULTURAL_VALIDATION: 'enabled',
      VITE_ACCESSIBILITY_TESTING: 'strict',
      VITE_INDONESIAN_LOCALE: 'id-ID',
    },
    
    // Disable CSS processing for performance
    css: false,
    
    // Reporters optimized for CI/CD
    reporter: [
      'verbose',
      'json',
      'html',
      ['junit', { outputFile: 'test-results.xml' }],
    ],
    outputFile: {
      json: 'test-results.json',
      html: 'test-results.html',
    },
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@services': resolve(__dirname, 'src/services'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@types': resolve(__dirname, 'src/types'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@cultural': resolve(__dirname, 'src/components/cultural'),
      '@test': resolve(__dirname, 'src/test'),
    },
  },
  
  // Ensure consistent build behavior in testing
  define: {
    __INDONESIAN_BUILD__: JSON.stringify(true),
    __CULTURAL_VALIDATION__: JSON.stringify(true),
    __ACCESSIBILITY_MODE__: JSON.stringify('strict'),
  },
})