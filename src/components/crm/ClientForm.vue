<script setup lang="ts">
import { ref } from 'vue'
import Drawer from 'primevue/drawer'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import { useCrmApi } from '@/composables/api/useCrmApi'
import { generateId } from '@/utils/uuid'

interface Props {
  visible: boolean
}

defineProps<Props>()
const emit = defineEmits<{ 'update:visible': [value: boolean]; saved: [] }>()

const api = useCrmApi()
const toast = useToast()
const saving = ref(false)
const form = ref({
  name: '', rfc: '', industry: '', website: '', email: '', phone: '', address: '',
})

async function save() {
  if (!form.value.name.trim()) {
    toast.add({ severity: 'warn', summary: 'El nombre es requerido', life: 3000 })
    return
  }
  saving.value = true
  try {
    await api.createClient(generateId(), {
      name: form.value.name,
      rfc: form.value.rfc || undefined,
      industry: form.value.industry || undefined,
      website: form.value.website || undefined,
      email: form.value.email || undefined,
      phone: form.value.phone || undefined,
      address: form.value.address || undefined,
    })
    toast.add({ severity: 'success', summary: 'Cliente creado', life: 3000 })
    form.value = { name: '', rfc: '', industry: '', website: '', email: '', phone: '', address: '' }
    emit('update:visible', false)
    emit('saved')
  } catch {
    toast.add({ severity: 'error', summary: 'Error al crear cliente', life: 5000 })
  } finally { saving.value = false }
}
</script>

<template>
  <Drawer :visible="visible" header="Nuevo Cliente" position="right" :style="{ width: '28rem' }" @update:visible="emit('update:visible', $event)">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-color">Nombre *</label>
        <InputText v-model="form.name" placeholder="Nombre del cliente" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-color">RFC</label>
        <InputText v-model="form.rfc" placeholder="RFC" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-color">Industria</label>
        <InputText v-model="form.industry" placeholder="Ej: Tecnología" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-color">Sitio web</label>
        <InputText v-model="form.website" placeholder="https://..." />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-color">Email</label>
        <InputText v-model="form.email" placeholder="contacto@empresa.com" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-color">Teléfono</label>
        <InputText v-model="form.phone" placeholder="+52..." />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-color">Dirección</label>
        <Textarea v-model="form.address" rows="2" />
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" text @click="emit('update:visible', false)" />
        <Button label="Crear" icon="pi pi-check" :loading="saving" @click="save" />
      </div>
    </template>
  </Drawer>
</template>
