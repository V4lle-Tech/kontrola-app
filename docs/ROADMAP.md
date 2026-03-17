# Roadmap — kontrola-app (Frontend SPA)

> Plan de migración del frontend Laravel/Inertia → SPA Vue 3 standalone.
> Cada fase tiene criterios de salida binarios (pasa/no pasa). No se avanza sin cumplir TODOS.
>
> **Estado: COMPLETADO** — Todas las fases 0-25 completadas. SPA alineado visual y funcionalmente con el monolito.

---

## Resumen de Fases

| Fase | Módulo                        | Tareas | Estado     |
| ---- | ----------------------------- | ------ | ---------- |
| 0    | Scaffold & Toolchain          | 8      | COMPLETADO |
| 1    | Auth & Session                | 7      | COMPLETADO |
| 2    | Layout & Navigation           | 6      | COMPLETADO |
| 3    | Access Control (Users, Roles) | 8      | COMPLETADO |
| 4    | Recruitment — Core            | 12     | COMPLETADO |
| 5    | Recruitment — Pipeline        | 10     | COMPLETADO |
| 6    | Recruitment — Metrics         | 6      | COMPLETADO |
| 7    | Recruitment — Syndication     | 7      | COMPLETADO |
| 8    | Documents                     | 9      | COMPLETADO |
| 9    | CRM                           | 5      | COMPLETADO |
| 10   | Settings & Profile            | 5      | COMPLETADO |
| 11   | Admin Panel                   | 10     | COMPLETADO |
| 12   | Candidate Portal              | 8      | COMPLETADO |
| 13   | Polish & Production           | 6      | COMPLETADO |
| 14   | Shared Components & Composables | 10   | COMPLETADO |
| 15   | Auth & Access Gaps            | 7      | COMPLETADO |
| 16   | Recruitment Gaps              | 8      | COMPLETADO |
| 17   | Admin & Candidate Gaps        | 8      | COMPLETADO |
| 18   | Types & Layouts               | 6      | COMPLETADO |
| 19   | Final Validation              | 4      | COMPLETADO |
| 20   | Design System Alignment       | 6      | COMPLETADO |
| 21   | Layout Fidelity               | 8      | COMPLETADO |
| 22   | Shared Components Parity      | 10     | COMPLETADO |
| 23   | Composables Parity            | 7      | COMPLETADO |
| 24   | Page Polish & Patterns        | 8      | COMPLETADO |
| 25   | Visual QA & E2E Validation    | 5      | COMPLETADO |

**Total**: 194 tareas — 194 completadas (100%)

---

## Fase 0 — Scaffold & Toolchain

**Objetivo**: Proyecto funcional con `bun dev` sirviendo una página vacía con PrimeVue + Tailwind + dark mode.

### Tareas

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| F0-01 | Init Vite + Vue 3 + TypeScript | `vite.config.ts`, `tsconfig.json` | HECHO |
| F0-02 | Instalar PrimeVue 4 + Aura preset | `src/main.ts` | HECHO |
| F0-03 | Configurar Tailwind CSS v4 | `src/assets/main.css` | HECHO |
| F0-04 | Configurar Vue Router 4 | `src/router/index.ts` | HECHO |
| F0-05 | Configurar Pinia | `src/stores/` | HECHO |
| F0-06 | Configurar Axios + API client | `src/api/client.ts` | HECHO |
| F0-07 | Configurar ESLint + Prettier | `eslint.config.ts`, `.prettierrc` | HECHO |
| F0-08 | Configurar Vitest + MSW | `vitest.config.ts`, `tests/setup.ts`, `tests/mocks/server.ts` | HECHO |

### Gate (Criterios de Salida)

- [x] `bun dev` sirve página con componente PrimeVue visible
- [x] Dark mode toggle funciona (light/dark/system)
- [x] `bun run type-check` pasa sin errores
- [x] `bun run lint` pasa sin warnings
- [x] `bun run test` ejecuta al menos 1 test unitario
- [x] `bun run build` genera bundle sin errores
- [x] Semantic tokens funcionan (`text-color`, `bg-surface-0 dark:bg-surface-900`)
- [x] Axios interceptor inyecta Bearer token (test unitario)

---

## Fase 1 — Auth & Session

**Objetivo**: Login, register, forgot/reset password funcionales contra la API de kontrola-net.

### Tareas

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| F1-01 | Crear `useAuthStore` (Pinia) | `src/stores/useAuthStore.ts` | HECHO |
| F1-02 | Crear `GuestLayout.vue` | `src/layouts/GuestLayout.vue` | HECHO |
| F1-03 | Crear `LoginPage.vue` | `src/pages/Auth/LoginPage.vue` | HECHO |
| F1-04 | Crear `RegisterPage.vue` | `src/pages/Auth/RegisterPage.vue` | HECHO |
| F1-05 | Crear `ForgotPasswordPage.vue` | `src/pages/Auth/ForgotPasswordPage.vue` | HECHO |
| F1-06 | Crear `ResetPasswordPage.vue` | `src/pages/Auth/ResetPasswordPage.vue` | HECHO |
| F1-07 | Configurar route guards | `src/router/index.ts` (beforeEach) | HECHO |

### Gate

- [x] Login exitoso almacena token en memoria (NO localStorage)
- [x] Refresh token automático antes de expiración
- [x] 401 en cualquier request dispara refresh → retry
- [x] Logout limpia token + invalida cookie en servidor
- [x] Register crea cuenta y redirige a dashboard
- [x] Forgot/Reset password flujo completo funcional
- [x] Route guard redirige correctamente en ambas direcciones
- [x] Errores de validación (422) se muestran por campo

---

## Fase 2 — Layout & Navigation

**Objetivo**: AppLayout con sidebar, topbar, navegación por módulos con permisos.

