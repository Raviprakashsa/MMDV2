'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/ui/PageContainer'
import { LightCard } from '@/components/ui/GlassCard'
import InterviewForm, { InterviewFormData } from '@/components/ats/interviews/InterviewForm'
import { useToast } from '@/components/ui/Toast'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { createInterview, getApplications, getCandidates, getUsers, getJobPostings } from '@/lib/ui/api'

interface LookupOption {
  value: string
  label: string
}

export default function NewInterviewPage() {
  const router = useRouter()
  const toast = useToast()

  const [applicationOptions, setApplicationOptions] = useState<LookupOption[]>([])
  const [interviewerOptions, setInterviewerOptions] = useState<LookupOption[]>([])
  const [isLoadingLookups, setIsLoadingLookups] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchLookups = async () => {
      setIsLoadingLookups(true)
      try {
        const [apps, candidates, users, postings] = await Promise.all([
          getApplications(),
          getCandidates(),
          getUsers(),
          getJobPostings()
        ])

        // Build Application selector labels: Candidate Name (Target Job Title)
        const candMap = new Map<string, any>(candidates.map((c: any) => [c.id, c]))
        const postingMap = new Map<string, any>(postings.map((p: any) => [p.id, p]))

        const mappedApps = (apps || []).map((app: any) => {
          const candidate = candMap.get(app.candidateId)
          const posting = postingMap.get(app.jobPostingId)
          const name = candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown Candidate'
          const title = posting ? posting.title : 'Unknown Job'
          return {
            value: app.id,
            label: `${name} — Target Job: ${title}`,
          }
        })
        setApplicationOptions(mappedApps)

        // Build Interviewer selector labels: Interviewer Name (Email)
        const mappedInterviewers = (users || []).map((u: any) => ({
          value: u.id,
          label: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
        }))
        setInterviewerOptions(mappedInterviewers)

      } catch (err: any) {
        console.error('Error loading lookup dependencies:', err)
        toast.error('Error', 'Failed to retrieve application listings or interviewer rosters.')
        router.push('/ats/interviews')
      } finally {
        setIsLoadingLookups(false)
      }
    }

    fetchLookups()
  }, [router, toast])

  const handleSubmit = async (data: InterviewFormData) => {
    setIsSubmitting(true)
    try {
      // Map scheduledAt date format into valid backend ISO datetime string
      const payload = {
        ...data,
        scheduledAt: new Date(data.scheduledAt).toISOString(),
      }
      await createInterview(payload)
      toast.success('Success', 'Interview scheduled successfully!')
      router.push('/ats/interviews')
      router.refresh()
    } catch (err: any) {
      console.error('Error scheduling interview:', err)
      toast.error('Schedule Failed', err?.message || 'Failed to schedule interview round.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/ats/interviews')
  }

  return (
    <PageContainer
      stagger={true}
      header={
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
            Schedule Candidate Interview
          </h1>
          <p className="mt-1.5 text-sm text-[var(--foreground-muted)]">
            Configure round details, assign an interviewer panel, and define schedules for applicant evaluations.
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
          <InterviewForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
            applicationOptions={applicationOptions}
            interviewerOptions={interviewerOptions}
            submitLabel="Schedule Interview"
          />
        )}
      </LightCard>
    </PageContainer>
  )
}
