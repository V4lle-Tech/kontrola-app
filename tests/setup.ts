import { beforeAll, afterEach, afterAll } from 'vitest'
import { config } from '@vue/test-utils'
import { server } from './mocks/server'

// MSW — start mock server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Global PrimeVue stubs to avoid errors in components
// that use Toast/ConfirmDialog without a provider in the tree
config.global.stubs = {
  Toast: true,
  ConfirmDialog: true,
  Teleport: true,
}

// Suppress Vue warnings about unresolved PrimeVue components
config.global.config.warnHandler = (msg) => {
  if (msg.includes('Failed to resolve component')) return
  console.warn(msg)
}