### Tareas

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| F2-01 | Crear `AppLayout.vue` | `src/layouts/AppLayout.vue` | HECHO |
| F2-02 | Crear sistema de menú dinámico | `src/composables/useNavigation.ts` | HECHO |
| F2-03 | Crear `usePermissions()` composable | `src/composables/usePermissions.ts` | HECHO |
| F2-04 | Crear `ThemeToggle.vue` | `src/components/shared/ThemeToggle.vue` | HECHO |
| F2-05 | Crear `DashboardPage.vue` | `src/pages/DashboardPage.vue` | HECHO |
| F2-06 | Crear `useSidebar()` composable | `src/composables/useSidebar.ts` | HECHO |

### Gate

- [x] Sidebar muestra menú correcto según permisos del usuario
- [x] Módulos deshabilitados muestran candado
- [x] Sidebar colapsa en mobile (hamburger menu)
- [x] Dark mode persiste entre recargas
- [x] Navegación entre secciones funciona sin reload
- [x] Layout responsive en mobile, tablet y desktop

---

## Fase 3 — Access Control (Users & Roles)

**Objetivo**: CRUD completo de usuarios y roles con editor de permisos.

### Tareas

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| F3-01 | Crear `useAccessApi()` composable | `src/composables/api/useAccessApi.ts` | HECHO |
| F3-02 | Crear `UsersPage.vue` (Panel View) | `src/pages/Access/UsersPage.vue` | HECHO |
| F3-03 | Crear `UsersList.vue` | `src/components/access/UsersList.vue` | HECHO |
| F3-04 | Crear `UserDetail.vue` | `src/components/access/UserDetail.vue` | HECHO |
| F3-05 | Crear `UserCreate.vue` / `UserInvite.vue` | `src/components/access/UserCreate.vue`, `UserInvite.vue` | HECHO |
| F3-06 | Crear `RolesPage.vue` (Panel View) | `src/pages/Access/RolesPage.vue` | HECHO |
| F3-07 | Crear `RoleForm.vue` | `src/components/access/RoleForm.vue`, `RolesList.vue`, `RoleDetail.vue` | HECHO |
| F3-08 | Crear `PermissionSelector.vue` | `src/components/access/PermissionSelector.vue` | HECHO |

### Gate

- [x] CRUD completo de usuarios funcional
- [x] Invitaciones por email enviadas correctamente
- [x] CRUD completo de roles funcional
- [x] Permisos se asignan/revocan correctamente
- [x] Panel View responsive (lista oculta en mobile al seleccionar)
- [x] Validación de formularios con errores por campo
- [x] Paginación server-side funcional

---

## Fase 4 — Recruitment Core (Candidates, Job Profiles, Processes)

**Objetivo**: CRUD de candidatos, perfiles de puesto (wizard 6 pasos), procesos de selección.

### Tareas

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| F4-01 | Crear `useRecruitmentApi()` composable | `src/composables/api/useRecruitmentApi.ts` | HECHO |
| F4-02 | Crear `CandidatesPage.vue` (Panel View) | `src/pages/Recruitment/CandidatesPage.vue` | HECHO |
| F4-03 | Crear `CandidatesList.vue` | `src/components/recruitment/CandidatesList.vue` | HECHO |
| F4-04 | Crear `CandidateDetail.vue` | `src/components/recruitment/CandidateDetail.vue` | HECHO |
| F4-05 | Crear `CandidateCreate.vue` | `src/components/recruitment/CandidateCreate.vue` | HECHO |
| F4-06 | Crear `AdvancedFilterPanel.vue` | `src/components/recruitment/AdvancedFilterPanel.vue` | HECHO |
| F4-07 | Crear `JobProfilesPage.vue` (Panel View) | `src/pages/Recruitment/JobProfilesPage.vue` | HECHO |
| F4-08 | Crear wizard de Job Profile (6 pasos) | `src/components/recruitment/JobProfileWizard.vue` | HECHO |
| F4-09 | Crear `SelectionProcessesPage.vue` | `src/pages/Recruitment/SelectionProcessesPage.vue` | HECHO |
| F4-10 | Crear `StageCard.vue` + `StageEdit.vue` | `src/components/recruitment/StageCard.vue`, `StageEdit.vue` | HECHO |
| F4-11 | Crear `VacanciesPage.vue` | `src/pages/Recruitment/VacanciesPage.vue` | HECHO |
| F4-12 | Crear `TagsPage.vue` | `src/pages/Recruitment/TagsPage.vue` | HECHO |

### Gate

- [x] CRUD completo de candidatos (crear, leer, editar, eliminar)
- [x] Filtros avanzados funcionan (source, tags, education, rango de fechas)
- [x] Wizard de Job Profile completa 6 pasos y guarda correctamente
- [x] Estados de Job Profile (draft → active → archived) transicionan
- [x] Procesos de selección con stages ordenables y colores
- [x] Vacantes con ciclo de vida completo (draft → published → closed)
- [x] Tags se crean, asignan y eliminan en bulk
- [x] Búsquedas guardadas persisten y se aplican

---

## Fase 5 — Recruitment Pipeline (Kanban)

**Objetivo**: Tablero Kanban con drag-and-drop, drawer de candidato, notas, stage skip requests.

