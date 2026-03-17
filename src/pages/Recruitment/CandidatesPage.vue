<script setup lang="ts">
import { ref, computed } from 'vue'
import Dialog from 'primevue/dialog'
import AppLayout from '@/layouts/AppLayout.vue'
import CandidatesList from '@/components/recruitment/CandidatesList.vue'
import CandidateDetail from '@/components/recruitment/CandidateDetail.vue'
import CandidateCreate from '@/components/recruitment/CandidateCreate.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import type { CandidateListItem } from '@/types/recruitment'

const selectedCandidate = ref<CandidateListItem | null>(null)
const showCreateDialog = ref(false)
const listKey = ref(0)

const showDetail = computed(() => selectedCandidate.value !== null)

function selectCandidate(candidate: CandidateListItem) {
  selectedCandidate.value = candidate
}

function clearSelection() {
  selectedCandidate.value = null
}

function onCandidateUpdated(candidate: CandidateListItem) {
  selectedCandidate.value = candidate
  listKey.value++
}

function onCandidateDeleted() {
  selectedCandidate.value = null
  listKey.value++
}

function onCandidateCreated(candidate: CandidateListItem) {
  showCreateDialog.value = false
  listKey.value++
  selectedCandidate.value = candidate
}

function openCreate() {
  showCreateDialog.value = true
}
</script>

<template>
  <AppLayout>
    <div class="flex h-full">
      <!-- Panel izquierdo: Lista fija 380px -->
      <div
        class="w-full shrink-0 border-r border-surface lg:w-[380px]"
        :class="showDetail ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'"
      >
        <CandidatesList
          :key="listKey"
          :selected-id="selectedCandidate?.id ?? null"
          @select="selectCandidate"
          @create="openCreate"
        />
      </div>

      <!-- Panel derecho: Detalle -->
      <div v-if="showDetail && selectedCandidate" class="flex flex-1 flex-col overflow-hidden">
        <CandidateDetail
          :candidate="selectedCandidate"
          @back="clearSelection"
          @updated="onCandidateUpdated"
          @deleted="onCandidateDeleted"
        />
      </div>

      <!-- Estado vacío desktop -->
      <div v-else class="hidden flex-1 items-center justify-center lg:flex">
        <EmptyState icon="pi pi-users" title="Selecciona un candidato para ver su detalle" />
      </div>
    </div>

    <!-- Create candidate dialog -->
    <Dialog
      v-model:visible="showCreateDialog"
      modal
      header="Nuevo Candidato"
      class="w-full max-w-2xl"
    >
      <CandidateCreate
        @created="onCandidateCreated"
        @cancel="showCreateDialog = false"
      />
    </Dialog>
  </AppLayout>
</template>
