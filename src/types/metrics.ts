import type { CandidateSource } from './recruitment'

export interface FunnelData {
  stageName: string
  count: number
  percentage: number
  color: string
}

export interface SourceDistribution {
  source: CandidateSource
  count: number
  percentage: number
  hiredCount: number
  conversionRate: number
}

export interface TimeToFill {
  jobProfileTitle: string
  averageDays: number
  minDays: number
  maxDays: number
}

export interface RecruitmentKPIs {
  totalCandidates: number
  totalApplications: number
  totalHired: number
  averageTimeToFill: number
  openVacancies: number
  conversionRate: number
}

export interface MetricsFilters {
  dateFrom?: string
  dateTo?: string
  vacancyId?: string
}
