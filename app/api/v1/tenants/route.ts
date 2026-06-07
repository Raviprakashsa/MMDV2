import { NextResponse } from 'next/server'
import { z } from 'zod'
import { tenantService } from '@/lib/foundation/services/tenant.service'
import { runApi } from '@/lib/core/route-utils'

const CreateTenantSchema = z.object({
  tenantId: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  planId: z.string().min(1),
})

export async function POST(request: Request) {
  return runApi(async () => {
    const body = await request.json()
    const parsed = CreateTenantSchema.parse(body)

    // TODO: RBAC placeholder - ensure caller has permission to create tenants
    const tenant = await tenantService.create(parsed)
    return NextResponse.json(tenant, { status: 201 })
  })
}
