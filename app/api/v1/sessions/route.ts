import runApi, { getAuthenticatedTenantContext } from '@/lib/core/route-utils'
import { sessionService } from '@/lib/foundation/services'

export async function GET(request: Request) {
  return runApi(async () => {
    const ctx = await getAuthenticatedTenantContext()
    return sessionService.list(ctx)
  })
}