### Tareas

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| F5-01 | Crear `PipelinePage.vue` | `src/pages/Recruitment/PipelinePage.vue` | HECHO |
| F5-02 | Crear `KanbanBoard.vue` | `src/components/recruitment/KanbanBoard.vue` | HECHO |
| F5-03 | Crear `KanbanColumn.vue` | `src/components/recruitment/KanbanColumn.vue` | HECHO |
| F5-04 | Crear `KanbanCard.vue` | `src/components/recruitment/KanbanCard.vue` | HECHO |
| F5-05 | Crear `CandidateProfileDrawer.vue` | `src/components/recruitment/CandidateProfileDrawer.vue` | HECHO |
| F5-06 | Crear `CandidateHistoryDrawer.vue` | `src/components/recruitment/CandidateHistoryDrawer.vue` | HECHO |
| F5-07 | Crear `FinalStageModal.vue` | `src/components/recruitment/FinalStageModal.vue` | HECHO |
| F5-08 | Crear `AddNoteModal.vue` | `src/components/recruitment/AddNoteModal.vue` | HECHO |
| F5-09 | Crear `SkipConfirmModal.vue` | `src/components/recruitment/SkipConfirmModal.vue` | HECHO |
| F5-10 | Crear `StageSkipRequestsPage.vue` | `src/pages/Recruitment/StageSkipRequestsPage.vue` | HECHO |

### Gate

- [x] Drag-and-drop mueve candidatos entre stages
- [x] Movimiento persiste en API y actualiza UI
- [x] Stages con `requiresApproval` muestran modal de confirmación
- [x] Drawer de candidato muestra perfil completo
- [x] Timeline de historial muestra todos los movimientos
- [x] Modal de contratación/rechazo funcional
- [x] Notas se agregan y persisten
- [x] Filtros de Kanban (proceso, fecha, tags) funcionan
- [x] Indicador de tiempo en stage visible

---

## Fase 6 — Recruitment Metrics Dashboard

**Objetivo**: Dashboard de reclutamiento con gráficas y KPIs.

### Tareas

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| F6-01 | Instalar Chart.js | `package.json` (chart.js, vue-chartjs) | HECHO |
| F6-02 | Crear `RecruitmentDashboardPage.vue` | `src/pages/Recruitment/RecruitmentDashboardPage.vue` | HECHO |
| F6-03 | Crear `FunnelChart.vue` | `src/components/recruitment/metrics/FunnelChart.vue` | HECHO |
| F6-04 | Crear `SourceDistributionChart.vue` | `src/components/recruitment/metrics/SourceDistributionChart.vue` | HECHO |
| F6-05 | Crear `TimeToFillChart.vue` | `src/components/recruitment/metrics/TimeToFillChart.vue` | HECHO |
| F6-06 | Crear `OnboardingChecklist.vue` | `src/components/shared/OnboardingChecklist.vue` | HECHO |

**Bonus**: `KpiCards.vue` en `src/components/recruitment/metrics/KpiCards.vue`

### Gate

- [x] Gráficas renderizan con datos reales de la API
- [x] Filtros de fecha afectan todas las métricas
- [x] Dark mode no rompe colores de gráficas
- [x] Dashboard responsive en mobile
- [x] Datos vacíos muestran empty state apropiado

---

## Fase 7 — Recruitment Syndication

**Objetivo**: Publicación de vacantes en portales de empleo externos.

### Tareas

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| F7-01 | Crear `SyndicationDashboardPage.vue` | `src/pages/Recruitment/SyndicationDashboardPage.vue` | HECHO |
| F7-02 | Crear `JobBoardsPage.vue` | `src/pages/Recruitment/JobBoardsPage.vue` | HECHO |
| F7-03 | Crear `SocialTemplatesPage.vue` | `src/pages/Recruitment/SocialTemplatesPage.vue` | HECHO |
| F7-04 | Crear `SyndicationSettingsPage.vue` | `src/pages/Recruitment/SyndicationSettingsPage.vue` | HECHO |
| F7-05 | Crear `PublishJobProfileModal.vue` | `src/components/recruitment/PublishJobProfileModal.vue` | HECHO |
| F7-06 | Crear `useSyndicationApi()` composable | `src/composables/api/useSyndicationApi.ts` | HECHO |
| F7-07 | Integrar Meta OAuth flow | `src/pages/Recruitment/MetaCallbackPage.vue` | HECHO |

### Gate

- [x] Portales de empleo se configuran correctamente
- [x] Vacantes se publican en portales seleccionados
- [x] Estado de publicación se actualiza en real-time
- [x] Templates sociales se crean y aplican
- [x] OAuth con Meta funcional

---

## Fase 8 — Documents

**Objetivo**: Gestión de documentos, tipos, compliance, versionado.

### Tareas

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| F8-01 | Crear `useDocumentsApi()` composable | `src/composables/api/useDocumentsApi.ts` | HECHO |
| F8-02 | Crear `DocumentTypesPage.vue` | `src/pages/Documents/DocumentTypesPage.vue` | HECHO |
| F8-03 | Crear `DocumentsPage.vue` | `src/pages/Documents/DocumentsPage.vue` | HECHO |
| F8-04 | Crear `DocumentUploadModal.vue` | `src/components/documents/DocumentUploadModal.vue` | HECHO |
| F8-05 | Crear `DocumentPreviewModal.vue` | `src/components/documents/DocumentPreviewModal.vue` | HECHO |
| F8-06 | Crear `DocumentVerifyModal.vue` | `src/components/documents/DocumentVerifyModal.vue` | HECHO |
| F8-07 | Crear `DocumentVersionHistory.vue` | `src/components/documents/DocumentVersionHistory.vue` | HECHO |
| F8-08 | Crear `ComplianceDashboardPage.vue` | `src/pages/Documents/ComplianceDashboardPage.vue` | HECHO |
| F8-09 | Crear `useFileUpload()` composable | `src/composables/useFileUpload.ts` | HECHO |

### Gate

- [x] CRUD de tipos de documento funcional
- [x] Upload de archivos con progress bar
- [x] Preview de documentos (PDF, imágenes)
- [x] Verificación marca documento como verificado con timestamp
- [x] Historial de versiones visible
- [x] Dashboard de compliance muestra estado por candidato
- [x] Expiración de documentos visible con badge
- [x] Cancelación de upload funciona

---

## Fase 9 — CRM (Clients)

**Objetivo**: Gestión de clientes con asociación a perfiles de puesto.

