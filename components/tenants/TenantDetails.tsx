"use client"
import React from 'react'

export default function TenantDetails({ tenant }: { tenant: any }) {
  if (!tenant) return <div>Loading...</div>
  return (
    <div>
      <h2>{tenant.name}</h2>
      <p><strong>Slug:</strong> {tenant.slug}</p>
      <p><strong>Tenant ID:</strong> {tenant.tenantId}</p>
      <p><strong>Plan ID:</strong> {tenant.planId ?? '-'}</p>
      <p><strong>Active:</strong> {tenant.isActive ? 'Yes' : 'No'}</p>
    </div>
  )
}
