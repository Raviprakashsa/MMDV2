'use client'
import React, { useEffect, useState } from 'react'
import { getUsers } from '@/lib/ui/api'
import Loading from '@/components/ui/Loading'
import { EmptyStateCard } from '@/components/ui/EmptyState'

export default function Page() {
  const [data, setData] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { load() }, [])
  async function load() {
    try {
      const res = await getUsers()
      setData(res)
    } catch (err: any) { setError(err?.message || String(err)) }
  }

  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!data) return <Loading />
  if (data.length === 0) return <div>No users found for this tenant.</div>

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {data.map(u => <li key={u.id}>{u.email} — {u.name}</li>)}
      </ul>
    </div>
  )
}
