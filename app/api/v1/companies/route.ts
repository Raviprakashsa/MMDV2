import runApi, { getAuthenticatedTenantContext } from '@/lib/core/route-utils'
import { z } from 'zod'
import { companyService } from '@/lib/foundation/services'

const createSchema = z.object({
  name: z.string().min(1),
  website: z.string().min(1),
  industry: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
})

const querySchema = z.object({
  name: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
})

export async function GET(request: Request) {
  return runApi(async () => {
    const parsed = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams.entries()))
    const ctx = await getAuthenticatedTenantContext()
    return companyService.list(ctx, parsed)
  })
}

export async function POST(request: Request) {
  return runApi(async () => {
    const body = await request.json()
    const parsed = createSchema.parse(body)
    const ctx = await getAuthenticatedTenantContext()
    return companyService.create(ctx, parsed)
  })
}
