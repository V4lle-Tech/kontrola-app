import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

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
    path: '/recruitment/tags',
    name: 'tags',
    component: () => import('@/pages/Recruitment/TagsPage.vue'),
    meta: { requiresAuth: true, permission: 'tags.view' },
  },
  {
    path: '/recruitment/selection-processes',
    name: 'selection-processes',
    component: () => import('@/pages/Recruitment/SelectionProcessesPage.vue'),
    meta: { requiresAuth: true, permission: 'selection-processes.view' },
  },
  {
    path: '/recruitment/pipeline',
    name: 'pipeline',
    component: () => import('@/pages/Recruitment/PipelinePage.vue'),
    meta: { requiresAuth: true, permission: 'pipeline.view' },
  },
  {
    path: '/recruitment/skip-requests',
    name: 'skip-requests',
    component: () => import('@/pages/Recruitment/StageSkipRequestsPage.vue'),
    meta: { requiresAuth: true, permission: 'pipeline.manage' },
  },
  {
    path: '/recruitment/metrics',
    name: 'recruitment-metrics',
    component: () => import('@/pages/Recruitment/RecruitmentDashboardPage.vue'),
    meta: { requiresAuth: true, permission: 'metrics.view' },
  },
  {
    path: '/recruitment/syndication',
    name: 'syndication',
    component: () => import('@/pages/Recruitment/SyndicationDashboardPage.vue'),
    meta: { requiresAuth: true, permission: 'syndication.view' },
  },
  {
    path: '/recruitment/job-boards',
    name: 'job-boards',
    component: () => import('@/pages/Recruitment/JobBoardsPage.vue'),
    meta: { requiresAuth: true, permission: 'syndication.manage' },
  },
  {
    path: '/recruitment/social-templates',
    name: 'social-templates',
    component: () => import('@/pages/Recruitment/SocialTemplatesPage.vue'),
    meta: { requiresAuth: true, permission: 'syndication.manage' },
  },
  {
    path: '/recruitment/syndication-settings',
    name: 'syndication-settings',
    component: () => import('@/pages/Recruitment/SyndicationSettingsPage.vue'),
    meta: { requiresAuth: true, permission: 'syndication.manage' },
  },
  {
    path: '/recruitment/meta-callback',
    name: 'meta-callback',
    component: () => import('@/pages/Recruitment/MetaCallbackPage.vue'),
    meta: { requiresAuth: true, permission: 'syndication.manage' },
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
  {
    path: '/documents/compliance',
    name: 'compliance',
    component: () => import('@/pages/Documents/ComplianceDashboardPage.vue'),
    meta: { requiresAuth: true, permission: 'documents.view' },
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

// Auth guard — redirects based on authentication state
router.beforeEach((to) => {
  const auth = useAuthStore()

  const requiresAuth = to.meta.requiresAuth !== false
  const isGuestOnly = to.meta.requiresAuth === false

  // Unauthenticated user trying to access protected route → login
  if (requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Authenticated user trying to access guest-only page (login, register) → dashboard
  if (isGuestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  // Check route-level permission
  const requiredPermission = to.meta.permission as string | undefined
  if (requiredPermission && !auth.checkPermission(requiredPermission)) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
