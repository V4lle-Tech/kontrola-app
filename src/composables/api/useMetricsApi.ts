import { apiClient } from '@/api/client'
import type { FunnelData, SourceDistribution, TimeToFill, RecruitmentKPIs, MetricsFilters } from '@/types/metrics'

export function useMetricsApi() {
  async function getKPIs(filters?: MetricsFilters): Promise<RecruitmentKPIs> {
    const { data } = await apiClient.get<RecruitmentKPIs>('/metrics/recruitment/kpis', { params: filters })
    return data
  }

  async function getFunnel(filters?: MetricsFilters): Promise<FunnelData[]> {
    const { data } = await apiClient.get<FunnelData[]>('/metrics/recruitment/funnel', { params: filters })
    return data
  }

  async function getSourceDistribution(filters?: MetricsFilters): Promise<SourceDistribution[]> {
    const { data } = await apiClient.get<SourceDistribution[]>('/metrics/recruitment/sources', { params: filters })
    return data
  }

  async function getTimeToFill(filters?: MetricsFilters): Promise<TimeToFill[]> {
    const { data } = await apiClient.get<TimeToFill[]>('/metrics/recruitment/time-to-fill', { params: filters })
    return data
  }

  return {
    getKPIs,
    getFunnel,
    getSourceDistribution,
    getTimeToFill,
  }
}
