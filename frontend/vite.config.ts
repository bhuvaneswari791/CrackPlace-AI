import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/CrackPlace-AI/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://bhuvaneswari791.github.io/CrackPlace-AI',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
