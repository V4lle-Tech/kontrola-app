# Roadmap — kontrola-app (Frontend SPA)

> Plan de migración del frontend Laravel/Inertia → SPA Vue 3 standalone.
> Cada fase tiene criterios de salida binarios (pasa/no pasa). No se avanza sin cumplir TODOS.

---

## Resumen de Fases

| Fase | Módulo                        | Semanas | Tareas | Dependencia Backend |
| ---- | ----------------------------- | ------- | ------ | ------------------- |
| 0    | Scaffold & Toolchain          | 0       | 8      | Ninguna             |
| 1    | Auth & Session                | 1       | 7      | Identity (Phase 2)  |
| 2    | Layout & Navigation           | 1       | 6      | Identity (Phase 4)  |
| 3    | Access Control (Users, Roles) | 1       | 8      | Identity (Phase 3)  |
| 4    | Recruitment — Core            | 2       | 12     | Recruitment (Ph 5-6)|
| 5    | Recruitment — Pipeline        | 1-2     | 10     | Recruitment (Ph 6)  |
| 6    | Recruitment — Metrics         | 1       | 6      | Recruitment (Ph 6)  |
| 7    | Recruitment — Syndication     | 1       | 7      | Recruitment (Ph 7)  |
| 8    | Documents                     | 1-2     | 9      | Documents (Ph 8)    |
| 9    | CRM                           | 1       | 5      | CRM (Ph 9)          |
| 10   | Settings & Profile            | 0.5     | 5      | Identity (Ph 4)     |
| 11   | Admin Panel                   | 2       | 10     | Admin (Ph 12)       |
| 12   | Candidate Portal              | 1-2     | 8      | Recruitment (Ph 6)  |
| 13   | Polish & Production           | 1       | 6      | All                 |

**Total estimado**: ~107 tareas

---

## Fase 0 — Scaffold & Toolchain

**Objetivo**: Proyecto funcional con `bun dev` sirviendo una página vacía con PrimeVue + Tailwind + dark mode.

### Tareas

| # | Tarea | Descripción |
|---|-------|-------------|
| F0-01 | Init Vite + Vue 3 + TypeScript | `bun create vite`, configurar `tsconfig.json` estricto |
| F0-02 | Instalar PrimeVue 4 + Aura preset | Plugin, tema custom (orange primary), `tailwindcss-primeui` |
| F0-03 | Configurar Tailwind CSS v4 | `@tailwindcss/vite`, custom variant dark, font Instrument Sans |
| F0-04 | Configurar Vue Router 4 | Rutas base, lazy loading, guards placeholder |
| F0-05 | Configurar Pinia | Setup store pattern, plugin registration |
| F0-06 | Configurar Axios + API client | `src/api/client.ts` con interceptors JWT + refresh queue |
| F0-07 | Configurar ESLint + Prettier | Flat config, reglas estrictas de TS + Vue |
| F0-08 | Configurar Vitest + MSW | Setup file, PrimeVue stubs, MSW server |

### Gate (Criterios de Salida)

- [ ] `bun dev` sirve página con componente PrimeVue visible
- [ ] Dark mode toggle funciona (light/dark/system)
- [ ] `bun run type-check` pasa sin errores
- [ ] `bun run lint` pasa sin warnings
- [ ] `bun run test` ejecuta al menos 1 test unitario
- [ ] `bun run build` genera bundle sin errores
- [ ] Semantic tokens funcionan (`text-color`, `bg-surface-0 dark:bg-surface-900`)
- [ ] Axios interceptor inyecta Bearer token (test unitario)

---

## Fase 1 — Auth & Session

**Objetivo**: Login, register, forgot/reset password funcionales contra la API de kontrola-net.

### Tareas

| # | Tarea | Descripción |
|---|-------|-------------|
| F1-01 | Crear `useAuthStore` (Pinia) | Token en memoria, refresh via HttpOnly cookie, schedule refresh |
| F1-02 | Crear `GuestLayout.vue` | Layout centrado para páginas de auth |
| F1-03 | Crear `LoginPage.vue` | Email + password, remember-me, error handling RFC 9457 |
| F1-04 | Crear `RegisterPage.vue` | given_name, paternal_name, maternal_name, email, password |
| F1-05 | Crear `ForgotPasswordPage.vue` | Solicitar reset por email |
| F1-06 | Crear `ResetPasswordPage.vue` | Token-based password reset |
| F1-07 | Configurar route guards | Redirect a login si no autenticado, redirect a dashboard si ya autenticado |

