<script setup lang="ts">
import { ref, watch } from 'vue'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import ToggleSwitch from 'primevue/toggleswitch'
import { useToast } from 'primevue/usetoast'
import { useCrmApi } from '@/composables/api/useCrmApi'
import { generateId } from '@/utils/uuid'
import type { Client, Branch, Contact } from '@/types/crm'

interface Props {
  client: Client
}

const props = defineProps<Props>()
const emit = defineEmits<{ back: []; updated: [] }>()

const api = useCrmApi()
const toast = useToast()
const branches = ref<Branch[]>([])
const contacts = ref<Contact[]>([])
const loadingBranches = ref(false)
const loadingContacts = ref(false)

// Branch dialog
const branchDialog = ref(false)
const branchForm = ref({ name: '', address: '', city: '', state: '', phone: '' })
const editingBranchId = ref<string | null>(null)
const savingBranch = ref(false)

// Contact dialog
const contactDialog = ref(false)
const contactForm = ref({ name: '', email: '', phone: '', position: '', isPrimary: false })
const editingContactId = ref<string | null>(null)
const savingContact = ref(false)

watch(() => props.client.id, async (id) => {
  if (!id) return
  loadingBranches.value = true
  loadingContacts.value = true
  try {
    const [b, c] = await Promise.all([api.getBranches(id), api.getContacts(id)])
    branches.value = b
    contacts.value = c
  } finally { loadingBranches.value = false; loadingContacts.value = false }
}, { immediate: true })

function openAddBranch() {
  editingBranchId.value = null
  branchForm.value = { name: '', address: '', city: '', state: '', phone: '' }
  branchDialog.value = true
}

function openEditBranch(b: Branch) {
  editingBranchId.value = b.id
  branchForm.value = { name: b.name, address: b.address ?? '', city: b.city ?? '', state: b.state ?? '', phone: b.phone ?? '' }
  branchDialog.value = true
}

async function saveBranch() {
  savingBranch.value = true
  try {
    if (editingBranchId.value) {
      await api.updateBranch(props.client.id, editingBranchId.value, branchForm.value)
    } else {
      await api.createBranch(props.client.id, generateId(), branchForm.value)
    }
    branches.value = await api.getBranches(props.client.id)
    branchDialog.value = false
    emit('updated')
  } catch { toast.add({ severity: 'error', summary: 'Error al guardar sucursal', life: 5000 }) }
  finally { savingBranch.value = false }
}

async function removeBranch(id: string) {
  try {
    await api.deleteBranch(props.client.id, id)
    branches.value = branches.value.filter(b => b.id !== id)
    emit('updated')
  } catch { toast.add({ severity: 'error', summary: 'Error al eliminar', life: 5000 }) }
}

function openAddContact() {
  editingContactId.value = null
  contactForm.value = { name: '', email: '', phone: '', position: '', isPrimary: false }
  contactDialog.value = true
}

function openEditContact(c: Contact) {
  editingContactId.value = c.id
  contactForm.value = { name: c.name, email: c.email ?? '', phone: c.phone ?? '', position: c.position ?? '', isPrimary: c.isPrimary }
  contactDialog.value = true
}

async function saveContact() {
  savingContact.value = true
  try {
    if (editingContactId.value) {
      await api.updateContact(props.client.id, editingContactId.value, contactForm.value)
    } else {
      await api.createContact(props.client.id, generateId(), contactForm.value)
    }
    contacts.value = await api.getContacts(props.client.id)
    contactDialog.value = false
    emit('updated')
  } catch { toast.add({ severity: 'error', summary: 'Error al guardar contacto', life: 5000 }) }
  finally { savingContact.value = false }
}

