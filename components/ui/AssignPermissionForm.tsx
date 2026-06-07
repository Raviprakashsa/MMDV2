'use client'
import React, { useState } from 'react'
import { assignPermissionSchema } from '@/lib/ui/schemas'

export default function AssignPermissionForm({ onSubmit }: { onSubmit: (data: any) => Promise<void> }) {
  const [permissionId, setPermissionId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const parsed = assignPermissionSchema.parse({ permissionId })
      setLoading(true)
      await onSubmit(parsed)
    } catch (err: any) {
      setError(err?.message || String(err))
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit}>
      <div>
        <label>Permission ID</label>
        <input value={permissionId} onChange={e => setPermissionId(e.target.value)} />
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={loading}>{loading ? 'Assigning...' : 'Assign'}</button>
    </form>
  )
}
