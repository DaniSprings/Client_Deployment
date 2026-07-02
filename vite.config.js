import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    host: true,      // Exposes the server on your local network (0.0.0.0)
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'https://clientapi-production-afc7.up.railway.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})