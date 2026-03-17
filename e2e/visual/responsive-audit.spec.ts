import { test } from '../fixtures/base'
import { mockAuthApi, fillLoginForm } from '../helpers/auth'

/**
 * Responsive audit — captures screenshots at mobile, tablet, and desktop
 * breakpoints for key authenticated pages.
 *
 * Run with: bun run e2e:screenshots
 */

test.describe('Responsive Audit — Key Pages', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthApi(page)
    await page.goto('/login')
    await fillLoginForm(page, { email: 'admin@kontrola.com', password: 'Test1234!' })
    await page.waitForURL('/')
  })

  const pages = [
    { path: '/', name: 'dashboard' },
    { path: '/recruitment/candidates', name: 'candidates' },
    { path: '/recruitment/job-profiles', name: 'job-profiles' },
    { path: '/recruitment/vacancies', name: 'vacancies' },
    { path: '/recruitment/pipeline', name: 'pipeline' },
    { path: '/access/users', name: 'users' },
    { path: '/documents', name: 'documents' },
    { path: '/crm/clients', name: 'clients' },
    { path: '/settings/profile', name: 'settings-profile' },
  ]

  for (const pg of pages) {
    test(`capture ${pg.name} — all viewports`, async ({ page, snap }) => {
      await page.goto(pg.path)
      await page.waitForLoadState('networkidle')
      await snap.captureViewports(pg.name, 'responsive-app')
    })
  }
})
