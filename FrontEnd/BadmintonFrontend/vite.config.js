import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  base: "./",
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: ['tg.dondevelops.de'],
    // proxy: {
    //   '/A/api': 'http://localhost:3122',
    //   '/B/api': 'http://localhost:3122',
    //   '/C/api': 'http://localhost:3122',
    // }
  }
})
