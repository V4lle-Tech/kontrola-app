# Inventario de Tipos TypeScript

> Mapeo de los tipos del frontend Laravel a las interfaces que se crearán en la SPA.
> Los tipos se definen en `src/types/` y se generan parcialmente desde el OpenAPI spec.

---

## Tipos Base (Fase 0)

### Paginación

```typescript
// src/types/pagination.ts
interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}
```

### API Errors (RFC 9457)

```typescript
// src/types/api.ts
interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
  traceId?: string;
}

interface ApiError extends ProblemDetails {
  fieldErrors: Record<string, string>;
}
```

### UI State

```typescript
// src/types/ui.ts
type PanelMode = 'list' | 'detail';
type ViewType = 'list' | 'kanban' | 'grid';
type EmptyReason = 'first-use' | 'no-results' | 'error' | 'no-permission';
type ColorMode = 'light' | 'dark' | 'system';
```

---

## Tipos de Auth (Fase 1)

```typescript
// src/types/auth.ts
interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  givenName: string;
  paternalName: string;
  maternalName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

interface AuthUser {
  id: string;
  givenName: string;
  paternalName: string;
  maternalName: string;
  fullName: string;
  email: string;
  roles: string[];
  permissions: string[];
  isOwner: boolean;
  isAdmin: boolean;
}

interface TokenResponse {
  accessToken: string;
  expiresInSeconds: number;
  user: AuthUser;
}

type Permission =
  | 'recruitment.candidates.view'
  | 'recruitment.candidates.manage'
  | 'recruitment.job_profiles.view'
  | 'recruitment.job_profiles.create'
  | 'recruitment.job_profiles.manage'
  | 'recruitment.applications.view'
  | 'recruitment.applications.manage'
  | 'recruitment.pipeline.move'
  | 'recruitment.tags.manage'
  | 'recruitment.metrics.view'
  | 'recruitment.syndication.manage'
  | 'documents.view'
  | 'documents.manage'
  | 'documents.types.manage'
  | 'documents.verify'
  | 'crm.clients.view'
  | 'crm.clients.manage'
  | 'access.users.view'
  | 'access.users.manage'
  | 'access.roles.view'
  | 'access.roles.manage'
  | 'settings.modules.manage'
  | 'settings.api_keys.manage'
  | 'compliance_reports.view';
```

---

## Tipos de Access Control (Fase 3)

```typescript
// src/types/access.ts
interface User {
  id: string;
  givenName: string;
  paternalName: string;
  maternalName: string;
  fullName: string;
  email: string;
  roles: Role[];
  isActive: boolean;
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  slug: string;
  level: number;
  isSystem: boolean;
  permissions: Permission[];
  usersCount: number;
}

interface UserInvitation {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;
  createdAt: string;
}
```

---

## Tipos de Recruitment (Fase 4)

