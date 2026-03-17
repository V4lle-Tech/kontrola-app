import { test, expect } from '../fixtures/base'
import { fillLoginForm, mockAuthApi } from '../helpers/auth'

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthApi(page)
    await page.goto('/login')
  })

  test('renders login form correctly', async ({ page, snap }) => {
    await expect(page.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible()
    await expect(page.getByLabel('Correo electrónico')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Iniciar Sesión' })).toBeVisible()
    await expect(page.getByText('¿Olvidaste tu contraseña?')).toBeVisible()
    await expect(page.getByText('Regístrate')).toBeVisible()

    // Capture for AI UX review — both themes
    await snap.captureBothThemes('login-empty', 'auth')
  })

  test('captures responsive viewports for UX analysis', async ({ page, snap }) => {
    await snap.captureViewports('login-responsive', 'auth')
  })

  test('shows validation state on invalid credentials', async ({ page, snap }) => {
    await fillLoginForm(page, { email: 'wrong@test.com', password: 'bad' })

    await expect(page.getByText(/Credenciales inválidas|Error al iniciar sesión/)).toBeVisible()

    await snap.capture('login-error', { category: 'auth' })
  })

  test('successful login redirects to dashboard', async ({ page }) => {
    await fillLoginForm(page, { email: 'admin@kontrola.com', password: 'Test1234!' })

    await page.waitForURL('/')
    await expect(page).toHaveURL('/')
  })

  test('navigates to forgot password', async ({ page, snap }) => {
    await page.getByText('¿Olvidaste tu contraseña?').click()
    await page.waitForURL('/forgot-password')

    await snap.capture('forgot-password', { category: 'auth' })
  })

  test('navigates to register', async ({ page, snap }) => {
    await page.getByText('Regístrate').click()
    await page.waitForURL('/register')

    await snap.capture('register', { category: 'auth' })
  })
})