### Gate

- [ ] Login exitoso almacena token en memoria (NO localStorage)
- [ ] Refresh token automático antes de expiración
- [ ] 401 en cualquier request dispara refresh → retry
- [ ] Logout limpia token + invalida cookie en servidor
- [ ] Register crea cuenta y redirige a dashboard
- [ ] Forgot/Reset password flujo completo funcional
- [ ] Route guard redirige correctamente en ambas direcciones
- [ ] Errores de validación (422) se muestran por campo

---

## Fase 2 — Layout & Navigation

**Objetivo**: AppLayout con sidebar, topbar, navegación por módulos con permisos.

### Tareas

| # | Tarea | Descripción |
|---|-------|-------------|
| F2-01 | Crear `AppLayout.vue` | Sidebar colapsable + topbar + slot contenido |
| F2-02 | Crear sistema de menú dinámico | Basado en permisos + módulos habilitados |
| F2-03 | Crear `usePermissions()` composable | `can()`, `canAny()`, `hasRole()`, `isOwner()` |
| F2-04 | Crear `ThemeToggle.vue` | Light/dark/system con persistencia localStorage |
| F2-05 | Crear `DashboardPage.vue` | Página inicial post-login (placeholder) |
| F2-06 | Crear `useSidebar()` composable | Estado de colapso, responsive |

### Gate

- [ ] Sidebar muestra menú correcto según permisos del usuario
- [ ] Módulos deshabilitados muestran candado
- [ ] Sidebar colapsa en mobile (hamburger menu)
- [ ] Dark mode persiste entre recargas
- [ ] Navegación entre secciones funciona sin reload
- [ ] Layout responsive en mobile, tablet y desktop

---

## Fase 3 — Access Control (Users & Roles)

**Objetivo**: CRUD completo de usuarios y roles con editor de permisos.

### Tareas

| # | Tarea | Descripción |
|---|-------|-------------|
| F3-01 | Crear `useAccessApi()` composable | Endpoints de users, roles, permissions, invitations |
| F3-02 | Crear `UsersPage.vue` (Panel View) | Lista + detalle |
| F3-03 | Crear `UsersList.vue` | DataTable con búsqueda y filtros |
| F3-04 | Crear `UserDetail.vue` | Info, roles asignados |
| F3-05 | Crear `UserCreate.vue` / `UserInvite.vue` | Formulario de creación/invitación |
| F3-06 | Crear `RolesPage.vue` (Panel View) | Lista + detalle |
| F3-07 | Crear `RoleCreate.vue` / `RoleEdit.vue` | Formulario con selector de permisos |
| F3-08 | Crear `PermissionSelector.vue` | Selector granular de permisos por módulo |

### Gate

- [ ] CRUD completo de usuarios funcional
- [ ] Invitaciones por email enviadas correctamente
- [ ] CRUD completo de roles funcional
- [ ] Permisos se asignan/revocan correctamente
- [ ] Panel View responsive (lista oculta en mobile al seleccionar)
- [ ] Validación de formularios con errores por campo
- [ ] Paginación server-side funcional

---

## Fase 4 — Recruitment Core (Candidates, Job Profiles, Processes)

**Objetivo**: CRUD de candidatos, perfiles de puesto (wizard 6 pasos), procesos de selección.

### Tareas

