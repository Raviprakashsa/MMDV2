'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { ArrowLeft, User, Briefcase, Calendar, RefreshCw, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { PageContainer } from '@/components/ui/PageContainer'
import { LightCard } from '@/components/ui/GlassCard'
import ApplicationForm, { ApplicationFormData } from '@/components/ats/applications/ApplicationForm'
import ApplicationStatusBadge, { ApplicationStatus } from '@/components/ats/applications/ApplicationStatusBadge'
import ApplicationStatusModal from '@/components/ats/applications/ApplicationStatusModal'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { getApplication, getCandidate, getJobPosting, updateApplication, changeApplicationStatus } from '@/lib/ui/api'

interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  currentLocation?: string | null
  resumeUrl: string
  linkedinUrl?: string | null
  portfolioUrl?: string | null
}

interface JobPosting {
  id: string
  title: string
  department: string
  location: string
  employmentType: string
  description: string
  requirements: string
  salaryMin: any
  salaryMax: any
  status: string
}

interface Application {
  id: string
  candidateId: string
  jobPostingId: string
  status: ApplicationStatus
  appliedAt: string
}

// Client transition mapping for workflow assistance layout (matching application.service.ts)
const TransitionMap: Record<ApplicationStatus, { next: ApplicationStatus[]; cta: string[] }> = {
  APPLIED: { next: ['SCREENING'], cta: ['Advance to Screening'] },
  SCREENING: { next: ['SHORTLISTED', 'REJECTED'], cta: ['Shortlist Candidate', 'Reject Application'] },
  SHORTLISTED: { next: ['INTERVIEW', 'REJECTED'], cta: ['Schedule Interview', 'Reject Application'] },
  INTERVIEW: { next: ['OFFERED', 'REJECTED'], cta: ['Extend Job Offer', 'Reject Application'] },
  OFFERED: { next: ['HIRED', 'REJECTED'], cta: ['Mark as Hired', 'Reject Application'] },
  HIRED: { next: [], cta: [] },
  REJECTED: { next: [], cta: [] },
  WITHDRAWN: { next: [], cta: [] },
}

