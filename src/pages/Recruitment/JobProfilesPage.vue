<script setup lang="ts">
import { ref, computed } from 'vue'
import Dialog from 'primevue/dialog'
import AppLayout from '@/layouts/AppLayout.vue'
import JobProfilesList from '@/components/recruitment/JobProfilesList.vue'
import JobProfileDetail from '@/components/recruitment/JobProfileDetail.vue'
import JobProfileWizard from '@/components/recruitment/JobProfileWizard.vue'
import type { JobProfile } from '@/types/recruitment'

const selectedProfile = ref<JobProfile | null>(null)
const listKey = ref(0)
const showCreateWizard = ref(false)

const showDetail = computed(() => selectedProfile.value !== null)

function selectProfile(profile: JobProfile) {
  selectedProfile.value = profile
}

function clearSelection() {
  selectedProfile.value = null
}

function onProfileUpdated(profile: JobProfile) {
  selectedProfile.value = profile
  listKey.value++
}

function onProfileDeleted() {
  selectedProfile.value = null
  listKey.value++
}

function onProfileCreated(profile: JobProfile) {
  showCreateWizard.value = false
  listKey.value++
  selectedProfile.value = profile
}

function openCreate() {
  showCreateWizard.value = true
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
        <JobProfilesList
          :key="listKey"
          :selected-id="selectedProfile?.id ?? null"
          @select="selectProfile"
          @create="openCreate"
        />
      </div>

      <!-- Panel derecho: Detalle -->
      <div v-if="showDetail && selectedProfile" class="flex flex-1 flex-col overflow-hidden">
        <JobProfileDetail
          :profile="selectedProfile"
          @back="clearSelection"
          @updated="onProfileUpdated"
          @deleted="onProfileDeleted"
        />
      </div>

      <!-- Estado vacío desktop -->
      <div v-else class="hidden flex-1 items-center justify-center lg:flex">
        <div class="text-center">
          <i class="pi pi-briefcase mb-3 text-4xl text-muted-color" />
          <p class="text-muted-color">Selecciona un perfil de puesto para ver su detalle</p>
        </div>
      </div>
    </div>

    <!-- Create wizard dialog -->
    <Dialog
      v-model:visible="showCreateWizard"
      modal
      header="Nuevo Perfil de Puesto"
      class="w-full max-w-3xl"
      :dismissable-mask="false"
    >
      <JobProfileWizard
        @created="onProfileCreated"
        @cancel="showCreateWizard = false"
      />
    </Dialog>
  </AppLayout>
</template>
