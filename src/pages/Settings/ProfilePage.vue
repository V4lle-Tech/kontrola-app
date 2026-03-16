<script setup lang="ts">
import { ref, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import { useToast } from 'primevue/usetoast'
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { apiClient } from '@/api/client'

const auth = useAuthStore()
const toast = useToast()
const saving = ref(false)
const form = ref({
  givenName: '',
  paternalName: '',
  maternalName: '',
  email: '',
})

function loadProfile() {
  if (!auth.user) return
  form.value = {
    givenName: auth.user.givenName,
    paternalName: auth.user.paternalName,
    maternalName: auth.user.maternalName ?? '',
    email: auth.user.email,
  }
}

async function save() {
  saving.value = true
  try {
    await apiClient.put('/profile', {
      givenName: form.value.givenName,
      paternalName: form.value.paternalName,
      maternalName: form.value.maternalName || undefined,
    })
    toast.add({ severity: 'success', summary: 'Perfil actualizado', life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Error al actualizar perfil', life: 5000 })
  } finally { saving.value = false }
}

onMounted(loadProfile)
</script>

<template>
  <AppLayout>
    <div class="flex h-full flex-col">
      <div class="border-b border-surface px-6 py-4">
        <h1 class="text-xl font-semibold text-color">Mi Perfil</h1>
        <p class="text-sm text-muted-color">Actualiza tu información personal</p>
      </div>
      <div class="flex-1 overflow-auto px-6 py-6">
        <div class="mx-auto max-w-lg">
          <div class="mb-6 flex items-center gap-4">
            <Avatar :image="auth.user?.avatarUrl" :label="auth.user?.givenName?.charAt(0)" size="xlarge" shape="circle" />
            <div>
              <p class="font-semibold text-color">{{ auth.user?.fullName }}</p>
              <p class="text-sm text-muted-color">{{ auth.user?.email }}</p>
            </div>
          </div>
          <form class="flex flex-col gap-4" @submit.prevent="save">
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-color">Nombre</label>
              <InputText v-model="form.givenName" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-color">Apellido Paterno</label>
              <InputText v-model="form.paternalName" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-color">Apellido Materno</label>
              <InputText v-model="form.maternalName" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-color">Email</label>
              <InputText :model-value="form.email" disabled />
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