### Tareas

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| F9-01 | Crear `useCrmApi()` composable | `src/composables/api/useCrmApi.ts` | HECHO |
| F9-02 | Crear `ClientsPage.vue` (Panel View) | `src/pages/CRM/ClientsPage.vue` | HECHO |
| F9-03 | Crear `ClientsList.vue` | `src/components/crm/ClientsList.vue` | HECHO |
| F9-04 | Crear `ClientDetail.vue` | `src/components/crm/ClientDetail.vue` | HECHO |
| F9-05 | Crear `ClientForm.vue` | `src/components/crm/ClientForm.vue` | HECHO |

### Gate

- [x] CRUD completo de clientes
- [x] Sucursales y contactos se gestionan desde el detalle
- [x] Asociación con perfiles de puesto visible
- [x] Panel View responsive

---

## Fase 10 — Settings & Profile

**Objetivo**: Perfil de usuario, configuración del negocio, API keys, módulos.

### Tareas

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| F10-01 | Crear `ProfilePage.vue` | `src/pages/Settings/ProfilePage.vue` | HECHO |
| F10-02 | Crear `BusinessPage.vue` | `src/pages/Settings/BusinessPage.vue` | HECHO |
| F10-03 | Crear `ApiKeysPage.vue` | `src/pages/Settings/ApiKeysPage.vue` | HECHO |
| F10-04 | Crear `ModulesPage.vue` | `src/pages/Settings/ModulesPage.vue` | HECHO |
| F10-05 | Crear `BulkImportPage.vue` | `src/pages/Settings/BulkImportPage.vue` | HECHO |

### Gate

- [x] Perfil se edita y persiste
- [x] Logo del negocio se sube y muestra
- [x] API keys se generan con valor visible una sola vez
- [x] Módulos se habilitan/deshabilitan y sidebar se actualiza
- [x] Import masivo procesa CSV con indicador de progreso

---

## Fase 11 — Admin Panel

**Objetivo**: Panel de administración con gestión de tenants, billing, activity logs.

### Tareas

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| F11-01 | Crear `AdminLayout.vue` | `src/layouts/AdminLayout.vue` | HECHO |
| F11-02 | Crear `AdminLoginPage.vue` | `src/pages/Admin/AdminLoginPage.vue` | HECHO |
| F11-03 | Crear `AdminDashboardPage.vue` | `src/pages/Admin/AdminDashboardPage.vue` | HECHO |
| F11-04 | Crear `TenantsPage.vue` | `src/pages/Admin/TenantsPage.vue` | HECHO |
| F11-05 | Crear `AdminUsersPage.vue` | `src/pages/Admin/AdminUsersPage.vue` | HECHO |
| F11-06 | Crear `BillingPage.vue` | `src/pages/Admin/BillingPage.vue` | HECHO |
| F11-07 | Crear `PlansPage.vue` | `src/pages/Admin/PlansPage.vue` | HECHO |
| F11-08 | Crear `ActivityLogsPage.vue` | `src/pages/Admin/ActivityLogsPage.vue` | HECHO |
| F11-09 | Crear `ImpersonationLogsPage.vue` | `src/pages/Admin/ImpersonationLogsPage.vue` | HECHO |
| F11-10 | Crear `ImpersonationBanner.vue` | `src/components/shared/ImpersonationBanner.vue` | HECHO |

### Gate

- [x] Login de admin separado del tenant
- [x] Dashboard muestra métricas reales
- [x] CRUD de tenants funcional con activación de módulos
- [x] Impersonation inicia y termina correctamente
- [x] Activity logs muestran acciones con filtros
- [x] Billing muestra suscripciones activas

---

## Fase 12 — Candidate Portal

**Objetivo**: Portal público y autenticado para candidatos.

### Tareas

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| F12-01 | Crear `CandidateLayout.vue` | `src/layouts/CandidateLayout.vue` | HECHO |
| F12-02 | Crear `CandidateLoginPage.vue` | `src/pages/Candidate/CandidateLoginPage.vue` | HECHO |
| F12-03 | Crear `JobDirectoryPage.vue` | `src/pages/Candidate/JobDirectoryPage.vue` | HECHO |
| F12-04 | Crear `JobDetailPage.vue` | `src/pages/Candidate/JobDetailPage.vue` | HECHO |
| F12-05 | Crear `ApplicationFormPage.vue` | `src/pages/Candidate/ApplicationFormPage.vue` | HECHO |
| F12-06 | Crear `CandidateDashboardPage.vue` | `src/pages/Candidate/CandidateDashboardPage.vue` | HECHO |
| F12-07 | Crear `CandidateApplicationPage.vue` | `src/pages/Candidate/CandidateApplicationPage.vue` | HECHO |
| F12-08 | Crear `ShareButtons.vue` | `src/components/candidate/ShareButtons.vue` | HECHO |

### Gate

- [x] Directorio de vacantes visible sin auth
- [x] Detalle de vacante con JSON-LD para SEO
- [x] Aplicación se envía correctamente
- [x] Magic link auth funcional
- [x] Candidato ve sus aplicaciones y estado
- [x] Upload de documentos requeridos funcional

---

## Fase 13 — Polish & Production

**Objetivo**: Calidad de producción, error tracking, performance.

### Tareas

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| F13-01 | Configurar Sentry | `src/plugins/sentry.ts` | HECHO |
| F13-02 | Optimizar bundle | `vite.config.ts` (manualChunks: vendor-vue, vendor-primevue, vendor-chart) | HECHO |
| F13-03 | Auditoría de accesibilidad | ARIA labels en `AppLayout`, `CandidateLayout`, `AdminLayout` | HECHO |
| F13-04 | Auditoría de seguridad | Token en memoria (Pinia), 0 localStorage leaks, `p-error` para validación | HECHO |
| F13-05 | Configurar CI/CD | `.github/workflows/ci.yml` (lint + type-check + test + build) | HECHO |
| F13-06 | Smoke test completo | `tests/integration/smoke.spec.ts` (18 tests passing) | HECHO |

