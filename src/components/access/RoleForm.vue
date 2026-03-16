<script setup lang="ts">
import { ref, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import { useAccessApi } from '@/composables/api/useAccessApi'
import type { Role, PermissionGroup } from '@/types/access'
import type { Permission } from '@/types/auth'
import type { ApiError } from '@/types/api'

interface Props {
  role?: Role | null
}
const props = withDefaults(defineProps<Props>(), {
  role: null,
})

const emit = defineEmits<{
  saved: [role: Role]
  cancel: []
}>()

const api = useAccessApi()
const toast = useToast()

const isEdit = !!props.role
const form = ref({
  name: props.role?.name ?? '',
  permissions: [...(props.role?.permissions ?? [])] as Permission[],
})
const fieldErrors = ref<Record<string, string[]>>({})
const generalError = ref('')
const loading = ref(false)
const permissionGroups = ref<PermissionGroup[]>([])

onMounted(async () => {
  try {
    permissionGroups.value = await api.getPermissions()
  } catch {
    // Permission groups empty if fetch fails
  }
})

function isChecked(permission: Permission): boolean {
  return form.value.permissions.includes(permission)
}

function togglePermission(permission: Permission) {
  const idx = form.value.permissions.indexOf(permission)
  if (idx >= 0) {
    form.value.permissions.splice(idx, 1)
  } else {
    form.value.permissions.push(permission)
  }
}

function toggleGroup(group: PermissionGroup) {
  const allChecked = group.permissions.every((p) => form.value.permissions.includes(p))
  if (allChecked) {
    form.value.permissions = form.value.permissions.filter(
      (p) => !group.permissions.includes(p),
    )
  } else {
    for (const p of group.permissions) {
      if (!form.value.permissions.includes(p)) {
        form.value.permissions.push(p)
      }
    }
  }
}

function isGroupChecked(group: PermissionGroup): boolean {
  return group.permissions.every((p) => form.value.permissions.includes(p))
}

function isGroupIndeterminate(group: PermissionGroup): boolean {
  const some = group.permissions.some((p) => form.value.permissions.includes(p))
  return some && !isGroupChecked(group)
}

async function submit() {
  fieldErrors.value = {}
  generalError.value = ''
  loading.value = true

  try {
    let role: Role
    if (isEdit && props.role) {
      role = await api.updateRole(props.role.id, {
        name: form.value.name,
        permissions: form.value.permissions,
      })
      toast.add({ severity: 'success', summary: 'Rol actualizado', life: 3000 })
    } else {
      role = await api.createRole({
        name: form.value.name,
        permissions: form.value.permissions,
      })
      toast.add({ severity: 'success', summary: 'Rol creado', life: 3000 })
    }
    emit('saved', role)
  } catch (e: unknown) {
    const apiError = e as ApiError
    if (apiError.status === 422 && apiError.errors) {
      fieldErrors.value = apiError.errors
    } else {
      generalError.value = apiError.title ?? 'Error al guardar rol'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <Message v-if="generalError" severity="error" :closable="false">
      {{ generalError }}
    </Message>

    <form class="flex flex-col gap-4" @submit.prevent="submit">
      <div class="flex flex-col gap-1">
        <label for="roleName" class="text-sm font-medium text-color">Nombre del rol</label>
        <InputText
          id="roleName"
          v-model="form.name"
          :invalid="!!fieldErrors.name"
          placeholder="Ej: Reclutador"
        />
        <small v-if="fieldErrors.name" class="text-red-500">{{ fieldErrors.name[0] }}</small>
      </div>

      <!-- Permission groups -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-color">
          Permisos ({{ form.permissions.length }} seleccionados)
        </label>
        <small v-if="fieldErrors.permissions" class="text-red-500">{{ fieldErrors.permissions[0] }}</small>

        <div class="max-h-80 overflow-y-auto rounded-lg border border-surface p-3">
          <div v-if="!permissionGroups.length" class="text-sm text-muted-color">
            Cargando permisos...
          </div>

          <div v-else class="flex flex-col gap-3">
            <div v-for="group in permissionGroups" :key="group.module">
              <!-- Group header -->
              <div
                class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-surface-100 dark:hover:bg-surface-800"
                @click="toggleGroup(group)"
              >
                <Checkbox
                  :model-value="isGroupChecked(group)"
                  :binary="true"
                  :indeterminate="isGroupIndeterminate(group)"
                  @click.stop="toggleGroup(group)"
                />
                <span class="text-sm font-semibold capitalize text-color">
                  {{ group.module }}
                </span>
              </div>

              <!-- Individual permissions -->
              <div class="ml-6 mt-1 flex flex-col gap-1">
                <div
                  v-for="perm in group.permissions"
                  :key="perm"
                  class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-0.5 hover:bg-surface-50 dark:hover:bg-surface-800"
                  @click="togglePermission(perm)"
                >
                  <Checkbox
                    :model-value="isChecked(perm)"
                    :binary="true"
                    @click.stop="togglePermission(perm)"
                  />
                  <span class="text-sm text-color">{{ perm }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" text @click="emit('cancel')" />
        <Button
          type="submit"
          :label="isEdit ? 'Guardar Cambios' : 'Crear Rol'"
          :loading="loading"
        />
      </div>
    </form>
  </div>
</template>
