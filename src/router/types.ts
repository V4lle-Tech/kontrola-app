import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    layout?: 'guest' | 'admin'
    requiresAuth?: boolean
    requiresAdmin?: boolean
    permission?: string
  }
}
