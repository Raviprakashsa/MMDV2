"use client"
import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import TenantForm from '@/components/tenants/TenantForm'

export default function EditTenantPage() {
  const params = useParams()
  const id = params?.id
  const router = useRouter()
  const [initial, setInitial] = useState<any | null>(null)
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
        if (mounted) setInitial(data)
      } catch (err: any) {
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  if (loading) return <div>Loading...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!initial) return <div>Tenant not found.</div>

  return (
    <div>
      <h1>Edit Tenant</h1>
      <TenantForm
        mode="edit"
        initial={initial}
        onSuccess={() => router.push(`/dashboard/tenants/${id}`)}
      />
    </div>
  )
}