```typescript
// src/types/recruitment.ts

// — Job Profiles —
type JobProfileStatus = 'draft' | 'active' | 'archived';
type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'temporary' | 'internship';
type ConfidentialityLevel = 'public' | 'hide_logo' | 'hide_location' | 'confidential';
type QuestionType = 'yes_no' | 'text';
type DocumentImportance = 'required' | 'recommended' | 'optional';

interface JobProfile {
  id: string;
  title: string;
  description: string | null;
  requirements: string[] | null;
  functions: string[] | null;
  benefits: string[] | null;
  salaryMin: number | null;
  salaryMax: number | null;
  status: JobProfileStatus;
  employmentType: EmploymentType;
  confidentialityLevel: ConfidentialityLevel;
  selectionProcess?: SelectionProcess;
  vacancies?: Vacancy[];
  questions?: JobProfileQuestion[];
  tags?: Tag[];
  clientId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface JobProfileQuestion {
  id: string;
  type: QuestionType;
  questionText: string;
  isRequired: boolean;
  sortOrder: number;
}

// — Vacancies —
type VacancyStatus = 'draft' | 'published' | 'paused' | 'closed' | 'filled';

interface Vacancy {
  id: string;
  jobProfileId: string;
  jobProfile?: JobProfile;
  slug: string;
  status: VacancyStatus;
  publishedAt: string | null;
  closedAt: string | null;
  createdAt: string;
}

// — Selection Processes —
type StageType = 'application' | 'intermediate' | 'rejected' | 'hired';

interface SelectionProcess {
  id: string;
  name: string;
  isDefault: boolean;
  stages: SelectionStage[];
  createdAt: string;
}

interface SelectionStage {
  id: string;
  name: string;
  order: number;
  color: string;
  isFinal: boolean;
  type: StageType;
  requiresComments: boolean;
  requiresApproval: boolean;
  documentTemplateIds?: string[];
}

// — Candidates —
type CandidateSource = 'manual' | 'portal' | 'referral' | 'linkedin' | 'indeed' | 'other';

interface Candidate {
  id: string;
  givenName: string;
  paternalName: string;
  maternalName: string;
  fullName: string;
  email: string;
  phone: string | null;
  notes: string | null;
  source: CandidateSource;
  educationLevel: string | null;
  tags?: Tag[];
  createdAt: string;
  updatedAt: string;
}

interface CandidateListItem extends Candidate {
  jobProfilesCount: number;
  applicationsCount: number;
  documentsCount: number;
}

// — Applications —
type ApplicationStatus = 'in_progress' | 'hired' | 'rejected' | 'withdrawn';

interface Application {
  id: string;
  vacancyId: string;
  candidateId: string;
  currentStageId: string;
  status: ApplicationStatus;
  daysInStage: number;
  vacancy?: Vacancy;
  candidate?: Candidate;
  currentStage?: SelectionStage;
  createdAt: string;
}

// — Tags —
interface Tag {
  id: string;
  name: string;
  color: string;
  type: 'candidate' | 'job_profile';
}

// — Match Scores —
interface MatchScore {
  id: string;
  candidateId: string;
  jobProfileId: string;
  score: number;
  breakdown: Record<string, number>;
}

// — Stage Skip Requests —
type SkipRequestStatus = 'pending' | 'approved' | 'rejected';

interface StageSkipRequest {
  id: string;
  applicationId: string;
  fromStageId: string;
  toStageId: string;
  requestedById: string;
  status: SkipRequestStatus;
  reason: string;
  reviewedById: string | null;
  reviewNote: string | null;
  createdAt: string;
}

// — Candidate Filters —
interface CandidateFilters {
  search?: string;
  sources?: CandidateSource[];
  tags?: string[];
  educationLevels?: string[];
  jobProfiles?: string[];
  dateFrom?: string;
  dateTo?: string;
}
```

---

## Tipos de Kanban (Fase 5)

```typescript
// src/types/kanban.ts
interface KanbanCandidate {
  id: string;
  fullName: string;
  avatarColor: string;
  tags: Tag[];
  score: number | null;
  daysInStage: number;
  applicationId: string;
}

interface KanbanColumn {
  stage: SelectionStage;
  candidates: KanbanCandidate[];
  count: number;
}

interface KanbanFilters {
  selectionProcessId?: string;
  vacancyId?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
}
```

---

## Tipos de Metrics (Fase 6)

```typescript
// src/types/metrics.ts
interface FunnelData {
  stageName: string;
  count: number;
  percentage: number;
  color: string;
}

interface SourceDistribution {
  source: CandidateSource;
  count: number;
  percentage: number;
  hiredCount: number;
  conversionRate: number;
}

interface TimeToFill {
  jobProfileTitle: string;
  averageDays: number;
  minDays: number;
  maxDays: number;
}

interface RecruitmentKPIs {
  totalCandidates: number;
  totalApplications: number;
  totalHired: number;
  averageTimeToFill: number;
  openVacancies: number;
  conversionRate: number;
}
```

---

## Tipos de Documents (Fase 8)

