'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Select, Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { InterviewStatus } from './InterviewStatusBadge'

// Zod Schema to handle form inputs (preprocessed into correct numbers/dates)
export const interviewSchema = z.object({
  applicationId: z.string().min(1, 'Application selection is required'),
  interviewerId: z.string().min(1, 'Interviewer selection is required'),
  round: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number({ required_error: 'Round is required' }).int().min(1, 'Round must be at least 1')
  ),
  scheduledAt: z.string().min(1, 'Scheduled date and time is required'),
  feedback: z.string().optional().nullable(),
  rating: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? null : Number(val)),
    z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5').nullable().optional()
  ),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).default('SCHEDULED'),
})

export type InterviewFormData = z.infer<typeof interviewSchema>

interface LookupOption {
  value: string
  label: string
}

interface InterviewFormProps {
  defaultValues?: Partial<InterviewFormData>
  onSubmit: (data: InterviewFormData) => void
  onCancel: () => void
  isLoading?: boolean
  applicationOptions: LookupOption[]
  interviewerOptions: LookupOption[]
  submitLabel?: string
  isEditMode?: boolean
}

const statusOptions = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No Show' },
]

export default function InterviewForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  applicationOptions,
  interviewerOptions,
  submitLabel = 'Schedule Interview',
  isEditMode = false,
}: InterviewFormProps) {
  
  // Format DateTime local value (e.g. YYYY-MM-DDTHH:MM) for default value binding
  const formatDateTimeLocal = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    const pad = (num: number) => String(num).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InterviewFormData>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      applicationId: '',
      interviewerId: '',
      round: 1,
      feedback: '',
      rating: null,
      status: 'SCHEDULED',
      ...defaultValues,
      // Map ISO Date to input expected format datetime-local
      scheduledAt: defaultValues?.scheduledAt ? formatDateTimeLocal(defaultValues.scheduledAt) : '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Application Selector */}
      <Select
        label="Linked Candidate Application *"
        placeholder="Choose Application"
        error={errors.applicationId?.message}
        options={applicationOptions}
        disabled={isEditMode}
        {...register('applicationId')}
      />

      {/* Interviewer Selector */}
      <Select
        label="Assigned Interviewer *"
        placeholder="Choose Interviewer"
        error={errors.interviewerId?.message}
        options={interviewerOptions}
        {...register('interviewerId')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Round number */}
        <Input
          label="Interview Round *"
          type="number"
          min="1"
          error={errors.round?.message}
          {...register('round')}
        />

        {/* Scheduled date and time picker */}
        <div className="flex flex-col">
          <label className="text-xxs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 pl-1">
            Scheduled Date & Time *
          </label>
          <input
            type="datetime-local"
            className="w-full h-11 px-4 text-sm bg-white dark:bg-slate-900 border border-[rgba(23,0,174,0.08)] dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 hover:border-brand-300 dark:hover:border-slate-700 transition-all font-medium text-[var(--foreground)]"
            {...register('scheduledAt')}
          />
          {errors.scheduledAt && (
            <span className="text-xxs font-bold text-destructive mt-1.5 pl-1 block">
              {errors.scheduledAt.message}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Rating selection (optional, 1-5) */}
        <Input
          label="Interviewer Rating (1-5)"
          type="number"
          min="1"
          max="5"
          placeholder="e.g. 4"
          error={errors.rating?.message}
          {...register('rating')}
        />

        {/* Status selector */}
        <Select
          label="Interview Status"
          error={errors.status?.message}
          options={statusOptions}
          {...register('status')}
        />
      </div>

      {/* Feedback text field */}
      <div className="flex flex-col">
        <label className="text-xxs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 pl-1">
          Feedback / Notes
        </label>
        <textarea
          rows={4}
          placeholder="Enter interview evaluation notes..."
          className="w-full p-4 text-sm bg-white dark:bg-slate-900 border border-[rgba(23,0,174,0.08)] dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 hover:border-brand-300 dark:hover:border-slate-700 transition-all font-medium text-[var(--foreground)]"
          {...register('feedback')}
        />
        {errors.feedback && (
          <span className="text-xxs font-bold text-destructive mt-1.5 pl-1 block">
            {errors.feedback.message}
          </span>
        )}
      </div>

      {/* Actions */}
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
