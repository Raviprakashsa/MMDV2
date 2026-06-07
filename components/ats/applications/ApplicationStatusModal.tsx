'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { Select } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { ApplicationStatus } from './ApplicationStatusBadge'

interface ApplicationStatusModalProps {
  isOpen: boolean
  onClose: () => void
  currentStatus: ApplicationStatus
  onConfirm: (newStatus: ApplicationStatus) => Promise<void>
  isLoading?: boolean
}

const statusOptions = [
  { value: 'APPLIED', label: 'Applied' },
  { value: 'SCREENING', label: 'Screening' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'OFFERED', label: 'Offered' },
  { value: 'HIRED', label: 'Hired' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
]

export default function ApplicationStatusModal({
  isOpen,
  onClose,
  currentStatus,
  onConfirm,
  isLoading = false,
}: ApplicationStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>(currentStatus)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedStatus === currentStatus) {
      onClose()
      return
    }
    await onConfirm(selectedStatus)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Application Status" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 mb-2">
          <span className="block text-xxs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1">
            Current Status
          </span>
          <span className="font-semibold text-sm capitalize text-[var(--foreground)]">
            {currentStatus.toLowerCase()}
          </span>
        </div>

        <Select
          label="New Status *"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as ApplicationStatus)}
          options={statusOptions}
        />

        <div className="flex gap-3 justify-end pt-4 border-t border-border/50">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Update Status
          </Button>
        </div>
      </form>
    </Modal>
  )
}
