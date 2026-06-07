'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { Select } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { InterviewStatus } from './InterviewStatusBadge'

interface InterviewStatusModalProps {
  isOpen: boolean
  onClose: () => void
  currentStatus: InterviewStatus
  onConfirm: (newStatus: InterviewStatus) => Promise<void>
  isLoading?: boolean
}

const statusOptions = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No Show' },
]

export default function InterviewStatusModal({
  isOpen,
  onClose,
  currentStatus,
  onConfirm,
  isLoading = false,
}: InterviewStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<InterviewStatus>(currentStatus)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedStatus === currentStatus) {
      onClose()
      return
    }
    await onConfirm(selectedStatus)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Interview Status" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 mb-2 dark:bg-slate-900/50 dark:border-slate-800">
          <span className="block text-xxs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1">
            Current Status
          </span>
          <span className="font-semibold text-sm capitalize text-[var(--foreground)]">
            {currentStatus.toLowerCase().replace('_', ' ')}
          </span>
        </div>

        <Select
          label="New Status *"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as InterviewStatus)}
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