export default function ApplicationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const toast = useToast()

  const initialEditMode = searchParams.get('edit') === 'true'

  // Dynamic state
  const [application, setApplication] = useState<Application | null>(null)
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [jobPosting, setJobPosting] = useState<JobPosting | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(initialEditMode)
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)

  // Fetch full joined data
  const fetchAllDetails = async () => {
    setIsLoading(true)
    try {
      const appData = await getApplication(id)
      setApplication(appData)

      // Fetch related Candidate and Job Posting in parallel
      const [candData, jobData] = await Promise.all([
        getCandidate(appData.candidateId),
        getJobPosting(appData.jobPostingId)
      ])

      setCandidate(candData)
      setJobPosting(jobData)
    } catch (err: any) {
      console.error('Error fetching application profiles:', err)
      toast.error('Error', err?.message || 'Failed to retrieve application detail dependencies.')
      router.push('/ats/applications')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchAllDetails()
    }
  }, [id])

  const handleUpdate = async (data: ApplicationFormData) => {
    setIsSaving(true)
    try {
      // Discard candidateId/jobPostingId since they are immutable, but API handles PATCH on status / appliedAt
      const updated = await updateApplication(id, {
        status: data.status,
      })
      setApplication(updated)
      toast.success('Success', 'Application fields updated successfully!')
      setIsEditing(false)
      router.refresh()
    } catch (err: any) {
      console.error('Error updating application details:', err)
      toast.error('Update Failed', err?.message || 'Failed to update application details.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusTransition = async (newStatus: ApplicationStatus) => {
    setIsUpdatingStatus(true)
    try {
      await changeApplicationStatus(id, newStatus)
      toast.success('Success', `Application status transitioned to ${newStatus.toLowerCase()}!`)
      setApplication((prev) => (prev ? { ...prev, status: newStatus } : null))
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
          <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-6 w-32 bg-slate-100 rounded animate-pulse" />
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

  if (!application || !candidate || !jobPosting) return null

  // Lookup selections mapping for form
  const candidateOptions = [{ value: candidate.id, label: `${candidate.firstName} ${candidate.lastName}` }]
  const jobPostingOptions = [{ value: jobPosting.id, label: jobPosting.title }]

  const workflow = TransitionMap[application.status] || { next: [], cta: [] }

  return (
    <PageContainer
      stagger={true}
      header={
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/ats/applications')}
              className="p-2.5 rounded-xl border border-[rgba(23,0,174,0.06)] bg-white hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all shadow-sm"
              aria-label="Back to Applications"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--foreground)]" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
                  Application Profile
                </h1>
                <ApplicationStatusBadge status={application.status} />
              </div>
              <p className="text-xs text-[var(--foreground-muted)]">
                Submitted on {new Date(application.appliedAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
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
                Edit Details
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
            Edit Application Details
          </h2>
          <ApplicationForm
            defaultValues={{
              candidateId: application.candidateId,
              jobPostingId: application.jobPostingId,
              status: application.status,
            }}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            isLoading={isSaving}
            candidateOptions={candidateOptions}
            jobPostingOptions={jobPostingOptions}
            submitLabel="Save Changes"
            isEditMode={true}
          />
        </LightCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details (Candidate & Job description summary) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Summary */}
            <LightCard className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2 pb-3 border-b border-slate-100">
                <User className="w-5 h-5 text-brand-700" />
                Candidate Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xxs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                    Full Name
                  </span>
                  <span className="text-sm font-semibold text-[var(--foreground)] mt-0.5 block">
                    {candidate.firstName} {candidate.lastName}
                  </span>
                </div>
                <div>
                  <span className="block text-xxs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                    Email Address
                  </span>
                  <span className="text-sm font-semibold text-[var(--foreground)] mt-0.5 block">
                    {candidate.email}
                  </span>
                </div>
                <div>
                  <span className="block text-xxs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                    Phone Number
                  </span>
                  <span className="text-sm font-semibold text-[var(--foreground)] mt-0.5 block">
                    {candidate.phone}
                  </span>
                </div>
                <div>
                  <span className="block text-xxs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                    Location
                  </span>
                  <span className="text-sm font-semibold text-[var(--foreground)] mt-0.5 block">
                    {candidate.currentLocation || 'Not specified'}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl hover:bg-emerald-100 transition-all"
                >
                  <FileText className="w-4 h-4 text-emerald-700" />
                  Inspect Candidate Resume PDF
                </a>
              </div>
            </LightCard>

            {/* Job Posting Summary */}
            <LightCard className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2 pb-3 border-b border-slate-100">
                <Briefcase className="w-5 h-5 text-brand-700" />
                Target Job Posting
              </h2>
              <div className="mb-4">
                <span className="block text-xxs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                  Job Title
                </span>
                <span className="text-base font-extrabold text-[var(--foreground)] mt-0.5 block">
                  {jobPosting.title}
                </span>
                <span className="text-xs text-[var(--foreground-muted)] font-medium block mt-0.5">
                  {jobPosting.department} &bull; {jobPosting.location}
                </span>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-xl border border-[rgba(23,0,174,0.03)] text-xs text-[var(--foreground-muted)]">
                <span className="font-bold text-[var(--foreground)] block mb-1">Employment Type</span>
                <span className="capitalize">{jobPosting.employmentType.replace('_', ' ').toLowerCase()}</span>
              </div>
            </LightCard>
          </div>

          {/* Workflow Sidebar */}
          <div className="space-y-6">
            <LightCard className="p-6">
              <h3 className="text-base font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-700" />
                Pipeline Workflow Guide
              </h3>

              {workflow.next.length === 0 ? (
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <span className="block text-xs font-semibold text-slate-700">Terminal Pipeline State</span>
                  <p className="text-xxs text-slate-500 mt-1">
                    This application is in a final recruitment state ({application.status.toLowerCase()}) and cannot be transitioned further.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xxs font-semibold text-[var(--foreground-muted)]">
                    Quickly transition this candidate to one of the allowed next stages:
                  </p>
                  {workflow.next.map((nextStatus, idx) => {
                    const label = workflow.cta[idx] || `Move to ${nextStatus}`
                    const isReject = nextStatus === 'REJECTED'
                    return (
                      <Button
                        key={nextStatus}
                        onClick={() => handleStatusTransition(nextStatus)}
                        isLoading={isUpdatingStatus}
                        className={`w-full justify-center ${
                          isReject
                            ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:text-red-800'
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
        <ApplicationStatusModal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          currentStatus={application.status}
          onConfirm={handleStatusTransition}
          isLoading={isUpdatingStatus}
        />
      )}
    </PageContainer>
  )
}
