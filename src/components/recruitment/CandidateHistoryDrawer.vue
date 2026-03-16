<script setup lang="ts">
import { ref, watch } from 'vue'
import Drawer from 'primevue/drawer'
import Timeline from 'primevue/timeline'
import { useRecruitmentApi } from '@/composables/api/useRecruitmentApi'
import type { ApplicationHistory } from '@/types/recruitment'

interface Props {
  applicationId: string | null
}
const props = defineProps<Props>()

const visible = defineModel<boolean>('visible', { default: false })

const api = useRecruitmentApi()
const history = ref<ApplicationHistory[]>([])
const loading = ref(false)

watch(visible, async (show) => {
  if (show && props.applicationId) {
    loading.value = true
    try {
      history.value = await api.getApplicationHistory(props.applicationId)
    } catch {
      history.value = []
    } finally {
      loading.value = false
    }
  }
})

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <Drawer v-model:visible="visible" position="right" class="w-full sm:w-[420px]" header="Historial de Movimientos">
    <div v-if="loading" class="flex items-center justify-center py-12">
      <i class="pi pi-spin pi-spinner text-2xl text-muted-color" />
    </div>

    <div v-else-if="!history.length" class="flex flex-col items-center justify-center py-12">
      <i class="pi pi-history mb-3 text-3xl text-muted-color" />
      <p class="text-sm text-muted-color">Sin movimientos registrados</p>
    </div>

    <Timeline v-else :value="history" class="pl-1">
      <template #marker>
        <span class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
          <i class="pi pi-arrow-right-arrow-left text-xs text-primary" />
        </span>
      </template>
      <template #content="{ item }">
        <div class="mb-4 rounded-lg border border-surface bg-surface-0 p-3 dark:bg-surface-900">
          <div class="flex items-center gap-2 text-sm">
            <span v-if="item.fromStageName" class="rounded bg-surface-100 px-2 py-0.5 text-xs text-muted-color dark:bg-surface-800">
              {{ item.fromStageName }}
            </span>
            <span v-if="item.fromStageName" class="text-muted-color">
              <i class="pi pi-arrow-right text-[10px]" />
            </span>
            <span class="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {{ item.toStageName }}
            </span>
          </div>
          <p v-if="item.reason" class="mt-2 text-sm text-color">{{ item.reason }}</p>
          <div class="mt-2 flex items-center gap-2 text-[11px] text-muted-color">
            <i class="pi pi-user text-[10px]" />
            <span>{{ item.authorName }}</span>
            <span>·</span>
            <span>{{ formatDate(item.createdAt) }}</span>
          </div>
        </div>
      </template>
    </Timeline>
  </Drawer>
</template>
