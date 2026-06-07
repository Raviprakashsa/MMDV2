'use client'

import Link from 'next/link'
import { Eye, Edit, RefreshCw } from 'lucide-react'
import { IconButton } from '@/components/ui/Button'
import InteractiveTableRow from '@/components/ui/InteractiveTableRow'
import ApplicationStatusBadge, { ApplicationStatus } from './ApplicationStatusBadge'

export interface JoinedApplication {
  id: string
  candidateId: string
  candidateName: string
  candidateEmail: string
  jobPostingId: string
  jobTitle: string
  jobDepartment: string
  status: ApplicationStatus
  appliedAt: string
}

interface ApplicationTableProps {
  applications: JoinedApplication[]
  onStatusChangeClick: (id: string, currentStatus: ApplicationStatus) => void
}

export default function ApplicationTable({
  applications,
  onStatusChangeClick,
}: ApplicationTableProps) {
  return (
    <div className="overflow-x-auto w-full rounded-2xl border border-[rgba(23,0,174,0.06)] bg-white/50 shadow-sm backdrop-blur-md">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-slate-50/50">
            <th className="p-4 font-semibold text-sm text-[var(--foreground-muted)]">Candidate</th>
            <th className="p-4 font-semibold text-sm text-[var(--foreground-muted)]">Job Posting</th>
            <th className="p-4 font-semibold text-sm text-[var(--foreground-muted)]">Status</th>
            <th className="p-4 font-semibold text-sm text-[var(--foreground-muted)]">Applied Date</th>
            <th className="p-4 font-semibold text-sm text-[var(--foreground-muted)] text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {applications.map((app) => (
            <InteractiveTableRow key={app.id}>
              {/* Candidate Info */}
              <td className="p-4">
                <div className="flex flex-col">
                  <Link
                    href={`/ats/applications/${app.id}`}
                    className="font-semibold text-sm text-[var(--foreground)] hover:text-brand-700 transition-colors"
                  >
                    {app.candidateName}
                  </Link>
                  <span className="text-xs text-[var(--foreground-muted)] mt-0.5">
                    {app.candidateEmail}
                  </span>
                </div>
              </td>

              {/* Job Posting Info */}
              <td className="p-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {app.jobTitle}
                  </span>
                  <span className="text-xs text-[var(--foreground-muted)] mt-0.5">
                    {app.jobDepartment}
                  </span>
                </div>
              </td>

              {/* Status Badge */}
              <td className="p-4">
                <ApplicationStatusBadge status={app.status} />
              </td>

              {/* Applied Date */}
              <td className="p-4 text-sm text-[var(--foreground-muted)]">
                {new Date(app.appliedAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>

              {/* Actions */}
              <td className="p-4 text-right">
                <div className="inline-flex gap-2 justify-end">
                  <Link href={`/ats/applications/${app.id}`}>
                    <IconButton variant="ghost" size="sm" aria-label="View Application Details">
                      <Eye className="w-4 h-4" />
                    </IconButton>
                  </Link>
                  <Link href={`/ats/applications/${app.id}?edit=true`}>
                    <IconButton variant="ghost" size="sm" aria-label="Edit Application">
                      <Edit className="w-4 h-4" />
                    </IconButton>
                  </Link>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    className="text-brand-700 hover:bg-brand-50"
                    onClick={() => onStatusChangeClick(app.id, app.status)}
                    aria-label="Change Application Status"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </IconButton>
                </div>
              </td>
            </InteractiveTableRow>
          ))}
        </tbody>
      </table>
    </div>
  )
}
