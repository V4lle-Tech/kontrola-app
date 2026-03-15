# Mapa de Funcionalidad — Kontrola Frontend

> Inventario completo del frontend Laravel/Inertia que se migrará a la SPA Vue 3.
> Cada item incluye: ubicación original, componentes PrimeVue, complejidad y fase del ROADMAP.

---

## Leyenda

- **Complejidad**: S (simple, <100 LOC), M (media, 100-250 LOC), L (large, 250-400 LOC), XL (>400 LOC)
- **Tipo**: Page, Feature, Shared, Layout (taxonomía de `docs/guides/component-patterns.md`)
- **Fase**: Referencia al ROADMAP.md

---

## 1. Layouts (6)

| Componente Original | Tipo | Complejidad | PrimeVue | Fase | Notas |
|---------------------|------|-------------|----------|------|-------|
| `AppLayout.vue` | Layout | L | Menu, Button, Avatar, Tooltip | F2 | Sidebar colapsable, menú dinámico por permisos/módulos |
| `AdminLayout.vue` | Layout | M | Menu, Button | F11 | Sidebar admin, separado del tenant |
| `GuestLayout.vue` | Layout | S | - | F1 | Card centrado, logo, minimal |
| `PublicLayout.vue` | Layout | M | Button | F12 | Header/footer público para landing/portal |
| `CandidateLayout.vue` | Layout | S | - | F12 | Portal autenticado de candidato |
| `CandidateGuestLayout.vue` | Layout | S | - | F12 | Portal público de vacantes |

---

## 2. Auth (5 páginas)

| Componente Original | Tipo | Complejidad | PrimeVue | Fase | Campos/Features |
|---------------------|------|-------------|----------|------|-----------------|
| `Tenant/Auth/Login.vue` | Page | M | InputText, Password, Checkbox, Button | F1 | email, password, remember_me |
| `Tenant/Auth/Register.vue` | Page | M | InputText, Password, Button | F1 | given_name, paternal_name, maternal_name, email, password |
| `Tenant/Auth/ForgotPassword.vue` | Page | S | InputText, Button | F1 | email |
| `Tenant/Auth/ResetPassword.vue` | Page | S | Password, Button | F1 | token, email, password, password_confirmation |
| `Tenant/Auth/AcceptInvitation.vue` | Page | M | InputText, Password, Button | F3 | Acepta invitación con token |

---

## 3. Shared Components (34)

### UI Primitivos

| Componente | Tipo | Complejidad | PrimeVue | Fase | Descripción |
|-----------|------|-------------|----------|------|-------------|
| `EmptyState.vue` | Shared | S | - | F0 | Variantes: first-use, no-results, error, compact |
| `StatusBadge.vue` | Shared | S | Tag | F4 | Mapeo status → severity |
| `SourceBadge.vue` | Shared | S | Tag | F4 | Badge de fuente de candidato |
| `TagBadge.vue` | Shared | S | Tag | F4 | Badge de etiqueta con color |
| `ScoreIndicator.vue` | Shared | S | - | F5 | Indicador visual de score 0-100 |
| `ComplianceIndicator.vue` | Shared | S | - | F8 | Estado de cumplimiento documental |
| `DocumentExpirationBadge.vue` | Shared | S | Tag | F8 | Vigente/por vencer/vencido |
| `ViewToggle.vue` | Shared | S | ButtonGroup | F4 | Toggle lista/kanban/grid |
| `ThemeToggle.vue` | Shared | S | Button, Menu | F2 | Light/dark/system |
| `ImpersonationBanner.vue` | Shared | S | Message | F11 | Banner de impersonación activa |
| `WatermarkOverlay.vue` | Shared | S | - | F13 | Marca de agua dev/staging |
| `KontrolaLogo.vue` | Shared | S | - | F0 | Logo SVG |
| `KontrolaLogoIcon.vue` | Shared | S | - | F0 | Favicon SVG |

### List Controls

| Componente | Tipo | Complejidad | PrimeVue | Fase | Descripción |
|-----------|------|-------------|----------|------|-------------|
| `ListSearch.vue` | Shared | S | InputText | F3 | Campo de búsqueda con debounce |
| `ListControls.vue` | Shared | S | Dropdown | F3 | Per-page + filtros toolbar |
| `ListFilterTabs.vue` | Shared | S | TabMenu | F4 | Filtros por tabs |
| `PerPageSelect.vue` | Shared | S | Dropdown | F3 | Selector 10/20/50/100 |
| `SelectionToolbar.vue` | Shared | M | Button, Toolbar | F4 | Toolbar de acciones bulk |
| `DeleteConfirmDialog.vue` | Shared | S | Dialog | F3 | Confirmación de eliminación |

