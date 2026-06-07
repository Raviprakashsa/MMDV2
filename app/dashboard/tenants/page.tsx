"use client"
import React, { useEffect, useState } from 'react'
import TenantTable from '@/components/tenants/TenantTable'
import { useRouter } from 'next/navigation'

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/v1/tenants')
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Failed to load')
        if (mounted) setTenants(data)
      } catch (err: any) {
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  if (loading) return <div>Loading tenants...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>

  return (
    <div>
      <h1>Tenants</h1>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => router.push('/dashboard/tenants/new')}>New Tenant</button>
      </div>
      <TenantTable
        tenants={tenants ?? []}
        onView={(id) => router.push(`/dashboard/tenants/${id}`)}
        onEdit={(id) => router.push(`/dashboard/tenants/${id}/edit`)}
      />
    </div>
  )
}
