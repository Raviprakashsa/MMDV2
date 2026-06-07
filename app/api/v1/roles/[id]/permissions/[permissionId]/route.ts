import runApi, { getAuthenticatedTenantContext } from '@/lib/core/route-utils'
import { rolePermissionService } from '@/lib/foundation/services'
import { z } from 'zod'

export async function DELETE(request: Request, context: any) {
  return runApi(async () => {
    const params = await context.params
    const paramsSchema = z.object({ id: z.string().min(1), permissionId: z.string().min(1) })
    const { id, permissionId } = paramsSchema.parse(params)
    const ctx = await getAuthenticatedTenantContext()
    return rolePermissionService.remove(ctx, id, permissionId)
  })
}