### Form Inputs

| Componente | Tipo | Complejidad | PrimeVue | Fase | Descripción |
|-----------|------|-------------|----------|------|-------------|
| `ImageUploadInput.vue` | Shared | M | FileUpload | F10 | Drag-and-drop imagen con preview |
| `StringListInput.vue` | Shared | M | InputText, Button | F4 | Array dinámico (requisitos, beneficios) |
| `WorkScheduleInput.vue` | Shared | M | Dropdown, Checkbox | F4 | Configurador de horario laboral |

### Tags

| Componente | Tipo | Complejidad | PrimeVue | Fase | Descripción |
|-----------|------|-------------|----------|------|-------------|
| `TagInput.vue` | Shared | M | AutoComplete, Chip | F4 | Input de tags con autocomplete |
| `TagFormModal.vue` | Shared | M | Dialog, InputText, ColorPicker | F4 | Crear/editar tag |
| `CreateTagModal.vue` | Shared | S | Dialog | F4 | Wrapper create |
| `EditTagModal.vue` | Shared | S | Dialog | F4 | Wrapper edit |
| `BulkTagModal.vue` | Shared | M | Dialog, MultiSelect | F4 | Asignación masiva |

### Documents

| Componente | Tipo | Complejidad | PrimeVue | Fase | Descripción |
|-----------|------|-------------|----------|------|-------------|
| `DocumentPreviewModal.vue` | Shared | M | Dialog | F8 | Visor PDF/imagen |
| `DocumentVerifyModal.vue` | Shared | M | Dialog, Checkbox | F8 | Verificación documental |
| `DocumentVersionHistory.vue` | Shared | M | Timeline | F8 | Historial de versiones |
| `DocumentLinkedEntities.vue` | Shared | S | DataTable | F8 | Entidades vinculadas |

### Candidates

| Componente | Tipo | Complejidad | PrimeVue | Fase | Descripción |
|-----------|------|-------------|----------|------|-------------|
| `CandidateCompareModal.vue` | Shared | L | Dialog, DataTable | F4 | Comparación multi-candidato |
| `CandidateTagsSection.vue` | Shared | M | Chip, AutoComplete | F4 | Gestión de tags en candidato |
| `JobProfileTagsSection.vue` | Shared | M | Chip, AutoComplete | F4 | Gestión de tags en perfil |

---

## 4. Recruitment Module (~80 componentes)

### 4.1 Candidates

| Componente | Tipo | Complejidad | PrimeVue | Fase | Descripción |
|-----------|------|-------------|----------|------|-------------|
| `Candidates/Index.vue` | Page | M | - | F4 | Panel View: lista + detalle |
| `CandidatesList.vue` | Feature | L | DataTable, Column, InputText, Button, Tag | F4 | Tabla con búsqueda, filtros, selección |
| `CandidateDetail.vue` | Feature | L | TabView, Tag, Button, Skeleton | F4 | Header fijo + tabs (docs, apps, historial) |
| `CandidateCreate.vue` | Feature | M | Drawer, InputText, Dropdown, Button | F4 | Formulario en drawer |
| `CandidateEdit.vue` | Feature | M | Drawer, InputText, Dropdown, Button | F4 | Edición en drawer |
| `CandidateDocumentsTab.vue` | Feature | M | DataTable, Tag, Button | F8 | Documentos requeridos del candidato |
| `CandidateApplicationsTab.vue` | Feature | M | DataTable, Tag | F4 | Aplicaciones del candidato |
| `CandidateHistoryTab.vue` | Feature | M | Timeline | F4 | Log de actividad |
| `AdvancedFilterPanel.vue` | Feature | L | MultiSelect, Calendar, Dropdown, Button | F4 | Filtros multi-faceta |
| `SavedSearchDropdown.vue` | Feature | M | Dropdown, Button | F4 | Búsquedas guardadas |
| `AddRequirementModal.vue` | Feature | S | Dialog, Dropdown | F8 | Agregar requisito documental |
| `AssociateToJobProfilesModal.vue` | Feature | M | Dialog, MultiSelect | F4 | Asociar candidato a puestos |
| `DocumentUploadModal.vue` | Feature | M | Dialog, FileUpload, ProgressBar | F8 | Subir documento |
| `ReplaceDocumentModal.vue` | Feature | M | Dialog, FileUpload | F8 | Reemplazar documento |
| `DocumentMaintenanceModal.vue` | Feature | M | Dialog | F8 | Mantenimiento documental |

