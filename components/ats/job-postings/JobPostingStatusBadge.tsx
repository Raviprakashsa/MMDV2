import StatusBadge from '@/components/ui/StatusBadge'

interface JobPostingStatusBadgeProps {
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'ON_HOLD'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const statusMap = {
  DRAFT: 'Draft',
  OPEN: 'Open',
  CLOSED: 'Closed',
  ON_HOLD: 'On Hold',
} as const

export default function JobPostingStatusBadge({
  status,
  size = 'md',
  className,
}: JobPostingStatusBadgeProps) {
  const displayStatus = statusMap[status] || 'Draft'
  return <StatusBadge status={displayStatus} size={size} className={className} />
}
