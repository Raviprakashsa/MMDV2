'use client'
import React from 'react'
import RoleForm from '@/components/ui/RoleForm'
import { createRole } from '@/lib/ui/api'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()
  return (
    <div>
      <h2>Create Role</h2>
      <RoleForm onSubmit={async (d) => { await createRole(d); router.push('/a2/roles') }} />
    </div>
  )
}