### 4.2 Job Profiles

| Componente | Tipo | Complejidad | PrimeVue | Fase | Descripción |
|-----------|------|-------------|----------|------|-------------|
| `JobProfiles/Index.vue` | Page | M | - | F4 | Panel View |
| `JobProfiles/Create.vue` | Page | M | Stepper | F4 | Wizard 6 pasos |
| `JobProfilesList.vue` | Feature | M | DataTable, Tag, Button | F4 | Lista con estados |
| `JobProfileDetail.vue` | Feature | L | TabView, Tag, Button | F4 | Detalle con tabs |
| `PublishJobProfile.vue` | Feature | M | Dialog, Button | F4 | Publicar perfil |
| `WizardStepBasicInfo.vue` | Feature | M | InputText, Dropdown, InputTextarea | F4 | Paso 1: info básica |
| `WizardStepRequirements.vue` | Feature | M | StringListInput | F4 | Paso 2: requisitos |
| `WizardStepDocuments.vue` | Feature | M | MultiSelect, Checkbox | F4 | Paso 3: documentos requeridos |
| `WizardStepTemplate.vue` | Feature | M | Dropdown | F4 | Paso 4: template |
| `WizardStepVacancies.vue` | Feature | M | EmbeddedVacancyForm | F4 | Paso 5: vacantes |
| `WizardStepReview.vue` | Feature | M | Summary display | F4 | Paso 6: revisión |
| `EmbeddedVacancyForm.vue` | Feature | M | InputText, Calendar, Dropdown | F4 | Form de vacante inline |

### 4.3 Pipeline / Kanban

| Componente | Tipo | Complejidad | PrimeVue | Fase | Descripción |
|-----------|------|-------------|----------|------|-------------|
| `Processes/Index.vue` | Page | M | - | F5 | Kanban board |
| `KanbanBoard.vue` | Feature | XL | vuedraggable | F5 | Tablero drag-and-drop |
| `KanbanColumn.vue` | Feature | M | - | F5 | Columna por stage |
| `KanbanCard.vue` | Feature | M | Tag, Avatar | F5 | Tarjeta de candidato |
| `KanbanFilters.vue` | Feature | M | Dropdown, MultiSelect, Calendar | F5 | Filtros del tablero |
| `CandidateProfileDrawer.vue` | Feature | L | Drawer, TabView | F5 | Drawer de perfil |
| `CandidateHistoryDrawer.vue` | Feature | M | Drawer, Timeline | F5 | Timeline de movimientos |
| `CandidateDocumentsModal.vue` | Feature | M | Dialog, DataTable | F5 | Documentos en kanban |
| `FinalStageModal.vue` | Feature | M | Dialog, RadioButton, InputTextarea | F5 | Contratación/rechazo |
| `AddNoteModal.vue` | Feature | S | Dialog, InputTextarea | F5 | Agregar nota |
| `SkipConfirmModal.vue` | Feature | M | Dialog, InputTextarea | F5 | Saltar etapa |
| `TimeIndicator.vue` | Feature | S | - | F5 | Días en stage |

### 4.4 Selection Processes

| Componente | Tipo | Complejidad | PrimeVue | Fase | Descripción |
|-----------|------|-------------|----------|------|-------------|
| `Procesos/Index.vue` | Page | M | - | F4 | Panel View |
| `PipelinesList.vue` | Feature | M | DataTable | F4 | Lista de procesos |
| `PipelinesDetail.vue` | Feature | M | - | F4 | Stages visualizados |
| `PipelinesCreate.vue` | Feature | M | InputText, Button | F4 | Crear proceso |
| `PipelinesEdit.vue` | Feature | M | InputText, Button | F4 | Editar proceso |
| `StageCard.vue` | Feature | S | - | F4 | Stage con color |
| `StageEdit.vue` | Feature | M | InputText, Checkbox, ColorPicker | F4 | Editar stage |
| `StageColorPicker.vue` | Feature | S | ColorPicker | F4 | Selector de color |

### 4.5 Metrics Dashboard

