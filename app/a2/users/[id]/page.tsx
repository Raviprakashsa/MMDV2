'use client'
import React, { useEffect, useState } from 'react'
import { getUser } from '@/lib/ui/api'
import Loading from '@/components/ui/Loading'
import { useRouter, useParams } from 'next/navigation'

export default function Page() {
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id || '')
  const [data, setData] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { load() }, [id])
  async function load() {
    try { const res = await getUser(id); setData(res) } catch (err: any) { setError(err?.message || String(err)) }
  }

  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!data) return <Loading />

  return (
    <div>
      <h2>User</h2>
      <div>Email: {data.email}</div>
      <div>Name: {data.name}</div>
      <div>Role: {data.roleId}</div>
    </div>
  )
}
