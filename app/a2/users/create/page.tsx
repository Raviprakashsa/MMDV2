'use client'
import React from 'react'
import UserForm from '@/components/ui/UserForm'
import { createUser } from '@/lib/ui/api'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()
  return (
    <div>
      <h2>Create User</h2>
      <UserForm onSubmit={async (data) => { await createUser(data); router.push('/a2/users') }} />
    </div>
  )
}
