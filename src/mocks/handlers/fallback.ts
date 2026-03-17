import { http, HttpResponse } from 'msw'

const BASE = import.meta.env.VITE_API_BASE_URL

/**
 * Catch-all handlers for any API endpoint not explicitly mocked.
 * Returns sensible empty responses so pages render without errors.
 *
 * Order matters — these must be registered LAST so specific handlers take priority.
 */
export const fallbackHandlers = [
  // GET → empty paginated list
  http.get(`${BASE}/*`, ({ request }) => {
    const url = new URL(request.url)
    console.info(`[MSW] fallback GET → ${url.pathname}`)
    return HttpResponse.json({
      data: [],
      meta: { currentPage: 1, lastPage: 1, perPage: 25, total: 0 },
    })
  }),

  // POST → 200 with empty object
  http.post(`${BASE}/*`, ({ request }) => {
    const url = new URL(request.url)
    console.info(`[MSW] fallback POST → ${url.pathname}`)
    return HttpResponse.json({ data: {} })
  }),

  // PUT → 200 with empty object
  http.put(`${BASE}/*`, ({ request }) => {
    const url = new URL(request.url)
    console.info(`[MSW] fallback PUT → ${url.pathname}`)
    return HttpResponse.json({ data: {} })
  }),

  // DELETE → 204 No Content
  http.delete(`${BASE}/*`, ({ request }) => {
    const url = new URL(request.url)
    console.info(`[MSW] fallback DELETE → ${url.pathname}`)
    return new HttpResponse(null, { status: 204 })
  }),
]
