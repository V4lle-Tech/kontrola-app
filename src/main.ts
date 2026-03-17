import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

import App from './App.vue'
import router from './router'
import KontrolaPreset from './primevue-preset'
import { startMockWorker } from './mocks'

import 'primeicons/primeicons.css'
import './assets/main.css'
import './utils/chartjs'

async function bootstrap(): Promise<void> {
  // Start MSW mock worker before mounting (no-op when VITE_MOCK_API !== 'true')
  await startMockWorker()

  const app = createApp(App)

  app.use(createPinia())
  app.use(router)

  app.use(PrimeVue, {
    theme: {
      preset: KontrolaPreset,
      options: {
        darkModeSelector: '.dark',
        cssLayer: {
          name: 'primevue',
          order: 'theme, base, primevue',
        },
      },
    },
  })
  app.use(ToastService)
  app.use(ConfirmationService)

  app.mount('#app')

  // Initialize theme from persisted preference
  const { usePreferencesStore } = await import('./stores/usePreferencesStore')
  const preferences = usePreferencesStore()
  preferences.initThemeListener()
}

void bootstrap()
