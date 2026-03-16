import { apiClient } from '@/api/client'
import { generateId } from '@/utils/uuid'
import type { PaginatedResponse, PaginationParams } from '@/types/pagination'
import type {
  Candidate,
  CandidateListItem,
  CreateCandidateRequest,
  UpdateCandidateRequest,
  JobProfile,
  CreateJobProfileRequest,
  UpdateJobProfileRequest,
  Vacancy,
  CreateVacancyRequest,
  UpdateVacancyRequest,
  SelectionProcess,
  CreateSelectionProcessRequest,
  UpdateSelectionProcessRequest,
  Tag,
  CreateTagRequest,
  UpdateTagRequest,
  Application,
  PipelineBoard,
  PipelineApplication,
  ApplicationNote,
  ApplicationHistory,
  MoveApplicationRequest,
  CreateApplicationNoteRequest,
  SkipStageRequest,
} from '@/types/recruitment'

export interface CandidateFilters extends PaginationParams {
  source?: string
  educationLevel?: string
  tagIds?: string[]
  dateFrom?: string
  dateTo?: string
}

export function useRecruitmentApi() {
  // ── Candidates ─────────────────────────────────────────────────────

  async function getCandidates(params?: CandidateFilters): Promise<PaginatedResponse<CandidateListItem>> {
    const { data } = await apiClient.get<PaginatedResponse<CandidateListItem>>('/candidates', { params })
    return data
  }

  async function getCandidate(id: string): Promise<Candidate> {
    const { data } = await apiClient.get<Candidate>(`/candidates/${id}`)
    return data
  }

  async function createCandidate(request: CreateCandidateRequest): Promise<Candidate> {
    const id = generateId()
    const { data } = await apiClient.put<Candidate>(`/candidates/${id}`, request)
    return data
  }

  async function updateCandidate(id: string, request: UpdateCandidateRequest): Promise<Candidate> {
    const { data } = await apiClient.put<Candidate>(`/candidates/${id}`, request)
    return data
  }

  async function deleteCandidate(id: string): Promise<void> {
    await apiClient.delete(`/candidates/${id}`)
  }

  // ── Job Profiles ───────────────────────────────────────────────────

  async function getJobProfiles(params?: PaginationParams): Promise<PaginatedResponse<JobProfile>> {
    const { data } = await apiClient.get<PaginatedResponse<JobProfile>>('/job-profiles', { params })
    return data
  }

  async function getJobProfile(id: string): Promise<JobProfile> {
    const { data } = await apiClient.get<JobProfile>(`/job-profiles/${id}`)
    return data
  }

  async function createJobProfile(request: CreateJobProfileRequest): Promise<JobProfile> {
    const id = generateId()
    const { data } = await apiClient.put<JobProfile>(`/job-profiles/${id}`, request)
    return data
  }

  async function updateJobProfile(id: string, request: UpdateJobProfileRequest): Promise<JobProfile> {
    const { data } = await apiClient.put<JobProfile>(`/job-profiles/${id}`, request)
    return data
  }

  async function deleteJobProfile(id: string): Promise<void> {
    await apiClient.delete(`/job-profiles/${id}`)
  }

  // ── Vacancies ──────────────────────────────────────────────────────

  async function getVacancies(params?: PaginationParams): Promise<PaginatedResponse<Vacancy>> {
    const { data } = await apiClient.get<PaginatedResponse<Vacancy>>('/vacancies', { params })
    return data
  }

  async function getVacancy(id: string): Promise<Vacancy> {
    const { data } = await apiClient.get<Vacancy>(`/vacancies/${id}`)
    return data
  }

  async function createVacancy(request: CreateVacancyRequest): Promise<Vacancy> {
    const id = generateId()
    const { data } = await apiClient.put<Vacancy>(`/vacancies/${id}`, request)
    return data
  }

  async function updateVacancy(id: string, request: UpdateVacancyRequest): Promise<Vacancy> {
    const { data } = await apiClient.put<Vacancy>(`/vacancies/${id}`, request)
    return data
  }

  async function deleteVacancy(id: string): Promise<void> {
    await apiClient.delete(`/vacancies/${id}`)
  }

  // ── Selection Processes ────────────────────────────────────────────

  async function getSelectionProcesses(params?: PaginationParams): Promise<PaginatedResponse<SelectionProcess>> {
    const { data } = await apiClient.get<PaginatedResponse<SelectionProcess>>('/selection-processes', { params })
    return data
  }

  async function getSelectionProcess(id: string): Promise<SelectionProcess> {
    const { data } = await apiClient.get<SelectionProcess>(`/selection-processes/${id}`)
    return data
  }

  async function createSelectionProcess(request: CreateSelectionProcessRequest): Promise<SelectionProcess> {
    const id = generateId()
    const { data } = await apiClient.put<SelectionProcess>(`/selection-processes/${id}`, request)
    return data
  }

  async function updateSelectionProcess(id: string, request: UpdateSelectionProcessRequest): Promise<SelectionProcess> {
    const { data } = await apiClient.put<SelectionProcess>(`/selection-processes/${id}`, request)
    return data
  }

  async function deleteSelectionProcess(id: string): Promise<void> {
    await apiClient.delete(`/selection-processes/${id}`)
  }

  // ── Tags ───────────────────────────────────────────────────────────

  async function getTags(type?: 'candidate' | 'job_profile'): Promise<Tag[]> {
    const params = type ? { type } : undefined
    const { data } = await apiClient.get<Tag[]>('/tags', { params })
    return data
  }

  async function createTag(request: CreateTagRequest): Promise<Tag> {
    const id = generateId()
    const { data } = await apiClient.put<Tag>(`/tags/${id}`, request)
    return data
  }

  async function updateTag(id: string, request: UpdateTagRequest): Promise<Tag> {
    const { data } = await apiClient.put<Tag>(`/tags/${id}`, request)
    return data
  }

  async function deleteTag(id: string): Promise<void> {
    await apiClient.delete(`/tags/${id}`)
  }

  async function bulkAssignTags(candidateIds: string[], tagIds: string[]): Promise<void> {
    await apiClient.post('/tags/bulk-assign', { candidateIds, tagIds })
  }

  async function bulkRemoveTags(candidateIds: string[], tagIds: string[]): Promise<void> {
    await apiClient.post('/tags/bulk-remove', { candidateIds, tagIds })
  }

  // ── Applications ───────────────────────────────────────────────────

  async function getCandidateApplications(candidateId: string): Promise<Application[]> {
    const { data } = await apiClient.get<Application[]>(`/candidates/${candidateId}/applications`)
    return data
  }

  // ── Pipeline ─────────────────────────────────────────────────────

  async function getPipelineBoard(vacancyId: string): Promise<PipelineBoard> {
    const { data } = await apiClient.get<PipelineBoard>(`/vacancies/${vacancyId}/pipeline`)
    return data
  }

  async function moveApplication(applicationId: string, request: MoveApplicationRequest): Promise<PipelineApplication> {
    const { data } = await apiClient.post<PipelineApplication>(`/applications/${applicationId}/move`, request)
    return data
  }

  async function getApplicationNotes(applicationId: string): Promise<ApplicationNote[]> {
    const { data } = await apiClient.get<ApplicationNote[]>(`/applications/${applicationId}/notes`)
    return data
  }

  async function createApplicationNote(applicationId: string, request: CreateApplicationNoteRequest): Promise<ApplicationNote> {
    const { data } = await apiClient.post<ApplicationNote>(`/applications/${applicationId}/notes`, request)
    return data
  }

  async function getApplicationHistory(applicationId: string): Promise<ApplicationHistory[]> {
    const { data } = await apiClient.get<ApplicationHistory[]>(`/applications/${applicationId}/history`)
    return data
  }

  async function getSkipRequests(params?: PaginationParams): Promise<PaginatedResponse<SkipStageRequest>> {
    const { data } = await apiClient.get<PaginatedResponse<SkipStageRequest>>('/skip-requests', { params })
    return data
  }

  async function approveSkipRequest(id: string): Promise<void> {
    await apiClient.post(`/skip-requests/${id}/approve`)
  }

  async function rejectSkipRequest(id: string): Promise<void> {
    await apiClient.post(`/skip-requests/${id}/reject`)
  }

  async function getActiveVacancies(): Promise<Vacancy[]> {
    const { data } = await apiClient.get<Vacancy[]>('/vacancies', { params: { status: 'published', pageSize: 100 } })
    return (data as unknown as PaginatedResponse<Vacancy>).items
  }

  return {
    // Candidates
    getCandidates,
    getCandidate,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    // Job Profiles
    getJobProfiles,
    getJobProfile,
    createJobProfile,
    updateJobProfile,
    deleteJobProfile,
    // Vacancies
    getVacancies,
    getVacancy,
    createVacancy,
    updateVacancy,
    deleteVacancy,
    // Selection Processes
    getSelectionProcesses,
    getSelectionProcess,
    createSelectionProcess,
    updateSelectionProcess,
    deleteSelectionProcess,
    // Tags
    getTags,
    createTag,
    updateTag,
    deleteTag,
    bulkAssignTags,
    bulkRemoveTags,
    // Applications
    getCandidateApplications,
    // Pipeline
    getPipelineBoard,
    moveApplication,
    getApplicationNotes,
    createApplicationNote,
    getApplicationHistory,
    getSkipRequests,
    approveSkipRequest,
    rejectSkipRequest,
    getActiveVacancies,
  }
}
