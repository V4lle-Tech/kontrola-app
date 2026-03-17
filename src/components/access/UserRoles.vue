<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Checkbox from 'primevue/checkbox'
import { useToast } from 'primevue/usetoast'
import { useAccessApi } from '@/composables/api/useAccessApi'
import type { UserSummary, Role } from '@/types/access'
import type { ApiError } from '@/types/api'

interface Props {
  user: UserSummary
}
const props = defineProps<Props>()

const emit = defineEmits<{
  updated: [user: UserSummary]
}>()

const api = useAccessApi()
const toast = useToast()

const availableRoles = ref<Role[]>([])
const selectedRoleIds = ref<string[]>([])
const loading = ref(false)
const saving = ref(false)

const currentRoleIds = computed(() => props.user.roles.map((r) => r.id))

onMounted(async () => {
  selectedRoleIds.value = [...currentRoleIds.value]
  loading.value = true
  try {
    const result = await api.getRoles({ pageSize: 100 })
    availableRoles.value = result.items
  } catch {
    // Roles will be empty if fetch fails
  } finally {
    loading.value = false
  }
})

async function onRoleChange() {
  saving.value = true
  try {
    const updated = await api.updateUser(props.user.id, {
      givenName: props.user.givenName,
      paternalName: props.user.paternalName,
      maternalName: props.user.maternalName,
      email: props.user.email,
      roleIds: selectedRoleIds.value,
      isActive: props.user.isActive,
    })
    toast.add({ severity: 'success', summary: 'Roles actualizados', life: 3000 })
    emit('updated', updated)
  } catch (e: unknown) {
    const apiError = e as ApiError
    toast.add({
      severity: 'error',
      summary: apiError.title ?? 'Error al actualizar roles',
      life: 5000,
    })
    // Revert selection on error
    selectedRoleIds.value = [...currentRoleIds.value]
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="rounded-xl border border-surface bg-surface-0 dark:bg-surface-900 p-6">
    <h3 class="mb-4 text-base font-semibold text-color">Roles asignados</h3>

    <div v-if="loading" class="flex items-center justify-center py-4">
      <i class="pi pi-spin pi-spinner text-xl text-muted-color" />
    </div>

    <div v-else-if="!availableRoles.length" class="text-sm text-muted-color">
      No hay roles disponibles
    </div>

    <div v-else class="flex flex-col gap-3">
      <div
        v-for="role in availableRoles"
        :key="role.id"
        class="flex items-center gap-3 rounded-lg bg-surface-50 dark:bg-surface-800 px-4 py-3"
      >
        <Checkbox
          v-model="selectedRoleIds"
          :input-id="`role-${role.id}`"
          :value="role.id"
          :disabled="saving"
          @change="onRoleChange"
        />
        <label :for="`role-${role.id}`" class="cursor-pointer">
          <p class="font-medium text-color">{{ role.name }}</p>
          <p class="text-xs text-muted-color">{{ role.slug }}</p>
        </label>
      </div>
    </div>
  </div>
</template>
