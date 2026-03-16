import type { App } from 'vue'
import type { Router } from 'vue-router'

interface SentryConfig {
  dsn: string
  environment: string
  release?: string
}

// In-memory reference to Sentry module after dynamic import
let sentryModule: {
  setTag: (key: string, value: string) => void
  setUser: (user: { id: string; email?: string } | null) => void
  captureException: (error: unknown) => void
} | null = null

/**
 * Initialize Sentry error tracking.
 * @sentry/vue must be installed as a dependency for this to work.
 * If not installed, the plugin silently skips initialization.
 */
export async function initSentry(app: App, router: Router, config: SentryConfig): Promise<void> {
  if (!config.dsn) return

  try {
    // Dynamic import — tree-shaken if @sentry/vue is not installed
    const Sentry = await import('@sentry/vue' as string) as Record<string, unknown>

    const init = Sentry['init'] as (opts: Record<string, unknown>) => void
    const browserTracingIntegration = Sentry['browserTracingIntegration'] as (opts: Record<string, unknown>) => unknown

    init({
      app,
      dsn: config.dsn,
      environment: config.environment,
      release: config.release,
      integrations: [browserTracingIntegration({ router })],
      tracesSampleRate: config.environment === 'production' ? 0.2 : 1.0,
    })

    sentryModule = {
      setTag: Sentry['setTag'] as (key: string, value: string) => void,
      setUser: Sentry['setUser'] as (user: { id: string; email?: string } | null) => void,
      captureException: Sentry['captureException'] as (error: unknown) => void,
    }
  } catch {
    // @sentry/vue not installed — skip silently
  }
}

export function setSentryTenant(tenantId: string, tenantSlug: string): void {
  sentryModule?.setTag('tenant.id', tenantId)
  sentryModule?.setTag('tenant.slug', tenantSlug)
}

export function setSentryUser(userId: string, email?: string): void {
  sentryModule?.setUser({ id: userId, email })
}

export function clearSentryUser(): void {
  sentryModule?.setUser(null)
}

export function captureError(error: unknown): void {
  sentryModule?.captureException(error)
}
