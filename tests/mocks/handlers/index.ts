import type { RequestHandler } from 'msw'
import { authHandlers } from './auth'

// Combine all module handlers here as they are created
export const handlers: RequestHandler[] = [
  ...authHandlers,
  // TODO(F4-01): Add recruitment handlers
]
