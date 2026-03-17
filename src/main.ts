import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

import App from './App.vue'
import router from './router'
import KontrolaPreset from './primevue-preset'

import 'primeicons/primeicons.css'
import './assets/main.css'
import './utils/chartjs'

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
import { usePreferencesStore } from './stores/usePreferencesStore'
const preferences = usePreferencesStore()
preferences.initThemeListener()