| # | Tarea | Descripción |
|---|-------|-------------|
| F4-01 | Crear `useRecruitmentApi()` composable | Candidates, JobProfiles, SelectionProcesses, Vacancies |
| F4-02 | Crear `CandidatesPage.vue` (Panel View) | Lista + detalle |
| F4-03 | Crear `CandidatesList.vue` | DataTable, búsqueda, filtros avanzados, tags |
| F4-04 | Crear `CandidateDetail.vue` | Perfil, tabs (documentos, aplicaciones, historial) |
| F4-05 | Crear `CandidateCreate.vue` | Drawer con formulario |
| F4-06 | Crear `AdvancedFilterPanel.vue` | Filtros multi-faceta (source, tags, education, fecha) |
| F4-07 | Crear `JobProfilesPage.vue` (Panel View) | Lista + detalle |
| F4-08 | Crear wizard de Job Profile (6 pasos) | BasicInfo, Requirements, Documents, Template, Vacancies, Review |
| F4-09 | Crear `SelectionProcessesPage.vue` | CRUD de pipelines con stages |
| F4-10 | Crear `StageCard.vue` + `StageEdit.vue` | Edición de etapas con color picker |
| F4-11 | Crear `VacanciesPage.vue` | Lista de vacantes con estados |
| F4-12 | Crear `TagsPage.vue` | CRUD de etiquetas + bulk assign |

### Gate

- [ ] CRUD completo de candidatos (crear, leer, editar, eliminar)
- [ ] Filtros avanzados funcionan (source, tags, education, rango de fechas)
- [ ] Wizard de Job Profile completa 6 pasos y guarda correctamente
- [ ] Estados de Job Profile (draft → active → archived) transicionan
- [ ] Procesos de selección con stages ordenables y colores
- [ ] Vacantes con ciclo de vida completo (draft → published → closed)
- [ ] Tags se crean, asignan y eliminan en bulk
- [ ] Búsquedas guardadas persisten y se aplican

---

## Fase 5 — Recruitment Pipeline (Kanban)

**Objetivo**: Tablero Kanban con drag-and-drop, drawer de candidato, notas, stage skip requests.

### Tareas

| # | Tarea | Descripción |
|---|-------|-------------|
| F5-01 | Crear `KanbanPage.vue` | Contenedor del tablero con filtros |
| F5-02 | Crear `KanbanBoard.vue` | Columnas por stage, drag-and-drop |
| F5-03 | Crear `KanbanColumn.vue` | Columna individual con conteo |
| F5-04 | Crear `KanbanCard.vue` | Tarjeta de candidato (avatar, tags, score, días en stage) |
| F5-05 | Crear `CandidateProfileDrawer.vue` | Drawer lateral con perfil completo |
| F5-06 | Crear `CandidateHistoryDrawer.vue` | Timeline de movimientos |
| F5-07 | Crear `FinalStageModal.vue` | Modal de contratación/rechazo |
| F5-08 | Crear `AddNoteModal.vue` | Agregar nota a candidato |
| F5-09 | Crear `SkipConfirmModal.vue` | Solicitud de salto de etapa |
| F5-10 | Crear `StageSkipRequestsPage.vue` | Lista de solicitudes de autorización |

### Gate

- [ ] Drag-and-drop mueve candidatos entre stages
- [ ] Movimiento persiste en API y actualiza UI
- [ ] Stages con `requiresApproval` muestran modal de confirmación
- [ ] Drawer de candidato muestra perfil completo
- [ ] Timeline de historial muestra todos los movimientos
- [ ] Modal de contratación/rechazo funcional
- [ ] Notas se agregan y persisten
- [ ] Filtros de Kanban (proceso, fecha, tags) funcionan
- [ ] Indicador de tiempo en stage visible

---

## Fase 6 — Recruitment Metrics Dashboard

**Objetivo**: Dashboard de reclutamiento con gráficas y KPIs.

### Tareas

| # | Tarea | Descripción |
|---|-------|-------------|
| F6-01 | Instalar Chart.js | Plugin de Vue para Chart.js |
| F6-02 | Crear `RecruitmentDashboardPage.vue` | Layout de métricas con filtros |
| F6-03 | Crear `FunnelChart.vue` | Funnel de aplicaciones por stage |
| F6-04 | Crear `SourceDistributionChart.vue` | Distribución por fuente |
| F6-05 | Crear `TimeToFillChart.vue` | Tiempo promedio de llenado |
| F6-06 | Crear `OnboardingChecklist.vue` | Checklist de primer uso |

### Gate

