import runApi, { getAuthenticatedTenantContext } from '@/lib/core/route-utils'
import { z } from 'zod'
import { rolePermissionService } from '@/lib/foundation/services'

const bodySchema = z.object({ permissionId: z.string() })

export async function POST(request: Request, context: any) {
  return runApi(async () => {
    const params = await context.params
    const paramsSchema = z.object({ id: z.string().min(1) })
    const { id } = paramsSchema.parse(params)
    const body = await request.json()
    const parsed = bodySchema.parse(body)
    const ctx = await getAuthenticatedTenantContext()
    return rolePermissionService.assign(ctx, id, parsed.permissionId)
  })
}
