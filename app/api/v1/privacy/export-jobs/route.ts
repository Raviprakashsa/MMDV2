import runApi, { getAuthenticatedTenantContext } from '@/lib/core/route-utils'
import { exportJobService } from '@/lib/foundation/services/export-job.service'
import { z } from 'zod'

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
})

const createSchema = z.object({
  format: z.string().min(1),
})

export async function GET(request: Request) {
  return runApi(async () => {
    const parsed = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams.entries()))
    const ctx = await getAuthenticatedTenantContext()
    return exportJobService.getGdprJobs(ctx, parsed.limit)
  })
}

export async function POST(request: Request) {
  return runApi(async () => {
    const body = await request.json()
    const parsed = createSchema.parse(body)
    const ctx = await getAuthenticatedTenantContext()
    return exportJobService.createGdprJob(ctx, parsed.format)
  })
}