- [ ] Gráficas renderizan con datos reales de la API
- [ ] Filtros de fecha afectan todas las métricas
- [ ] Dark mode no rompe colores de gráficas
- [ ] Dashboard responsive en mobile
- [ ] Datos vacíos muestran empty state apropiado

---

## Fase 7 — Recruitment Syndication

**Objetivo**: Publicación de vacantes en portales de empleo externos.

### Tareas

| # | Tarea | Descripción |
|---|-------|-------------|
| F7-01 | Crear `SyndicationDashboardPage.vue` | Estado de publicaciones |
| F7-02 | Crear `JobBoardsPage.vue` | Configuración de portales |
| F7-03 | Crear `SocialTemplatesPage.vue` | Templates de publicación social |
| F7-04 | Crear `SyndicationSettingsPage.vue` | Credenciales por portal |
| F7-05 | Crear `PublishJobProfileModal.vue` | Modal de publicación |
| F7-06 | Crear `useSyndicationApi()` composable | Endpoints de syndication |
| F7-07 | Integrar Meta OAuth flow | Conectar cuenta Meta para publicación |

### Gate

- [ ] Portales de empleo se configuran correctamente
- [ ] Vacantes se publican en portales seleccionados
- [ ] Estado de publicación se actualiza en real-time
- [ ] Templates sociales se crean y aplican
- [ ] OAuth con Meta funcional

---

## Fase 8 — Documents

**Objetivo**: Gestión de documentos, tipos, compliance, versionado.

### Tareas

| # | Tarea | Descripción |
|---|-------|-------------|
| F8-01 | Crear `useDocumentsApi()` composable | Document types, documents, compliance |
| F8-02 | Crear `DocumentTypesPage.vue` | CRUD de tipos de documento |
| F8-03 | Crear `FileExplorerPage.vue` | Explorador de archivos con upload |
| F8-04 | Crear `DocumentUploadModal.vue` | Upload con progress bar |
| F8-05 | Crear `DocumentPreviewModal.vue` | Visor de documentos |
| F8-06 | Crear `DocumentVerifyModal.vue` | Verificación con checkbox + timestamp |
| F8-07 | Crear `DocumentVersionHistory.vue` | Historial de versiones |
| F8-08 | Crear `ComplianceDashboardPage.vue` | Estado de cumplimiento |
| F8-09 | Crear `useFileUpload()` composable | Upload con progress + cancelación |

### Gate

- [ ] CRUD de tipos de documento funcional
- [ ] Upload de archivos con progress bar
- [ ] Preview de documentos (PDF, imágenes)
- [ ] Verificación marca documento como verificado con timestamp
- [ ] Historial de versiones visible
- [ ] Dashboard de compliance muestra estado por candidato
- [ ] Expiración de documentos visible con badge
- [ ] Cancelación de upload funciona

---

## Fase 9 — CRM (Clients)

**Objetivo**: Gestión de clientes con asociación a perfiles de puesto.

### Tareas

| # | Tarea | Descripción |
|---|-------|-------------|
| F9-01 | Crear `useCrmApi()` composable | Clients, branches, contacts |
| F9-02 | Crear `ClientsPage.vue` (Panel View) | Lista + detalle |
| F9-03 | Crear `ClientsList.vue` | DataTable con búsqueda |
| F9-04 | Crear `ClientDetail.vue` | Info, sucursales, contactos, perfiles asociados |
| F9-05 | Crear `ClientForm.vue` | Crear/editar cliente |

### Gate

- [ ] CRUD completo de clientes
- [ ] Sucursales y contactos se gestionan desde el detalle
- [ ] Asociación con perfiles de puesto visible
- [ ] Panel View responsive

---

## Fase 10 — Settings & Profile

**Objetivo**: Perfil de usuario, configuración del negocio, API keys, módulos.

### Tareas

| # | Tarea | Descripción |
|---|-------|-------------|
| F10-01 | Crear `ProfilePage.vue` | Editar perfil del usuario actual |
| F10-02 | Crear `BusinessSettingsPage.vue` | Nombre, logo, RFC, dirección |
| F10-03 | Crear `ApiKeysPage.vue` | Generar y revocar API keys |
| F10-04 | Crear `ModulesPage.vue` | Habilitar/deshabilitar módulos |
| F10-05 | Crear `BulkImportPage.vue` | Importación masiva de candidatos (CSV) |

