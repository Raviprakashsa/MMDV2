'use client'

import { SearchInput, Select } from '@/components/ui/Input'

interface CandidateFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  company: string
  onCompanyChange: (value: string) => void
  designation: string
  onDesignationChange: (value: string) => void
  experience: string
  onExperienceChange: (value: string) => void
}

const experienceOptions = [
  { value: '', label: 'All Experience Levels' },
  { value: '0', label: 'Freshers (0+ years)' },
  { value: '2', label: 'Junior (2+ years)' },
  { value: '5', label: 'Mid-Senior (5+ years)' },
  { value: '8', label: 'Senior (8+ years)' },
  { value: '12', label: 'Lead/Expert (12+ years)' },
]

export default function CandidateFilters({
  searchTerm,
  onSearchChange,
  company,
  onCompanyChange,
  designation,
  onDesignationChange,
  experience,
  onExperienceChange,
}: CandidateFiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div>
        <SearchInput
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
        />
      </div>
      <div>
        <SearchInput
          placeholder="Search by company..."
          value={company}
          onChange={(e) => onCompanyChange(e.target.value)}
          onClear={() => onCompanyChange('')}
        />
      </div>
      <div>
        <SearchInput
          placeholder="Search by designation..."
          value={designation}
          onChange={(e) => onDesignationChange(e.target.value)}
          onClear={() => onDesignationChange('')}
        />
      </div>
      <div>
        <Select
          value={experience}
          onChange={(e) => onExperienceChange(e.target.value)}
          options={experienceOptions}
        />
      </div>
    </div>
  )
}
