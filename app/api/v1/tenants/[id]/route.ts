import { NextResponse } from 'next/server'
import { z } from 'zod'
import { tenantService } from '@/lib/foundation/services/tenant.service'
import { runApi } from '@/lib/core/route-utils'

const UpdateTenantSchema = z.object({
  slug: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  planId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(_request: Request, context: any) {
  return runApi(async () => {
    const p = context.params
    const params = p && typeof p.then === 'function' ? await p : p
    const id = params.id
    // TODO: RBAC placeholder - validate access
    const tenant = await tenantService.getById(id)
    return tenant
  })
}

export async function PATCH(request: Request, context: any) {
  return runApi(async () => {
    const p = context.params
    const params = p && typeof p.then === 'function' ? await p : p
    const id = params.id
    const body = await request.json()
    const parsed = UpdateTenantSchema.parse(body)
    // TODO: RBAC placeholder - validate permission to update tenant
    const updated = await tenantService.updateById(id, parsed)
    return updated
  })
}
