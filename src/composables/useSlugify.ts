import type { Ref } from 'vue'

/**
 * Composable para auto-generación de slugs desde texto.
 *
 * @example
 * const name = ref('')
 * const slug = ref('')
 * const manuallyEdited = ref(false)
 * const { updateSlug, markAsManuallyEdited } = useSlugify(name, slug, manuallyEdited)
 */
export function useSlugify(source: Ref<string>, slug: Ref<string>, manuallyEdited: Ref<boolean>) {
  function slugify(text: string): string {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
      .substring(0, 255)
  }

  function updateSlug() {
    if (!manuallyEdited.value && source.value) {
      slug.value = slugify(source.value)
    }
  }

  function markAsManuallyEdited() {
    manuallyEdited.value = true
  }

  return {
    updateSlug,
    markAsManuallyEdited,
  }
}
