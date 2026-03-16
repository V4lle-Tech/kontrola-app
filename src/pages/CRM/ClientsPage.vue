<script setup lang="ts">
import { ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import ClientsList from '@/components/crm/ClientsList.vue'
import ClientDetail from '@/components/crm/ClientDetail.vue'
import ClientForm from '@/components/crm/ClientForm.vue'
import type { Client } from '@/types/crm'

const selected = ref<Client | null>(null)
const formVisible = ref(false)
const listRef = ref<InstanceType<typeof ClientsList> | null>(null)

function onSelect(client: Client) { selected.value = client }
function onBack() { selected.value = null }
function onCreate() { formVisible.value = true }
function onSaved() { listRef.value?.reload() }
</script>

<template>
  <AppLayout>
    <div class="flex h-full">
      <div class="w-full shrink-0 border-r border-surface lg:w-[380px]" :class="selected ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'">
        <ClientsList ref="listRef" @select="onSelect" @create="onCreate" />
      </div>
      <div v-if="selected" class="flex flex-1 flex-col overflow-hidden">
        <ClientDetail :client="selected" @back="onBack" @updated="onSaved" />
      </div>
      <div v-else class="hidden flex-1 items-center justify-center lg:flex">
        <div class="text-center">
          <i class="pi pi-building mb-2 text-3xl text-muted-color" />
          <p class="text-muted-color">Selecciona un cliente</p>
        </div>
      </div>
    </div>
    <ClientForm v-model:visible="formVisible" @saved="onSaved" />
  </AppLayout>
</template>
