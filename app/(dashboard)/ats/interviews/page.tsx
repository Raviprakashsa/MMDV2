'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Calendar, List, Clock, AlertCircle } from 'lucide-react'
import { PageContainer } from '@/components/ui/PageContainer'
import { LightCard } from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { SkeletonTable } from '@/components/ui/Skeleton'
import InterviewTable from '@/components/ats/interviews/InterviewTable'
import InterviewCalendar from '@/components/ats/interviews/InterviewCalendar'
import InterviewFilters from '@/components/ats/interviews/InterviewFilters'
import InterviewStatusModal from '@/components/ats/interviews/InterviewStatusModal'
import { InterviewStatus } from '@/components/ats/interviews/InterviewStatusBadge'
import { JoinedInterview } from '@/components/ats/interviews/InterviewCard'
import { getInterviews, getApplications, getCandidates, getUsers, getJobPostings, changeInterviewStatus } from '@/lib/ui/api'

interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface UserRecord {
  id: string
  firstName?: string | null
  lastName?: string | null
  email: string
}

interface JobPosting {
  id: string
  title: string
}

interface Application {
  id: string
  candidateId: string
  jobPostingId: string
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

export default function InterviewsPage() {
  const toast = useToast()

  // View Toggle: 'table' or 'calendar'
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('calendar')

  // Raw API State
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [users, setUsers] = useState<UserRecord[]>([])
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters State
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCandidateId, setFilterCandidateId] = useState('')
  const [filterInterviewerId, setFilterInterviewerId] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterRound, setFilterRound] = useState('')
  const [filterDate, setFilterDate] = useState('')

  // Transition Modal State
  const [transitionInterviewId, setTransitionInterviewId] = useState<string | null>(null)
  const [transitionCurrentStatus, setTransitionCurrentStatus] = useState<InterviewStatus | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Fetch all necessary details in parallel
  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [interviewsData, appsData, candidatesData, usersData, postingsData] = await Promise.all([
        getInterviews(),
        getApplications(),
        getCandidates(),
        getUsers(),
        getJobPostings()
      ])

      setInterviews(interviewsData || [])
      setApplications(appsData || [])
      setCandidates(candidatesData || [])
      setUsers(usersData || [])
      setJobPostings(postingsData || [])
    } catch (err: any) {
      console.error('Error fetching interview schedule data:', err)
      setError(err?.message || 'Failed to load interview schedules')
      toast.error('Error', err?.message || 'Failed to load interview schedules')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Build the joined interview representation (O(1) lookups via maps)
  const joinedInterviews = useMemo<JoinedInterview[]>(() => {
    const appMap = new Map(applications.map((a) => [a.id, a]))
    const candMap = new Map(candidates.map((c) => [c.id, c]))
    const userMap = new Map(users.map((u) => [u.id, u]))
    const postingMap = new Map(jobPostings.map((j) => [j.id, j]))

    return interviews.map((item) => {
      const app = appMap.get(item.applicationId)
      const interviewer = userMap.get(item.interviewerId)
      const candidate = app ? candMap.get(app.candidateId) : null
      const job = app ? postingMap.get(app.jobPostingId) : null

      return {
        id: item.id,
        applicationId: item.applicationId,
        candidateId: app ? app.candidateId : '',
        candidateName: candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown Candidate',
        candidateEmail: candidate ? candidate.email : 'Unknown Email',
        jobTitle: job ? job.title : 'Unknown Job Posting',
        interviewerId: item.interviewerId,
        interviewerName: interviewer
          ? `${interviewer.firstName || ''} ${interviewer.lastName || ''}`.trim() || interviewer.email
          : 'Unknown Interviewer',
        round: item.round,
        feedback: item.feedback,
        rating: item.rating,
        status: item.status,
        scheduledAt: item.scheduledAt,
      }
    })
  }, [interviews, applications, candidates, users, jobPostings])

  // Filter schedules
  const filteredInterviews = useMemo(() => {
    return joinedInterviews.filter((item) => {
      const matchesSearch =
        item.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.interviewerName.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCandidate = filterCandidateId ? item.candidateId === filterCandidateId : true
      const matchesInterviewer = filterInterviewerId ? item.interviewerId === filterInterviewerId : true
      const matchesStatus = filterStatus ? item.status === filterStatus : true
      const matchesRound = filterRound ? String(item.round) === filterRound : true

      let matchesDate = true
      if (filterDate) {
        const itemDate = new Date(item.scheduledAt).toISOString().split('T')[0]
        matchesDate = itemDate === filterDate
      }

      return matchesSearch && matchesCandidate && matchesInterviewer && matchesStatus && matchesRound && matchesDate
    })
  }, [joinedInterviews, searchTerm, filterCandidateId, filterInterviewerId, filterStatus, filterRound, filterDate])

  // Lookups mapped for search inputs
  const candidateLookupOptions = useMemo(() => {
    return candidates.map((c) => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))
  }, [candidates])

  const interviewerLookupOptions = useMemo(() => {
    return users.map((u) => ({
      value: u.id,
      label: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
    }))
  }, [users])

  // Status transitions triggering workflow modal
  const handleStatusChangeClick = (id: string, currentStatus: InterviewStatus) => {
    setTransitionInterviewId(id)
    setTransitionCurrentStatus(currentStatus)
  }

  const handleStatusTransitionConfirm = async (newStatus: InterviewStatus) => {
    if (!transitionInterviewId) return
    setIsUpdatingStatus(true)
    try {
      await changeInterviewStatus(transitionInterviewId, newStatus)
      toast.success('Success', `Interview status changed to ${newStatus.toLowerCase()}!`)
      setInterviews((prev) =>
        prev.map((item) => (item.id === transitionInterviewId ? { ...item, status: newStatus } : item))
      )
      setTransitionInterviewId(null)
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
              Interview Schedules
            </h1>
            <p className="mt-1.5 text-sm text-[var(--foreground-muted)]">
              Organize and review candidate interview rounds, feedback ratings, and calendar schedules.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle Button Group */}
            <div className="inline-flex rounded-xl p-1 bg-slate-100/80 border border-slate-200/50 shadow-sm backdrop-blur-sm dark:bg-slate-800/80 dark:border-slate-700">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-900 dark:text-brand-400'
                    : 'text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                aria-label="Calendar View"
              >
                <Calendar className="w-3.5 h-3.5" />
                Calendar
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-900 dark:text-brand-400'
                    : 'text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                aria-label="Table View"
              >
                <List className="w-3.5 h-3.5" />
                Table
              </button>
            </div>

            <Link href="/ats/interviews/new">
              <Button className="btn-gradient shadow-md flex items-center gap-2">
                <Plus className="w-4.5 h-4.5" />
                Schedule Interview
              </Button>
            </Link>
          </div>
        </div>
      }
    >
      <LightCard className="mb-6 p-6">
        <InterviewFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          candidateId={filterCandidateId}
          onCandidateChange={setFilterCandidateId}
          interviewerId={filterInterviewerId}
          onInterviewerChange={setFilterInterviewerId}
          status={filterStatus}
          onStatusChange={setFilterStatus}
          round={filterRound}
          onRoundChange={setFilterRound}
          scheduledDate={filterDate}
          onScheduledDateChange={setFilterDate}
          candidateOptions={candidateLookupOptions}
          interviewerOptions={interviewerLookupOptions}
        />

        {isLoading ? (
          <SkeletonTable rows={5} />
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center shadow-sm dark:bg-red-950/20 dark:border-red-900">
            <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-3" />
            <h3 className="text-lg font-bold text-red-800 dark:text-red-400 mb-1">Failed to Load Schedules</h3>
            <p className="text-sm text-red-700/80 dark:text-red-400/80 mb-4">{error}</p>
            <Button variant="secondary" onClick={fetchData} className="mx-auto">
              Try Again
            </Button>
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 border-dashed bg-white/40 p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/20">
            <Clock className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
              {interviews.length === 0 ? 'No Interviews Scheduled' : 'No Match Found'}
            </h3>
            <p className="text-sm text-[var(--foreground-muted)] max-w-sm mx-auto mb-6">
              {interviews.length === 0
                ? "Start setting up candidate reviews by scheduling your first interview panel."
                : "No matching interview schedule details found. Adjust your keywords or clear your active filters."}
            </p>
            {interviews.length === 0 ? (
              <Link href="/ats/interviews/new">
                <Button className="btn-gradient mx-auto flex items-center gap-2">
                  <Plus className="w-4.5 h-4.5" />
                  Schedule First Interview
                </Button>
              </Link>
            ) : (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchTerm('')
                  setFilterCandidateId('')
                  setFilterInterviewerId('')
                  setFilterStatus('')
                  setFilterRound('')
                  setFilterDate('')
                }}
                className="mx-auto"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          <InterviewTable
            interviews={filteredInterviews}
            onStatusChangeClick={handleStatusChangeClick}
          />
        ) : (
          <InterviewCalendar
            interviews={filteredInterviews}
            onStatusChangeClick={handleStatusChangeClick}
          />
        )}
      </LightCard>

      {transitionInterviewId && transitionCurrentStatus && (
        <InterviewStatusModal
          isOpen={transitionInterviewId !== null}
          onClose={() => {
            setTransitionInterviewId(null)
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
