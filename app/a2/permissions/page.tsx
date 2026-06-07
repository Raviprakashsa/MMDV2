'use client'
import React, { useEffect, useState } from 'react'
import { getPermissions } from '@/lib/ui/api'
import Loading from '@/components/ui/Loading'

export default function Page() {
  const [data, setData] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { load() }, [])
  async function load() { try { const res = await getPermissions(); setData(res) } catch (err: any) { setError(err?.message || String(err)) } }
  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!data) return <Loading />
  return (<div><h2>Permissions</h2><ul>{data.map(p => <li key={p.id}>{p.code || p.name}</li>)}</ul></div>)
}
