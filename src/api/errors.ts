import type { ApiError } from '@/types/api'

/**
 * Parses a raw API error response into a typed ApiError (RFC 9457).
 * Falls back to a generic error if the response doesn't match ProblemDetails.
 */
export function parseApiError(data: unknown): ApiError {
  if (data && typeof data === 'object' && 'status' in data) {
    const problem = data as Record<string, unknown>
    return {
      type: typeof problem.type === 'string' ? problem.type : undefined,
      title: typeof problem.title === 'string' ? problem.title : 'Error',
      status: typeof problem.status === 'number' ? problem.status : 0,
      detail: typeof problem.detail === 'string' ? problem.detail : undefined,
      instance: typeof problem.instance === 'string' ? problem.instance : undefined,
      traceId: typeof problem.traceId === 'string' ? problem.traceId : undefined,
      errors:
        problem.errors && typeof problem.errors === 'object'
          ? (problem.errors as Record<string, string[]>)
          : undefined,
    }
  }

  return {
    title: 'Error de conexión',
    status: 0,
    detail: 'No se pudo conectar con el servidor.',
  }
}
