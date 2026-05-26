import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

/**
 * Vite Configuration — MockIQ Frontend
 *
 * Tailwind CSS v4 is loaded as a Vite plugin.
 * NO tailwind.config.js needed — all config lives in index.css via @theme.
 *
 * Path aliases allow clean imports:
 *   import Button from '@/components/common/Button'
 *   instead of: '../../../components/common/Button'
 */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },

server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
    },
  },
},

  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          charts: ['recharts'],
          ui:     ['lucide-react'],
          store:  ['zustand'],
        },
      },
    },
  },
})