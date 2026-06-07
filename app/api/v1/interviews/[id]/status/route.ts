import runApi, { getAuthenticatedTenantContext } from '@/lib/core/route-utils'
import { z } from 'zod'
import { interviewService } from '@/lib/foundation/services'

const paramsSchema = z.object({ id: z.string().min(1) })
const statusSchema = z.object({
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
})

export async function POST(request: Request, context: any) {
  return runApi(async () => {
    const params = await context.params
    const { id } = paramsSchema.parse(params)
    const body = await request.json()
    const { status } = statusSchema.parse(body)
    const ctx = await getAuthenticatedTenantContext()
    return interviewService.changeStatus(ctx, id, status)
  })
}
