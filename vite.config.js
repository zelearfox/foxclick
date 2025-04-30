import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/socket.io': {
        target: 'ws://localhost:3001',
        ws: true,
        changeOrigin: true
      }
    },
    allowedHosts: ['foxclick.therikky.xyz']
  }
})