| Componente | Tipo | Complejidad | PrimeVue | Fase | Descripción |
|-----------|------|-------------|----------|------|-------------|
| `Dashboard/Index.vue` | Page | M | - | F6 | Layout de métricas |
| `MetricsFilters.vue` | Feature | M | Calendar, Dropdown | F6 | Filtros de fecha |
| `FunnelChart.vue` | Feature | M | Chart.js | F6 | Funnel de stages |
| `ThroughputChart.vue` | Feature | M | Chart.js | F6 | Throughput temporal |
| `TimeToFillChart.vue` | Feature | M | Chart.js | F6 | Tiempo de llenado |
| `SourceDistributionChart.vue` | Feature | M | Chart.js | F6 | Distribución por fuente |
| `SourceEffectivenessTable.vue` | Feature | M | DataTable | F6 | Efectividad por fuente |
| `SuccessRateTable.vue` | Feature | M | DataTable | F6 | Tasa de éxito |
| `BottleneckAlert.vue` | Feature | S | Message | F6 | Alerta de cuello de botella |
| `ExportDropdown.vue` | Feature | S | SplitButton | F6 | Exportar métricas |
| `OnboardingChecklist.vue` | Feature | M | - | F6 | Checklist primer uso |

### 4.6 Syndication

| Componente | Tipo | Complejidad | PrimeVue | Fase | Descripción |
|-----------|------|-------------|----------|------|-------------|
| `Syndication/Dashboard/Index.vue` | Page | M | DataTable, Tag | F7 | Status de publicaciones |
| `JobBoards/Index.vue` | Page | M | DataTable | F7 | Portales configurados |
| `Templates/Index.vue` | Page | M | DataTable, Dialog | F7 | Templates sociales |
| `Settings/Index.vue` | Page | M | InputText, Password | F7 | Credenciales |

### 4.7 Tags & Vacancies

| Componente | Tipo | Complejidad | PrimeVue | Fase | Descripción |
|-----------|------|-------------|----------|------|-------------|
| `Etiquetas/Index.vue` | Page | M | DataTable, Dialog | F4 | CRUD de tags |
| `Vacancies/Index.vue` | Page | M | DataTable, Tag | F4 | Lista de vacantes |
| `Autorizaciones/Index.vue` | Page | M | DataTable, Tag | F5 | Skip requests |

---

## 5. Documents Module (~15 componentes)

| Componente | Tipo | Complejidad | PrimeVue | Fase | Descripción |
|-----------|------|-------------|----------|------|-------------|
| `FileExplorer/Index.vue` | Page | L | DataTable, FileUpload, Dialog | F8 | Explorador de archivos |
| `DocumentTypes/Index.vue` | Page | M | DataTable, Dialog | F8 | CRUD de tipos |
| `ClientCompliance/Index.vue` | Page | M | DataTable, Tag, ProgressBar | F8 | Dashboard compliance |

---

## 6. CRM Module (~5 componentes)

| Componente | Tipo | Complejidad | PrimeVue | Fase | Descripción |
|-----------|------|-------------|----------|------|-------------|
| `Clients/Index.vue` | Page | M | - | F9 | Panel View |
| `ClientsList.vue` | Feature | M | DataTable | F9 | Lista de clientes |
| `ClientDetail.vue` | Feature | M | TabView | F9 | Detalle con tabs |

---

## 7. Access Control (~15 componentes)

| Componente | Tipo | Complejidad | PrimeVue | Fase | Descripción |
|-----------|------|-------------|----------|------|-------------|
| `Users/Index.vue` | Page | M | - | F3 | Panel View |
| `UsersList.vue` | Feature | M | DataTable | F3 | Lista con roles |
| `UserDetail.vue` | Feature | M | Tag | F3 | Detalle de usuario |
| `UserCreate.vue` | Feature | M | Drawer, InputText | F3 | Crear usuario |
| `UserEdit.vue` | Feature | M | Drawer | F3 | Editar usuario |
| `UserInvite.vue` | Feature | M | Drawer, InputText | F3 | Invitar por email |
| `UserRoles.vue` | Feature | M | MultiSelect | F3 | Asignar roles |
| `InvitationsList.vue` | Feature | M | DataTable, Tag | F3 | Invitaciones pendientes |
| `Roles/Index.vue` | Page | M | - | F3 | Panel View |
| `RolesList.vue` | Feature | M | DataTable | F3 | Lista de roles |
| `RoleDetail.vue` | Feature | M | - | F3 | Permisos del rol |
| `RoleCreate.vue` | Feature | M | Drawer | F3 | Crear rol |
| `RoleEdit.vue` | Feature | M | Drawer | F3 | Editar rol |
| `PermissionSelector.vue` | Feature | L | Checkbox, Accordion | F3 | Selector granular |

