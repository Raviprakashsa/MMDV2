'use client'

import Link from 'next/link'
import { Eye, Trash2, Mail, Phone, Briefcase } from 'lucide-react'
import { IconButton } from '@/components/ui/Button'
import InteractiveTableRow from '@/components/ui/InteractiveTableRow'

interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  currentLocation?: string | null
  totalExperience?: any
  currentCompany?: string | null
  currentDesignation?: string | null
  resumeUrl: string
  linkedinUrl?: string | null
  portfolioUrl?: string | null
  createdAt: string
}

interface CandidateTableProps {
  candidates: Candidate[]
  onDelete: (id: string) => void
}

export default function CandidateTable({ candidates, onDelete }: CandidateTableProps) {
  return (
    <div className="overflow-x-auto w-full rounded-2xl border border-[rgba(23,0,174,0.06)] bg-white/50 shadow-sm backdrop-blur-md">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-slate-50/50">
            <th className="p-4 font-semibold text-sm text-[var(--foreground-muted)]">Candidate</th>
            <th className="p-4 font-semibold text-sm text-[var(--foreground-muted)]">Current Position</th>
            <th className="p-4 font-semibold text-sm text-[var(--foreground-muted)]">Experience</th>
            <th className="p-4 font-semibold text-sm text-[var(--foreground-muted)]">Contact Info</th>
            <th className="p-4 font-semibold text-sm text-[var(--foreground-muted)] text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {candidates.map((candidate) => (
            <InteractiveTableRow key={candidate.id}>
              {/* Candidate Info */}
              <td className="p-4">
                <div className="flex flex-col">
                  <Link
                    href={`/ats/candidates/${candidate.id}`}
                    className="font-semibold text-sm text-[var(--foreground)] hover:text-brand-700 transition-colors"
                  >
                    {candidate.firstName} {candidate.lastName}
                  </Link>
                  {candidate.currentLocation && (
                    <span className="text-xs text-[var(--foreground-muted)] mt-0.5">
                      {candidate.currentLocation}
                    </span>
                  )}
                </div>
              </td>

              {/* Current Position */}
              <td className="p-4">
                <div className="flex flex-col min-w-[150px]">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {candidate.currentDesignation || 'Not specified'}
                  </span>
                  {candidate.currentCompany && (
                    <span className="text-xs text-[var(--foreground-muted)] flex items-center gap-1 mt-0.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      {candidate.currentCompany}
                    </span>
                  )}
                </div>
              </td>

              {/* Experience */}
              <td className="p-4 text-sm text-[var(--foreground-muted)]">
                {candidate.totalExperience !== undefined && candidate.totalExperience !== null ? (
                  <span className="font-semibold text-[var(--foreground)]">
                    {Number(candidate.totalExperience)} {Number(candidate.totalExperience) === 1 ? 'Year' : 'Years'}
                  </span>
                ) : (
                  'Not specified'
                )}
              </td>

              {/* Contact Info */}
              <td className="p-4 text-sm">
                <div className="flex flex-col gap-1 text-[var(--foreground-muted)]">
                  <span className="flex items-center gap-1.5 hover:text-brand-700 transition-colors">
                    <Mail className="w-3.5 h-3.5" />
                    {candidate.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    {candidate.phone}
                  </span>
                </div>
              </td>

              {/* Actions */}
              <td className="p-4 text-right">
                <div className="inline-flex gap-2 justify-end">
                  <Link href={`/ats/candidates/${candidate.id}`}>
                    <IconButton variant="ghost" size="sm" aria-label="View Candidate Profile">
                      <Eye className="w-4 h-4" />
                    </IconButton>
                  </Link>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => onDelete(candidate.id)}
                    aria-label="Delete Candidate"
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
