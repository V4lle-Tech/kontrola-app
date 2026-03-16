<script setup lang="ts">
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { apiClient } from '@/api/client'

interface Props {
  tenantName: string
}

defineProps<Props>()
const emit = defineEmits<{ ended: [] }>()
const toast = useToast()

async function endImpersonation() {
  try {
    await apiClient.post('/admin/impersonation/end')
    toast.add({ severity: 'info', summary: 'Impersonación terminada', life: 3000 })
    emit('ended')
    window.location.href = '/admin'
  } catch {
    toast.add({ severity: 'error', summary: 'Error al terminar impersonación', life: 5000 })
  }
}
</script>

<template>
  <div class="flex items-center justify-between bg-emphasis px-4 py-2 text-sm font-medium text-primary-contrast">
    <div class="flex items-center gap-2">
      <i class="pi pi-eye" />
      <span>Impersonando: <strong>{{ tenantName }}</strong></span>
    </div>
    <Button label="Terminar" icon="pi pi-times" size="small" severity="contrast" @click="endImpersonation" />
  </div>
</template>
