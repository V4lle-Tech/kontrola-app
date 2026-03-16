<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import AppLayout from '@/layouts/AppLayout.vue'
import { useSyndicationApi } from '@/composables/api/useSyndicationApi'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const api = useSyndicationApi()
const status = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref('')

onMounted(async () => {
  const code = route.query.code as string | undefined
  if (!code) {
    status.value = 'error'
    errorMessage.value = 'No se recibió el código de autorización de Meta.'
    return
  }
  try {
    await api.connectMeta(code)
    status.value = 'success'
    toast.add({ severity: 'success', summary: 'Meta conectado exitosamente', life: 3000 })
    setTimeout(() => { void router.push({ name: 'syndication-settings' }) }, 2000)
  } catch {
    status.value = 'error'
    errorMessage.value = 'Error al conectar con Meta. Intenta nuevamente.'
  }
})
</script>

<template>
  <AppLayout>
    <div class="flex h-full items-center justify-center">
      <div class="text-center">
        <div v-if="status === 'loading'">
          <i class="pi pi-spin pi-spinner mb-3 text-4xl text-primary" />
          <p class="text-color">Conectando con Meta...</p>
        </div>
        <div v-else-if="status === 'success'">
          <i class="pi pi-check-circle mb-3 text-4xl text-green-500" />
          <p class="text-color">Cuenta Meta conectada exitosamente</p>
          <p class="mt-1 text-sm text-muted-color">Redirigiendo a configuración...</p>
        </div>
        <div v-else>
          <i class="pi pi-times-circle mb-3 text-4xl text-red-500" />
          <p class="text-color">{{ errorMessage }}</p>
          <router-link :to="{ name: 'syndication-settings' }" class="mt-2 inline-block text-sm text-primary">
            Volver a configuración
          </router-link>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