```typescript
// src/types/documents.ts
type DocumentStatus = 'pending' | 'approved' | 'rejected';

interface DocumentType {
  id: string;
  name: string;
  description: string | null;
  category: string;
  maxSizeMb: number;
  allowedExtensions: string[];
  requiredByDefault: boolean;
  isSystem: boolean;
}

interface Document {
  id: string;
  documentTypeId: string;
  documentType?: DocumentType;
  ownerId: string;
  ownerType: 'candidate' | 'user';
  filePath: string;
  url: string;
  mimeType: string;
  fileSize: number;
  status: DocumentStatus;
  verifiedAt: string | null;
  verifiedBy: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  filePath: string;
  replacedAt: string;
  replacedBy: string;
}

interface RequiredDocument {
  id: string;
  documentTypeId: string;
  documentType: DocumentType;
  linkedDocument?: Document;
  isLinked: boolean;
  isVerified: boolean;
  importance: DocumentImportance;
}

interface ComplianceReport {
  candidateId: string;
  candidateName: string;
  totalRequired: number;
  totalLinked: number;
  totalVerified: number;
  totalExpired: number;
  compliancePercentage: number;
}
```

---

## Tipos de CRM (Fase 9)

```typescript
// src/types/crm.ts
interface Client {
  id: string;
  name: string;
  parentId: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  rfc: string | null;
  isActive: boolean;
  jobProfilesCount: number;
  branches?: ClientBranch[];
  contacts?: ClientContact[];
  createdAt: string;
}

interface ClientBranch {
  id: string;
  clientId: string;
  name: string;
  address: string | null;
  phone: string | null;
}

interface ClientContact {
  id: string;
  clientId: string;
  name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
}
```

---

## Tipos de Admin (Fase 11)

```typescript
// src/types/admin.ts
interface Tenant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  modules: TenantModule[];
  usersCount: number;
  createdAt: string;
}

interface TenantModule {
  moduleId: string;
  moduleName: string;
  level: string;
  isActive: boolean;
}

interface Plan {
  id: string;
  name: string;
  slug: string;
  platformFee: number;
  maxModuleSlots: number;
  isActive: boolean;
}

interface AdminDashboardMetrics {
  totalTenants: number;
  activeTenants: number;
  mrr: number;
  mrrGrowth: number;
  newTenantsThisMonth: number;
  planDistribution: { planName: string; count: number }[];
}

interface AdminActivityLog {
  id: string;
  adminUserId: string;
  adminName: string;
  action: string;
  subjectType: string;
  subjectId: string;
  properties: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
}

interface ImpersonationLog {
  id: string;
  adminUserId: string;
  adminName: string;
  tenantId: string;
  tenantName: string;
  startedAt: string;
  endedAt: string | null;
  actionsCount: number;
}
```

---

## Tipos de Syndication (Fase 7)

```typescript
// src/types/syndication.ts
type SyndicationProvider = 'indeed' | 'jooble' | 'meta' | 'linkedin';
type SyndicationStatus = 'draft' | 'scheduled' | 'published' | 'failed' | 'expired';

interface SyndicationPost {
  id: string;
  vacancyId: string;
  provider: SyndicationProvider;
  status: SyndicationStatus;
  externalId: string | null;
  publishedAt: string | null;
  expiresAt: string | null;
  metrics?: SyndicationMetrics;
}

interface SyndicationMetrics {
  views: number;
  clicks: number;
  applications: number;
}

interface SocialTemplate {
  id: string;
  name: string;
  platform: 'facebook' | 'instagram' | 'linkedin';
  content: string;
  isDefault: boolean;
}

interface JobBoard {
  id: string;
  provider: SyndicationProvider;
  name: string;
  isConnected: boolean;
  credentials: Record<string, string>;
}
```

---

## Tipos de Settings (Fase 10)

```typescript
// src/types/settings.ts
interface UserProfile {
  id: string;
  givenName: string;
  paternalName: string;
  maternalName: string;
  email: string;
  avatarUrl: string | null;
}

interface BusinessConfig {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  rfc: string | null;
}

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface EnabledModule {
  slug: string;
  name: string;
  level: string;
  isActive: boolean;
}
```

---

## Nota sobre Generación

Los tipos marcados como "generados" se auto-generarán desde el OpenAPI spec de kontrola-net via `bun run api:generate`. Los tipos aquí documentados sirven como referencia y pueden diferir ligeramente de los generados. En caso de conflicto, los tipos generados desde el spec son la fuente de verdad.
