<script setup lang="ts">
interface Props {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showText?: boolean;
}

withDefaults(defineProps<Props>(), {
    size: 'md',
    showText: true,
});

const sizeClasses = {
    sm: { icon: 'w-6 h-6', text: 'text-base', gap: 'gap-1.5' },
    md: { icon: 'w-8 h-8', text: 'text-xl', gap: 'gap-2' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl', gap: 'gap-2.5' },
    xl: { icon: 'w-12 h-12', text: 'text-3xl', gap: 'gap-3' },
};
</script>

<template>
    <div class="flex items-center" :class="sizeClasses[size].gap">
        <!-- Icon placeholder - replace with actual logo when available -->
        <div class="flex shrink-0 items-center justify-center rounded-lg bg-primary" :class="sizeClasses[size].icon">
            <span class="font-bold text-primary-contrast" :class="size === 'sm' ? 'text-xs' : 'text-sm'">K</span>
        </div>
        <!-- Text -->
        <span v-if="showText" class="font-bold text-color" :class="sizeClasses[size].text"> Kontrola </span>
    </div>
</template>
