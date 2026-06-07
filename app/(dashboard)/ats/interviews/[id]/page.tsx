'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { ArrowLeft, User, UserCheck, Star, Calendar, RefreshCw, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { PageContainer } from '@/components/ui/PageContainer'
import { LightCard } from '@/components/ui/GlassCard'
import InterviewForm, { InterviewFormData } from '@/components/ats/interviews/InterviewForm'
import InterviewStatusBadge, { InterviewStatus } from '@/components/ats/interviews/InterviewStatusBadge'
import InterviewStatusModal from '@/components/ats/interviews/InterviewStatusModal'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { getInterview, getApplication, getCandidate, getJobPosting, getUser, updateInterview, changeInterviewStatus } from '@/lib/ui/api'

interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  currentLocation?: string | null
}

interface JobPosting {
  id: string
  title: string
  department: string
  location: string
}

interface Application {
  id: string
  candidateId: string
  jobPostingId: string
  status: string
  appliedAt: string
}

interface Interviewer {
  id: string
  firstName?: string | null
  lastName?: string | null
  email: string
}

interface Interview {
  id: string
  applicationId: string
  interviewerId: string
  round: number
  feedback?: string | null
  rating?: number | null
  status: InterviewStatus
  scheduledAt: string
}

// Allowed status transitions mapping for helper workflow guides (matches interview.service.ts)
const TransitionMap: Record<InterviewStatus, { next: InterviewStatus[]; cta: string[] }> = {
  SCHEDULED: { next: ['COMPLETED', 'CANCELLED', 'NO_SHOW'], cta: ['Complete Interview', 'Cancel Session', 'Mark as No-Show'] },
  COMPLETED: { next: [], cta: [] },
  CANCELLED: { next: [], cta: [] },
  NO_SHOW: { next: [], cta: [] },
}

