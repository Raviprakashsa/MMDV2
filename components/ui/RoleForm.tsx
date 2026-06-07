'use client'
import React, { useState } from 'react'
import { createRoleSchema } from '@/lib/ui/schemas'

export default function RoleForm({ initial, onSubmit }: { initial?: any; onSubmit: (data: any) => Promise<void> }) {
  const [form, setForm] = useState({ name: initial?.name || '', description: initial?.description || '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const parsed = createRoleSchema.parse(form)
      setLoading(true)
      await onSubmit(parsed)
    } catch (err: any) {
      setError(err?.message || String(err))
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit}>
      <div>
        <label>Name</label>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <label>Description</label>
        <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
    </form>
  )
}
