<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import type { Application, ApplicationHistory } from '@/types/recruitment'

interface Props {
  candidateId: string
  applications: Application[]
}
const props = defineProps<Props>()

const api = useRecruitmentApi()
const historyByApp = ref<Map<string, ApplicationHistory[]>>(new Map())
const loading = ref(false)

async function loadHistory() {
  loading.value = true
  try {
    const entries = await Promise.all(
      props.applications.map(async (app) => {
        const items = await api.getApplicationHistory(app.id)
        return [app.id, items] as [string, ApplicationHistory[]]
      }),
    )
    historyByApp.value = new Map(entries)
  } catch {
    historyByApp.value = new Map()
  } finally {
    loading.value = false
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function vacancyLabel(app: Application): string {
  return app.vacancy?.jobProfile?.title ?? app.vacancy?.slug ?? 'Vacante'
}

onMounted(() => {
  void loadHistory()
})
</script>

<template>
  <div>
    <div v-if="loading" class="flex items-center justify-center py-12">
      <i class="pi pi-spin pi-spinner text-2xl text-muted-color" />
    </div>

    <div v-else-if="applications.length === 0" class="flex flex-col items-center justify-center py-12">
      <i class="pi pi-history mb-3 text-3xl text-muted-color" />
      <p class="text-sm text-muted-color">Sin postulaciones registradas</p>
    </div>

    <div v-else class="flex flex-col gap-6">
      <div v-for="app in applications" :key="app.id">
        <h3 class="mb-3 text-sm font-semibold text-color">{{ vacancyLabel(app) }}</h3>

        <div v-if="!historyByApp.get(app.id)?.length" class="text-sm text-muted-color">
          Sin movimientos registrados
        </div>

        <div v-else class="relative ml-3 border-l-2 border-surface pl-6">
          <div
            v-for="item in historyByApp.get(app.id)"
            :key="item.id"
            class="relative mb-4 last:mb-0"
          >
            <!-- Dot -->
            <span class="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-primary bg-surface-0 dark:bg-surface-900" />

            <div class="rounded-lg border border-surface bg-surface-0 p-3 dark:bg-surface-900">
              <div class="flex items-center gap-2 text-sm">
                <span
                  v-if="item.fromStageName"
                  class="rounded bg-surface-100 px-2 py-0.5 text-xs text-muted-color dark:bg-surface-800"
                >
                  {{ item.fromStageName }}
                </span>
                <i v-if="item.fromStageName" class="pi pi-arrow-right text-[10px] text-muted-color" />
                <span class="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {{ item.toStageName }}
                </span>
              </div>
              <p v-if="item.reason" class="mt-2 text-sm text-color">{{ item.reason }}</p>
              <div class="mt-2 flex items-center gap-2 text-[11px] text-muted-color">
                <i class="pi pi-user text-[10px]" />
                <span>{{ item.authorName }}</span>
                <span>&middot;</span>
                <span>{{ formatDate(item.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
