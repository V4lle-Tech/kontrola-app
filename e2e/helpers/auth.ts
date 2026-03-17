import type { Page } from '@playwright/test'

/**
 * Fill and submit login form.
 * Does NOT assert result — caller decides what to expect.
 */
export async function fillLoginForm(
  page: Page,
  credentials: { email: string; password: string },
) {
  await page.getByLabel('Correo electrónico').fill(credentials.email)
  // PrimeVue Password wraps the input — target it via the container's textbox role
  await page.getByRole('textbox').nth(1).fill(credentials.password)
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click()
}

/**
 * Mock auth API responses for E2E tests that don't need a real backend.
 */
export async function mockAuthApi(page: Page) {
  // Mock login endpoint
  await page.route('**/auth/login', async (route) => {
    const body = route.request().postDataJSON()

    if (body.email === 'admin@kontrola.com' && body.password === 'Test1234!') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'mock-jwt-token-for-e2e',
          expiresInSeconds: 3600,
          user: {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'admin@kontrola.com',
            givenName: 'Admin',
            paternalName: 'Test',
            permissions: ['*'],
          },
        }),
      })
    } else {
      await route.fulfill({
        status: 401,
        contentType: 'application/problem+json',
        body: JSON.stringify({
          type: 'https://tools.ietf.org/html/rfc9110#section-15.5.2',
          title: 'Credenciales inválidas',
          status: 401,
        }),
      })
    }
  })

  // Mock refresh endpoint (always fail — no real session in E2E)
  await page.route('**/auth/refresh', async (route) => {
    await route.fulfill({ status: 401, contentType: 'application/json', body: '{}' })
  })

  // Mock logout
  await page.route('**/auth/logout', async (route) => {
    await route.fulfill({ status: 204 })
  })
}
