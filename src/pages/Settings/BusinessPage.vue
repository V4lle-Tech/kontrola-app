<script setup lang="ts">
import { ref, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import FileUpload from 'primevue/fileupload'
import { useToast } from 'primevue/usetoast'
import AppLayout from '@/layouts/AppLayout.vue'
import { apiClient } from '@/api/client'

interface BusinessSettings {
  name: string
  rfc: string
  address: string
  phone: string
  email: string
  website: string
  logoUrl: string | null
}

const toast = useToast()
const loading = ref(false)
const saving = ref(false)
const form = ref<BusinessSettings>({ name: '', rfc: '', address: '', phone: '', email: '', website: '', logoUrl: null })

async function load() {
  loading.value = true
  try {
    const { data } = await apiClient.get<BusinessSettings>('/settings/business')
    form.value = data
  } finally { loading.value = false }
}

async function save() {
  saving.value = true
  try {
    await apiClient.put('/settings/business', form.value)
    toast.add({ severity: 'success', summary: 'Configuración guardada', life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Error al guardar', life: 5000 })
  } finally { saving.value = false }
}

async function uploadLogo(event: { files: File[] }) {
  const file = event.files[0]
  if (!file) return
  const formData = new FormData()
  formData.append('logo', file)
  try {
    const { data } = await apiClient.post<{ logoUrl: string }>('/settings/business/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    form.value.logoUrl = data.logoUrl
    toast.add({ severity: 'success', summary: 'Logo actualizado', life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Error al subir logo', life: 5000 })
  }
}

onMounted(() => { void load() })
</script>

<template>
  <AppLayout>
    <div class="flex h-full flex-col">
      <div class="border-b border-surface px-6 py-4">
        <h1 class="text-xl font-semibold text-color">Empresa</h1>
        <p class="text-sm text-muted-color">Configuración del negocio</p>
      </div>
      <div class="flex-1 overflow-auto px-6 py-6">
        <div v-if="loading" class="flex justify-center py-12">
          <i class="pi pi-spin pi-spinner text-2xl text-muted-color" />
        </div>
        <div v-else class="mx-auto max-w-lg">
          <div class="mb-6">
            <label class="mb-2 block text-sm font-medium text-color">Logo</label>
            <div class="flex items-center gap-4">
              <img v-if="form.logoUrl" :src="form.logoUrl" alt="Logo" class="h-16 w-16 rounded object-contain" />
              <div v-else class="flex h-16 w-16 items-center justify-center rounded bg-surface-100 dark:bg-surface-800">
                <i class="pi pi-image text-2xl text-muted-color" />
              </div>
              <FileUpload mode="basic" :auto="false" accept="image/*" choose-label="Cambiar logo" @select="uploadLogo" />
            </div>
          </div>
          <form class="flex flex-col gap-4" @submit.prevent="save">
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-color">Nombre de la empresa</label>
              <InputText v-model="form.name" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-color">RFC</label>
              <InputText v-model="form.rfc" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-color">Dirección</label>
              <Textarea v-model="form.address" rows="2" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-sm font-medium text-color">Teléfono</label>
                <InputText v-model="form.phone" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-sm font-medium text-color">Email</label>
                <InputText v-model="form.email" />
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-color">Sitio web</label>
              <InputText v-model="form.website" />
            </div>
            <div class="flex justify-end">
              <Button type="submit" label="Guardar" icon="pi pi-check" :loading="saving" />
            </div>
          </form>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
