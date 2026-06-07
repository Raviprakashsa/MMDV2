import runApi, { getAuthenticatedTenantContext } from '@/lib/core/route-utils'
import { z } from 'zod'
import { sessionService } from '@/lib/foundation/services'

export async function DELETE(request: Request, context: any) {
  return runApi(async () => {
    const params = await context.params
    const paramsSchema = z.object({ id: z.string().min(1) })
    const { id } = paramsSchema.parse(params)
    const ctx = await getAuthenticatedTenantContext()
    return sessionService.revoke(ctx, id)
  })
}
