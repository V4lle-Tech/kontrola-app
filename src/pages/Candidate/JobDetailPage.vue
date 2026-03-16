<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import CandidateLayout from '@/layouts/CandidateLayout.vue'
import ShareButtons from '@/components/candidate/ShareButtons.vue'
import { apiClient } from '@/api/client'

interface VacancyDetail {
  id: string
  slug: string
  title: string
  description: string | null
  requirements: string[] | null
  functions: string[] | null
  benefits: string[] | null
  employmentType: string
  location: string | null
  salaryMin: number | null
  salaryMax: number | null
  companyName: string | null
  companyLogo: string | null
  publishedAt: string
}

const route = useRoute()
const router = useRouter()
const vacancy = ref<VacancyDetail | null>(null)
const loading = ref(false)
const currentUrl = computed(() => window.location.href)

const typeLabels: Record<string, string> = {
  full_time: 'Tiempo completo',
  part_time: 'Medio tiempo',
  contract: 'Contrato',
  temporary: 'Temporal',
  internship: 'Prácticas',
}

async function load() {
  loading.value = true
  try {
    const { data } = await apiClient.get<VacancyDetail>(`/public/vacancies/${route.params.slug}`)
    vacancy.value = data

    // JSON-LD for SEO
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: data.title,
      description: data.description,
      employmentType: data.employmentType.toUpperCase(),
      datePosted: data.publishedAt,
      hiringOrganization: data.companyName ? { '@type': 'Organization', name: data.companyName } : undefined,
      jobLocation: data.location ? { '@type': 'Place', address: data.location } : undefined,
      baseSalary: data.salaryMin ? {
        '@type': 'MonetaryAmount',
        currency: 'MXN',
        value: { '@type': 'QuantitativeValue', minValue: data.salaryMin, maxValue: data.salaryMax, unitText: 'MONTH' },
      } : undefined,
    })
    document.head.appendChild(script)
  } catch {
    router.push({ name: 'candidate.jobs' })
  } finally {
    loading.value = false
  }
}

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return ''
  const fmt = (v: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(v)
  if (min && max) return `${fmt(min)} - ${fmt(max)} /mes`
  if (min) return `Desde ${fmt(min)} /mes`
  if (max) return `Hasta ${fmt(max)} /mes`
  return ''
}

onMounted(() => { void load() })
</script>

<template>
  <CandidateLayout>
    <div v-if="loading" class="py-16 text-center">
      <i class="pi pi-spin pi-spinner text-3xl text-muted-color" />
    </div>

    <template v-else-if="vacancy">
      <div class="mb-4">
        <Button icon="pi pi-arrow-left" label="Todas las vacantes" text size="small" @click="router.push({ name: 'candidate.jobs' })" />
      </div>

      <div class="rounded-xl border border-surface bg-surface-0 dark:bg-surface-900 p-6 shadow-sm">
        <div class="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-color">{{ vacancy.title }}</h1>
            <p v-if="vacancy.companyName" class="mt-1 text-muted-color">{{ vacancy.companyName }}</p>
          </div>
          <router-link :to="{ name: 'candidate.apply', params: { slug: vacancy.slug } }">
            <Button label="Aplicar ahora" icon="pi pi-send" />
          </router-link>
        </div>

        <div class="mb-6 flex flex-wrap gap-2">
          <Tag :value="typeLabels[vacancy.employmentType] ?? vacancy.employmentType" severity="info" />
          <Tag v-if="vacancy.location" :value="vacancy.location" severity="secondary" icon="pi pi-map-marker" />
          <Tag v-if="vacancy.salaryMin || vacancy.salaryMax" :value="formatSalary(vacancy.salaryMin, vacancy.salaryMax)" severity="success" icon="pi pi-dollar" />
        </div>

        <div v-if="vacancy.description" class="prose mb-6 max-w-none text-color">
          <h3 class="text-lg font-semibold">Descripción</h3>
          <p class="whitespace-pre-line">{{ vacancy.description }}</p>
        </div>

        <div v-if="vacancy.requirements?.length" class="mb-6">
          <h3 class="mb-2 text-lg font-semibold text-color">Requisitos</h3>
          <ul class="ml-4 list-disc text-color">
            <li v-for="req in vacancy.requirements" :key="req">{{ req }}</li>
          </ul>
        </div>

        <div v-if="vacancy.functions?.length" class="mb-6">
          <h3 class="mb-2 text-lg font-semibold text-color">Funciones</h3>
          <ul class="ml-4 list-disc text-color">
            <li v-for="fn in vacancy.functions" :key="fn">{{ fn }}</li>
          </ul>
        </div>

        <div v-if="vacancy.benefits?.length" class="mb-6">
          <h3 class="mb-2 text-lg font-semibold text-color">Beneficios</h3>
          <ul class="ml-4 list-disc text-color">
            <li v-for="b in vacancy.benefits" :key="b">{{ b }}</li>
          </ul>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-4 border-t border-surface pt-4">
          <ShareButtons :title="vacancy.title" :url="currentUrl" />
          <router-link :to="{ name: 'candidate.apply', params: { slug: vacancy.slug } }">
            <Button label="Aplicar ahora" icon="pi pi-send" />
          </router-link>
        </div>
      </div>
    </template>
  </CandidateLayout>
</template>
