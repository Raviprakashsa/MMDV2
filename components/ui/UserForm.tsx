'use client'
import React, { useState } from 'react'
import { createUserSchema } from '@/lib/ui/schemas'
import { z } from 'zod'

export default function UserForm({ initial, onSubmit }: { initial?: any; onSubmit: (data: any) => Promise<void> }) {
  const [form, setForm] = useState({ email: initial?.email || '', name: initial?.name || '', passwordHash: '', roleId: initial?.roleId || '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const parsed = createUserSchema.parse(form)
      setLoading(true)
      await onSubmit(parsed)
    } catch (err: any) {
      if (err?.errors) setError(JSON.stringify(err.errors))
      else setError(err?.message || String(err))
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit}>
      <div>
        <label>Email</label>
        <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
      </div>
      <div>
        <label>Name</label>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <label>Password</label>
        <input value={form.passwordHash} onChange={e => setForm({ ...form, passwordHash: e.target.value })} type="password" />
      </div>
      <div>
        <label>Role ID</label>
        <input value={form.roleId} onChange={e => setForm({ ...form, roleId: e.target.value })} />
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
    </form>
  )
}
