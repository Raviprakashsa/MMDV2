'use client'
import React, { useEffect, useState } from 'react'
import { getSessions, revokeSession } from '@/lib/ui/api'
import Loading from '@/components/ui/Loading'

export default function Page() {
  const [data, setData] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { load() }, [])
  async function load() { try { const res = await getSessions(); setData(res) } catch (err: any) { setError(err?.message || String(err)) } }
  async function revoke(id: string) { try { await revokeSession(id); await load() } catch (err: any) { setError(err?.message || String(err)) } }
  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!data) return <Loading />
  if (data.length === 0) return <div>No sessions</div>
  return (<div><h2>Sessions</h2><ul>{data.map(s => <li key={s.id}>{s.id} — {s.userId} <button onClick={() => revoke(s.id)}>Revoke</button></li>)}</ul></div>)
}
