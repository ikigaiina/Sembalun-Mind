import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'Sembalun - Indonesian Meditation App',
        short_name: 'Sembalun',
        description: 'A calm, mindful Indonesian meditation experience with cairn progress tracking',
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
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Meditasi Cepat',
            short_name: 'Meditasi',
            description: 'Mulai sesi meditasi 5 menit',
            url: '/meditation?quick=true',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Latihan Pernapasan',
            short_name: 'Pernapasan',
            description: 'Latihan pernapasan 3 menit',
            url: '/breathing?quick=true',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }]
          }
        ]
      }
    })
  ],
})
