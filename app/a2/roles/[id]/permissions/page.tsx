'use client'
import React, { useEffect, useState } from 'react'
import { getPermissions, assignRolePermission, removeRolePermission } from '@/lib/ui/api'
import AssignPermissionForm from '@/components/ui/AssignPermissionForm'
import { useParams } from 'next/navigation'

export default function Page() {
  const params = useParams(); const roleId = Array.isArray(params?.id) ? params.id[0] : (params?.id || '')
  const [perms, setPerms] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { load() }, [])
  async function load() { try { const res = await getPermissions(); setPerms(res) } catch (err: any) { setError(err?.message || String(err)) } }
  async function assign(d: any) { try { await assignRolePermission(roleId as string, d.permissionId); await load() } catch (err: any) { setError(err?.message || String(err)) } }
  async function remove(permissionId: string) { try { await removeRolePermission(roleId as string, permissionId); await load() } catch (err: any) { setError(err?.message || String(err)) } }

  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!perms) return <div>Loading...</div>

  return (<div><h2>Role Permissions</h2><AssignPermissionForm onSubmit={assign} /><ul>{perms.map(p => <li key={p.id}>{p.code || p.name} <button onClick={() => remove(p.id)}>Remove</button></li>)}</ul></div>)
}
