import { test } from '../fixtures/base'
import { mockAuthApi, fillLoginForm } from '../helpers/auth'

/**
 * Visual audit test suite — captures screenshots of key pages
 * for AI-driven UX/UI analysis.
 *
 * Run with: bun run e2e:screenshots
 *
 * The captured screenshots in e2e/screenshots/ can then be analyzed by
 * Claude via Playwright MCP (vision mode) or read directly with the
 * Read tool for multimodal analysis.
 */

// ── Guest Pages ──────────────────────────────────────────────────────

test.describe('Visual Audit — Guest Pages', () => {
  const guestPages = [
    { path: '/login', name: 'login' },
    { path: '/register', name: 'register' },
    { path: '/forgot-password', name: 'forgot-password' },
  ]

  for (const pg of guestPages) {
    test(`capture ${pg.name} — light & dark`, async ({ page, snap }) => {
      await page.goto(pg.path)
      await page.waitForLoadState('networkidle')
      await snap.captureBothThemes(pg.name, 'guest-pages')
    })

    test(`capture ${pg.name} — responsive`, async ({ page, snap }) => {
      await page.goto(pg.path)
      await page.waitForLoadState('networkidle')
      await snap.captureViewports(pg.name, 'responsive')
    })
  }
})

// ── Auth Required Pages ──────────────────────────────────────────────

test.describe('Visual Audit — App Pages', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthApi(page)
    await page.goto('/login')
    await fillLoginForm(page, { email: 'admin@kontrola.com', password: 'Test1234!' })
    await page.waitForURL('/')
  })

  // Dashboard
  test('capture dashboard — light & dark', async ({ page, snap }) => {
    await page.waitForLoadState('networkidle')
    await snap.captureBothThemes('dashboard', 'app-pages')
  })

  test('capture dashboard — responsive', async ({ page, snap }) => {
    await page.waitForLoadState('networkidle')
    await snap.captureViewports('dashboard', 'responsive')
  })

  // Candidates
  test('capture candidates — light & dark', async ({ page, snap }) => {
    await page.goto('/recruitment/candidates')
    await page.waitForLoadState('networkidle')
    await snap.captureBothThemes('candidates', 'app-pages')
  })

  test('capture candidates — responsive', async ({ page, snap }) => {
    await page.goto('/recruitment/candidates')
    await page.waitForLoadState('networkidle')
    await snap.captureViewports('candidates', 'responsive')
  })

  // Job Profiles
  test('capture job-profiles — light & dark', async ({ page, snap }) => {
    await page.goto('/recruitment/job-profiles')
    await page.waitForLoadState('networkidle')
    await snap.captureBothThemes('job-profiles', 'app-pages')
  })

  // Vacancies
  test('capture vacancies — light & dark', async ({ page, snap }) => {
    await page.goto('/recruitment/vacancies')
    await page.waitForLoadState('networkidle')
    await snap.captureBothThemes('vacancies', 'app-pages')
  })

  // Pipeline
  test('capture pipeline — light & dark', async ({ page, snap }) => {
    await page.goto('/recruitment/pipeline')
    await page.waitForLoadState('networkidle')
    await snap.captureBothThemes('pipeline', 'app-pages')
  })

  // Users
  test('capture users — light & dark', async ({ page, snap }) => {
    await page.goto('/access/users')
    await page.waitForLoadState('networkidle')
    await snap.captureBothThemes('users', 'app-pages')
  })

  // Roles
  test('capture roles — light & dark', async ({ page, snap }) => {
    await page.goto('/access/roles')
    await page.waitForLoadState('networkidle')
    await snap.captureBothThemes('roles', 'app-pages')
  })

  // Documents
  test('capture documents — light & dark', async ({ page, snap }) => {
    await page.goto('/documents')
    await page.waitForLoadState('networkidle')
    await snap.captureBothThemes('documents', 'app-pages')
  })

  test('capture document-types — light & dark', async ({ page, snap }) => {
    await page.goto('/documents/types')
    await page.waitForLoadState('networkidle')
    await snap.captureBothThemes('document-types', 'app-pages')
  })

  // CRM
  test('capture clients — light & dark', async ({ page, snap }) => {
    await page.goto('/crm/clients')
    await page.waitForLoadState('networkidle')
    await snap.captureBothThemes('clients', 'app-pages')
  })

  // Settings
  test('capture settings-profile — light & dark', async ({ page, snap }) => {
    await page.goto('/settings/profile')
    await page.waitForLoadState('networkidle')
    await snap.captureBothThemes('settings-profile', 'app-pages')
  })

  test('capture settings-business — light & dark', async ({ page, snap }) => {
    await page.goto('/settings/business')
    await page.waitForLoadState('networkidle')
    await snap.captureBothThemes('settings-business', 'app-pages')
  })

  // Metrics
  test('capture metrics — light & dark', async ({ page, snap }) => {
    await page.goto('/recruitment/metrics')
    await page.waitForLoadState('networkidle')
    await snap.captureBothThemes('metrics', 'app-pages')
  })

  // Syndication
  test('capture syndication — light & dark', async ({ page, snap }) => {
    await page.goto('/recruitment/syndication')
    await page.waitForLoadState('networkidle')
    await snap.captureBothThemes('syndication', 'app-pages')
  })
})

// ── Sidebar States ───────────────────────────────────────────────────

test.describe('Visual Audit — Sidebar States', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthApi(page)
    await page.goto('/login')
    await fillLoginForm(page, { email: 'admin@kontrola.com', password: 'Test1234!' })
    await page.waitForURL('/')
  })

  test('capture sidebar expanded — light & dark', async ({ page, snap }) => {
    await page.waitForLoadState('networkidle')
    await snap.captureBothThemes('sidebar-expanded', 'sidebar')
  })

  test('capture sidebar collapsed — light & dark', async ({ page, snap }) => {
    await page.waitForLoadState('networkidle')
    // Click collapse toggle
    const collapseBtn = page.locator('[data-testid="sidebar-collapse-toggle"]').or(
      page.locator('button:has(> .pi-chevron-left)'),
    )
    if (await collapseBtn.isVisible()) {
      await collapseBtn.click()
      await page.waitForTimeout(300)
    }
    await snap.captureBothThemes('sidebar-collapsed', 'sidebar')
  })
})
