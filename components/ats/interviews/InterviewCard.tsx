'use client'

import Link from 'next/link'
import { Calendar, User, UserCheck, Star, ExternalLink, RefreshCw } from 'lucide-react'
import { LightCard } from '@/components/ui/GlassCard'
import { IconButton } from '@/components/ui/Button'
import InterviewStatusBadge, { InterviewStatus } from './InterviewStatusBadge'

export interface JoinedInterview {
  id: string
  applicationId: string
  candidateId: string
  candidateName: string
  candidateEmail: string
  jobTitle: string
  interviewerId: string
  interviewerName: string
  round: number
  feedback?: string | null
  rating?: number | null
  status: InterviewStatus
  scheduledAt: string
}

interface InterviewCardProps {
  interview: JoinedInterview
  onStatusChangeClick?: (id: string, currentStatus: InterviewStatus) => void
}

export default function InterviewCard({
  interview,
  onStatusChangeClick,
}: InterviewCardProps) {
  const formattedTime = new Date(interview.scheduledAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const formattedDate = new Date(interview.scheduledAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  })

  return (
    <LightCard
      className="p-4 border border-[rgba(23,0,174,0.06)] hover:border-brand-300 hover:shadow-md transition-all duration-200 relative group"
      noPadding
    >
      {/* Candidate Name & Status Action */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <User className="w-3.5 h-3.5 text-brand-700 shrink-0" />
          <Link
            href={`/ats/interviews/${interview.id}`}
            className="font-bold text-sm text-[var(--foreground)] hover:text-brand-700 transition-colors truncate"
          >
            {interview.candidateName}
          </Link>
        </div>
        {onStatusChangeClick && (
          <IconButton
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 text-brand-700 hover:bg-brand-50 shrink-0 transition-opacity"
            onClick={() => onStatusChangeClick(interview.id, interview.status)}
            aria-label="Change Status"
          >
            <RefreshCw className="w-3 h-3" />
          </IconButton>
        )}
      </div>

      {/* Target Job Title */}
      <div className="text-xs text-[var(--foreground-muted)] font-medium truncate mb-2 pl-5">
        {interview.jobTitle}
      </div>

      {/* Interviewer */}
      <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)] mb-3 pl-1">
        <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="truncate">Interviewer: <span className="font-semibold">{interview.interviewerName}</span></span>
      </div>

      {/* Round & Rating & Status */}
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <span className="text-xxs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 dark:text-slate-500 px-2 py-0.5 rounded-md">
          Round {interview.round}
        </span>
        {interview.rating !== undefined && interview.rating !== null && (
          <span className="flex items-center gap-0.5 text-xxs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 px-1.5 py-0.5 rounded-md">
            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500 shrink-0" />
            {interview.rating}/5
          </span>
        )}
        <InterviewStatusBadge status={interview.status} size="sm" />
      </div>

      {/* Scheduled Time & Details Link */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xxs text-slate-400 font-semibold">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-300" />
          {formattedDate} &bull; {formattedTime}
        </span>
        <Link
          href={`/ats/interviews/${interview.id}`}
          className="text-brand-700 hover:underline flex items-center gap-0.5"
        >
          Details
          <ExternalLink className="w-2.5 h-2.5" />
        </Link>
      </div>
    </LightCard>
  )
}
