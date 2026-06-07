'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Users, AlertCircle } from 'lucide-react'
import { PageContainer } from '@/components/ui/PageContainer'
import { LightCard } from '@/components/ui/GlassCard'
import CandidateTable from '@/components/ats/candidates/CandidateTable'
import CandidateFilters from '@/components/ats/candidates/CandidateFilters'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { ConfirmDialog } from '@/components/ui/Modal'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { getCandidates, deleteCandidate } from '@/lib/ui/api'

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
}

export default function CandidatesPage() {
  const toast = useToast()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters State
  const [searchTerm, setSearchTerm] = useState('')
  const [company, setCompany] = useState('')
  const [designation, setDesignation] = useState('')
  const [experience, setExperience] = useState('')

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch candidates
  const fetchCandidates = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getCandidates()
      setCandidates(data || [])
    } catch (err: any) {
      console.error('Error fetching candidates:', err)
      setError(err?.message || 'Failed to load candidates')
      toast.error('Error', err?.message || 'Failed to load candidates')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  // Live filter candidates locally
  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const fullName = `${candidate.firstName} ${candidate.lastName}`.toLowerCase()
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCompany = company
        ? (candidate.currentCompany || '').toLowerCase().includes(company.toLowerCase())
        : true

      const matchesDesignation = designation
        ? (candidate.currentDesignation || '').toLowerCase().includes(designation.toLowerCase())
        : true

      // Handle minimum experience experience filter
      let matchesExperience = true
      if (experience) {
        const minExp = Number(experience)
        const exp = candidate.totalExperience !== null && candidate.totalExperience !== undefined ? Number(candidate.totalExperience) : 0
        matchesExperience = exp >= minExp
      }

      return matchesSearch && matchesCompany && matchesDesignation && matchesExperience
    })
  }, [candidates, searchTerm, company, designation, experience])

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await deleteCandidate(deleteId)
      toast.success('Success', 'Candidate profile has been deleted successfully')
      setCandidates((prev) => prev.filter((c) => c.id !== deleteId))
    } catch (err: any) {
      toast.error('Error', err?.message || 'Failed to delete candidate')
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
              Candidate Directory
            </h1>
            <p className="mt-1.5 text-sm text-[var(--foreground-muted)]">
              Search, filter, and manage applicant profiles, screen resumes, and track active candidate details.
            </p>
          </div>
          <Link href="/ats/candidates/new">
            <Button className="btn-gradient shadow-md flex items-center gap-2">
              <Plus className="w-4.5 h-4.5" />
              Add Candidate
            </Button>
          </Link>
        </div>
      }
    >
      <LightCard className="mb-6 p-6">
        <CandidateFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          company={company}
          onCompanyChange={setCompany}
          designation={designation}
          onDesignationChange={setDesignation}
          experience={experience}
          onExperienceChange={setExperience}
        />

        {isLoading ? (
          <SkeletonTable rows={5} />
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center shadow-sm">
            <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-3" />
            <h3 className="text-lg font-bold text-red-800 mb-1">Failed to Load Candidates</h3>
            <p className="text-sm text-red-700/80 mb-4">{error}</p>
            <Button variant="secondary" onClick={fetchCandidates} className="mx-auto">
              Try Again
            </Button>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 border-dashed bg-white/40 p-12 text-center shadow-sm">
            <Users className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
              {candidates.length === 0 ? 'No Candidates Registered' : 'No Match Found'}
            </h3>
            <p className="text-sm text-[var(--foreground-muted)] max-w-sm mx-auto mb-6">
              {candidates.length === 0
                ? "Start building your recruiting pool by registering your first candidate profile."
                : "No matching candidate records discovered. Refine or reset your filters to broaden your search."}
            </p>
            {candidates.length === 0 ? (
              <Link href="/ats/candidates/new">
                <Button className="btn-gradient mx-auto flex items-center gap-2">
                  <Plus className="w-4.5 h-4.5" />
                  Add First Candidate
                </Button>
              </Link>
            ) : (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchTerm('')
                  setCompany('')
                  setDesignation('')
                  setExperience('')
                }}
                className="mx-auto"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <CandidateTable candidates={filteredCandidates} onDelete={handleDeleteClick} />
        )}
      </LightCard>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Candidate Profile?"
        message="Are you absolutely sure you want to delete this candidate profile? This action will remove the candidate from your active pool."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </PageContainer>
  )
}
