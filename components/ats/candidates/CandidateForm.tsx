'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export const candidateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  currentLocation: z.string().optional().nullable().transform((val) => (val === '' ? null : val)),
  totalExperience: z
    .union([z.number(), z.string(), z.literal('')])
    .transform((val) => {
      if (val === '' || val === null || val === undefined) return null
      const parsed = Number(val)
      return Number.isNaN(parsed) ? null : parsed
    })
    .refine((val) => val === null || val >= 0, {
      message: 'Experience must be 0 or greater',
    })
    .optional()
    .nullable(),
  currentCompany: z.string().optional().nullable().transform((val) => (val === '' ? null : val)),
  currentDesignation: z.string().optional().nullable().transform((val) => (val === '' ? null : val)),
  resumeUrl: z.string().min(1, 'Resume URL is required').url('Invalid resume URL format (must start with http/https)'),
  linkedinUrl: z
    .union([z.string().url('Invalid LinkedIn URL format'), z.literal('')])
    .transform((val) => (val === '' ? null : val))
    .optional()
    .nullable(),
  portfolioUrl: z
    .union([z.string().url('Invalid Portfolio URL format'), z.literal('')])
    .transform((val) => (val === '' ? null : val))
    .optional()
    .nullable(),
})

export type CandidateFormInputData = z.input<typeof candidateSchema>
export type CandidateFormOutputData = z.output<typeof candidateSchema>

interface CandidateFormProps {
  defaultValues?: Partial<CandidateFormInputData>
  onSubmit: (data: CandidateFormOutputData) => void
  onCancel: () => void
  isLoading?: boolean
  submitLabel?: string
}

export default function CandidateForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save Profile',
}: CandidateFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CandidateFormInputData>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      currentLocation: '',
      totalExperience: '',
      currentCompany: '',
      currentDesignation: '',
      resumeUrl: '',
      linkedinUrl: '',
      portfolioUrl: '',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      {/* Name Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="First Name *"
          placeholder="e.g. Rahul"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          label="Last Name *"
          placeholder="e.g. Sharma"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>

      {/* Contact Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Email Address *"
          type="email"
          placeholder="e.g. rahul.sharma@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Phone Number *"
          placeholder="e.g. +91 98765 43210"
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>

      {/* Demographics & Experience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Current Location"
          placeholder="e.g. Mumbai, Maharashtra"
          error={errors.currentLocation?.message}
          {...register('currentLocation')}
        />
        <Input
          label="Total Experience (Years)"
          type="number"
          step="0.1"
          placeholder="e.g. 4.5"
          error={errors.totalExperience?.message}
          {...register('totalExperience')}
        />
      </div>

      {/* Current Position */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Current Company"
          placeholder="e.g. Acme Tech Solutions"
          error={errors.currentCompany?.message}
          {...register('currentCompany')}
        />
        <Input
          label="Current Designation"
          placeholder="e.g. Software Engineer"
          error={errors.currentDesignation?.message}
          {...register('currentDesignation')}
        />
      </div>

      {/* Resume and Links */}
      <div className="space-y-6 pt-4 border-t border-border/50">
        <Input
          label="Resume URL (PDF/Doc) *"
          placeholder="e.g. https://drive.google.com/file/d/your-resume-id"
          error={errors.resumeUrl?.message}
          {...register('resumeUrl')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="LinkedIn URL"
            placeholder="e.g. https://linkedin.com/in/rahulsharma"
            error={errors.linkedinUrl?.message}
            {...register('linkedinUrl')}
          />
          <Input
            label="Portfolio/GitHub URL"
            placeholder="e.g. https://github.com/rahulsharma"
            error={errors.portfolioUrl?.message}
            {...register('portfolioUrl')}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-end pt-6 border-t border-border/50">
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
