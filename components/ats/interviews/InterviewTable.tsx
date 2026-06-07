'use client'

import Link from 'next/link'
import { Eye, Edit, RefreshCw } from 'lucide-react'
import { IconButton } from '@/components/ui/Button'
import InteractiveTableRow from '@/components/ui/InteractiveTableRow'
import InterviewStatusBadge, { InterviewStatus } from './InterviewStatusBadge'
import { JoinedInterview } from './InterviewCard'

interface InterviewTableProps {
  interviews: JoinedInterview[]
  onStatusChangeClick: (id: string, currentStatus: InterviewStatus) => void
}

export default function InterviewTable({
  interviews,
  onStatusChangeClick,
}: InterviewTableProps) {
  return (
    <div className="overflow-x-auto w-full rounded-2xl border border-[rgba(23,0,174,0.06)] bg-white/50 shadow-sm backdrop-blur-md dark:bg-slate-900/40 dark:border-slate-800">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
            <th className="p-4 font-semibold text-sm text-[var(--foreground-muted)]">Candidate</th>
            <th className="p-4 font-semibold text-sm text-[var(--foreground-muted)]">Job Posting</th>
            <th className="p-4 font-semibold text-sm text-[var(--foreground-muted)]">Interviewer</th>
            <th className="p-4 font-semibold text-sm text-[var(--foreground-muted)]">Round</th>
            <th className="p-4 font-semibold text-sm text-[var(--foreground-muted)]">Scheduled At</th>
            <th className="p-4 font-semibold text-sm text-[var(--foreground-muted)]">Status</th>
            <th className="p-4 font-semibold text-sm text-[var(--foreground-muted)] text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border dark:divide-slate-800">
          {interviews.map((interview) => {
            const formattedTime = new Date(interview.scheduledAt).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })

            const formattedDate = new Date(interview.scheduledAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })

            return (
              <InteractiveTableRow key={interview.id}>
                {/* Candidate */}
                <td className="p-4">
                  <div className="flex flex-col">
                    <Link
                      href={`/ats/interviews/${interview.id}`}
                      className="font-semibold text-sm text-[var(--foreground)] hover:text-brand-700 transition-colors"
                    >
                      {interview.candidateName}
                    </Link>
                    <span className="text-xs text-[var(--foreground-muted)] mt-0.5">
                      {interview.candidateEmail}
                    </span>
                  </div>
                </td>

                {/* Job Posting */}
                <td className="p-4">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {interview.jobTitle}
                  </span>
                </td>

                {/* Interviewer */}
                <td className="p-4">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {interview.interviewerName}
                  </span>
                </td>

                {/* Round */}
                <td className="p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 dark:text-slate-500 px-2 py-0.5 rounded-md">
                    Round {interview.round}
                  </span>
                </td>

                {/* Scheduled At */}
                <td className="p-4">
                  <div className="flex flex-col text-sm">
                    <span className="font-semibold text-[var(--foreground)]">{formattedDate}</span>
                    <span className="text-xs text-[var(--foreground-muted)] mt-0.5">{formattedTime}</span>
                  </div>
                </td>

                {/* Status */}
                <td className="p-4">
                  <InterviewStatusBadge status={interview.status} />
                </td>

                {/* Actions */}
                <td className="p-4 text-right">
                  <div className="inline-flex gap-2 justify-end">
                    <Link href={`/ats/interviews/${interview.id}`}>
                      <IconButton variant="ghost" size="sm" aria-label="View Details">
                        <Eye className="w-4 h-4" />
                      </IconButton>
                    </Link>
                    <Link href={`/ats/interviews/${interview.id}?edit=true`}>
                      <IconButton variant="ghost" size="sm" aria-label="Edit Interview">
                        <Edit className="w-4 h-4" />
                      </IconButton>
                    </Link>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      className="text-brand-700 hover:bg-brand-50"
                      onClick={() => onStatusChangeClick(interview.id, interview.status)}
                      aria-label="Change Status"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </IconButton>
                  </div>
                </td>
              </InteractiveTableRow>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
