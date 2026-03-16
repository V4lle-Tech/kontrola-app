<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ToggleSwitch from 'primevue/toggleswitch'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import AppLayout from '@/layouts/AppLayout.vue'
import { apiClient } from '@/api/client'

interface ModuleConfig {
  id: string
  name: string
  description: string
  icon: string
  isEnabled: boolean
  isCore: boolean
}

const toast = useToast()
const modules = ref<ModuleConfig[]>([])
const loading = ref(false)
const savingId = ref<string | null>(null)

async function load() {
  loading.value = true
  try {
    const { data } = await apiClient.get<ModuleConfig[]>('/settings/modules')
    modules.value = data
  } finally { loading.value = false }
}

async function toggle(mod: ModuleConfig) {
  if (mod.isCore) return
  savingId.value = mod.id
  try {
    await apiClient.put(`/settings/modules/${mod.id}`, { isEnabled: mod.isEnabled })
    toast.add({ severity: 'success', summary: `${mod.name} ${mod.isEnabled ? 'habilitado' : 'deshabilitado'}`, life: 3000 })
  } catch {
    mod.isEnabled = !mod.isEnabled
    toast.add({ severity: 'error', summary: 'Error al actualizar módulo', life: 5000 })
  } finally { savingId.value = null }
}

onMounted(() => { void load() })
</script>

<template>
  <AppLayout>
    <div class="flex h-full flex-col">
      <div class="border-b border-surface px-6 py-4">
        <h1 class="text-xl font-semibold text-color">Módulos</h1>
        <p class="text-sm text-muted-color">Habilita o deshabilita módulos del sistema</p>
      </div>
      <div class="flex-1 overflow-auto px-6 py-4">
        <div v-if="loading" class="flex justify-center py-12">
          <i class="pi pi-spin pi-spinner text-2xl text-muted-color" />
        </div>
        <div v-else class="mx-auto grid max-w-2xl gap-3">
          <div
            v-for="mod in modules"
            :key="mod.id"
            class="flex items-center gap-4 rounded-lg border border-surface bg-surface-0 p-4 dark:bg-surface-900"
          >
            <i :class="mod.icon" class="text-2xl text-muted-color" />
            <div class="flex-1">
              <p class="font-medium text-color">{{ mod.name }}</p>
              <p class="text-sm text-muted-color">{{ mod.description }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span v-if="mod.isCore" class="text-xs text-muted-color">Core</span>
              <ToggleSwitch v-model="mod.isEnabled" :disabled="mod.isCore" @change="toggle(mod)" />
              <Button v-if="savingId === mod.id" icon="pi pi-spin pi-spinner" text size="small" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
