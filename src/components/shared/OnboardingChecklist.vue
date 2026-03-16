<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import { useRouter } from 'vue-router'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'

interface ChecklistItem {
  key: string
  label: string
  description: string
  icon: string
  route: string
  check: () => Promise<boolean>
}

const router = useRouter()
const api = useRecruitmentApi()
const completed = ref<Record<string, boolean>>({})
const loading = ref(true)
const dismissed = ref(false)

const items: ChecklistItem[] = [
  {
    key: 'job_profiles',
    label: 'Crear un perfil de puesto',
    description: 'Define los requisitos y responsabilidades del puesto',
    icon: 'pi pi-briefcase',
    route: '/recruitment/job-profiles',
    check: async () => {
      const res = await api.getJobProfiles({ page: 1, pageSize: 1 })
      return res.totalCount > 0
    },
  },
  {
    key: 'selection_process',
    label: 'Configurar un proceso de selección',
    description: 'Define las etapas por las que pasan los candidatos',
    icon: 'pi pi-sitemap',
    route: '/recruitment/selection-processes',
    check: async () => {
      const res = await api.getSelectionProcesses({ page: 1, pageSize: 1 })
      return res.totalCount > 0
    },
  },
  {
    key: 'vacancy',
    label: 'Publicar una vacante',
    description: 'Abre una posición para recibir candidatos',
    icon: 'pi pi-megaphone',
    route: '/recruitment/vacancies',
    check: async () => {
      const res = await api.getVacancies({ page: 1, pageSize: 1 })
      return res.totalCount > 0
    },
  },
  {
    key: 'candidate',
    label: 'Registrar un candidato',
    description: 'Agrega tu primer candidato al sistema',
    icon: 'pi pi-user-plus',
    route: '/recruitment/candidates',
    check: async () => {
      const res = await api.getCandidates({ page: 1, pageSize: 1 })
      return res.totalCount > 0
    },
  },
]

const progress = computed(() => {
  const done = Object.values(completed.value).filter(Boolean).length
  return Math.round((done / items.length) * 100)
})

const allDone = computed(() => progress.value === 100)

function navigate(route: string) { void router.push(route) }

onMounted(async () => {
  if (localStorage.getItem('onboarding_dismissed') === 'true') {
    dismissed.value = true
    loading.value = false
    return
  }
  try {
    const results = await Promise.allSettled(items.map((item) => item.check()))
    results.forEach((r, i) => {
      const item = items[i]
      if (item) completed.value[item.key] = r.status === 'fulfilled' && r.value
    })
  } finally { loading.value = false }
})

function dismiss() {
  dismissed.value = true
  localStorage.setItem('onboarding_dismissed', 'true')
}
</script>

<template>
  <div v-if="!dismissed && !loading" class="rounded-xl border border-primary/30 bg-primary/5 p-5">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold text-color">Primeros pasos</h2>
        <p class="text-sm text-muted-color">Configura tu espacio de reclutamiento</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm font-medium text-primary">{{ progress }}%</span>
        <Button v-if="allDone" icon="pi pi-times" severity="secondary" text size="small" @click="dismiss" />
      </div>
    </div>

    <!-- Progress bar -->
    <div class="mb-4 h-2 overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700">
      <div class="h-full rounded-full bg-primary transition-all" :style="{ width: `${progress}%` }" />
    </div>

    <!-- Checklist items -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div
        v-for="item in items"
        :key="item.key"
        class="flex cursor-pointer items-center gap-3 rounded-lg border border-surface bg-surface-0 p-3 transition-colors hover:bg-surface-50 dark:bg-surface-900 dark:hover:bg-surface-800"
        @click="navigate(item.route)"
      >
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          :class="completed[item.key] ? 'bg-green-100 dark:bg-green-900/30' : 'bg-surface-100 dark:bg-surface-800'"
        >
          <i v-if="completed[item.key]" class="pi pi-check text-sm text-green-600 dark:text-green-400" />
          <i v-else :class="item.icon" class="text-sm text-muted-color" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium" :class="completed[item.key] ? 'text-muted-color line-through' : 'text-color'">
            {{ item.label }}
          </p>
          <p class="truncate text-xs text-muted-color">{{ item.description }}</p>
        </div>
        <i v-if="!completed[item.key]" class="pi pi-chevron-right text-xs text-muted-color" />
      </div>
    </div>
  </div>
</template>
