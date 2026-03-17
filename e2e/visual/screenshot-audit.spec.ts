import { test, expect } from '../fixtures/base'
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

test.describe('Visual Audit — Auth Required Pages (mocked)', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthApi(page)

    // Login first
    await page.goto('/login')
    await fillLoginForm(page, { email: 'admin@kontrola.com', password: 'Test1234!' })
    await page.waitForURL('/')
  })

  test('capture dashboard — light & dark', async ({ page, snap }) => {
    await page.waitForLoadState('networkidle')
    await snap.captureBothThemes('dashboard', 'app-pages')
  })
})
