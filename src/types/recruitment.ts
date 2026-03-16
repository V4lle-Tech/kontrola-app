// — Job Profiles —
export type JobProfileStatus = 'draft' | 'active' | 'archived'
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'temporary' | 'internship'
export type ConfidentialityLevel = 'public' | 'hide_logo' | 'hide_location' | 'confidential'
export type QuestionType = 'yes_no' | 'text'
export type DocumentImportance = 'required' | 'recommended' | 'optional'

export interface JobProfile {
  id: string
  title: string
  description: string | null
  requirements: string[] | null
  functions: string[] | null
  benefits: string[] | null
  salaryMin: number | null
  salaryMax: number | null
  status: JobProfileStatus
  employmentType: EmploymentType
  confidentialityLevel: ConfidentialityLevel
  selectionProcess?: SelectionProcess
  vacancies?: Vacancy[]
  questions?: JobProfileQuestion[]
  tags?: Tag[]
  clientId: string | null
  createdAt: string
  updatedAt: string
}

export interface JobProfileQuestion {
  id: string
  type: QuestionType
  questionText: string
  isRequired: boolean
  sortOrder: number
}

export interface CreateJobProfileRequest {
  title: string
  description?: string
  requirements?: string[]
  functions?: string[]
  benefits?: string[]
  salaryMin?: number
  salaryMax?: number
  employmentType: EmploymentType
  confidentialityLevel?: ConfidentialityLevel
  selectionProcessId?: string
  clientId?: string
  tagIds?: string[]
}

export interface UpdateJobProfileRequest extends CreateJobProfileRequest {
  status?: JobProfileStatus
}

// — Vacancies —
export type VacancyStatus = 'draft' | 'published' | 'paused' | 'closed' | 'filled'

export interface Vacancy {
  id: string
  jobProfileId: string
  jobProfile?: JobProfile
  slug: string
  status: VacancyStatus
  publishedAt: string | null
  closedAt: string | null
  createdAt: string
}

export interface CreateVacancyRequest {
  jobProfileId: string
}

export interface UpdateVacancyRequest {
  status: VacancyStatus
}

// — Selection Processes —
export type StageType = 'application' | 'intermediate' | 'rejected' | 'hired'

export interface SelectionProcess {
  id: string
  name: string
  isDefault: boolean
  stages: SelectionStage[]
  createdAt: string
}

export interface SelectionStage {
  id: string
  name: string
  order: number
  color: string
  isFinal: boolean
  type: StageType
  requiresComments: boolean
  requiresApproval: boolean
  documentTemplateIds?: string[]
}

export interface CreateSelectionProcessRequest {
  name: string
  stages: Omit<SelectionStage, 'id'>[]
}

export interface UpdateSelectionProcessRequest {
  name: string
  stages: (Omit<SelectionStage, 'id'> & { id?: string })[]
}

// — Candidates —
export type CandidateSource = 'manual' | 'portal' | 'referral' | 'linkedin' | 'indeed' | 'other'

export interface Candidate {
  id: string
  givenName: string
  paternalName: string
  maternalName: string
  fullName: string
  email: string
  phone: string | null
  notes: string | null
  source: CandidateSource
  educationLevel: string | null
  tags?: Tag[]
  createdAt: string
  updatedAt: string
}

export interface CandidateListItem extends Candidate {
  jobProfilesCount: number
  applicationsCount: number
  documentsCount: number
}

export interface CreateCandidateRequest {
  givenName: string
  paternalName: string
  maternalName?: string
  email: string
  phone?: string
  notes?: string
  source?: CandidateSource
  educationLevel?: string
  tagIds?: string[]
}

export interface UpdateCandidateRequest extends CreateCandidateRequest {
  id?: never
}

// — Applications —
export type ApplicationStatus = 'in_progress' | 'hired' | 'rejected' | 'withdrawn'

export interface Application {
  id: string
  vacancyId: string
  candidateId: string
  currentStageId: string
  status: ApplicationStatus
  daysInStage: number
  vacancy?: Vacancy
  candidate?: Candidate
  currentStage?: SelectionStage
  createdAt: string
}

// — Pipeline —
export interface PipelineBoard {
  vacancy: Vacancy
  selectionProcess: SelectionProcess
  stages: PipelineStage[]
}

export interface PipelineStage {
  stage: SelectionStage
  applications: PipelineApplication[]
  count: number
}

export interface PipelineApplication {
  id: string
  candidateId: string
  candidateName: string
  candidateEmail: string
  status: ApplicationStatus
  daysInStage: number
  totalDays: number
  tags: Tag[]
  score: number | null
  currentStageId: string
  createdAt: string
}

export interface ApplicationNote {
  id: string
  applicationId: string
  content: string
  authorName: string
  createdAt: string
}

export interface MoveApplicationRequest {
  targetStageId: string
  reason?: string
}

export interface CreateApplicationNoteRequest {
  content: string
}

export interface ApplicationHistory {
  id: string
  applicationId: string
  fromStageId: string | null
  toStageId: string
  fromStageName: string | null
  toStageName: string
  reason: string | null
  authorName: string
  createdAt: string
}

export interface SkipStageRequest {
  id: string
  applicationId: string
  fromStageId: string
  toStageId: string
  fromStageName: string
  toStageName: string
  reason: string
  requestedBy: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface CreateSkipStageRequest {
  applicationId: string
  targetStageId: string
  reason: string
}

// — Tags —
export interface Tag {
  id: string
  name: string
  color: string
  type: 'candidate' | 'job_profile'
}

export interface CreateTagRequest {
  name: string
  color: string
  type: 'candidate' | 'job_profile'
}

export interface UpdateTagRequest {
  name: string
  color: string
}
