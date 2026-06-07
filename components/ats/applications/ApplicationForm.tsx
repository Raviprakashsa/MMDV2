'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Select } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { ApplicationStatus } from './ApplicationStatusBadge'

export const applicationSchema = z.object({
  candidateId: z.string().min(1, 'Candidate selection is required'),
  jobPostingId: z.string().min(1, 'Job posting selection is required'),
  status: z.enum([
    'APPLIED',
    'SCREENING',
    'SHORTLISTED',
    'INTERVIEW',
    'OFFERED',
    'HIRED',
    'REJECTED',
    'WITHDRAWN',
  ]).default('APPLIED'),
})

export type ApplicationFormData = z.infer<typeof applicationSchema>

interface LookupOption {
  value: string
  label: string
}

interface ApplicationFormProps {
  defaultValues?: Partial<ApplicationFormData>
  onSubmit: (data: ApplicationFormData) => void
  onCancel: () => void
  isLoading?: boolean
  candidateOptions: LookupOption[]
  jobPostingOptions: LookupOption[]
  submitLabel?: string
  isEditMode?: boolean
}

const statusOptions = [
  { value: 'APPLIED', label: 'Applied' },
  { value: 'SCREENING', label: 'Screening' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'OFFERED', label: 'Offered' },
  { value: 'HIRED', label: 'Hired' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
]

export default function ApplicationForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  candidateOptions,
  jobPostingOptions,
  submitLabel = 'Submit Application',
  isEditMode = false,
}: ApplicationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      candidateId: '',
      jobPostingId: '',
      status: 'APPLIED',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Candidate Select */}
      <Select
        label="Select Candidate *"
        placeholder="Choose Candidate"
        error={errors.candidateId?.message}
        options={candidateOptions}
        disabled={isEditMode}
        {...register('candidateId')}
      />

      {/* Job Posting Select */}
      <Select
        label="Select Job Posting *"
        placeholder="Choose Job Posting"
        error={errors.jobPostingId?.message}
        options={jobPostingOptions}
        disabled={isEditMode}
        {...register('jobPostingId')}
      />

      {/* Status Select - optional during create, default is APPLIED */}
      <Select
        label="Application Status"
        error={errors.status?.message}
        options={statusOptions}
        {...register('status')}
      />

      {/* Action Buttons */}
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
