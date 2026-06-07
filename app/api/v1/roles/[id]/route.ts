import runApi, { getAuthenticatedTenantContext } from '@/lib/core/route-utils'
import { z } from 'zod'
import { roleService } from '@/lib/foundation/services'

const updateSchema = z.object({ name: z.string().optional(), description: z.string().optional() })

export async function GET(request: Request, context: any) {
  return runApi(async () => {
    const params = await context.params
    const paramsSchema = z.object({ id: z.string().min(1) })
    const { id } = paramsSchema.parse(params)
    const ctx = await getAuthenticatedTenantContext()
    return roleService.get(ctx, id)
  })
}

export async function PATCH(request: Request, context: any) {
  return runApi(async () => {
    const params = await context.params
    const paramsSchema = z.object({ id: z.string().min(1) })
    const { id } = paramsSchema.parse(params)
    const body = await request.json()
    const parsed = updateSchema.parse(body)
    const ctx = await getAuthenticatedTenantContext()
    return roleService.update(ctx, id, parsed)
  })
}
