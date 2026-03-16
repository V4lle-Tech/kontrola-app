<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import CandidateLayout from '@/layouts/CandidateLayout.vue'
import { apiClient } from '@/api/client'
import type { PaginatedResponse } from '@/types/pagination'

interface PublicVacancy {
  id: string
  slug: string
  title: string
  employmentType: string
  location: string | null
  salaryMin: number | null
  salaryMax: number | null
  companyName: string | null
  publishedAt: string
}

const vacancies = ref<PublicVacancy[]>([])
const loading = ref(false)
const search = ref('')
const employmentType = ref<string | undefined>(undefined)
const page = ref(1)
const totalPages = ref(1)

const typeOptions = [
  { label: 'Todos', value: undefined },
  { label: 'Tiempo completo', value: 'full_time' },
  { label: 'Medio tiempo', value: 'part_time' },
  { label: 'Contrato', value: 'contract' },
  { label: 'Temporal', value: 'temporary' },
  { label: 'Prácticas', value: 'internship' },
]

const typeLabels: Record<string, string> = {
  full_time: 'Tiempo completo',
  part_time: 'Medio tiempo',
  contract: 'Contrato',
  temporary: 'Temporal',
  internship: 'Prácticas',
}

const hasMore = computed(() => page.value < totalPages.value)

async function load(reset = false) {
  if (reset) page.value = 1
  loading.value = true
  try {
    const { data } = await apiClient.get<PaginatedResponse<PublicVacancy>>('/public/vacancies', {
      params: { page: page.value, pageSize: 12, search: search.value || undefined, employmentType: employmentType.value },
    })
    vacancies.value = reset ? data.items : [...vacancies.value, ...data.items]
    totalPages.value = Math.ceil(data.totalCount / 12)
  } finally {
    loading.value = false
  }
}

function loadMore() {
  page.value++
  void load()
}

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return ''
  const fmt = (v: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(v)
  if (min && max) return `${fmt(min)} - ${fmt(max)}`
  if (min) return `Desde ${fmt(min)}`
  if (max) return `Hasta ${fmt(max)}`
  return ''
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 30) return `Hace ${days} días`
  return `Hace ${Math.floor(days / 30)} meses`
}

onMounted(() => { void load(true) })
</script>

<template>
  <CandidateLayout>
    <h1 class="mb-6 text-2xl font-bold text-color">Vacantes Disponibles</h1>

    <div class="mb-6 flex flex-wrap gap-3">
      <InputText v-model="search" placeholder="Buscar vacante..." class="w-full sm:w-64" @keyup.enter="load(true)" />
      <Select v-model="employmentType" :options="typeOptions" option-label="label" option-value="value" placeholder="Tipo" @change="load(true)" />
      <Button icon="pi pi-search" @click="load(true)" />
    </div>

    <div v-if="vacancies.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <router-link
        v-for="v in vacancies"
        :key="v.id"
        :to="{ name: 'candidate.job-detail', params: { slug: v.slug } }"
        class="rounded-lg border border-surface bg-surface-0 dark:bg-surface-900 p-4 no-underline transition hover:shadow-md"
      >
        <h3 class="mb-1 text-lg font-semibold text-color">{{ v.title }}</h3>
        <p v-if="v.companyName" class="mb-2 text-sm text-muted-color">{{ v.companyName }}</p>
        <div class="mb-3 flex flex-wrap gap-2">
          <Tag :value="typeLabels[v.employmentType] ?? v.employmentType" severity="info" />
          <Tag v-if="v.location" :value="v.location" severity="secondary" />
        </div>
        <p v-if="v.salaryMin || v.salaryMax" class="mb-2 text-sm font-medium text-color">
          {{ formatSalary(v.salaryMin, v.salaryMax) }}
        </p>
        <p class="text-xs text-muted-color">{{ timeAgo(v.publishedAt) }}</p>
      </router-link>
    </div>

    <div v-else-if="!loading" class="py-16 text-center">
      <i class="pi pi-briefcase mb-4 text-5xl text-muted-color" />
      <p class="text-muted-color">No hay vacantes disponibles en este momento.</p>
    </div>

    <div v-if="loading" class="py-8 text-center">
      <i class="pi pi-spin pi-spinner text-2xl text-muted-color" />
    </div>

    <div v-if="hasMore && !loading" class="mt-6 text-center">
      <Button label="Ver más vacantes" severity="secondary" outlined @click="loadMore" />
    </div>
  </CandidateLayout>
</template>
