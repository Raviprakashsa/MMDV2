'use client'

import { Mail, Phone, MapPin, Briefcase, FileText, Linkedin, Globe, ExternalLink } from 'lucide-react'

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

interface CandidateProfileCardProps {
  candidate: Candidate
}

export default function CandidateProfileCard({ candidate }: CandidateProfileCardProps) {
  const getInitials = () => {
    return `${candidate.firstName.charAt(0)}${candidate.lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[rgba(23,0,174,0.06)] bg-gradient-to-b from-white via-white to-[#fafaff] p-6 md:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_20px_rgba(15,23,42,0.08),0_12px_40px_rgba(23,0,174,0.04)]">
      {/* Decorative Brand Gradient Accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-700 via-indigo-500 to-purple-500 opacity-80" />

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        {/* Profile Demographics */}
        <div className="flex items-start gap-4">
          <div className="avatar avatar-xl h-16 w-16 text-xl rounded-2xl bg-gradient-to-br from-brand-900 via-brand-700 to-indigo-600 text-white font-extrabold flex items-center justify-center shadow-md shrink-0">
            {getInitials()}
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
              {candidate.firstName} {candidate.lastName}
            </h2>
            <p className="text-sm font-semibold text-brand-700 mt-0.5">
              {candidate.currentDesignation || 'Candidate Roster'}
            </p>
            {candidate.currentCompany && (
              <p className="text-xs text-[var(--foreground-muted)] flex items-center gap-1.5 mt-1 font-medium">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {candidate.currentCompany}
              </p>
            )}
            {candidate.currentLocation && (
              <p className="text-xs text-[var(--foreground-muted)] flex items-center gap-1.5 mt-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {candidate.currentLocation}
              </p>
            )}
          </div>
        </div>

        {/* Experience KPI Card */}
        {candidate.totalExperience !== undefined && candidate.totalExperience !== null && (
          <div className="rounded-2xl border border-brand-100 bg-brand-50/50 px-5 py-3 shrink-0 self-start md:self-auto shadow-sm">
            <span className="block text-2xl font-extrabold text-brand-900 tabular-nums">
              {Number(candidate.totalExperience)} {Number(candidate.totalExperience) === 1 ? 'Year' : 'Years'}
            </span>
            <span className="block text-xxs font-semibold text-brand-700/80 uppercase tracking-wider mt-0.5">
              Total Professional Experience
            </span>
          </div>
        )}
      </div>

      {/* Contact Information Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-3 text-sm text-[var(--foreground)] bg-slate-50/60 p-3 rounded-xl border border-slate-100 hover:border-brand-200 transition-colors">
          <Mail className="w-4.5 h-4.5 text-brand-700 shrink-0" />
          <div className="min-w-0">
            <span className="block text-xxs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
              Email Address
            </span>
            <span className="block font-medium truncate mt-0.5">{candidate.email}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-[var(--foreground)] bg-slate-50/60 p-3 rounded-xl border border-slate-100 hover:border-brand-200 transition-colors">
          <Phone className="w-4.5 h-4.5 text-brand-700 shrink-0" />
          <div className="min-w-0">
            <span className="block text-xxs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
              Phone Number
            </span>
            <span className="block font-medium truncate mt-0.5">{candidate.phone}</span>
          </div>
        </div>
      </div>

      {/* Social and Document Portals */}
      <div className="mt-6 pt-6 border-t border-slate-100">
        <h4 className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-3">
          Links & Attachments
        </h4>
        <div className="flex flex-wrap gap-3">
          {/* Resume Link - REQUIRED */}
          <a
            href={candidate.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm font-semibold hover:bg-emerald-100 hover:scale-105 active:scale-95 transition-all shadow-sm"
          >
            <FileText className="w-4 h-4 text-emerald-700" />
            View Resume PDF
            <ExternalLink className="w-3.5 h-3.5 text-emerald-600/80" />
          </a>

          {/* LinkedIn Link - OPTIONAL */}
          {candidate.linkedinUrl && (
            <a
              href={candidate.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 text-sm font-semibold hover:bg-blue-100 hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              <Linkedin className="w-4 h-4 text-blue-700" />
              LinkedIn Profile
              <ExternalLink className="w-3.5 h-3.5 text-blue-600/80" />
            </a>
          )}

          {/* Portfolio/GitHub Link - OPTIONAL */}
          {candidate.portfolioUrl && (
            <a
              href={candidate.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-semibold hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              <Globe className="w-4 h-4 text-slate-700" />
              Portfolio/GitHub
              <ExternalLink className="w-3.5 h-3.5 text-slate-600/80" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
