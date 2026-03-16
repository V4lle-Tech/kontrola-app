import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/useAuthStore'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts unauthenticated', () => {
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.accessToken).toBeNull()
    expect(auth.user).toBeNull()
  })

  it('login sets token in memory and user data', async () => {
    const auth = useAuthStore()
    await auth.login({ email: 'test@kontrola.com.mx', password: 'password' })

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.accessToken).toBe('mock-jwt-token')
    expect(auth.user?.email).toBe('test@kontrola.com.mx')
    expect(auth.user?.givenName).toBe('Test')
  })

  it('login stores token in memory, NOT in localStorage', async () => {
    const auth = useAuthStore()
    await auth.login({ email: 'test@kontrola.com.mx', password: 'password' })

    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(localStorage.getItem('auth')).toBeNull()
    expect(auth.accessToken).toBe('mock-jwt-token')
  })

  it('register sets session just like login', async () => {
    const auth = useAuthStore()
    await auth.register({
      givenName: 'Test',
      paternalName: 'User',
      email: 'test@kontrola.com.mx',
      password: 'password',
      passwordConfirmation: 'password',
    })

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.accessToken).toBe('mock-jwt-token')
  })

  it('logout clears session', async () => {
    const auth = useAuthStore()
    await auth.login({ email: 'test@kontrola.com.mx', password: 'password' })
    expect(auth.isAuthenticated).toBe(true)

    await auth.logout()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.accessToken).toBeNull()
    expect(auth.user).toBeNull()
  })

  it('refreshAccessToken updates token', async () => {
    const auth = useAuthStore()
    await auth.login({ email: 'test@kontrola.com.mx', password: 'password' })

    const result = await auth.refreshAccessToken()
    expect(result).toBe(true)
    expect(auth.accessToken).toBe('refreshed-jwt-token')
  })

  it('checkPermission returns correct values', async () => {
    const auth = useAuthStore()
    await auth.login({ email: 'test@kontrola.com.mx', password: 'password' })

    expect(auth.checkPermission('candidates.view')).toBe(true)
    expect(auth.checkPermission('candidates.create')).toBe(true)
    expect(auth.checkPermission('admin.view')).toBe(false)
  })

  it('checkAnyPermission returns true if at least one matches', async () => {
    const auth = useAuthStore()
    await auth.login({ email: 'test@kontrola.com.mx', password: 'password' })

    expect(auth.checkAnyPermission(['admin.view', 'candidates.view'])).toBe(true)
    expect(auth.checkAnyPermission(['admin.view', 'admin.create'])).toBe(false)
  })

  it('clearSession resets state without API call', async () => {
    const auth = useAuthStore()
    await auth.login({ email: 'test@kontrola.com.mx', password: 'password' })

    auth.clearSession()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.accessToken).toBeNull()
  })
})
