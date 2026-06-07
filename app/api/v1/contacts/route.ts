import runApi, { getAuthenticatedTenantContext } from '@/lib/core/route-utils'
import { z } from 'zod'
import { contactService } from '@/lib/foundation/services'

const createSchema = z.object({
  companyId: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  title: z.string().min(1),
})

const querySchema = z.object({
  companyId: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  title: z.string().optional(),
})

export async function GET(request: Request) {
  return runApi(async () => {
    const parsed = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams.entries()))
    const ctx = await getAuthenticatedTenantContext()
    return contactService.list(ctx, parsed)
  })
}

export async function POST(request: Request) {
  return runApi(async () => {
    const body = await request.json()
    const parsed = createSchema.parse(body)
    const ctx = await getAuthenticatedTenantContext()
    return contactService.create(ctx, parsed)
  })
}
