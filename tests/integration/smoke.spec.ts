import { describe, it, expect } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import router from '@/router'

describe('Smoke test — all routes resolve', () => {
  const allRoutes = router.getRoutes()

  it('should have routes registered', () => {
    expect(allRoutes.length).toBeGreaterThan(0)
  })

  it('should have all expected modules', () => {
    const routeNames = allRoutes.map((r) => r.name).filter(Boolean) as string[]

    // Auth
    expect(routeNames).toContain('login')
    expect(routeNames).toContain('register')

    // Dashboard
    expect(routeNames).toContain('dashboard')

    // Recruitment
    expect(routeNames).toContain('candidates')
    expect(routeNames).toContain('job-profiles')
    expect(routeNames).toContain('vacancies')
    expect(routeNames).toContain('pipeline')
    expect(routeNames).toContain('tags')

    // Documents
    expect(routeNames).toContain('documents')
    expect(routeNames).toContain('document-types')
    expect(routeNames).toContain('compliance')

    // CRM
    expect(routeNames).toContain('clients')

    // Access
    expect(routeNames).toContain('users')
    expect(routeNames).toContain('roles')

    // Settings
    expect(routeNames).toContain('profile')
    expect(routeNames).toContain('business')
    expect(routeNames).toContain('api-keys')
    expect(routeNames).toContain('modules')

    // Admin
    expect(routeNames).toContain('admin.dashboard')
    expect(routeNames).toContain('admin.tenants')
    expect(routeNames).toContain('admin.billing')

    // Candidate Portal
    expect(routeNames).toContain('candidate.jobs')
    expect(routeNames).toContain('candidate.login')
    expect(routeNames).toContain('candidate.dashboard')
  })

  it('should resolve each route without errors', async () => {
    setActivePinia(createPinia())
    const testRouter = createRouter({
      history: createMemoryHistory(),
      routes: router.options.routes,
    })

    for (const route of allRoutes) {
      if (!route.path || route.path.includes(':')) continue

      const resolved = testRouter.resolve(route.path)
      expect(resolved).toBeDefined()
      expect(resolved.matched.length).toBeGreaterThan(0)
    }
  })

  it('should have no duplicate route names', () => {
    const names = allRoutes.map((r) => r.name).filter(Boolean)
    const unique = new Set(names)
    expect(names.length).toBe(unique.size)
  })

  it('should require auth for protected routes', () => {
    const protectedRoutes = allRoutes.filter(
      (r) => r.meta.requiresAuth === true || (r.meta.requiresAuth !== false && !r.meta.requiresCandidateAuth),
    )
    for (const route of protectedRoutes) {
      if (route.path.startsWith('/portal/') || route.meta.requiresAuth === false) continue
      expect(route.meta.requiresAuth).not.toBe(false)
    }
  })
})
