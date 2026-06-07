'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Select, Textarea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export const jobPostingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  department: z.string().min(1, 'Department is required'),
  location: z.string().min(1, 'Location is required'),
  employmentType: z.string().min(1, 'Employment type is required'),
  description: z.string().min(1, 'Description is required'),
  requirements: z.string().min(1, 'Requirements is required'),
  salaryMin: z
    .union([z.number(), z.string(), z.literal('')])
    .transform((val) => (val === '' ? null : val))
    .optional()
    .nullable(),
  salaryMax: z
    .union([z.number(), z.string(), z.literal('')])
    .transform((val) => (val === '' ? null : val))
    .optional()
    .nullable(),
  status: z.enum(['DRAFT', 'OPEN', 'CLOSED', 'ON_HOLD']).default('DRAFT'),
})

export type JobPostingFormData = z.infer<typeof jobPostingSchema>

interface JobPostingFormProps {
  defaultValues?: Partial<JobPostingFormData>
  onSubmit: (data: JobPostingFormData) => void
  onCancel: () => void
  isLoading?: boolean
  submitLabel?: string
}

const departmentOptions = [
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Product', label: 'Product' },
  { value: 'Design', label: 'Design' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'HR', label: 'HR' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Finance', label: 'Finance' },
]

const employmentTypeOptions = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'INTERNSHIP', label: 'Internship' },
]

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'OPEN', label: 'Open' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'ON_HOLD', label: 'On Hold' },
]

export default function JobPostingForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save Job Posting',
}: JobPostingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobPostingFormData>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: '',
      department: '',
      location: '',
      employmentType: '',
      description: '',
      requirements: '',
      salaryMin: null,
      salaryMax: null,
      status: 'DRAFT',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Job Title *"
          placeholder="e.g. Senior Frontend Engineer"
          error={errors.title?.message}
          {...register('title')}
        />
        <Select
          label="Department *"
          placeholder="Select Department"
          error={errors.department?.message}
          options={departmentOptions}
          {...register('department')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Location *"
          placeholder="e.g. Mumbai, India (Hybrid)"
          error={errors.location?.message}
          {...register('location')}
        />
        <Select
          label="Employment Type *"
          placeholder="Select Employment Type"
          error={errors.employmentType?.message}
          options={employmentTypeOptions}
          {...register('employmentType')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input
          label="Minimum Salary (Annual)"
          type="number"
          placeholder="e.g. 1200000"
          error={errors.salaryMin?.message}
          {...register('salaryMin')}
        />
        <Input
          label="Maximum Salary (Annual)"
          type="number"
          placeholder="e.g. 1800000"
          error={errors.salaryMax?.message}
          {...register('salaryMax')}
        />
        <Select
          label="Posting Status"
          error={errors.status?.message}
          options={statusOptions}
          {...register('status')}
        />
      </div>

      <Textarea
        label="Description *"
        placeholder="Describe the responsibilities, project scope, and daily tasks..."
        error={errors.description?.message}
        rows={6}
        {...register('description')}
      />

      <Textarea
        label="Requirements *"
        placeholder="List technical qualifications, required experience levels, and certificates..."
        error={errors.requirements?.message}
        rows={6}
        {...register('requirements')}
      />

      <div className="flex gap-4 justify-end pt-4 border-t border-border/50">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
