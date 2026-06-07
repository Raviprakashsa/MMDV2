'use client'

import { SearchInput, Select } from '@/components/ui/Input'

interface LookupOption {
  value: string
  label: string
}

interface InterviewFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  candidateId: string
  onCandidateChange: (value: string) => void
  interviewerId: string
  onInterviewerChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  round: string
  onRoundChange: (value: string) => void
  scheduledDate: string
  onScheduledDateChange: (value: string) => void
  candidateOptions: LookupOption[]
  interviewerOptions: LookupOption[]
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No Show' },
]

export default function InterviewFilters({
  searchTerm,
  onSearchChange,
  candidateId,
  onCandidateChange,
  interviewerId,
  onInterviewerChange,
  status,
  onStatusChange,
  round,
  onRoundChange,
  scheduledDate,
  onScheduledDateChange,
  candidateOptions,
  interviewerOptions,
}: InterviewFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Search Candidates or jobs */}
        <div>
          <SearchInput
            placeholder="Search candidates or jobs..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={() => onSearchChange('')}
          />
        </div>

        {/* Candidate Selector */}
        <div>
          <Select
            value={candidateId}
            onChange={(e) => onCandidateChange(e.target.value)}
            options={[{ value: '', label: 'All Candidates' }, ...candidateOptions]}
          />
        </div>

        {/* Interviewer Selector */}
        <div>
          <Select
            value={interviewerId}
            onChange={(e) => onInterviewerChange(e.target.value)}
            options={[{ value: '', label: 'All Interviewers' }, ...interviewerOptions]}
          />
        </div>

        {/* Status Selector */}
        <div>
          <Select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            options={statusOptions}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Scheduled Date picker */}
        <div className="flex flex-col">
          <label className="text-xxs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 pl-1">
            Scheduled Date
          </label>
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => onScheduledDateChange(e.target.value)}
            className="w-full h-11 px-4 text-sm bg-white dark:bg-slate-900 border border-[rgba(23,0,174,0.08)] dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 hover:border-brand-300 dark:hover:border-slate-700 transition-all font-medium text-[var(--foreground)]"
          />
        </div>

        {/* Round Filter */}
        <div className="flex flex-col">
          <label className="text-xxs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 pl-1">
            Round Number
          </label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 1, 2, 3"
            value={round}
            onChange={(e) => onRoundChange(e.target.value)}
            className="w-full h-11 px-4 text-sm bg-white dark:bg-slate-900 border border-[rgba(23,0,174,0.08)] dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 hover:border-brand-300 dark:hover:border-slate-700 transition-all font-medium text-[var(--foreground)]"
          />
        </div>
      </div>
    </div>
  )
}
