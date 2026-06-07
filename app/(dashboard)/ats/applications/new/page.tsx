'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/ui/PageContainer'
import { LightCard } from '@/components/ui/GlassCard'
import ApplicationForm, { ApplicationFormData } from '@/components/ats/applications/ApplicationForm'
import { useToast } from '@/components/ui/Toast'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { createApplication, getCandidates, getJobPostings } from '@/lib/ui/api'

interface LookupOption {
  value: string
  label: string
}

export default function NewApplicationPage() {
  const router = useRouter()
  const toast = useToast()

  const [candidateOptions, setCandidateOptions] = useState<LookupOption[]>([])
  const [jobPostingOptions, setJobPostingOptions] = useState<LookupOption[]>([])
  const [isLoadingLookups, setIsLoadingLookups] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch lists for select dropdown options
  useEffect(() => {
    const fetchLookups = async () => {
      setIsLoadingLookups(true)
      try {
        const [candidates, postings] = await Promise.all([
          getCandidates(),
          getJobPostings()
        ])

        setCandidateOptions(
          (candidates || []).map((c: any) => ({
            value: c.id,
            label: `${c.firstName} ${c.lastName} (${c.email})`,
          }))
        )
        setJobPostingOptions(
          (postings || []).map((j: any) => ({
            value: j.id,
            label: `${j.title} - ${j.department} (${j.location})`,
          }))
        )
      } catch (err: any) {
        console.error('Error loading lookup dependencies:', err)
        toast.error('Error', 'Failed to retrieve candidates or job postings listings.')
        router.push('/ats/applications')
      } finally {
        setIsLoadingLookups(false)
      }
    }

    fetchLookups()
  }, [router, toast])

  const handleSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true)
    try {
      await createApplication(data)
      toast.success('Success', 'Application submitted successfully!')
      router.push('/ats/applications')
      router.refresh()
    } catch (err: any) {
      console.error('Error submitting application:', err)
      toast.error('Submission Failed', err?.message || 'Failed to submit application.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/ats/applications')
  }

  return (
    <PageContainer
      stagger={true}
      header={
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
            Register Candidate Application
          </h1>
          <p className="mt-1.5 text-sm text-[var(--foreground-muted)]">
            Create a link between an active candidate profile and an open job advertisement to track their recruitment workflow.
          </p>
        </div>
      }
    >
      <LightCard className="p-6 md:p-8 max-w-2xl mx-auto">
        {isLoadingLookups ? (
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <ApplicationForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
            candidateOptions={candidateOptions}
            jobPostingOptions={jobPostingOptions}
            submitLabel="Submit Application"
          />
        )}
      </LightCard>
    </PageContainer>
  )
}
