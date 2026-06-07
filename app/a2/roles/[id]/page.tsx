'use client'
import React, { useEffect, useState } from 'react'
import { getRole } from '@/lib/ui/api'
import Loading from '@/components/ui/Loading'
import { useParams } from 'next/navigation'

export default function Page() {
  const params = useParams(); const id = Array.isArray(params?.id) ? params.id[0] : (params?.id || '')
  const [data, setData] = useState<any | null>(null)
  useEffect(() => { load() }, [id])
  async function load() { const res = await getRole(id); setData(res) }
  if (!data) return <Loading />
  return (<div><h2>Role</h2><div>{data.name}</div><div>{data.description}</div></div>)
}