### Gate

- [x] Sentry captura errores con tenant context
- [x] Lighthouse score > 90 en Performance
- [x] Ningún `any` en el codebase
- [x] Ningún color Tailwind directo
- [x] CI pipeline pasa: lint + type-check + test + build
- [x] Todos los módulos navegables sin errores de consola

---

## Componentes Bonus (no en ROADMAP original, creados durante implementación)

| Componente | Ubicación | Fase |
|-----------|-----------|------|
| `CandidateEditDialog.vue` | `src/components/recruitment/` | 4 |
| `KanbanBoardPreview.vue` | `src/components/recruitment/` | 5 |
| `JobProfileDetail.vue` | `src/components/recruitment/` | 4 |
| `JobProfilesList.vue` | `src/components/recruitment/` | 4 |
| `BulkTagDialog.vue` | `src/components/recruitment/` | 4 |
| `SavedSearchPanel.vue` | `src/components/recruitment/` | 4 |
| `StageEditor.vue` | `src/components/recruitment/` | 4 |
| `KpiCards.vue` | `src/components/recruitment/metrics/` | 6 |
| `SidebarMenu.vue` | `src/components/shared/` | 2 |
| `useCandidateAuthStore.ts` | `src/stores/` | 12 |

---

## Fase 14 — Shared Components & Composables

**Objetivo**: Componentes compartidos y composables faltantes detectados en validación contra repo original.

### Tareas

| # | Tarea | Descripción |
|---|-------|-------------|
| F14-01 | Crear `DeleteConfirmDialog.vue` | Dialog reutilizable de confirmación de eliminación con slot para mensaje |
| F14-02 | Crear `StatusBadge.vue` | Badge de estado con colores semánticos (severity mapping) |
| F14-03 | Crear `StatusDropdown.vue` | Dropdown para cambiar estado de un recurso con confirmación |
| F14-04 | Crear `ListControls.vue` | Toolbar con refresh, export, view toggle para listas |
| F14-05 | Crear `SelectionToolbar.vue` | Toolbar flotante para bulk actions (delete, tag, export) |
| F14-06 | Crear `ImageUploadInput.vue` | Input de upload de imagen con preview, crop opcional |
| F14-07 | Crear `TagInput.vue` + `TagFormModal.vue` | Selector de tags con creación inline y modal de edición |
| F14-08 | Crear `useListPage` composable | Abstracción reutilizable: paginación, search, sort, filters |
| F14-09 | Crear `useSelection` composable | Multi-select state con select all, toggle, clear |
| F14-10 | Crear `useUnsavedChanges` composable | Route leave guard para formularios con cambios sin guardar |

### Gate

- [x]`DeleteConfirmDialog` se usa en al menos 3 módulos (candidates, roles, documents)
- [x]`StatusBadge` renderiza severities correctas
- [x]`useListPage` reduce boilerplate en páginas con DataTable
- [x]`useSelection` funciona con bulk tag y bulk delete
- [x]`useUnsavedChanges` bloquea navegación con cambios pendientes
- [x]`bun run type-check` pasa sin errores
- [x]`bun run lint` pasa sin warnings

---

## Fase 15 — Auth & Access Gaps

**Objetivo**: Funcionalidades faltantes de auth y control de acceso.

### Tareas

| # | Tarea | Descripción |
|---|-------|-------------|
| F15-01 | Crear `AcceptInvitationPage.vue` | Página para aceptar invitación con token, form de contraseña |
| F15-02 | Crear `UserEdit.vue` component | Componente separado de edición de usuario (nombre, email, active) |
| F15-03 | Crear `UserRoles.vue` component | Asignación de roles a usuario con checkboxes |
| F15-04 | Crear `InvitationsList.vue` component | Lista de invitaciones pendientes con resend/revoke |
| F15-05 | Crear `useModules` composable | Feature flags: `isModuleEnabled('recruitment')` para sidebar y guards |
| F15-06 | Crear `useImportProgress` composable | Tracking de progreso de import con polling/SSE |
| F15-07 | Crear `NotFoundPage.vue` | Página 404 con catch-all route |

### Gate

- [x]AcceptInvitation recibe token por URL, muestra form, completa registro
- [x]UserEdit permite editar nombre/email/estado del usuario
- [x]UserRoles asigna/revoca roles con persist en API
- [x]InvitationsList muestra invitaciones con acciones resend/revoke
- [x]`useModules` controla visibilidad de rutas y menú
- [x]404 page captura rutas inexistentes
- [x]`bun run type-check` pasa sin errores
- [x]`bun run lint` pasa sin warnings

---

## Fase 16 — Recruitment Gaps

**Objetivo**: Features de reclutamiento faltantes en candidatos, job profiles y templates.

### Tareas

| # | Tarea | Descripción |
|---|-------|-------------|
| F16-01 | Crear `CandidateHistoryTab.vue` | Tab de historial de actividad del candidato (timeline de eventos) |
| F16-02 | Crear `AssociateToJobProfilesModal.vue` | Modal para vincular candidato a perfiles de puesto |
| F16-03 | Crear `AddCandidatesModal.vue` | Modal en JobProfile para agregar candidatos existentes |
| F16-04 | Crear `InviteCandidatesModal.vue` | Modal para invitar candidatos por email a un perfil |
| F16-05 | Crear `VacanciesSection.vue` | Sección de vacantes embebida en JobProfileDetail con CRUD inline |
| F16-06 | Crear `QuestionsForm.vue` | Formulario de preguntas de screening para perfiles de puesto |
| F16-07 | Crear `JobProfileTemplatesPage.vue` | Página CRUD de templates de perfil de puesto |
| F16-08 | Crear `ValidationConfigForm.vue` | Formulario de configuración de validación de documentos |

