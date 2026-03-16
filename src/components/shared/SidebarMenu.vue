<script setup lang="ts">
import { useRoute } from 'vue-router'
import type { MenuSection } from '@/types/navigation'

defineProps<{
  sections: MenuSection[]
  collapsed: boolean
}>()

const emit = defineEmits<{
  navigate: []
}>()

const route = useRoute()

function isActive(to: string): boolean {
  return route.path === to
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-for="section in sections" :key="section.label">
      <p
        v-if="!collapsed"
        class="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-color"
      >
        {{ section.label }}
      </p>
      <div v-else class="mb-1 border-b border-surface" />

      <ul class="flex flex-col gap-0.5">
        <li v-for="item in section.items" :key="item.label">
          <router-link
            v-if="item.to"
            :to="item.to"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
            :class="
              isActive(item.to)
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-color hover:bg-surface-100 dark:hover:bg-surface-800'
            "
            :title="collapsed ? item.label : undefined"
            @click="emit('navigate')"
          >
            <i :class="item.icon" class="text-base" />
            <span v-if="!collapsed">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>
