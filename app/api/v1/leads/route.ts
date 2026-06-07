import runApi, { getAuthenticatedTenantContext } from '@/lib/core/route-utils'
import { z } from 'zod'
import { leadService } from '@/lib/foundation/services'

const leadStatusSchema = z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'])

const createSchema = z.object({
  companyId: z.string().min(1).optional(),
  contactId: z.string().min(1).optional(),
  ownerId: z.string().min(1).optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  status: leadStatusSchema.optional(),
  value: z.union([z.string(), z.number()]),
})

const querySchema = z.object({
  companyId: z.string().optional(),
  contactId: z.string().optional(),
  ownerId: z.string().optional(),
  status: leadStatusSchema.optional(),
  title: z.string().optional(),
})

export async function GET(request: Request) {
  return runApi(async () => {
    const parsed = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams.entries()))
    const ctx = await getAuthenticatedTenantContext()
    return leadService.list(ctx, parsed)
  })
}

export async function POST(request: Request) {
  return runApi(async () => {
    const body = await request.json()
    const parsed = createSchema.parse(body)
    const ctx = await getAuthenticatedTenantContext()
    return leadService.create(ctx, parsed)
  })
}
