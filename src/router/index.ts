import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const guestRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/Auth/LoginPage.vue'),
    meta: { layout: 'guest', requiresAuth: false },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/pages/Auth/RegisterPage.vue'),
    meta: { layout: 'guest', requiresAuth: false },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/pages/Auth/ForgotPasswordPage.vue'),
    meta: { layout: 'guest', requiresAuth: false },
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('@/pages/Auth/ResetPasswordPage.vue'),
    meta: { layout: 'guest', requiresAuth: false },
  },
]

const appRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/pages/DashboardPage.vue'),
    meta: { requiresAuth: true },
  },

  // Recruitment
  {
    path: '/recruitment/candidates',
    name: 'candidates',
    component: () => import('@/pages/Recruitment/CandidatesPage.vue'),
    meta: { requiresAuth: true, permission: 'candidates.view' },
  },
  {
    path: '/recruitment/job-profiles',
    name: 'job-profiles',
    component: () => import('@/pages/Recruitment/JobProfilesPage.vue'),
    meta: { requiresAuth: true, permission: 'job-profiles.view' },
  },
  {
    path: '/recruitment/vacancies',
    name: 'vacancies',
    component: () => import('@/pages/Recruitment/VacanciesPage.vue'),
    meta: { requiresAuth: true, permission: 'vacancies.view' },
  },
  {
    path: '/recruitment/pipeline',
    name: 'pipeline',
    component: () => import('@/pages/Recruitment/PipelinePage.vue'),
    meta: { requiresAuth: true, permission: 'pipeline.view' },
  },

  // Documents
  {
    path: '/documents',
    name: 'documents',
    component: () => import('@/pages/Documents/DocumentsPage.vue'),
    meta: { requiresAuth: true, permission: 'documents.view' },
  },
  {
    path: '/documents/types',
    name: 'document-types',
    component: () => import('@/pages/Documents/DocumentTypesPage.vue'),
    meta: { requiresAuth: true, permission: 'document-types.view' },
  },

  // CRM
  {
    path: '/crm/clients',
    name: 'clients',
    component: () => import('@/pages/CRM/ClientsPage.vue'),
    meta: { requiresAuth: true, permission: 'clients.view' },
  },

  // Access
  {
    path: '/access/users',
    name: 'users',
    component: () => import('@/pages/Access/UsersPage.vue'),
    meta: { requiresAuth: true, permission: 'users.view' },
  },
  {
    path: '/access/roles',
    name: 'roles',
    component: () => import('@/pages/Access/RolesPage.vue'),
    meta: { requiresAuth: true, permission: 'roles.view' },
  },

  // Settings
  {
    path: '/settings/profile',
    name: 'profile',
    component: () => import('@/pages/Settings/ProfilePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/settings/business',
    name: 'business',
    component: () => import('@/pages/Settings/BusinessPage.vue'),
    meta: { requiresAuth: true, permission: 'settings.view' },
  },
]

const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    name: 'admin.dashboard',
    component: () => import('@/pages/Admin/AdminDashboardPage.vue'),
    meta: { layout: 'admin', requiresAuth: true, requiresAdmin: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...guestRoutes, ...appRoutes, ...adminRoutes],
})

// Auth guard placeholder — will be implemented in Phase 1 (F1-07)
router.beforeEach((to) => {
  const requiresAuth = to.meta.requiresAuth as boolean | undefined

  // TODO(F1-07): Check auth store for token, redirect to login if not authenticated
  // TODO(F1-07): If authenticated and visiting guest page, redirect to dashboard
  // TODO(F2-03): Check permissions via usePermissions() composable

  if (requiresAuth) {
    // Placeholder: allow all for now
  }

  return true
})

export default router
