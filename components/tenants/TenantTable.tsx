"use client"
import React from 'react'

export interface Tenant {
  id: string
  tenantId: string
  planId?: string
  slug: string
  name: string
  isActive?: boolean
}

export default function TenantTable({
  tenants,
  onView,
  onEdit,
}: {
  tenants: Tenant[]
  onView: (id: string) => void
  onEdit: (id: string) => void
}) {
  if (!tenants) return <div>Loading...</div>
  if (tenants.length === 0) return <div>No tenants found.</div>

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Slug</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Plan</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Active</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {tenants.map((t) => (
          <tr key={t.id}>
            <td style={{ padding: 8 }}>{t.name}</td>
            <td style={{ padding: 8 }}>{t.slug}</td>
            <td style={{ padding: 8 }}>{t.planId ?? '-'}</td>
            <td style={{ padding: 8 }}>{t.isActive ? 'Yes' : 'No'}</td>
            <td style={{ padding: 8 }}>
              <button onClick={() => onView(t.id)} style={{ marginRight: 8 }}>
                View
              </button>
              <button onClick={() => onEdit(t.id)}>Edit</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
