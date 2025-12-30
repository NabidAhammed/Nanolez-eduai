import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  base: '/eduai/', // ✅ REQUIRED for InfinityFree subfolder

  plugins: [react()],

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },

  server: {
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
      }
    }
  },

  build: {
    outDir: 'dist',
    sourcemap: false, // ❌ turn OFF in production (security + size)
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor'
            }
            if (id.includes('lucide-react')) {
              return 'icons'
            }
            return 'node_modules'
          }
        }
      }
    }
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react']
  }
})
