"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import TenantDetails from '@/components/tenants/TenantDetails'

export default function TenantPage() {
  const params = useParams()
  const id = params?.id
  const [tenant, setTenant] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/v1/tenants/${id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Failed to load')
        if (mounted) setTenant(data)
      } catch (err: any) {
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  if (loading) return <div>Loading tenant...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>

  return (
    <div>
      <h1>Tenant</h1>
      <TenantDetails tenant={tenant} />
    </div>
  )
}
