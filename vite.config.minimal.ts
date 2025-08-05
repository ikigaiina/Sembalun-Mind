import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Absolute minimal config for debugging build issues
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    minify: false, // Disable minification for debugging
    sourcemap: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: undefined // Disable chunking completely
      }
    },
    reportCompressedSize: false,
    chunkSizeWarningLimit: 5000
  },
  server: {
    host: true,
    port: 3000
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
})