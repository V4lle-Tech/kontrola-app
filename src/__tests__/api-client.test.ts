import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/useAuthStore'
import { apiClient } from '@/api/client'
import type { InternalAxiosRequestConfig } from 'axios'

describe('apiClient', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('injects Bearer token when accessToken is set', async () => {
    const auth = useAuthStore()
    auth.setAccessToken('test-jwt-token')

    // Access the first request interceptor handler
    const handlers = (
      apiClient.interceptors.request as unknown as {
        handlers: Array<{ fulfilled: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig }>
      }
    ).handlers

    const interceptor = handlers[0] as (typeof handlers)[number]
    const config = interceptor.fulfilled({
      headers: {},
    } as InternalAxiosRequestConfig)

    expect(config.headers.Authorization).toBe('Bearer test-jwt-token')
  })

  it('does not inject token when accessToken is null', async () => {
    const handlers = (
      apiClient.interceptors.request as unknown as {
        handlers: Array<{ fulfilled: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig }>
      }
    ).handlers

    const interceptor = handlers[0] as (typeof handlers)[number]
    const config = interceptor.fulfilled({
      headers: {},
    } as InternalAxiosRequestConfig)

    expect(config.headers.Authorization).toBeUndefined()
  })
})
