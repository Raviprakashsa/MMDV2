import StatusBadge from '@/components/ui/StatusBadge'

export type ApplicationStatus =
  | 'APPLIED'
  | 'SCREENING'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'OFFERED'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN'

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const statusLabelMap = {
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview',
  OFFERED: 'Offered',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
} as const

export default function ApplicationStatusBadge({
  status,
  size = 'md',
  className,
}: ApplicationStatusBadgeProps) {
  const displayStatus = statusLabelMap[status] || 'Applied'
  return <StatusBadge status={displayStatus} size={size} className={className} />
}
