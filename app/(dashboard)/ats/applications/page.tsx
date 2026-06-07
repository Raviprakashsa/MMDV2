'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Plus, LayoutGrid, List, FileText, AlertCircle } from 'lucide-react'
import { PageContainer } from '@/components/ui/PageContainer'
import { LightCard } from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { SkeletonTable } from '@/components/ui/Skeleton'
import ApplicationTable, { JoinedApplication } from '@/components/ats/applications/ApplicationTable'
import ApplicationKanban from '@/components/ats/applications/ApplicationKanban'
import ApplicationFilters from '@/components/ats/applications/ApplicationFilters'
import ApplicationStatusModal from '@/components/ats/applications/ApplicationStatusModal'
import { ApplicationStatus } from '@/components/ats/applications/ApplicationStatusBadge'
import { getApplications, getCandidates, getJobPostings, changeApplicationStatus } from '@/lib/ui/api'

interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface JobPosting {
  id: string
  title: string
  department: string
}

interface Application {
  id: string
  candidateId: string
  jobPostingId: string
  status: ApplicationStatus
  appliedAt: string
}

export default function ApplicationsPage() {
  const toast = useToast()
  
  // View Toggle: 'table' or 'kanban'
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban')
  
  // Raw state
  const [applications, setApplications] = useState<Application[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters State
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCandidateId, setFilterCandidateId] = useState('')
  const [filterJobPostingId, setFilterJobPostingId] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Transition Modal State
  const [transitionAppId, setTransitionAppId] = useState<string | null>(null)
  const [transitionCurrentStatus, setTransitionCurrentStatus] = useState<ApplicationStatus | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Master fetch pipeline (Client-side Joins)
  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [appsData, candidatesData, postingsData] = await Promise.all([
        getApplications(),
        getCandidates(),
        getJobPostings()
      ])
      
      setApplications(appsData || [])
      setCandidates(candidatesData || [])
      setJobPostings(postingsData || [])
    } catch (err: any) {
      console.error('Error fetching recruiting pipeline details:', err)
      setError(err?.message || 'Failed to load recruiting pipeline details')
      toast.error('Error', err?.message || 'Failed to load recruiting pipeline details')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Create fast indexes for mapping candidate and job posting keys
  const joinedApplications = useMemo<JoinedApplication[]>(() => {
    const candidateMap = new Map(candidates.map((c) => [c.id, c]))
    const postingMap = new Map(jobPostings.map((j) => [j.id, j]))

    return applications.map((app) => {
      const candidate = candidateMap.get(app.candidateId)
      const posting = postingMap.get(app.jobPostingId)

      return {
        id: app.id,
        candidateId: app.candidateId,
        candidateName: candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown Candidate',
        candidateEmail: candidate ? candidate.email : 'Unknown Email',
        jobPostingId: app.jobPostingId,
        jobTitle: posting ? posting.title : 'Unknown Job Posting',
        jobDepartment: posting ? posting.department : 'Unknown Department',
        status: app.status,
        appliedAt: app.appliedAt,
      }
    })
  }, [applications, candidates, jobPostings])

  // Filter listings
  const filteredApplications = useMemo(() => {
    return joinedApplications.filter((app) => {
      const matchesSearch =
        app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCandidate = filterCandidateId ? app.candidateId === filterCandidateId : true
      const matchesJob = filterJobPostingId ? app.jobPostingId === filterJobPostingId : true
      const matchesStatus = filterStatus ? app.status === filterStatus : true

      return matchesSearch && matchesCandidate && matchesJob && matchesStatus
    })
  }, [joinedApplications, searchTerm, filterCandidateId, filterJobPostingId, filterStatus])

  // Form select options
  const candidateLookupOptions = useMemo(() => {
    return candidates.map((c) => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))
  }, [candidates])

  const jobPostingLookupOptions = useMemo(() => {
    return jobPostings.map((j) => ({ value: j.id, label: `${j.title} (${j.department})` }))
  }, [jobPostings])

  // Status transitions triggering workflow modal
  const handleStatusChangeClick = (id: string, currentStatus: ApplicationStatus) => {
    setTransitionAppId(id)
    setTransitionCurrentStatus(currentStatus)
  }

  const handleStatusTransitionConfirm = async (newStatus: ApplicationStatus) => {
    if (!transitionAppId) return
    setIsUpdatingStatus(true)
    try {
      await changeApplicationStatus(transitionAppId, newStatus)
      toast.success('Success', `Application status changed to ${newStatus.toLowerCase()}!`)
      setApplications((prev) =>
        prev.map((app) => (app.id === transitionAppId ? { ...app, status: newStatus } : app))
      )
      setTransitionAppId(null)
      setTransitionCurrentStatus(null)
    } catch (err: any) {
      console.error('Workflow error:', err)
      toast.error('Workflow Rejection', err?.message || 'Status transition rejected by server policies.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <PageContainer
      stagger={true}
      header={
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
              Application Pipelines
            </h1>
            <p className="mt-1.5 text-sm text-[var(--foreground-muted)]">
              Screen candidate pipelines, update statuses, and toggle between detailed tables or status lanes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle Button Group */}
            <div className="inline-flex rounded-xl p-1 bg-slate-100/80 border border-slate-200/50 shadow-sm backdrop-blur-sm">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                aria-label="Kanban View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Kanban
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                aria-label="Table View"
              >
                <List className="w-3.5 h-3.5" />
                Table
              </button>
            </div>
            
            <Link href="/ats/applications/new">
              <Button className="btn-gradient shadow-md flex items-center gap-2">
                <Plus className="w-4.5 h-4.5" />
                Register Application
              </Button>
            </Link>
          </div>
        </div>
      }
    >
      <LightCard className="mb-6 p-6">
        <ApplicationFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          candidateId={filterCandidateId}
          onCandidateChange={setFilterCandidateId}
          jobPostingId={filterJobPostingId}
          onJobPostingChange={setFilterJobPostingId}
          status={filterStatus}
          onStatusChange={setFilterStatus}
          candidateOptions={candidateLookupOptions}
          jobPostingOptions={jobPostingLookupOptions}
        />

        {isLoading ? (
          <SkeletonTable rows={5} />
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center shadow-sm">
            <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-3" />
            <h3 className="text-lg font-bold text-red-800 mb-1">Failed to Load Pipeline</h3>
            <p className="text-sm text-red-700/80 mb-4">{error}</p>
            <Button variant="secondary" onClick={fetchData} className="mx-auto">
              Try Again
            </Button>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 border-dashed bg-white/40 p-12 text-center shadow-sm">
            <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
              {applications.length === 0 ? 'No Applications Yet' : 'No Match Found'}
            </h3>
            <p className="text-sm text-[var(--foreground-muted)] max-w-sm mx-auto mb-6">
              {applications.length === 0
                ? "Start tracking your recruitment pipelines by submitting your very first candidate application."
                : "No matching application details found. Adjust your search keywords or clear your active filters."}
            </p>
            {applications.length === 0 ? (
              <Link href="/ats/applications/new">
                <Button className="btn-gradient mx-auto flex items-center gap-2">
                  <Plus className="w-4.5 h-4.5" />
                  Submit First Application
                </Button>
              </Link>
            ) : (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchTerm('')
                  setFilterCandidateId('')
                  setFilterJobPostingId('')
                  setFilterStatus('')
                }}
                className="mx-auto"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          <ApplicationTable
            applications={filteredApplications}
            onStatusChangeClick={handleStatusChangeClick}
          />
        ) : (
          <ApplicationKanban
            applications={filteredApplications}
            onStatusChangeClick={handleStatusChangeClick}
          />
        )}
      </LightCard>

      {transitionAppId && transitionCurrentStatus && (
        <ApplicationStatusModal
          isOpen={transitionAppId !== null}
          onClose={() => {
            setTransitionAppId(null)
            setTransitionCurrentStatus(null)
          }}
          currentStatus={transitionCurrentStatus}
          onConfirm={handleStatusTransitionConfirm}
          isLoading={isUpdatingStatus}
        />
      )}
    </PageContainer>
  )
}
