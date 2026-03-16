import { apiClient } from '@/api/client'
import type { PaginationParams, PaginatedResponse } from '@/types/pagination'
import type {
  SyndicationPost,
  JobBoard,
  SocialTemplate,
  PublishRequest,
} from '@/types/syndication'

export function useSyndicationApi() {
  async function getPosts(params?: PaginationParams): Promise<PaginatedResponse<SyndicationPost>> {
    const { data } = await apiClient.get<PaginatedResponse<SyndicationPost>>('/syndication/posts', { params })
    return data
  }

  async function publishVacancy(request: PublishRequest): Promise<SyndicationPost[]> {
    const { data } = await apiClient.post<SyndicationPost[]>('/syndication/publish', request)
    return data
  }

  async function retryPost(postId: string): Promise<SyndicationPost> {
    const { data } = await apiClient.post<SyndicationPost>(`/syndication/posts/${postId}/retry`)
    return data
  }

  async function getJobBoards(): Promise<JobBoard[]> {
    const { data } = await apiClient.get<JobBoard[]>('/syndication/boards')
    return data
  }

  async function updateJobBoard(id: string, board: Partial<JobBoard>): Promise<JobBoard> {
    const { data } = await apiClient.put<JobBoard>(`/syndication/boards/${id}`, board)
    return data
  }

  async function getTemplates(): Promise<SocialTemplate[]> {
    const { data } = await apiClient.get<SocialTemplate[]>('/syndication/templates')
    return data
  }

  async function createTemplate(template: Omit<SocialTemplate, 'id'>): Promise<SocialTemplate> {
    const { data } = await apiClient.post<SocialTemplate>('/syndication/templates', template)
    return data
  }

  async function updateTemplate(id: string, template: Partial<SocialTemplate>): Promise<SocialTemplate> {
    const { data } = await apiClient.put<SocialTemplate>(`/syndication/templates/${id}`, template)
    return data
  }

  async function deleteTemplate(id: string): Promise<void> {
    await apiClient.delete(`/syndication/templates/${id}`)
  }

  async function connectMeta(code: string): Promise<void> {
    await apiClient.post('/syndication/meta/connect', { code })
  }

  return {
    getPosts,
    publishVacancy,
    retryPost,
    getJobBoards,
    updateJobBoard,
    getTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    connectMeta,
  }
}
