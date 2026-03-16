<script setup lang="ts">
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'

interface Props {
  title: string
  url: string
}

const props = defineProps<Props>()
const toast = useToast()

function shareOnFacebook() {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.url)}`, '_blank', 'width=600,height=400')
}

function shareOnLinkedIn() {
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(props.url)}`, '_blank', 'width=600,height=400')
}

function shareOnWhatsApp() {
  window.open(`https://wa.me/?text=${encodeURIComponent(`${props.title} — ${props.url}`)}`, '_blank')
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.url)
    toast.add({ severity: 'success', summary: 'Enlace copiado', life: 2000 })
  } catch {
    toast.add({ severity: 'error', summary: 'No se pudo copiar', life: 3000 })
  }
}
</script>

<template>
  <div class="flex items-center gap-1">
    <span class="mr-1 text-sm text-muted-color">Compartir:</span>
    <Button icon="pi pi-facebook" text rounded size="small" severity="info" aria-label="Compartir en Facebook" @click="shareOnFacebook" />
    <Button icon="pi pi-linkedin" text rounded size="small" severity="info" aria-label="Compartir en LinkedIn" @click="shareOnLinkedIn" />
    <Button icon="pi pi-whatsapp" text rounded size="small" severity="success" aria-label="Compartir en WhatsApp" @click="shareOnWhatsApp" />
    <Button icon="pi pi-link" text rounded size="small" severity="secondary" aria-label="Copiar enlace" @click="copyLink" />
  </div>
</template>
