'use client'

import Link from 'next/link'
import { Eye, Trash2 } from 'lucide-react'
import { IconButton } from '@/components/ui/Button'
import InteractiveTableRow from '@/components/ui/InteractiveTableRow'
import JobPostingStatusBadge from './JobPostingStatusBadge'

interface JobPosting {
  id: string
  title: string
  department: string
  location: string
  employmentType: string
  salaryMin: any
  salaryMax: any
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'ON_HOLD'
  createdAt: string
}

interface JobPostingTableProps {
  postings: JobPosting[]
  onDelete: (id: string) => void
}

export default function JobPostingTable({ postings, onDelete }: JobPostingTableProps) {
  return (
    <div className="overflow-x-auto w-full rounded-2xl border border-[rgba(23,0,174,0.06)] bg-white/50 shadow-sm backdrop-blur-md">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-slate-50/50">
            <th className="p-4 font-semibold text-sm text-[var(--foreground-muted)]">Title</th>
            <th className="p-4 font-semibold text-sm text-[var(--foreground-muted)]">Department</th>
            <th className="p-4 font-semibold text-sm text-[var(--foreground-muted)]">Location</th>
            <th className="p-4 font-semibold text-sm text-[var(--foreground-muted)]">Type</th>
            <th className="p-4 font-semibold text-sm text-[var(--foreground-muted)]">Salary Range</th>
            <th className="p-4 font-semibold text-sm text-[var(--foreground-muted)]">Status</th>
            <th className="p-4 font-semibold text-sm text-[var(--foreground-muted)] text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {postings.map((posting) => (
            <InteractiveTableRow key={posting.id}>
              <td className="p-4 font-medium text-sm text-[var(--foreground)]">
                <Link href={`/ats/job-postings/${posting.id}`} className="hover:text-brand-700 transition-colors">
                  {posting.title}
                </Link>
              </td>
              <td className="p-4 text-sm text-[var(--foreground-muted)]">{posting.department}</td>
              <td className="p-4 text-sm text-[var(--foreground-muted)]">{posting.location}</td>
              <td className="p-4 text-sm text-[var(--foreground-muted)] capitalize">
                {posting.employmentType.replace('_', ' ').toLowerCase()}
              </td>
              <td className="p-4 text-sm text-[var(--foreground-muted)]">
                {posting.salaryMin || posting.salaryMax ? (
                  <>
                    {posting.salaryMin ? Number(posting.salaryMin).toLocaleString() : '0'} -{' '}
                    {posting.salaryMax ? Number(posting.salaryMax).toLocaleString() : 'Max'}
                  </>
                ) : (
                  'Not specified'
                )}
              </td>
              <td className="p-4">
                <JobPostingStatusBadge status={posting.status} />
              </td>
              <td className="p-4 text-right">
                <div className="inline-flex gap-2 justify-end">
                  <Link href={`/ats/job-postings/${posting.id}`}>
                    <IconButton variant="ghost" size="sm" aria-label="View Details">
                      <Eye className="w-4 h-4" />
                    </IconButton>
                  </Link>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => onDelete(posting.id)}
                    aria-label="Delete Posting"
                  >
                    <Trash2 className="w-4 h-4" />
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