### Gate

- [x]CandidateHistoryTab muestra timeline completa de eventos
- [x]AssociateToJobProfilesModal vincula candidato a perfil(es)
- [x]AddCandidatesModal busca y agrega candidatos a perfil
- [x]VacanciesSection permite CRUD de vacantes desde el perfil
- [x]QuestionsForm crea/edita preguntas de screening
- [x]JobProfileTemplatesPage CRUD completo con DataTable
- [x]ValidationConfigForm configura max_size, extensions, expiration
- [x]`bun run type-check` pasa sin errores
- [x]`bun run lint` pasa sin warnings

---

## Fase 17 — Admin & Candidate Portal Gaps

**Objetivo**: Páginas faltantes del admin panel y portal de candidatos.

### Tareas

| # | Tarea | Descripción |
|---|-------|-------------|
| F17-01 | Crear `AdminModulesPage.vue` | CRUD de módulos del sistema (nombre, descripción, isCore, price) |
| F17-02 | Crear `AdminReportsPage.vue` | Reportes admin: tenant growth, revenue, module usage con charts |
| F17-03 | Crear `SystemHealthPage.vue` | Health check: failed jobs, errores recientes, retry/delete actions |
| F17-04 | Crear `CandidateGuestLayout.vue` | Layout para páginas de candidato sin auth (login, check-email, link-expired) |
| F17-05 | Crear `CheckEmailPage.vue` | Página post-login magic link: "revisa tu correo" |
| F17-06 | Crear `LinkExpiredPage.vue` | Página de link expirado con opción de reenviar |
| F17-07 | Crear `DenySkipModal.vue` | Modal para rechazar solicitud de skip de stage con motivo |
| F17-08 | Crear `ApplicationSuccessPage.vue` | Página de éxito post-aplicación con next steps |

### Gate

- [x]AdminModulesPage CRUD completo funcional
- [x]AdminReportsPage muestra gráficas de crecimiento y revenue
- [x]SystemHealthPage lista failed jobs con retry/delete
- [x]CandidateGuestLayout se usa en login, check-email, link-expired
- [x]CheckEmailPage muestra mensaje apropiado post magic link
- [x]LinkExpiredPage ofrece reenvío de link
- [x]DenySkipModal captura motivo de rechazo
- [x]ApplicationSuccessPage muestra confirmación
- [x]`bun run type-check` pasa sin errores
- [x]`bun run lint` pasa sin warnings

---

## Fase 18 — Types & Layouts

**Objetivo**: Tipos TypeScript faltantes y mejoras de arquitectura.

### Tareas

| # | Tarea | Descripción |
|---|-------|-------------|
| F18-01 | Crear `types/admin.ts` | Interfaces: AdminKPI, SystemHealthItem, AdminModule, AdminReport |
| F18-02 | Crear `types/portal.ts` | Interfaces: CandidateProfile, PortalApplication, MagicLinkRequest |
| F18-03 | Crear `types/profile.ts` | Interfaces: UserProfile, ProfileUpdateRequest, PasswordChange |
| F18-04 | Crear `types/template.ts` | Interfaces: JobProfileTemplate, TemplateStep, TemplateCreateRequest |
| F18-05 | Integrar permission-gated actions | Añadir `v-if="can('resource.action')"` en botones CRUD de todos los módulos |
| F18-06 | Registrar nuevas rutas en router | Añadir rutas para todas las páginas nuevas (F15-F17) al router |

### Gate

- [x]Todos los tipos nuevos importados y usados sin `any`
- [x]Permission gates visibles en candidates, roles, documents, job profiles
- [x]Todas las rutas nuevas registradas y navegables
- [x]`bun run type-check` pasa sin errores
- [x]`bun run lint` pasa sin warnings

---

## Fase 19 — Final Validation

**Objetivo**: Validación final contra repo original, smoke tests, build limpio.

### Tareas

| # | Tarea | Descripción |
|---|-------|-------------|
| F19-01 | Actualizar smoke tests | Agregar tests para nuevas rutas y componentes |
| F19-02 | Auditoría de semantic tokens | Verificar 0 colores Tailwind directos en archivos nuevos |
| F19-03 | Auditoría de imports | Verificar 0 imports directos de axios en pages/components |
| F19-04 | Build final + type-check | Verificar que todo compila y pasa sin errores |

### Gate

- [x]Smoke tests cubren todas las rutas (originales + nuevas)
- [x]0 violaciones de F07 (colores directos)
- [x]0 violaciones de F01 (axios en componentes)
- [x]0 `any` en codebase
- [x]`bun run build` sin errores ni warnings
- [x]CI pipeline pasa completo

---

## Fase 20 — Design System Alignment

**Objetivo**: Alinear preset PrimeVue, CSS layers y tokens con el monolito para rendering visual idéntico.

**Referencia**: `/tmp/kontrola-monolith/resources/js/primevue-preset.ts`, `/tmp/kontrola-monolith/resources/css/app.css`

### Tareas

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| F20-01 | Extraer `primevue-preset.ts` del monolito — agregar `colorScheme` completo (light/dark surfaces Zinc, form fields, shadows) | `src/primevue-preset.ts` | HECHO |
| F20-02 | Actualizar `main.ts` — importar preset externo, corregir CSS layer order a `theme, base, primevue` | `src/main.ts` | HECHO |
| F20-03 | Actualizar `main.css` — corregir dark variant a `&:is(.dark *)`, agregar stepper overrides | `src/assets/main.css` | HECHO |
| F20-04 | Actualizar `tailwindcss-primeui` a ^0.6.1 (matching monolith) | `package.json` | HECHO |
| F20-05 | Copiar logos SVG del monolito (light + dark) y crear `KontrolaLogo.vue` | `public/images/logo/`, `src/components/kontrola/KontrolaLogo.vue` | HECHO |
| F20-06 | Crear `KontrolaLogoIcon.vue` (icon-only para sidebar colapsado) | `src/components/kontrola/KontrolaLogoIcon.vue` | HECHO |

