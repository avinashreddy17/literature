import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * EXPLANATION: Vite Configuration
 * 
 * Vite is a modern build tool that's incredibly fast for React development.
 * It provides:
 * - Instant hot module replacement (HMR)
 * - Fast builds using esbuild
 * - TypeScript support out of the box
 * - Modern ES modules in development
 */

export default defineConfig({
  plugins: [react()],
  
  // Development server configuration
  server: {
    port: 5173,          // Default Vite port (matches our server CORS config)
    host: true,          // Allow external connections
    open: true,          // Open browser automatically
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,     // Source maps for debugging
    target: 'es2020',    // Modern browser support
  },

  // Preview server (for testing production builds)
  preview: {
    port: 5173,
    host: true,
  },

  // Path resolution (if we need custom imports)
  resolve: {
    alias: {
      '@': '/src',       // Use @/components/... for imports
    },
  },
}) 