export default function InterviewDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const toast = useToast()

  const initialEditMode = searchParams.get('edit') === 'true'

  // Dynamic state
  const [interview, setInterview] = useState<Interview | null>(null)
  const [application, setApplication] = useState<Application | null>(null)
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [jobPosting, setJobPosting] = useState<JobPosting | null>(null)
  const [interviewer, setInterviewer] = useState<Interviewer | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(initialEditMode)
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)

  // Fetch full details sequentially/parallelly
  const fetchAllDetails = async () => {
    setIsLoading(true)
    try {
      const interviewData = await getInterview(id)
      setInterview(interviewData)

      // Fetch Application and Interviewer (User) in parallel
      const [appData, interviewerData] = await Promise.all([
        getApplication(interviewData.applicationId),
        getUser(interviewData.interviewerId)
      ])

      setApplication(appData)
      setInterviewer(interviewerData)

      // Fetch Candidate and Job Posting in parallel
      const [candData, jobData] = await Promise.all([
        getCandidate(appData.candidateId),
        getJobPosting(appData.jobPostingId)
      ])

      setCandidate(candData)
      setJobPosting(jobData)
    } catch (err: any) {
      console.error('Error fetching interview dependencies:', err)
      toast.error('Error', err?.message || 'Failed to retrieve interview dependency profiles.')
      router.push('/ats/interviews')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchAllDetails()
    }
  }, [id])

  const handleUpdate = async (data: InterviewFormData) => {
    setIsSaving(true)
    try {
      // API expects preprocessed values
      const payload = {
        interviewerId: data.interviewerId,
        round: data.round,
        feedback: data.feedback,
        rating: data.rating,
        status: data.status,
        scheduledAt: new Date(data.scheduledAt).toISOString(),
      }
      const updated = await updateInterview(id, payload)
      setInterview(updated)

      // Refresh Interviewer name in case it was changed
      if (payload.interviewerId !== interviewer?.id) {
        const interviewerData = await getUser(payload.interviewerId)
        setInterviewer(interviewerData)
      }

      toast.success('Success', 'Interview fields updated successfully!')
      setIsEditing(false)
      router.refresh()
    } catch (err: any) {
      console.error('Error updating interview details:', err)
      toast.error('Update Failed', err?.message || 'Failed to update interview details.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusTransition = async (newStatus: InterviewStatus) => {
    setIsUpdatingStatus(true)
    try {
      await changeInterviewStatus(id, newStatus)
      toast.success('Success', `Interview status changed to ${newStatus.toLowerCase()}!`)
      setInterview((prev) => (prev ? { ...prev, status: newStatus } : null))
      setShowStatusModal(false)
    } catch (err: any) {
      console.error('Workflow error:', err)
      toast.error('Workflow Rejection', err?.message || 'Status transition rejected by server policies.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  if (isLoading) {
    return (
      <PageContainer stagger={true}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-6 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div>
            <SkeletonCard />
          </div>
        </div>
      </PageContainer>
    )
  }

  if (!interview || !application || !candidate || !jobPosting || !interviewer) return null

  // Dropdown mappings for select form fields
  const applicationOptions = [{ value: application.id, label: `${candidate.firstName} ${candidate.lastName} (${jobPosting.title})` }]
  const interviewerOptions = [{ value: interviewer.id, label: `${interviewer.firstName || ''} ${interviewer.lastName || ''}`.trim() || interviewer.email }]

  const workflow = TransitionMap[interview.status] || { next: [], cta: [] }

  const formattedTime = new Date(interview.scheduledAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const formattedDate = new Date(interview.scheduledAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <PageContainer
      stagger={true}
      header={
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/ats/interviews')}
              className="p-2.5 rounded-xl border border-[rgba(23,0,174,0.06)] bg-white dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all shadow-sm"
              aria-label="Back to Interviews"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--foreground)]" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
                  Interview Round Details
                </h1>
                <InterviewStatusBadge status={interview.status} />
              </div>
              <p className="text-xs text-[var(--foreground-muted)]">
                Round {interview.round} &bull; Scheduled for {formattedDate} at {formattedTime}
              </p>
            </div>
          </div>

          {!isEditing && (
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 border border-[rgba(23,0,174,0.08)]"
              >
                Edit Schedule
              </Button>
              <Button
                className="btn-gradient flex items-center gap-2"
                onClick={() => setShowStatusModal(true)}
              >
                <RefreshCw className="w-4 h-4" />
                Change Status
              </Button>
            </div>
          )}
        </div>
      }
    >
      {isEditing ? (
        <LightCard className="p-6 md:p-8 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-6 text-[var(--foreground)] pb-3 border-b border-border/50">
            Edit Interview details
          </h2>
          <InterviewForm
            defaultValues={{
              applicationId: interview.applicationId,
              interviewerId: interview.interviewerId,
              round: interview.round,
              scheduledAt: interview.scheduledAt,
              feedback: interview.feedback,
              rating: interview.rating,
              status: interview.status,
            }}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            isLoading={isSaving}
            applicationOptions={applicationOptions}
            interviewerOptions={interviewerOptions}
            submitLabel="Save Changes"
            isEditMode={true}
          />
        </LightCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main profile layout columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Candidate & Job Summary Card */}
            <LightCard className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <User className="w-5 h-5 text-brand-700" />
                Candidate & Job Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xxs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                    Applicant Name
                  </span>
                  <span className="text-sm font-semibold text-[var(--foreground)] mt-0.5 block">
                    {candidate.firstName} {candidate.lastName}
                  </span>
                </div>
                <div>
                  <span className="block text-xxs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                    Candidate Email
                  </span>
                  <span className="text-sm font-semibold text-[var(--foreground)] mt-0.5 block">
                    {candidate.email}
                  </span>
                </div>
                <div>
                  <span className="block text-xxs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                    Job Title
                  </span>
                  <span className="text-sm font-semibold text-[var(--foreground)] mt-0.5 block">
                    {jobPosting.title}
                  </span>
                </div>
                <div>
                  <span className="block text-xxs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                    Department & Location
                  </span>
                  <span className="text-sm font-semibold text-[var(--foreground)] mt-0.5 block">
                    {jobPosting.department} &bull; {jobPosting.location}
                  </span>
                </div>
              </div>
            </LightCard>

            {/* Evaluator Ratings and Notes */}
            <LightCard className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <FileText className="w-5 h-5 text-brand-700" />
                Evaluation Rating & Feedback
              </h2>
              <div className="space-y-4">
                <div>
                  <span className="block text-xxs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1">
                    Rating Status
                  </span>
                  {interview.rating !== undefined && interview.rating !== null ? (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, starIdx) => {
                        const filled = starIdx < (interview.rating || 0)
                        return (
                          <Star
                            key={starIdx}
                            className={`w-5 h-5 ${
                              filled ? 'fill-amber-500 text-amber-500' : 'text-slate-200 dark:text-slate-700'
                            }`}
                          />
                        )
                      })}
                      <span className="ml-2 text-sm font-bold text-slate-700 dark:text-slate-350">
                        {interview.rating} / 5
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-slate-400 block italic">
                      No rating provided yet. Edit details to score.
                    </span>
                  )}
                </div>

                <div className="pt-2">
                  <span className="block text-xxs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1">
                    Feedback Details
                  </span>
                  {interview.feedback ? (
                    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 dark:bg-slate-900/50 dark:border-slate-850 dark:text-slate-300 font-medium whitespace-pre-wrap">
                      {interview.feedback}
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-slate-400 block italic">
                      No evaluation feedback notes documented.
                    </span>
                  )}
                </div>
              </div>
            </LightCard>
          </div>

          {/* Workflow Sidebar */}
          <div className="space-y-6">
            {/* Assigned Interviewer */}
            <LightCard className="p-6">
              <h3 className="text-base font-bold text-[var(--foreground)] mb-4 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <UserCheck className="w-5 h-5 text-brand-700" />
                Interviewer Panel
              </h3>
              <div>
                <span className="block text-xxs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                  Panel Member
                </span>
                <span className="text-sm font-bold text-[var(--foreground)] mt-0.5 block">
                  {interviewer.firstName || interviewer.lastName
                    ? `${interviewer.firstName || ''} ${interviewer.lastName || ''}`.trim()
                    : 'Unnamed Interviewer'}
                </span>
                <span className="text-xs text-[var(--foreground-muted)] block mt-0.5">
                  {interviewer.email}
                </span>
              </div>
            </LightCard>

            {/* Workflow Guide */}
            <LightCard className="p-6">
              <h3 className="text-base font-bold text-[var(--foreground)] mb-4 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-brand-700" />
                Transition Guide
              </h3>

              {workflow.next.length === 0 ? (
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center dark:bg-slate-900/20 dark:border-slate-850">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Session Finalized</span>
                  <p className="text-xxs text-slate-500 mt-1">
                    This interview is in a terminal status ({interview.status.toLowerCase()}) and cannot be transitioned further.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xxs font-semibold text-[var(--foreground-muted)]">
                    Trigger one of the allowed status transitions for this evaluation round:
                  </p>
                  {workflow.next.map((nextStatus, idx) => {
                    const label = workflow.cta[idx] || `Move to ${nextStatus}`
                    const isNeg = nextStatus === 'CANCELLED' || nextStatus === 'NO_SHOW'
                    return (
                      <Button
                        key={nextStatus}
                        onClick={() => handleStatusTransition(nextStatus)}
                        isLoading={isUpdatingStatus}
                        className={`w-full justify-center ${
                          isNeg
                            ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:text-red-800 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900'
                            : 'btn-gradient shadow-sm'
                        }`}
                      >
                        {label}
                      </Button>
                    )
                  })}
                </div>
              )}
            </LightCard>
          </div>
        </div>
      )}

      {showStatusModal && (
        <InterviewStatusModal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          currentStatus={interview.status}
          onConfirm={handleStatusTransition}
          isLoading={isUpdatingStatus}
        />
      )}
    </PageContainer>
  )
}