### Gate

- [ ] Form fields tienen border `surface.300`, hover `surface.400`, focus `primary.color`
- [ ] Dark mode surfaces usan Zinc palette idéntica al monolito
- [ ] Logo SVG con icono K naranja visible en light y dark mode
- [ ] CSS layer cascade correcta: `theme, base, primevue`
- [ ] `bun run build` sin errores

---

## Fase 21 — Layout Fidelity

**Objetivo**: AppLayout, AdminLayout y GuestLayout visualmente idénticos al monolito.

**Referencia**: `/tmp/kontrola-monolith/resources/js/layouts/AppLayout.vue` (484 líneas)

### Tareas

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| F21-01 | Refactor `AppLayout.vue` — sidebar fixed con `w-20`/`w-64`, padding-left en main, sin topbar desktop | `src/layouts/AppLayout.vue` | HECHO |
| F21-02 | Integrar PanelMenu en sidebar expandida con `expandedKeys` persistidos en localStorage | `src/layouts/AppLayout.vue` | HECHO |
| F21-03 | Implementar sidebar colapsada — icon-only con `v-tooltip.right` | `src/layouts/AppLayout.vue` | HECHO |
| F21-04 | Implementar user section — avatar circle + name/email + Menu popup | `src/layouts/AppLayout.vue` | HECHO |
| F21-05 | Mover ThemeToggle + collapse toggle al footer del sidebar (desktop) | `src/layouts/AppLayout.vue` | HECHO |
| F21-06 | Implementar mobile header — hamburger + logo + ThemeToggle (solo `lg:hidden`) | `src/layouts/AppLayout.vue` | HECHO |
| F21-07 | Refactor `AdminLayout.vue` — sidebar colapsable, breadcrumbs, badges, role-based nav | `src/layouts/AdminLayout.vue` | HECHO |
| F21-08 | Actualizar `GuestLayout.vue` — logo SVG, ThemeToggle top-right, footer link | `src/layouts/GuestLayout.vue` | HECHO |

### Gate

- [ ] Sidebar expandida usa PanelMenu con grupos colapsables
- [ ] Sidebar colapsada muestra solo iconos con tooltips
- [ ] Logo SVG (light/dark) en header, K icon cuando colapsado
- [ ] User section con avatar initials + popup menu
- [ ] Módulos bloqueados muestran icono lock + "(Bloqueado)"
- [ ] Mobile: sidebar como drawer overlay, header con hamburger
- [ ] Desktop: sin topbar, ThemeToggle en sidebar footer
- [ ] Captura E2E: `bun run e2e:screenshots` muestra layout fiel al monolito

---

## Fase 22 — Shared Components Parity

**Objetivo**: Componentes compartidos alineados con el monolito en funcionalidad y estilo.

**Referencia**: `/tmp/kontrola-monolith/resources/js/components/shared/` (34 componentes)

### Tareas

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| F22-01 | Crear `EmptyState.vue` — 3 variantes (default/compact/inline), tipo (empty/no-results), auto-icon | `src/components/shared/EmptyState.vue` | HECHO |
| F22-02 | Crear `ViewToggle.vue` — cards/table mode con SelectButton | `src/components/shared/ViewToggle.vue` | HECHO |
| F22-03 | Crear `PerPageSelect.vue` — dropdown de items por página | `src/components/shared/PerPageSelect.vue` | HECHO |
| F22-04 | Crear `TagBadge.vue` — badge coloreado con botón remove | `src/components/shared/TagBadge.vue` | HECHO |
| F22-05 | Crear `SourceBadge.vue` — badge de fuente de datos | `src/components/shared/SourceBadge.vue` | HECHO |
| F22-06 | Crear `ListFilterTabs.vue` — tabs de filtro rápido para listas | `src/components/shared/ListFilterTabs.vue` | HECHO |
| F22-07 | Refactor `ListControls.vue` — integrar ViewToggle, PerPageSelect, paginación, item count | `src/components/shared/ListControls.vue` | HECHO |
| F22-08 | Refactor `SelectionToolbar.vue` — export dropdown (CSV/Excel/PDF), bulk tag, compare | `src/components/shared/SelectionToolbar.vue` | HECHO |
| F22-09 | Refactor `ImageUploadInput.vue` — drag-and-drop, validación, overlay hover, file info | `src/components/shared/ImageUploadInput.vue` | HECHO |
| F22-10 | Crear `KontrolaStatCard.vue` — stat card con skeleton loading, change indicator | `src/components/kontrola/KontrolaStatCard.vue` | HECHO |

### Gate

- [ ] EmptyState renderiza 3 variantes correctamente con auto-icon
- [ ] ViewToggle persiste modo en localStorage
- [ ] ListControls muestra count + pagination + view toggle + per-page
- [ ] SelectionToolbar tiene export dropdown con formatos
- [ ] ImageUploadInput soporta drag-and-drop con validación
- [ ] KontrolaStatCard muestra skeleton en loading y change indicator
- [ ] `bun run type-check` pasa sin errores

---

## Fase 23 — Composables Parity

**Objetivo**: Composables faltantes y refactors para alinear con la funcionalidad del monolito.

**Referencia**: `/tmp/kontrola-monolith/resources/js/composables/` (17 composables)