---

## 8. Settings (~5 componentes)

| Componente | Tipo | Complejidad | PrimeVue | Fase | Descripción |
|-----------|------|-------------|----------|------|-------------|
| `Profile/Index.vue` | Page | M | InputText, FileUpload, Button | F10 | Perfil de usuario |
| `Settings/ApiKeys/Index.vue` | Page | M | DataTable, Dialog, InputText | F10 | API keys |
| `Settings/Modules/Index.vue` | Page | M | ToggleButton, Card | F10 | Feature toggles |
| `Administration/BulkImport.vue` | Page | L | FileUpload, ProgressBar, DataTable | F10 | Import CSV |

---

## 9. Admin Panel (~50 componentes)

| Componente | Tipo | Complejidad | PrimeVue | Fase | Descripción |
|-----------|------|-------------|----------|------|-------------|
| `Panel/Admin/Auth/Login.vue` | Page | M | InputText, Password | F11 | Login admin |
| `Dashboard/Index.vue` | Page | L | Chart.js, DataTable | F11 | KPIs, MRR |
| `AdminUsers/*` | Feature | M | DataTable, Dialog | F11 | CRUD admins |
| `Tenants/*` | Feature | L | DataTable, Dialog, ToggleButton | F11 | Gestión tenants |
| `Billing/*` | Feature | L | DataTable, Chart.js | F11 | Suscripciones |
| `Modules/*` | Feature | M | DataTable, ToggleButton | F11 | Feature toggles |
| `Plans/*` | Feature | M | DataTable, Dialog | F11 | Planes de precio |
| `ActivityLogs/Index.vue` | Page | M | DataTable, Calendar | F11 | Audit trail |
| `ImpersonationLogs/Index.vue` | Page | M | DataTable | F11 | Log impersonación |
| `Reports/Index.vue` | Page | M | DataTable, Button | F11 | Exports |
| `SystemHealth/Index.vue` | Page | M | DataTable, Tag | F11 | Monitoreo |

---

## 10. Candidate Portal (~12 componentes)

| Componente | Tipo | Complejidad | PrimeVue | Fase | Descripción |
|-----------|------|-------------|----------|------|-------------|
| `Portal/Candidate/Auth/Login.vue` | Page | S | InputText, Button | F12 | Magic link |
| `Portal/Candidate/Auth/CheckEmail.vue` | Page | S | - | F12 | Mensaje de verificación |
| `Portal/Candidate/Auth/LinkExpired.vue` | Page | S | Button | F12 | Link expirado |
| `Portal/Candidate/Dashboard.vue` | Page | M | Card, Tag | F12 | Dashboard candidato |
| `Portal/Candidate/Applications/Show.vue` | Page | L | TabView, Tag | F12 | Detalle de aplicación |
| `Portal/Jobs/Directory.vue` | Page | M | DataView, InputText | F12 | Directorio público |
| `Portal/Jobs/Show.vue` | Page | M | Button, Tag | F12 | Detalle de vacante |
| `Portal/Jobs/Apply.vue` | Page | M | InputText, FileUpload | F12 | Formulario de aplicación |
| `Portal/Jobs/Success.vue` | Page | S | - | F12 | Confirmación |
| `PositionCard.vue` | Feature | S | Card, Tag | F12 | Tarjeta de vacante |
| `ShareButtons.vue` | Feature | S | Button | F12 | Compartir en redes |
| `JobStructuredData.vue` | Feature | S | - | F12 | JSON-LD para SEO |

---

## 11. Composables (15)

| Composable Original | Fase | Equivalente SPA | Descripción |
|---------------------|------|-----------------|-------------|
| `useColorMode()` | F2 | `useColorMode()` | Dark/light/system toggle |
| `usePermissions()` | F2 | `usePermissions()` | can(), canAny(), hasRole() |
| `useSidebar()` | F2 | `useSidebar()` | Estado de colapso sidebar |
| `useMobile()` | F2 | `useMobile()` | Breakpoint detection |
| `useSelection()` | F4 | `useSelection()` | Multi-select bulk operations |
| `useListPage()` | F3 | `useListPage()` | Paginación, sorting, filtros |
| `useListPreferences()` | F4 | `useListPreferences()` | Preferencias de columnas |
| `useCandidateFilters()` | F4 | `useCandidateFilters()` | Filtros avanzados candidatos |
| `useKanbanFilters()` | F5 | `useKanbanFilters()` | Filtros tablero kanban |
| `useImportProgress()` | F10 | `useImportProgress()` | Progreso de import masivo |
| `useNotifications()` → `useNotify()` | F2 | `useNotify()` | Toast notifications |
| `useSyndicationBroadcast()` | F7 | `useSyndicationStatus()` | Estado de publicaciones |
| `useSocialTemplates()` | F7 | `useSocialTemplates()` | Templates sociales |
| `useSlugify()` | F4 | `useSlugify()` | URL slug generation |
| `useUnsavedChanges()` | F4 | `useUnsavedChanges()` | Dirty check en navegación |

