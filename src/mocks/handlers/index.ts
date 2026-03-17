import type { RequestHandler } from 'msw'
import { authHandlers } from './auth'
import { fallbackHandlers } from './fallback'

// Specific handlers first, fallback catch-all last
export const handlers: RequestHandler[] = [...authHandlers, ...fallbackHandlers]
