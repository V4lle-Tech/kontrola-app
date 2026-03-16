import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    layout?: 'guest' | 'admin' | 'candidate'
    requiresAuth?: boolean
    requiresAdmin?: boolean
    requiresCandidateAuth?: boolean
    permission?: string
  }
}