---

## 12. TypeScript Types (25 archivos)

| Archivo Original | Fase | Tipos Principales |
|-----------------|------|-------------------|
| `recruitment.d.ts` | F4 | JobProfile, SelectionProcess, Stage, Vacancy, Question |
| `candidate.d.ts` | F4 | Candidate, CandidateListItem |
| `kanban.d.ts` | F5 | KanbanCandidate, KanbanColumn |
| `vacancy.d.ts` | F4 | Vacancy, ApplicationTiming |
| `documents.d.ts` | F8 | DocumentType, LinkedDocument, RequiredDocument |
| `search.d.ts` | F4 | CandidateFilters |
| `access.d.ts` | F3 | Role, Permission, User |
| `crm.d.ts` | F9 | Client, Branch, Contact |
| `tag.d.ts` | F4 | Tag |
| `pagination.ts` | F0 | PaginatedResponse<T> |
| `status.d.ts` | F4 | StatusMeta, StatusTransition |
| `admin.ts` | F11 | DashboardMetrics, Plan, Module, Tenant |
| `recruitment-metrics.d.ts` | F6 | FunnelData, SourceData, KPI |
| `stage-skip-request.d.ts` | F5 | StageSkipRequest |
| `syndication.d.ts` | F7 | SyndicationPost, Template |
| `portal.d.ts` | F12 | PortalCandidate, PortalApplication |
| `matching.d.ts` | F5 | MatchScore, ScoreBreakdown |
| `dashboard.d.ts` | F2 | DashboardData |
| `profile.d.ts` | F10 | UserProfile |
| `ui.d.ts` | F0 | PanelMode, ViewType, EmptyReason |
| `form-utils.d.ts` | F0 | FormErrors, FieldError |
| `integration.d.ts` | F7 | Integration, OAuthConfig |
| `auth.d.ts` | F1 | LoginCredentials, AuthUser, TokenResponse |

---

## 13. Diferencias Clave Laravel → SPA

| Aspecto | Laravel/Inertia | SPA Vue 3 |
|---------|----------------|-----------|
| Routing | Wayfinder (server-side) | Vue Router 4 (client-side) |
| State | Inertia props | Pinia stores |
| Forms | `useForm()` de Inertia | `ref()` + composables propios |
| Auth | Session cookie (Laravel) | JWT Bearer + HttpOnly refresh |
| API calls | Inertia `router.post/get` | Axios + OpenAPI client generado |
| SSR | Inertia SSR | No (SPA pura, SEO via portal público en Razor) |
| Real-time | Laravel Echo/Reverb | Polling o WebSocket directo (fase futura) |
| CSRF | Token automático de Laravel | No aplica (JWT) |
| Error display | `form.errors` de Inertia | RFC 9457 ProblemDetails + fieldErrors |
| Resource creation | POST | PUT con client-generated UUIDv7 |
| Charts | Chart.js + Unovis | Chart.js (migrar Unovis si necesario) |
| Drag-drop | vuedraggable | vuedraggable (misma lib) |

---

## 14. Dependencias a Migrar

| Paquete Laravel | Equivalente SPA | Notas |
|----------------|-----------------|-------|
| `@inertiajs/vue3` | `vue-router` + `pinia` + `axios` | Reemplaza routing + state + HTTP |
| `laravel-echo` + `pusher-js` | TBD (polling inicial) | WebSocket en fase futura |
| `vuedraggable` | `vuedraggable` | Misma librería |
| `chart.js` | `chart.js` | Misma librería |
| `@unovis/vue` | Evaluar necesidad | Solo usado en admin dashboard |
| `@vueuse/core` | Composables propios | Evitar dependencia extra si es posible |
| `@sentry/vue` | `@sentry/vue` | Misma librería |
