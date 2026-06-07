'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Briefcase, AlertCircle } from 'lucide-react'
import { PageContainer } from '@/components/ui/PageContainer'
import { LightCard } from '@/components/ui/GlassCard'
import JobPostingTable from '@/components/ats/job-postings/JobPostingTable'
import JobPostingFilters from '@/components/ats/job-postings/JobPostingFilters'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { ConfirmDialog } from '@/components/ui/Modal'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { getJobPostings, deleteJobPosting } from '@/lib/ui/api'

interface JobPosting {
  id: string
  title: string
  department: string
  location: string
  employmentType: string
  salaryMin: any
  salaryMax: any
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'ON_HOLD'
  createdAt: string
}

export default function JobPostingsPage() {
  const toast = useToast()
  const [postings, setPostings] = useState<JobPosting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters State
  const [searchTerm, setSearchTerm] = useState('')
  const [department, setDepartment] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState('')

  // Delete Dialog State
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch postings
  const fetchPostings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getJobPostings()
      setPostings(data || [])
    } catch (err: any) {
      console.error('Error fetching job postings:', err)
      setError(err?.message || 'Failed to load job postings')
      toast.error('Error', err?.message || 'Failed to load job postings')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPostings()
  }, [])

  // Filter listings locally
  const filteredPostings = useMemo(() => {
    return postings.filter((posting) => {
      const matchesSearch = posting.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDept = department ? posting.department === department : true
      const matchesLoc = location ? posting.location.toLowerCase().includes(location.toLowerCase()) : true
      const matchesStatus = status ? posting.status === status : true
      return matchesSearch && matchesDept && matchesLoc && matchesStatus
    })
  }, [postings, searchTerm, department, location, status])

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await deleteJobPosting(deleteId)
      toast.success('Success', 'Job posting has been deleted successfully')
      setPostings((prev) => prev.filter((p) => p.id !== deleteId))
    } catch (err: any) {
      toast.error('Error', err?.message || 'Failed to delete job posting')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <PageContainer
      stagger={true}
      header={
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
              Job Postings
            </h1>
            <p className="mt-1.5 text-sm text-[var(--foreground-muted)]">
              Manage your company's job advertisements, edit requirements, and track active career postings.
            </p>
          </div>
          <Link href="/ats/job-postings/new">
            <Button className="btn-gradient shadow-md flex items-center gap-2">
              <Plus className="w-4.5 h-4.5" />
              New Job Posting
            </Button>
          </Link>
        </div>
      }
    >
      <LightCard className="mb-6 p-6">
        <JobPostingFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          department={department}
          onDepartmentChange={setDepartment}
          location={location}
          onLocationChange={setLocation}
          status={status}
          onStatusChange={setStatus}
        />

        {isLoading ? (
          <SkeletonTable rows={5} />
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center shadow-sm">
            <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-3" />
            <h3 className="text-lg font-bold text-red-800 mb-1">Failed to Load Postings</h3>
            <p className="text-sm text-red-700/80 mb-4">{error}</p>
            <Button variant="secondary" onClick={fetchPostings} className="mx-auto">
              Try Again
            </Button>
          </div>
        ) : filteredPostings.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 border-dashed bg-white/40 p-12 text-center shadow-sm">
            <Briefcase className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
              {postings.length === 0 ? 'No Job Postings Yet' : 'No Match Found'}
            </h3>
            <p className="text-sm text-[var(--foreground-muted)] max-w-sm mx-auto mb-6">
              {postings.length === 0
                ? "Start building your Applicant Tracking System by creating your very first public career posting."
                : "Adjust your search parameters or clear some filters to discover matching job listings."}
            </p>
            {postings.length === 0 ? (
              <Link href="/ats/job-postings/new">
                <Button className="btn-gradient mx-auto flex items-center gap-2">
                  <Plus className="w-4.5 h-4.5" />
                  Create First Posting
                </Button>
              </Link>
            ) : (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchTerm('')
                  setDepartment('')
                  setLocation('')
                  setStatus('')
                }}
                className="mx-auto"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <JobPostingTable postings={filteredPostings} onDelete={handleDeleteClick} />
        )}
      </LightCard>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Job Posting?"
        message="Are you absolutely sure you want to delete this job posting? This action is reversible but will remove it from the active career directory."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </PageContainer>
  )
}
