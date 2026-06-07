'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Briefcase, Calendar, MapPin, DollarSign, Edit, Trash2 } from 'lucide-react'
import { PageContainer } from '@/components/ui/PageContainer'
import { LightCard } from '@/components/ui/GlassCard'
import JobPostingForm, { JobPostingFormData } from '@/components/ats/job-postings/JobPostingForm'
import JobPostingStatusBadge from '@/components/ats/job-postings/JobPostingStatusBadge'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { ConfirmDialog } from '@/components/ui/Modal'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { getJobPosting, updateJobPosting, deleteJobPosting } from '@/lib/ui/api'

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
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'ON_HOLD'
  createdAt: string
  updatedAt: string
}

export default function JobPostingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const toast = useToast()

  const [posting, setPosting] = useState<JobPosting | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch job posting details
  const fetchPosting = async () => {
    setIsLoading(true)
    try {
      const data = await getJobPosting(id)
      setPosting(data)
    } catch (err: any) {
      console.error('Error loading job posting:', err)
      toast.error('Error', err?.message || 'Failed to load job posting')
      router.push('/ats/job-postings')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchPosting()
    }
  }, [id])

  const handleUpdate = async (data: JobPostingFormData) => {
    setIsSaving(true)
    try {
      const updated = await updateJobPosting(id, data)
      setPosting(updated)
      toast.success('Success', 'Job posting updated successfully!')
      setIsEditing(false)
      router.refresh()
    } catch (err: any) {
      console.error('Error updating job posting:', err)
      toast.error('Error', err?.message || 'Failed to update job posting')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteJobPosting(id)
      toast.success('Success', 'Job posting deleted successfully!')
      router.push('/ats/job-postings')
      router.refresh()
    } catch (err: any) {
      console.error('Error deleting job posting:', err)
      toast.error('Error', err?.message || 'Failed to delete job posting')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
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

  if (!posting) return null

  return (
    <PageContainer
      stagger={true}
      header={
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/ats/job-postings')}
              className="p-2.5 rounded-xl border border-[rgba(23,0,174,0.06)] bg-white hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all shadow-sm"
              aria-label="Back to Job Postings"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--foreground)]" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
                  {posting.title}
                </h1>
                <JobPostingStatusBadge status={posting.status} />
              </div>
              <p className="text-sm text-[var(--foreground-muted)] flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> {posting.department} &bull; <MapPin className="w-4 h-4" /> {posting.location}
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
                <Edit className="w-4 h-4" />
                Edit Posting
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 border border-red-100 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          )}
        </div>
      }
    >
      {isEditing ? (
        <LightCard className="p-6 md:p-8 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-6 text-[var(--foreground)] pb-3 border-b border-border/50">
            Edit Job Details
          </h2>
          <JobPostingForm
            defaultValues={posting}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            isLoading={isSaving}
            submitLabel="Save Changes"
          />
        </LightCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-6">
            <LightCard className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-brand-700" />
                Job Description
              </h2>
              <div className="whitespace-pre-line text-sm text-[var(--foreground)] leading-relaxed bg-slate-50/50 p-5 rounded-2xl border border-[rgba(23,0,174,0.04)]">
                {posting.description}
              </div>
            </LightCard>

            <LightCard className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <ArrowLeft className="w-5 h-5 rotate-180 text-brand-700" />
                Requirements & Qualifications
              </h2>
              <div className="whitespace-pre-line text-sm text-[var(--foreground)] leading-relaxed bg-slate-50/50 p-5 rounded-2xl border border-[rgba(23,0,174,0.04)]">
                {posting.requirements}
              </div>
            </LightCard>
          </div>

          {/* Sidebar / Meta Details */}
          <div className="space-y-6">
            <LightCard className="p-6">
              <h3 className="text-base font-bold text-[var(--foreground)] mb-4">
                Compensation Details
              </h3>
              <div className="flex items-start gap-3 bg-brand-50/50 p-4 rounded-xl border border-[rgba(23,0,174,0.06)]">
                <DollarSign className="w-5 h-5 text-brand-700 shrink-0 mt-0.5" />
                <div>
                  <div className="text-base font-bold text-brand-900">
                    {posting.salaryMin || posting.salaryMax ? (
                      <>
                        {posting.salaryMin ? `${Number(posting.salaryMin).toLocaleString()}` : '0'} -{' '}
                        {posting.salaryMax ? `${Number(posting.salaryMax).toLocaleString()}` : 'Max'}
                      </>
                    ) : (
                      'Not Specified'
                    )}
                  </div>
                  <div className="text-xs text-[var(--foreground-muted)] font-medium">
                    Estimated Annual Salary Range
                  </div>
                </div>
              </div>
            </LightCard>

            <LightCard className="p-6">
              <h3 className="text-base font-bold text-[var(--foreground)] mb-4">
                Job Information
              </h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
                    Department
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-[var(--foreground)]">
                    {posting.department}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
                    Location
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-[var(--foreground)]">
                    {posting.location}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
                    Employment Type
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-[var(--foreground)] capitalize">
                    {posting.employmentType.replace('_', ' ').toLowerCase()}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Date Created
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-[var(--foreground)]">
                    {new Date(posting.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </dd>
                </div>
              </dl>
            </LightCard>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Job Posting?"
        message="Are you absolutely sure you want to delete this job posting? This action will permanently remove it from the recruitment pipeline and career directory."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </PageContainer>
  )
}