### Gate

- [ ] Perfil se edita y persiste
- [ ] Logo del negocio se sube y muestra
- [ ] API keys se generan con valor visible una sola vez
- [ ] Módulos se habilitan/deshabilitan y sidebar se actualiza
- [ ] Import masivo procesa CSV con indicador de progreso

---

## Fase 11 — Admin Panel

**Objetivo**: Panel de administración con gestión de tenants, billing, activity logs.

### Tareas

| # | Tarea | Descripción |
|---|-------|-------------|
| F11-01 | Crear `AdminLayout.vue` | Layout separado para admin |
| F11-02 | Crear `AdminLoginPage.vue` | Login separado de admin |
| F11-03 | Crear `AdminDashboardPage.vue` | KPIs, MRR, tenants activos |
| F11-04 | Crear `TenantsPage.vue` | CRUD de tenants con módulos |
| F11-05 | Crear `AdminUsersPage.vue` | Gestión de admins |
| F11-06 | Crear `BillingPage.vue` | Suscripciones, revenue |
| F11-07 | Crear `PlansPage.vue` | Gestión de planes |
| F11-08 | Crear `ActivityLogsPage.vue` | Audit trail |
| F11-09 | Crear `ImpersonationLogsPage.vue` | Tracking de impersonación |
| F11-10 | Crear `ImpersonationBanner.vue` | Banner cuando admin está impersonando |

### Gate

- [ ] Login de admin separado del tenant
- [ ] Dashboard muestra métricas reales
- [ ] CRUD de tenants funcional con activación de módulos
- [ ] Impersonation inicia y termina correctamente
- [ ] Activity logs muestran acciones con filtros
- [ ] Billing muestra suscripciones activas

---

## Fase 12 — Candidate Portal

**Objetivo**: Portal público y autenticado para candidatos.

### Tareas

| # | Tarea | Descripción |
|---|-------|-------------|
| F12-01 | Crear `CandidateLayout.vue` | Layout minimalista para portal |
| F12-02 | Crear `CandidateLoginPage.vue` | Magic link auth |
| F12-03 | Crear `JobDirectoryPage.vue` | Listado público de vacantes |
| F12-04 | Crear `JobDetailPage.vue` | Detalle de vacante con apply button |
| F12-05 | Crear `ApplicationFormPage.vue` | Formulario de aplicación |
| F12-06 | Crear `CandidateDashboardPage.vue` | Dashboard del candidato autenticado |
| F12-07 | Crear `CandidateApplicationPage.vue` | Ver estado + subir documentos |
| F12-08 | Crear `ShareButtons.vue` | Compartir vacante en redes sociales |

### Gate

- [ ] Directorio de vacantes visible sin auth
- [ ] Detalle de vacante con JSON-LD para SEO
- [ ] Aplicación se envía correctamente
- [ ] Magic link auth funcional
- [ ] Candidato ve sus aplicaciones y estado
- [ ] Upload de documentos requeridos funcional

---

## Fase 13 — Polish & Production

**Objetivo**: Calidad de producción, error tracking, performance.

### Tareas

| # | Tarea | Descripción |
|---|-------|-------------|
| F13-01 | Configurar Sentry | Error tracking con tenant tagging |
| F13-02 | Optimizar bundle | Code splitting, lazy loading verification |
| F13-03 | Auditoría de accesibilidad | ARIA labels, keyboard navigation |
| F13-04 | Auditoría de seguridad | XSS, CSRF, token handling |
| F13-05 | Configurar CI/CD | Build, lint, type-check, test en pipeline |
| F13-06 | Smoke test completo | Navegación de todos los módulos end-to-end |

### Gate

- [ ] Sentry captura errores con tenant context
- [ ] Lighthouse score > 90 en Performance
- [ ] Ningún `any` en el codebase
- [ ] Ningún color Tailwind directo
- [ ] CI pipeline pasa: lint + type-check + test + build
- [ ] Todos los módulos navegables sin errores de consola

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
