'use client'
import React, { useEffect, useState } from 'react'
import { getRoles } from '@/lib/ui/api'
import Loading from '@/components/ui/Loading'
import { EmptyStateCard } from '@/components/ui/EmptyState'

export default function Page() {
  const [data, setData] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { load() }, [])
  async function load() {
    try { const res = await getRoles(); setData(res) } catch (err: any) { setError(err?.message || String(err)) }
  }

  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!data) return <Loading />
  if (data.length === 0) return <div>No roles found.</div>

  return (
    <div>
      <h2>Roles</h2>
      <ul>{data.map(r => <li key={r.id}>{r.name}</li>)}</ul>
    </div>
  )
}
