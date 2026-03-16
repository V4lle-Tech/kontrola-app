/**
 * RFC 9457 Problem Details for HTTP APIs.
 * Standard error response format from kontrola-net.
 */
export interface ApiError {
  type?: string
  title: string
  status: number
  detail?: string
  instance?: string
  traceId?: string
  errors?: Record<string, string[]>
}
