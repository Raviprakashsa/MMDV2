'use client'
import React, { useEffect, useState } from 'react'
import RoleForm from '@/components/ui/RoleForm'
import { getRole, updateRole } from '@/lib/ui/api'
import { useRouter, useParams } from 'next/navigation'
import Loading from '@/components/ui/Loading'

export default function Page() {
  const params = useParams(); const id = Array.isArray(params?.id) ? params.id[0] : (params?.id || '')
  const router = useRouter()
  const [data, setData] = useState<any | null>(null)
  useEffect(() => { load() }, [id])
  async function load() { const res = await getRole(id); setData(res) }
  if (!data) return <Loading />
  return (<div><h2>Edit Role</h2><RoleForm initial={data} onSubmit={async (d) => { await updateRole(id, d); router.push('/a2/roles') }} /></div>)
}
