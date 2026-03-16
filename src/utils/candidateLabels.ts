import type { CandidateSource } from '@/types/recruitment'

const sourceLabels: Record<CandidateSource, string> = {
  manual: 'Manual',
  portal: 'Portal',
  referral: 'Referido',
  linkedin: 'LinkedIn',
  indeed: 'Indeed',
  other: 'Otro',
}

const sourceSeverities: Record<CandidateSource, string> = {
  manual: 'secondary',
  portal: 'info',
  referral: 'success',
  linkedin: 'info',
  indeed: 'warn',
  other: 'secondary',
}

export function sourceLabel(source: CandidateSource): string {
  return sourceLabels[source]
}

export function sourceSeverity(source: CandidateSource): string {
  return sourceSeverities[source]
}
