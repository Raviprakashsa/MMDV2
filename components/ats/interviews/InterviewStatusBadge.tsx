'use client'

import StatusBadge from '@/components/ui/StatusBadge'

export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

interface InterviewStatusBadgeProps {
  status: InterviewStatus
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const statusLabelMap = {
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
} as const

// Map statuses to visual overrides if needed, or rely on StatusBadge defaults
const statusClassMap = {
  SCHEDULED: 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-900/20 dark:text-brand-400 dark:border-brand-800',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900',
  NO_SHOW: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900',
} as const

export default function InterviewStatusBadge({
  status,
  size = 'md',
  className,
}: InterviewStatusBadgeProps) {
  const displayStatus = statusLabelMap[status] || 'Scheduled'
  const customClass = statusClassMap[status] || ''

  return (
    <StatusBadge
      status={displayStatus}
      size={size}
      className={`${customClass} ${className || ''}`}
    />
  )
}
