'use client'
import React, { useEffect, useState } from 'react'
import UserForm from '@/components/ui/UserForm'
import { getUser, updateUser } from '@/lib/ui/api'
import { useRouter, useParams } from 'next/navigation'
import Loading from '@/components/ui/Loading'

export default function Page() {
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id || '')
  const router = useRouter()
  const [data, setData] = useState<any | null>(null)

  useEffect(() => { load() }, [id])
  async function load() { const res = await getUser(id); setData(res) }

  if (!data) return <Loading />

  return (
    <div>
      <h2>Edit User</h2>
      <UserForm initial={data} onSubmit={async (d) => { await updateUser(id, d); router.push('/a2/users') }} />
    </div>
  )
}
