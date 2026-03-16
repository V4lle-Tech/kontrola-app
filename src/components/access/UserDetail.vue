<script setup lang="ts">
import { ref, watch } from 'vue'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { useAccessApi } from '@/composables/api/useAccessApi'
import type { UserSummary } from '@/types/access'
import type { ApiError } from '@/types/api'

interface Props {
  user: UserSummary
}
const props = defineProps<Props>()

const emit = defineEmits<{
  back: []
  updated: [user: UserSummary]
  deleted: [id: string]
}>()

const api = useAccessApi()
const toast = useToast()
const detail = ref<UserSummary>(props.user)
const loading = ref(false)

watch(
  () => props.user,
  (newUser) => {
    detail.value = newUser
    void loadDetail()
  },
)

async function loadDetail() {
  loading.value = true
  try {
    detail.value = await api.getUser(props.user.id)
  } catch {
    // Keep summary data if detail fails
  } finally {
    loading.value = false
  }
}

async function toggleActive() {
  try {
    const updated = await api.updateUser(detail.value.id, {
      givenName: detail.value.givenName,
      paternalName: detail.value.paternalName,
      maternalName: detail.value.maternalName,
      email: detail.value.email,
      roleIds: detail.value.roles.map((r) => r.id),
      isActive: !detail.value.isActive,
    })
    detail.value = updated
    emit('updated', updated)
    toast.add({
      severity: 'success',
      summary: updated.isActive ? 'Usuario activado' : 'Usuario desactivado',
      life: 3000,
    })
  } catch (e: unknown) {
    const apiError = e as ApiError
    toast.add({
      severity: 'error',
      summary: apiError.title ?? 'Error al actualizar usuario',
      life: 5000,
    })
  }
}

async function deleteUser() {
  try {
    await api.deleteUser(detail.value.id)
    emit('deleted', detail.value.id)
    toast.add({ severity: 'success', summary: 'Usuario eliminado', life: 3000 })
  } catch (e: unknown) {
    const apiError = e as ApiError
    toast.add({
      severity: 'error',
      summary: apiError.title ?? 'Error al eliminar usuario',
      life: 5000,
    })
  }
}

void loadDetail()
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="flex items-center gap-2 border-b border-surface px-4 py-3">
      <Button
        icon="pi pi-arrow-left"
        text
        rounded
        severity="secondary"
        class="lg:hidden"
        @click="emit('back')"
      />
      <h2 class="flex-1 text-lg font-semibold text-color">{{ detail.fullName }}</h2>
      <Button
        :icon="detail.isActive ? 'pi pi-ban' : 'pi pi-check'"
        :label="detail.isActive ? 'Desactivar' : 'Activar'"
        :severity="detail.isActive ? 'warn' : 'success'"
        text
        size="small"
        @click="toggleActive"
      />
      <Button
        icon="pi pi-trash"
        severity="danger"
        text
        size="small"
        @click="deleteUser"
      />
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="loading" class="flex items-center justify-center py-8">
        <i class="pi pi-spin pi-spinner text-2xl text-muted-color" />
      </div>

      <div v-else class="flex flex-col gap-4">
        <!-- Profile card -->
        <div class="rounded-xl border border-surface bg-surface-0 dark:bg-surface-900 p-6">
          <div class="mb-6 flex items-center gap-4">
            <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <i class="pi pi-user text-2xl text-primary" />
            </div>
            <div>
              <p class="text-xl font-semibold text-color">{{ detail.fullName }}</p>
              <p class="text-muted-color">{{ detail.email }}</p>
              <Tag
                :value="detail.isActive ? 'Activo' : 'Inactivo'"
                :severity="detail.isActive ? 'success' : 'danger'"
                class="mt-1"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <p class="mb-1 text-muted-color">Nombre(s)</p>
              <p class="text-color">{{ detail.givenName }}</p>
            </div>
            <div>
              <p class="mb-1 text-muted-color">Apellido paterno</p>
              <p class="text-color">{{ detail.paternalName }}</p>
            </div>
            <div>
              <p class="mb-1 text-muted-color">Apellido materno</p>
              <p class="text-color">{{ detail.maternalName ?? '—' }}</p>
            </div>
            <div>
              <p class="mb-1 text-muted-color">Correo electrónico</p>
              <p class="text-color">{{ detail.email }}</p>
            </div>
            <div>
              <p class="mb-1 text-muted-color">Fecha de creación</p>
              <p class="text-color">{{ detail.createdAt }}</p>
            </div>
          </div>
        </div>

        <!-- Roles card -->
        <div class="rounded-xl border border-surface bg-surface-0 dark:bg-surface-900 p-6">
          <h3 class="mb-4 text-base font-semibold text-color">Roles asignados</h3>

          <div v-if="!detail.roles.length" class="text-sm text-muted-color">
            No tiene roles asignados
          </div>

          <div v-else class="flex flex-col gap-2">
            <div
              v-for="role in detail.roles"
              :key="role.id"
              class="flex items-center gap-3 rounded-lg bg-surface-50 dark:bg-surface-800 px-4 py-3"
            >
              <i class="pi pi-shield text-primary" />
              <div>
                <p class="font-medium text-color">{{ role.name }}</p>
                <p class="text-xs text-muted-color">{{ role.slug }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
