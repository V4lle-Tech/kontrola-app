import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-primevue': ['primevue/config', 'primevue/datatable', 'primevue/column', 'primevue/button', 'primevue/dialog', 'primevue/inputtext', 'primevue/toast', 'primevue/usetoast'],
          'vendor-chart': ['chart.js', 'vue-chartjs'],
        },
      },
    },
  },
})