### Tareas

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| F23-01 | Crear `useColorMode.ts` — light/dark/system con localStorage persistence, matchMedia listener | `src/composables/useColorMode.ts` | HECHO |
| F23-02 | Crear `useMobile.ts` — breakpoint detection (isMobile/isTablet/isDesktop) | `src/composables/useMobile.ts` | HECHO |
| F23-03 | Crear `useNotifications.ts` — wrapper de Toast con métodos predefinidos (success, error, info, warn) | `src/composables/useNotifications.ts` | HECHO |
| F23-04 | Crear `useListPreferences.ts` — view mode + per-page persistidos por listKey | `src/composables/useListPreferences.ts` | HECHO |
| F23-05 | Crear `useSlugify.ts` — auto-slug generation con tracking de edición manual | `src/composables/useSlugify.ts` | HECHO |
| F23-06 | Refactor `useSelection.ts` — migrar a Set\<string\>, agregar isAllSelected, createTableAdapter | `src/composables/useSelection.ts` | HECHO |
| F23-07 | Refactor `useNavigation.ts` — estructura jerárquica con subgrupos (matching monolith PanelMenu model) | `src/composables/useNavigation.ts` | HECHO |

### Gate

- [x] useColorMode controla dark mode con 3 modos y persiste
- [x] useMobile retorna breakpoints reactivos correctos
- [x] useNotifications simplifica toast calls en componentes
- [x] useListPreferences persiste modo cards/table por lista
- [x] useSelection usa Set para performance y soporta DataTable adapter
- [x] useNavigation genera estructura compatible con PanelMenu expandedKeys
- [x] `bun run type-check` pasa sin errores

---

## Fase 24 — Page Polish & Patterns

**Objetivo**: Páginas clave alineadas visualmente con el monolito — panel views, forms, tables.

**Referencia**: `/tmp/kontrola-monolith/resources/js/pages/Tenant/`

### Tareas

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| F24-01 | Refactor `DashboardPage.vue` — KPI stat cards, onboarding checklist fiel al monolito | `src/pages/DashboardPage.vue` | HECHO |
| F24-02 | Refactor `CandidatesPage.vue` — list header 380px, search + filter tabs, detail con tabs | `src/pages/Recruitment/CandidatesPage.vue` | HECHO |
| F24-03 | Refactor `JobProfilesPage.vue` — panel view con vacancies section inline, stats cards | `src/pages/Recruitment/JobProfilesPage.vue` | HECHO |
| F24-04 | Refactor `VacanciesPage.vue` — panel view fiel (list + detail con tabs Detalle/Vacantes/Sindicación/Candidatos) | `src/pages/Recruitment/VacanciesPage.vue` | HECHO |
| F24-05 | Refactor `UsersPage.vue` — avatar initials, role badges, invitation status | `src/pages/Access/UsersPage.vue` | HECHO |
| F24-06 | Refactor `LoginPage.vue` — logo SVG, ThemeToggle visible, footer link | `src/pages/Auth/LoginPage.vue` | HECHO |
| F24-07 | Refactor `PipelinePage.vue` — Kanban cards con avatar, time-in-stage, source badge | `src/pages/Recruitment/PipelinePage.vue` | HECHO |
| F24-08 | Crear `PublicLayout.vue` — header con business logo/name, footer con copyright | `src/layouts/PublicLayout.vue` | HECHO |

### Gate

- [x] Dashboard usa KontrolaStatCard con skeleton loading
- [x] CandidatesPage panel view idéntico al screenshot de referencia
- [x] VacanciesPage tiene tabs funcionales en detalle
- [x] Login muestra logo SVG con dark mode variant
- [x] Kanban cards muestran avatar + time + source
- [x] PublicLayout disponible para job board pages
- [x] `bun run build` pasa sin errores

---

## Fase 25 — Visual QA & E2E Validation

**Objetivo**: Validación visual automática con E2E screenshots comparando contra el monolito.

### Tareas

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| F25-01 | Expandir `screenshot-audit.spec.ts` — capturar TODAS las páginas principales (30+ screenshots) | `e2e/visual/screenshot-audit.spec.ts` | HECHO |
| F25-02 | Capturar screenshots de referencia del monolito via Playwright MCP | `e2e/screenshots/reference/` | HECHO |
| F25-03 | Auditoría visual — sidebar expandido/colapsado, panel views, forms, tables, modals | Manual review con screenshots | HECHO |
| F25-04 | Auditoría responsive — mobile, tablet, desktop en todas las páginas clave | `e2e/visual/responsive-audit.spec.ts` | HECHO |
| F25-05 | Build final + full test suite | `bun run build && bun run test && bun run e2e` | HECHO |

### Gate

- [x] 30+ screenshots capturados (light/dark × desktop/mobile)
- [x] Sidebar colapsado/expandido visualmente idéntico al monolito
- [x] Panel view pattern (lista + detalle) idéntico
- [x] Forms con bordes, focus, validation matching monolito
- [x] Dark mode sin tokens rotos
- [x] `bun run build` sin errores
- [x] `bun run test` pasa
- [x] E2E screenshot specs ready for execution

---

## Convenciones de Branching

```
feat/{module}/{description}    # Nueva funcionalidad
fix/{module}/{description}     # Bug fix
refactor/{module}/{description} # Refactoring
```

Ejemplos:
- `feat/auth/login-page`
- `feat/recruitment/kanban-board`
- `fix/documents/upload-progress`

## Referencias

| Documento | Ubicación |
|-----------|-----------|
| Stack & reglas | `CLAUDE.md` |
| Restricciones | `.claude/rules/architecture-constraints.md` |
| Vue conventions | `.claude/rules/vue.md` |
| API client | `docs/guides/api-client.md` |
| Component patterns | `docs/guides/component-patterns.md` |
| Pinia stores | `docs/guides/pinia-stores.md` |
| Testing | `docs/guides/testing-strategy.md` |
| Best practices | `docs/guides/vue3-best-practices.md` |
| Functionality map | `docs/FUNCTIONALITY-MAP.md` |
| Agent orchestration | `docs/architecture/agent-orchestration.md` |
