"use client"
import React, { useState } from 'react'
import { z } from 'zod'

const CreateTenantSchema = z.object({
  tenantId: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  planId: z.string().min(1),
})

const UpdateTenantSchema = z.object({
  slug: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  planId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
})

export default function TenantForm({
  initial,
  onSuccess,
  mode = 'create',
}: {
  initial?: any
  onSuccess?: (data: any) => void
  mode?: 'create' | 'edit'
}) {
  const [form, setForm] = useState(() => ({
    tenantId: initial?.tenantId ?? '',
    slug: initial?.slug ?? '',
    name: initial?.name ?? '',
    planId: initial?.planId ?? '',
    isActive: initial?.isActive ?? true,
  }))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validate = () => {
    try {
      if (mode === 'create') CreateTenantSchema.parse(form)
      else UpdateTenantSchema.parse(form)
      return true
    } catch (err: any) {
      if (err?.errors) setError(JSON.stringify(err.errors))
      else setError('Validation failed')
      return false
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!validate()) return
    setLoading(true)
    try {
      const url = mode === 'create' ? '/api/v1/tenants' : `/api/v1/tenants/${initial.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'
      const body = mode === 'create'
        ? { tenantId: form.tenantId, slug: form.slug, name: form.name, planId: form.planId }
        : { slug: form.slug, name: form.name, planId: form.planId, isActive: form.isActive }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ? JSON.stringify(data.error) : 'API error')
      onSuccess?.(data)
    } catch (err: any) {
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 600 }}>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {mode === 'create' && (
        <div style={{ marginBottom: 8 }}>
          <label>Tenant ID</label>
          <input value={form.tenantId} onChange={(e) => setForm({ ...form, tenantId: e.target.value })} />
        </div>
      )}
      <div style={{ marginBottom: 8 }}>
        <label>Name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>Slug</label>
        <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>Plan ID</label>
        <input value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value })} />
      </div>
      {mode === 'edit' && (
        <div style={{ marginBottom: 8 }}>
          <label>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active
          </label>
        </div>
      )}
      <div>
        <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  )
}
