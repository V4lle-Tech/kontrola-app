/**
 * Starts MSW browser worker in development when VITE_MOCK_API=true.
 * Must be called (and awaited) before mounting the Vue app.
 */
export async function startMockWorker(): Promise<void> {
  if (import.meta.env.VITE_MOCK_API !== 'true') return

  const { worker } = await import('./browser')

  await worker.start({
    onUnhandledRequest: 'bypass', // Let non-API requests (assets, HMR) pass through
  })

  console.info(
    '%c[Mock Mode] MSW intercepting API calls — all endpoints return mock data',
    'color: #f59e0b; font-weight: bold;',
  )
}
