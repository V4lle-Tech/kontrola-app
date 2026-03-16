import { createApp, defineComponent, type App } from 'vue'

/**
 * Helper to test composables by mounting them inside a real Vue component.
 * This ensures reactivity works correctly during tests.
 */
export function withSetup<T>(composable: () => T): [T, App] {
  let result: T | undefined
  const app = createApp(
    defineComponent({
      setup() {
        result = composable()
        return () => null
      },
    }),
  )
  app.mount(document.createElement('div'))
  return [result as T, app]
}
