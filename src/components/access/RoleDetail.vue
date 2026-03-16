<script setup lang="ts">
import { ref, watch } from 'vue'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { useAccessApi } from '@/composables/api/useAccessApi'
import type { Role } from '@/types/access'
import type { ApiError } from '@/types/api'

interface Props {
  role: Role
}
const props = defineProps<Props>()

const emit = defineEmits<{
  back: []
  edit: [role: Role]
  deleted: [id: string]
}>()

const api = useAccessApi()
const toast = useToast()
const detail = ref<Role>(props.role)
const loading = ref(false)

watch(
  () => props.role,
  (newRole) => {
    detail.value = newRole
    void loadDetail()
  },
)

async function loadDetail() {
  loading.value = true
  try {
    detail.value = await api.getRole(props.role.id)
  } catch {
    // Keep summary data if detail fails
  } finally {
    loading.value = false
  }
}

async function deleteRole() {
  if (detail.value.isSystem) return

  try {
    await api.deleteRole(detail.value.id)
    emit('deleted', detail.value.id)
    toast.add({ severity: 'success', summary: 'Rol eliminado', life: 3000 })
  } catch (e: unknown) {
    const apiError = e as ApiError
    toast.add({
      severity: 'error',
      summary: apiError.title ?? 'Error al eliminar rol',
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
      <h2 class="flex-1 text-lg font-semibold text-color">{{ detail.name }}</h2>
      <Button
        icon="pi pi-pencil"
        label="Editar"
        text
        size="small"
        :disabled="detail.isSystem"
        @click="emit('edit', detail)"
      />
      <Button
        icon="pi pi-trash"
        severity="danger"
        text
        size="small"
        :disabled="detail.isSystem"
        @click="deleteRole"
      />
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="loading" class="flex items-center justify-center py-8">
        <i class="pi pi-spin pi-spinner text-2xl text-muted-color" />
      </div>

      <div v-else class="flex flex-col gap-4">
        <!-- Info card -->
        <div class="rounded-xl border border-surface bg-surface-0 dark:bg-surface-900 p-6">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <i class="pi pi-shield text-xl text-primary" />
            </div>
            <div>
              <p class="text-xl font-semibold text-color">{{ detail.name }}</p>
              <p class="text-sm text-muted-color">{{ detail.slug }}</p>
            </div>
            <Tag
              :value="detail.isSystem ? 'Sistema' : 'Custom'"
              :severity="detail.isSystem ? 'info' : 'secondary'"
              class="ml-auto"
            />
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-muted-color">Nivel</p>
              <p class="text-color">{{ detail.level }}</p>
            </div>
            <div>
              <p class="text-muted-color">Usuarios asignados</p>
              <p class="text-color">{{ detail.usersCount }}</p>
            </div>
          </div>
        </div>

        <!-- Permissions card -->
        <div class="rounded-xl border border-surface bg-surface-0 dark:bg-surface-900 p-6">
          <h3 class="mb-4 text-base font-semibold text-color">
            Permisos ({{ detail.permissions.length }})
          </h3>

          <div v-if="!detail.permissions.length" class="text-sm text-muted-color">
            No tiene permisos asignados
          </div>

          <div v-else class="flex flex-wrap gap-2">
            <Tag
              v-for="perm in detail.permissions"
              :key="perm"
              :value="perm"
              severity="secondary"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
