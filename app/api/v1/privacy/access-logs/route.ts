import runApi, { getAuthenticatedTenantContext } from '@/lib/core/route-utils'
import { dataAccessLogService } from '@/lib/foundation/services/data-access-log.service'
import { z } from 'zod'

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(100),
})

export async function GET(request: Request) {
  return runApi(async () => {
    const parsed = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams.entries()))
    const ctx = await getAuthenticatedTenantContext()
    return dataAccessLogService.getLogs(ctx, parsed.limit)
  })
}
