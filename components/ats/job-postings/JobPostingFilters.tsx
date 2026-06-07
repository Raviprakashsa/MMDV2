'use client'

import { SearchInput, Select } from '@/components/ui/Input'

interface JobPostingFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  department: string
  onDepartmentChange: (value: string) => void
  location: string
  onLocationChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
}

const departmentOptions = [
  { value: '', label: 'All Departments' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Product', label: 'Product' },
  { value: 'Design', label: 'Design' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'HR', label: 'HR' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Finance', label: 'Finance' },
]

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'OPEN', label: 'Open' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'ON_HOLD', label: 'On Hold' },
]

export default function JobPostingFilters({
  searchTerm,
  onSearchChange,
  department,
  onDepartmentChange,
  location,
  onLocationChange,
  status,
  onStatusChange,
}: JobPostingFiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div>
        <SearchInput
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
        />
      </div>
      <div>
        <Select
          value={department}
          onChange={(e) => onDepartmentChange(e.target.value)}
          options={departmentOptions}
        />
      </div>
      <div>
        <SearchInput
          placeholder="Search by location..."
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          onClear={() => onLocationChange('')}
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
