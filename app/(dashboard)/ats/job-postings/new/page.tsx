'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/ui/PageContainer'
import { LightCard } from '@/components/ui/GlassCard'
import JobPostingForm, { JobPostingFormData } from '@/components/ats/job-postings/JobPostingForm'
import { useToast } from '@/components/ui/Toast'
import { createJobPosting } from '@/lib/ui/api'

export default function NewJobPostingPage() {
  const router = useRouter()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: JobPostingFormData) => {
    setIsLoading(true)
    try {
      await createJobPosting(data)
      toast.success('Success', 'Job posting created successfully!')
      router.push('/ats/job-postings')
      router.refresh()
    } catch (err: any) {
      console.error('Error creating job posting:', err)
      toast.error('Error', err?.message || 'Failed to create job posting')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/ats/job-postings')
  }

  return (
    <PageContainer
      stagger={true}
      header={
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
            Create Job Posting
          </h1>
          <p className="mt-1.5 text-sm text-[var(--foreground-muted)]">
            Add a new job advertisement to start sourcing and attracting applicants for your recruitment pipeline.
          </p>
        </div>
      }
    >
      <LightCard className="p-6 md:p-8 max-w-4xl mx-auto">
        <JobPostingForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          submitLabel="Create Job Posting"
        />
      </LightCard>
    </PageContainer>
  )
}