async function removeContact(id: string) {
  try {
    await api.deleteContact(props.client.id, id)
    contacts.value = contacts.value.filter(c => c.id !== id)
    emit('updated')
  } catch { toast.add({ severity: 'error', summary: 'Error al eliminar', life: 5000 }) }
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex items-center gap-3 border-b border-surface px-6 py-4">
      <Button icon="pi pi-arrow-left" severity="secondary" text size="small" class="lg:hidden" @click="emit('back')" />
      <div class="flex-1">
        <h2 class="text-lg font-semibold text-color">{{ client.name }}</h2>
        <div class="flex gap-3 text-sm text-muted-color">
          <span v-if="client.rfc">RFC: {{ client.rfc }}</span>
          <span v-if="client.industry">{{ client.industry }}</span>
        </div>
      </div>
      <Tag :value="client.isActive ? 'Activo' : 'Inactivo'" :severity="client.isActive ? 'success' : 'secondary'" />
    </div>

    <div class="flex-1 overflow-auto px-6 py-4">
      <div class="mb-4 grid grid-cols-2 gap-4">
        <div v-if="client.email" class="text-sm"><span class="text-muted-color">Email:</span> <span class="text-color">{{ client.email }}</span></div>
        <div v-if="client.phone" class="text-sm"><span class="text-muted-color">Teléfono:</span> <span class="text-color">{{ client.phone }}</span></div>
        <div v-if="client.website" class="text-sm"><span class="text-muted-color">Sitio web:</span> <span class="text-color">{{ client.website }}</span></div>
        <div v-if="client.address" class="col-span-2 text-sm"><span class="text-muted-color">Dirección:</span> <span class="text-color">{{ client.address }}</span></div>
      </div>
      <div class="mb-2 text-xs text-muted-color">Perfiles asociados: {{ client.jobProfileCount }}</div>

      <Tabs value="branches">
        <TabList>
          <Tab value="branches">Sucursales</Tab>
          <Tab value="contacts">Contactos</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="branches">
            <div class="mb-2 flex justify-end">
              <Button icon="pi pi-plus" label="Agregar" size="small" @click="openAddBranch" />
            </div>
            <DataTable :value="branches" :loading="loadingBranches">
              <Column field="name" header="Nombre" />
              <Column field="city" header="Ciudad" />
              <Column field="state" header="Estado" />
              <Column header="Acciones" style="width: 100px">
                <template #body="{ data }">
                  <div class="flex gap-1">
                    <Button icon="pi pi-pencil" severity="secondary" text size="small" @click="openEditBranch(data)" />
                    <Button icon="pi pi-trash" severity="danger" text size="small" @click="removeBranch(data.id)" />
                  </div>
                </template>
              </Column>
            </DataTable>
          </TabPanel>
          <TabPanel value="contacts">
            <div class="mb-2 flex justify-end">
              <Button icon="pi pi-plus" label="Agregar" size="small" @click="openAddContact" />
            </div>
            <DataTable :value="contacts" :loading="loadingContacts">
              <Column field="name" header="Nombre" />
              <Column field="email" header="Email" />
              <Column field="position" header="Puesto" />
              <Column header="Principal" style="width: 80px">
                <template #body="{ data }"><i v-if="data.isPrimary" class="pi pi-star-fill text-yellow-500" /></template>
              </Column>
              <Column header="Acciones" style="width: 100px">
                <template #body="{ data }">
                  <div class="flex gap-1">
                    <Button icon="pi pi-pencil" severity="secondary" text size="small" @click="openEditContact(data)" />
                    <Button icon="pi pi-trash" severity="danger" text size="small" @click="removeContact(data.id)" />
                  </div>
                </template>
              </Column>
            </DataTable>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>

    <!-- Branch Dialog -->
    <Dialog v-model:visible="branchDialog" :header="editingBranchId ? 'Editar Sucursal' : 'Nueva Sucursal'" modal :style="{ width: '28rem' }">
      <div class="flex flex-col gap-3">
        <InputText v-model="branchForm.name" placeholder="Nombre" />
        <InputText v-model="branchForm.address" placeholder="Dirección" />
        <div class="grid grid-cols-2 gap-3">
          <InputText v-model="branchForm.city" placeholder="Ciudad" />
          <InputText v-model="branchForm.state" placeholder="Estado" />
        </div>
        <InputText v-model="branchForm.phone" placeholder="Teléfono" />
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="branchDialog = false" />
        <Button label="Guardar" icon="pi pi-check" :loading="savingBranch" @click="saveBranch" />
      </template>
    </Dialog>

    <!-- Contact Dialog -->
    <Dialog v-model:visible="contactDialog" :header="editingContactId ? 'Editar Contacto' : 'Nuevo Contacto'" modal :style="{ width: '28rem' }">
      <div class="flex flex-col gap-3">
        <InputText v-model="contactForm.name" placeholder="Nombre" />
        <InputText v-model="contactForm.email" placeholder="Email" />
        <InputText v-model="contactForm.phone" placeholder="Teléfono" />
        <InputText v-model="contactForm.position" placeholder="Puesto" />
        <div class="flex items-center gap-2">
          <ToggleSwitch v-model="contactForm.isPrimary" />
          <label class="text-sm text-color">Contacto principal</label>
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="contactDialog = false" />
        <Button label="Guardar" icon="pi pi-check" :loading="savingContact" @click="saveContact" />
      </template>
    </Dialog>
  </div>
</template>
