import runApi, { getAuthenticatedTenantContext } from '@/lib/core/route-utils'
import { z } from 'zod'
import { jobPostingService } from '@/lib/foundation/services'

const createSchema = z.object({
  title: z.string().min(1),
  department: z.string().min(1),
  location: z.string().min(1),
  employmentType: z.string().min(1),
  description: z.string().min(1),
  requirements: z.string().min(1),
  salaryMin: z.union([z.number(), z.string()]).optional().nullable(),
  salaryMax: z.union([z.number(), z.string()]).optional().nullable(),
  status: z.enum(['DRAFT', 'OPEN', 'CLOSED', 'ON_HOLD']).optional(),
})

export async function GET(request: Request) {
  return runApi(async () => {
    const ctx = await getAuthenticatedTenantContext()
    return jobPostingService.list(ctx)
  })
}

export async function POST(request: Request) {
  return runApi(async () => {
    const body = await request.json()
    const parsed = createSchema.parse(body)
    const ctx = await getAuthenticatedTenantContext()
    return jobPostingService.create(ctx, parsed)
  })
}
