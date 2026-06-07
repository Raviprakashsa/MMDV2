import runApi, { getAuthenticatedTenantContext } from '@/lib/core/route-utils'
import { z } from 'zod'
import { userService } from '@/lib/foundation/services'

const updateSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
  roleId: z.string().optional(),
})

export async function GET(request: Request, context: any) {
  return runApi(async () => {
    const params = await context.params
    const paramsSchema = z.object({ id: z.string().min(1) })
    const { id } = paramsSchema.parse(params)
    const ctx = await getAuthenticatedTenantContext()
    return userService.get(ctx, id)
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
    return userService.update(ctx, id, parsed)
  })
}
