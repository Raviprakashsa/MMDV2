'use client'

import Link from 'next/link'
import { Calendar, RefreshCw, Briefcase, User, ExternalLink } from 'lucide-react'
import { LightCard } from '@/components/ui/GlassCard'
import { IconButton } from '@/components/ui/Button'
import { JoinedApplication } from './ApplicationTable'
import { ApplicationStatus } from './ApplicationStatusBadge'

interface ApplicationKanbanProps {
  applications: JoinedApplication[]
  onStatusChangeClick: (id: string, currentStatus: ApplicationStatus) => void
}

const columns: { status: ApplicationStatus; label: string; headerColor: string }[] = [
  { status: 'APPLIED', label: 'Applied', headerColor: 'border-t-blue-500 bg-blue-50/40 text-blue-800' },
  { status: 'SCREENING', label: 'Screening', headerColor: 'border-t-purple-500 bg-purple-50/40 text-purple-800' },
  { status: 'SHORTLISTED', label: 'Shortlisted', headerColor: 'border-t-teal-500 bg-teal-50/40 text-teal-800' },
  { status: 'INTERVIEW', label: 'Interview', headerColor: 'border-t-amber-500 bg-amber-50/40 text-amber-800' },
  { status: 'OFFERED', label: 'Offered', headerColor: 'border-t-cyan-500 bg-cyan-50/40 text-cyan-800' },
  { status: 'HIRED', label: 'Hired', headerColor: 'border-t-emerald-500 bg-emerald-50/40 text-emerald-800' },
  { status: 'REJECTED', label: 'Rejected', headerColor: 'border-t-red-500 bg-red-50/40 text-red-800' },
  { status: 'WITHDRAWN', label: 'Withdrawn', headerColor: 'border-t-slate-400 bg-slate-100/50 text-slate-700' },
]

export default function ApplicationKanban({
  applications,
  onStatusChangeClick,
}: ApplicationKanbanProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 custom-scrollbar scroll-smooth w-full select-none" style={{ minHeight: '550px' }}>
      {columns.map((col) => {
        const columnApps = applications.filter((app) => app.status === col.status)

        return (
          <div
            key={col.status}
            className="flex-1 min-w-[280px] max-w-[320px] bg-slate-50/40 rounded-2xl border border-[rgba(23,0,174,0.04)] p-4 flex flex-col h-[650px] shadow-sm backdrop-blur-sm"
          >
            {/* Column Header */}
            <div className={`flex items-center justify-between p-3 rounded-xl border-t-2 ${col.headerColor} mb-4 font-semibold text-xs uppercase tracking-wider`}>
              <span>{col.label}</span>
              <span className="bg-white/90 border border-slate-200/50 px-2 py-0.5 rounded-full text-xxs font-bold tabular-nums">
                {columnApps.length}
              </span>
            </div>

            {/* Column Cards Container */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
              {columnApps.length === 0 ? (
                <div className="h-24 flex items-center justify-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-medium">
                  No applications
                </div>
              ) : (
                columnApps.map((app) => (
                  <LightCard
                    key={app.id}
                    className="p-4 border border-[rgba(23,0,174,0.06)] hover:border-brand-300 hover:shadow-md transition-all duration-200 relative group"
                    noPadding
                  >
                    {/* Candidate Name & Link */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <User className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                        <Link
                          href={`/ats/applications/${app.id}`}
                          className="font-bold text-sm text-[var(--foreground)] hover:text-brand-700 transition-colors truncate"
                        >
                          {app.candidateName}
                        </Link>
                      </div>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 text-brand-700 hover:bg-brand-50 shrink-0 transition-opacity"
                        onClick={() => onStatusChangeClick(app.id, app.status)}
                        aria-label="Change Status"
                      >
                        <RefreshCw className="w-3 h-3 animate-hover" />
                      </IconButton>
                    </div>

                    {/* Job Title & Department */}
                    <div className="text-xs text-[var(--foreground-muted)] space-y-1 mb-3">
                      <div className="flex items-center gap-1.5 min-w-0 font-medium">
                        <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{app.jobTitle}</span>
                      </div>
                      <div className="pl-4 text-xxs tracking-wide uppercase text-slate-400 font-semibold">
                        {app.jobDepartment}
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xxs text-slate-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-300" />
                        {new Date(app.appliedAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                      <Link
                        href={`/ats/applications/${app.id}`}
                        className="text-brand-700 hover:underline flex items-center gap-0.5"
                      >
                        Details
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </LightCard>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
