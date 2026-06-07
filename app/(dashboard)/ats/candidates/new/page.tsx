'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/ui/PageContainer'
import { LightCard } from '@/components/ui/GlassCard'
import CandidateForm, { CandidateFormOutputData } from '@/components/ats/candidates/CandidateForm'
import { useToast } from '@/components/ui/Toast'
import { createCandidate } from '@/lib/ui/api'

export default function NewCandidatePage() {
  const router = useRouter()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: CandidateFormOutputData) => {
    setIsLoading(true)
    try {
      await createCandidate(data)
      toast.success('Success', 'Candidate profile registered successfully!')
      router.push('/ats/candidates')
      router.refresh()
    } catch (err: any) {
      console.error('Error registering candidate:', err)
      toast.error('Error', err?.message || 'Failed to register candidate')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/ats/candidates')
  }

  return (
    <PageContainer
      stagger={true}
      header={
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
            Register Candidate
          </h1>
          <p className="mt-1.5 text-sm text-[var(--foreground-muted)]">
            Create a new candidate profile, record contact details, and input resume resources for screening evaluations.
          </p>
        </div>
      }
    >
      <LightCard className="p-6 md:p-8 max-w-4xl mx-auto">
        <CandidateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          submitLabel="Register Candidate"
        />
      </LightCard>
    </PageContainer>
  )
}
