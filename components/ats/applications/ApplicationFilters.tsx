'use client'

import { SearchInput, Select } from '@/components/ui/Input'

interface LookupOption {
  value: string
  label: string
}

interface ApplicationFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  candidateId: string
  onCandidateChange: (value: string) => void
  jobPostingId: string
  onJobPostingChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  candidateOptions: LookupOption[]
  jobPostingOptions: LookupOption[]
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'SCREENING', label: 'Screening' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'OFFERED', label: 'Offered' },
  { value: 'HIRED', label: 'Hired' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
]

export default function ApplicationFilters({
  searchTerm,
  onSearchChange,
  candidateId,
  onCandidateChange,
  jobPostingId,
  onJobPostingChange,
  status,
  onStatusChange,
  candidateOptions,
  jobPostingOptions,
}: ApplicationFiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div>
        <SearchInput
          placeholder="Search candidates or jobs..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
        />
      </div>
      <div>
        <Select
          value={candidateId}
          onChange={(e) => onCandidateChange(e.target.value)}
          options={[{ value: '', label: 'All Candidates' }, ...candidateOptions]}
        />
      </div>
      <div>
        <Select
          value={jobPostingId}
          onChange={(e) => onJobPostingChange(e.target.value)}
          options={[{ value: '', label: 'All Job Postings' }, ...jobPostingOptions]}
        />
      </div>
      <div>
        <Select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          options={statusOptions}
        />
      </div>
    </div>
  )
}
