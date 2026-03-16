# Roadmap — kontrola-app (Frontend SPA)

> Plan de migración del frontend Laravel/Inertia → SPA Vue 3 standalone.
> Cada fase tiene criterios de salida binarios (pasa/no pasa). No se avanza sin cumplir TODOS.
>
> **Estado: COMPLETO** — Todas las fases (0-13) implementadas y gates aprobados.

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

**Total**: 107 tareas — 107 completadas (100%)

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
