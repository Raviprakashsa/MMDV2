"use client"
import React from 'react'
import TenantForm from '@/components/tenants/TenantForm'
import { useRouter } from 'next/navigation'

export default function NewTenantPage() {
  const router = useRouter()
  return (
    <div>
      <h1>New Tenant</h1>
      <TenantForm
        mode="create"
        onSuccess={(data) => {
          // Navigate to tenant details after creation
          router.push(`/dashboard/tenants/${data.id}`)
        }}
      />
    </div>
  )
}
