'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, User, Edit, Trash2 } from 'lucide-react'
import { PageContainer } from '@/components/ui/PageContainer'
import { LightCard } from '@/components/ui/GlassCard'
import CandidateForm, { CandidateFormOutputData } from '@/components/ats/candidates/CandidateForm'
import CandidateProfileCard from '@/components/ats/candidates/CandidateProfileCard'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { ConfirmDialog } from '@/components/ui/Modal'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { getCandidate, updateCandidate, deleteCandidate } from '@/lib/ui/api'

interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  currentLocation?: string | null
  totalExperience?: any
  currentCompany?: string | null
  currentDesignation?: string | null
  resumeUrl: string
  linkedinUrl?: string | null
  portfolioUrl?: string | null
  createdAt: string
  updatedAt: string
}

export default function CandidateDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const toast = useToast()

  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch candidate details
  const fetchCandidate = async () => {
    setIsLoading(true)
    try {
      const data = await getCandidate(id)
      setCandidate(data)
    } catch (err: any) {
      console.error('Error loading candidate:', err)
      toast.error('Error', err?.message || 'Failed to load candidate details')
      router.push('/ats/candidates')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchCandidate()
    }
  }, [id])

  const handleUpdate = async (data: CandidateFormOutputData) => {
    setIsSaving(true)
    try {
      const updated = await updateCandidate(id, data)
      setCandidate(updated)
      toast.success('Success', 'Candidate profile updated successfully!')
      setIsEditing(false)
      router.refresh()
    } catch (err: any) {
      console.error('Error updating candidate:', err)
      toast.error('Error', err?.message || 'Failed to update candidate profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteCandidate(id)
      toast.success('Success', 'Candidate profile deleted successfully!')
      router.push('/ats/candidates')
      router.refresh()
    } catch (err: any) {
      console.error('Error deleting candidate:', err)
      toast.error('Error', err?.message || 'Failed to delete candidate')
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
        <div className="max-w-4xl mx-auto space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </PageContainer>
    )
  }

  if (!candidate) return null

  return (
    <PageContainer
      stagger={true}
      header={
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/ats/candidates')}
              className="p-2.5 rounded-xl border border-[rgba(23,0,174,0.06)] bg-white hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all shadow-sm"
              aria-label="Back to Candidates"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--foreground)]" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
                Candidate Profile
              </h1>
              <p className="text-sm text-[var(--foreground-muted)] flex items-center gap-2 mt-1">
                <User className="w-4 h-4 text-brand-700" />
                {candidate.firstName} {candidate.lastName} &bull; ID: {candidate.id.slice(-6)}
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
                Edit Profile
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
        <LightCard className="p-6 md:p-8 max-w-4xl mx-auto animate-in zoom-in-95 duration-150">
          <h2 className="text-xl font-bold mb-6 text-[var(--foreground)] pb-3 border-b border-border/50">
            Edit Candidate Profile
          </h2>
          <CandidateForm
            defaultValues={candidate}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            isLoading={isSaving}
            submitLabel="Save Changes"
          />
        </LightCard>
      ) : (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-200">
          <CandidateProfileCard candidate={candidate} />
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Candidate Profile?"
        message="Are you absolutely sure you want to delete this candidate profile? This action is reversible but will remove them from the active recruitment pool."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </PageContainer>
  )
}
