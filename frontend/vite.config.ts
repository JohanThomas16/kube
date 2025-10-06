import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  define: {
    // Define environment variables for build time
    __ISSUANCE_API_URL__: JSON.stringify(process.env.VITE_ISSUANCE_API_URL || 'http://localhost:3001'),
    __VERIFICATION_API_URL__: JSON.stringify(process.env.VITE_VERIFICATION_API_URL || 'http://localhost:3002')
  }
})
