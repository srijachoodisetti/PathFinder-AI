import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,          // Disable sourcemaps in production for security
    minify: 'esbuild',         // Fastest minifier
    target: 'es2020',

    rollupOptions: {
      output: {
        // Chunk splitting for optimal caching
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-framer';
            }
            if (id.includes('zustand') || id.includes('axios')) {
              return 'vendor-state';
            }
          }
        },
      },
    },

    // Increase chunk size warning limit (Recharts + Firebase are large)
    chunkSizeWarningLimit: 600,
  },

  server: {
    port: 5173,
    host: true,
    // Proxy API calls to FastAPI during local development
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  preview: {
    port: 4173,
    host: true,
  },
})
