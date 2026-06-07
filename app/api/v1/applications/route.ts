import runApi, { getAuthenticatedTenantContext } from '@/lib/core/route-utils'
import { z } from 'zod'
import { applicationService } from '@/lib/foundation/services'

const createSchema = z.object({
  candidateId: z.string().min(1),
  jobPostingId: z.string().min(1),
  status: z.enum([
    'APPLIED',
    'SCREENING',
    'SHORTLISTED',
    'INTERVIEW',
    'OFFERED',
    'HIRED',
    'REJECTED',
    'WITHDRAWN',
  ]).optional(),
  appliedAt: z.union([z.string(), z.date()]).optional(),
})

export async function GET(request: Request) {
  return runApi(async () => {
    const ctx = await getAuthenticatedTenantContext()
    return applicationService.list(ctx)
  })
}

export async function POST(request: Request) {
  return runApi(async () => {
    const body = await request.json()
    const parsed = createSchema.parse(body)
    const ctx = await getAuthenticatedTenantContext()
    return applicationService.create(ctx, parsed)
  })
}
