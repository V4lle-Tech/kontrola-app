<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import AppLayout from '@/layouts/AppLayout.vue'
import { useSyndicationApi } from '@/composables/api/useSyndicationApi'
import type { SyndicationPost } from '@/types/syndication'

const api = useSyndicationApi()
const toast = useToast()
const posts = ref<SyndicationPost[]>([])
const loading = ref(false)
const totalRecords = ref(0)
const page = ref(0)
const rows = ref(20)

async function loadPosts() {
  loading.value = true
  try {
    const res = await api.getPosts({ page: page.value + 1, pageSize: rows.value })
    posts.value = res.items
    totalRecords.value = res.totalCount
  } finally { loading.value = false }
}

function onPage(event: { page: number; rows: number }) {
  page.value = event.page
  rows.value = event.rows
  void loadPosts()
}

async function retry(postId: string) {
  try {
    await api.retryPost(postId)
    toast.add({ severity: 'success', summary: 'Reintentando publicación', life: 3000 })
    void loadPosts()
  } catch { toast.add({ severity: 'error', summary: 'Error al reintentar', life: 5000 }) }
}

function statusSeverity(status: string): string {
  const map: Record<string, string> = { published: 'success', scheduled: 'info', draft: 'secondary', failed: 'danger', expired: 'warn' }
  return map[status] ?? 'secondary'
}

function statusLabel(status: string): string {
  const map: Record<string, string> = { published: 'Publicado', scheduled: 'Programado', draft: 'Borrador', failed: 'Fallido', expired: 'Expirado' }
  return map[status] ?? status
}

function providerLabel(provider: string): string {
  const map: Record<string, string> = { indeed: 'Indeed', jooble: 'Jooble', meta: 'Meta', linkedin: 'LinkedIn' }
  return map[provider] ?? provider
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(() => { void loadPosts() })
</script>

<template>
  <AppLayout>
    <div class="flex h-full flex-col">
      <div class="flex items-center justify-between border-b border-surface px-6 py-4">
        <div>
          <h1 class="text-xl font-semibold text-color">Publicaciones</h1>
          <p class="text-sm text-muted-color">Estado de vacantes publicadas en portales de empleo</p>
        </div>
        <Button icon="pi pi-refresh" severity="secondary" text size="small" :loading="loading" @click="loadPosts" />
      </div>

      <div class="flex-1 overflow-auto px-6 py-4">
        <DataTable :value="posts" :loading="loading" lazy paginator :rows="rows" :total-records="totalRecords" :rows-per-page-options="[10, 20, 50]" @page="onPage">
          <Column field="vacancyTitle" header="Vacante" />
          <Column field="provider" header="Portal">
            <template #body="{ data }"><span class="font-medium">{{ providerLabel(data.provider) }}</span></template>
          </Column>
          <Column field="status" header="Estado">
            <template #body="{ data }"><Tag :value="statusLabel(data.status)" :severity="statusSeverity(data.status)" /></template>
          </Column>
          <Column header="Métricas" style="width: 200px">
            <template #body="{ data }">
              <div v-if="data.metrics" class="flex gap-3 text-xs text-muted-color">
                <span><i class="pi pi-eye mr-1" />{{ data.metrics.views }}</span>
                <span><i class="pi pi-link mr-1" />{{ data.metrics.clicks }}</span>
                <span><i class="pi pi-user-plus mr-1" />{{ data.metrics.applications }}</span>
              </div>
              <span v-else class="text-xs text-muted-color">—</span>
            </template>
          </Column>
          <Column field="publishedAt" header="Publicado">
            <template #body="{ data }">{{ formatDate(data.publishedAt) }}</template>
          </Column>
          <Column field="expiresAt" header="Expira">
            <template #body="{ data }">{{ formatDate(data.expiresAt) }}</template>
          </Column>
          <Column header="Acciones" style="width: 80px">
            <template #body="{ data }">
              <Button v-if="data.status === 'failed'" v-tooltip.top="'Reintentar'" icon="pi pi-replay" severity="warn" text size="small" @click="retry(data.id)" />
            </template>
          </Column>
          <template #empty>
            <div class="py-8 text-center">
              <i class="pi pi-send mb-2 text-3xl text-muted-color" />
              <p class="text-muted-color">No hay publicaciones aún</p>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
  </AppLayout>
</template>
