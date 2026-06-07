import runApi, { getAuthenticatedTenantContext } from '@/lib/core/route-utils'
import { z } from 'zod'
import { interviewService } from '@/lib/foundation/services'

const paramsSchema = z.object({ id: z.string().min(1) })
const updateSchema = z.object({
  interviewerId: z.string().min(1).optional(),
  round: z.number().int().min(1).optional(),
  feedback: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  scheduledAt: z.string().min(1).optional(),
})

export async function GET(request: Request, context: any) {
  return runApi(async () => {
    const params = await context.params
    const { id } = paramsSchema.parse(params)
    const ctx = await getAuthenticatedTenantContext()
    return interviewService.get(ctx, id)
  })
}

export async function PATCH(request: Request, context: any) {
  return runApi(async () => {
    const params = await context.params
    const { id } = paramsSchema.parse(params)
    const body = await request.json()
    const parsed = updateSchema.parse(body)
    const ctx = await getAuthenticatedTenantContext()
    return interviewService.update(ctx, id, parsed)
  })
}
