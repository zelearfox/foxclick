import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import JSOBF from 'vite-plugin-javascript-obfuscator';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    JSOBF({
      apply: 'build',
      options: {
        debugProtection: true,
        compact: true,
        optionsPreset: 'medium-obfuscation',
        renameGlobals: true
      }
    })
  ],
  server: {
    watch: {
      ignored: ['**/*.json']
    },
    proxy: {
      '/socket.io': {
        target: 'ws://localhost:3000',
        ws: true,
        changeOrigin: true
      },
    },
    allowedHosts: ['5173.zlr.su']
  }
})
