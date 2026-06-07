import runApi, { getAuthenticatedTenantContext } from '@/lib/core/route-utils'
import { z } from 'zod'
import { interviewService } from '@/lib/foundation/services'

const createSchema = z.object({
  applicationId: z.string().min(1),
  interviewerId: z.string().min(1),
  round: z.number().int().min(1).optional(),
  feedback: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  scheduledAt: z.string().min(1), // ISO Date string
})

export async function GET(request: Request) {
  return runApi(async () => {
    const ctx = await getAuthenticatedTenantContext()
    return interviewService.list(ctx)
  })
}

export async function POST(request: Request) {
  return runApi(async () => {
    const body = await request.json()
    const parsed = createSchema.parse(body)
    const ctx = await getAuthenticatedTenantContext()
    return interviewService.create(ctx, parsed)
  })
}
