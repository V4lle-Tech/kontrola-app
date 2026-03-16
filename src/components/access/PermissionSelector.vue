<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import { useAccessApi } from '@/composables/api/useAccessApi'
import type { PermissionGroup } from '@/types/access'
import type { Permission } from '@/types/auth'

const model = defineModel<Permission[]>({ required: true })

interface Props {
  invalid?: boolean
}
withDefaults(defineProps<Props>(), {
  invalid: false,
})

const api = useAccessApi()
const groups = ref<PermissionGroup[]>([])
const search = ref('')
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    groups.value = await api.getPermissions()
  } catch {
    // Groups empty if fetch fails
  } finally {
    loading.value = false
  }
})

const filteredGroups = computed(() => {
  if (!search.value) return groups.value
  const term = search.value.toLowerCase()
  return groups.value
    .map((g) => ({
      ...g,
      permissions: g.permissions.filter((p) => p.toLowerCase().includes(term)),
    }))
    .filter((g) => g.permissions.length > 0)
})

const selectedCount = computed(() => model.value.length)

function isChecked(permission: Permission): boolean {
  return model.value.includes(permission)
}

function togglePermission(permission: Permission) {
  const idx = model.value.indexOf(permission)
  if (idx >= 0) {
    model.value.splice(idx, 1)
  } else {
    model.value.push(permission)
  }
}

function toggleGroup(group: PermissionGroup) {
  const allChecked = group.permissions.every((p) => model.value.includes(p))
  if (allChecked) {
    const groupSet = new Set(group.permissions)
    const filtered = model.value.filter((p) => !groupSet.has(p))
    model.value.splice(0, model.value.length, ...filtered)
  } else {
    for (const p of group.permissions) {
      if (!model.value.includes(p)) {
        model.value.push(p)
      }
    }
  }
}

function isGroupChecked(group: PermissionGroup): boolean {
  return group.permissions.length > 0 && group.permissions.every((p) => model.value.includes(p))
}

function isGroupIndeterminate(group: PermissionGroup): boolean {
  const some = group.permissions.some((p) => model.value.includes(p))
  return some && !isGroupChecked(group)
}

function selectAll() {
  const all = groups.value.flatMap((g) => g.permissions)
  model.value.splice(0, model.value.length, ...all)
}

function clearAll() {
  model.value.splice(0, model.value.length)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <span class="text-sm text-muted-color">
        {{ selectedCount }} permiso{{ selectedCount !== 1 ? 's' : '' }} seleccionado{{ selectedCount !== 1 ? 's' : '' }}
      </span>
      <div class="flex gap-2">
        <button type="button" class="text-xs text-primary hover:underline" @click="selectAll">
          Todos
        </button>
        <button type="button" class="text-xs text-muted-color hover:underline" @click="clearAll">
          Ninguno
        </button>
      </div>
    </div>

    <!-- Search -->
    <span class="relative">
      <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-color" />
      <InputText
        v-model="search"
        placeholder="Filtrar permisos..."
        class="w-full pl-9"
      />
    </span>

    <!-- Permission groups -->
    <div
      class="max-h-80 overflow-y-auto rounded-lg border p-3"
      :class="invalid ? 'border-red-500' : 'border-surface'"
    >
      <div v-if="loading" class="flex items-center justify-center py-4">
        <i class="pi pi-spin pi-spinner text-muted-color" />
      </div>

      <div v-else-if="!filteredGroups.length" class="py-4 text-center text-sm text-muted-color">
        {{ search ? 'No se encontraron permisos' : 'No hay permisos disponibles' }}
      </div>

      <div v-else class="flex flex-col gap-3">
        <div v-for="group in filteredGroups" :key="group.module">
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
            <span class="ml-auto text-xs text-muted-color">
              {{ group.permissions.filter((p) => model.includes(p)).length }}/{{ group.permissions.length }}
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
</template>
