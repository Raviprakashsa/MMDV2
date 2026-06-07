import runApi, { getAuthenticatedTenantContext } from '@/lib/core/route-utils'
import { z } from 'zod'
import { jobPostingService } from '@/lib/foundation/services'

const paramsSchema = z.object({ id: z.string().min(1) })
const updateSchema = z.object({
  title: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  employmentType: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  requirements: z.string().min(1).optional(),
  salaryMin: z.union([z.number(), z.string()]).optional().nullable(),
  salaryMax: z.union([z.number(), z.string()]).optional().nullable(),
  status: z.enum(['DRAFT', 'OPEN', 'CLOSED', 'ON_HOLD']).optional(),
})

export async function GET(request: Request, context: any) {
  return runApi(async () => {
    const params = await context.params
    const { id } = paramsSchema.parse(params)
    const ctx = await getAuthenticatedTenantContext()
    return jobPostingService.get(ctx, id)
  })
}

export async function PATCH(request: Request, context: any) {
  return runApi(async () => {
    const params = await context.params
    const { id } = paramsSchema.parse(params)
    const body = await request.json()
    const parsed = updateSchema.parse(body)
    const ctx = await getAuthenticatedTenantContext()
    return jobPostingService.update(ctx, id, parsed)
  })
}

export async function DELETE(request: Request, context: any) {
  return runApi(async () => {
    const params = await context.params
    const { id } = paramsSchema.parse(params)
    const ctx = await getAuthenticatedTenantContext()
    return jobPostingService.delete(ctx, id)
  })
}
