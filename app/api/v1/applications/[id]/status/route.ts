import runApi, { getAuthenticatedTenantContext } from '@/lib/core/route-utils'
import { z } from 'zod'
import { applicationService } from '@/lib/foundation/services'

const paramsSchema = z.object({ id: z.string().min(1) })
const statusSchema = z.object({
  status: z.enum([
    'APPLIED',
    'SCREENING',
    'SHORTLISTED',
    'INTERVIEW',
    'OFFERED',
    'HIRED',
    'REJECTED',
    'WITHDRAWN',
  ]),
})

export async function POST(request: Request, context: any) {
  return runApi(async () => {
    const params = await context.params
    const { id } = paramsSchema.parse(params)
    const body = await request.json()
    const { status } = statusSchema.parse(body)
    const ctx = await getAuthenticatedTenantContext()
    return applicationService.changeStatus(ctx, id, status)
  })
}
