import runApi, { getAuthenticatedTenantContext } from '@/lib/core/route-utils'
import { z } from 'zod'
import { roleService } from '@/lib/foundation/services'

const createSchema = z.object({ code: z.string().optional(), name: z.string(), description: z.string().optional() })

export async function GET(request: Request) {
  return runApi(async () => {
    const ctx = await getAuthenticatedTenantContext()
    return roleService.list(ctx)
  })
}

export async function POST(request: Request) {
  return runApi(async () => {
    const body = await request.json()
    const parsed = createSchema.parse(body)
    const ctx = await getAuthenticatedTenantContext()
    return roleService.create(ctx, { tenantId: ctx.tenantId, name: parsed.name, description: parsed.description })
  })
}
