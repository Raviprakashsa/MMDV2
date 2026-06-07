import runApi, { getAuthenticatedTenantContext } from '@/lib/core/route-utils'
import { z } from 'zod'
import { leadService } from '@/lib/foundation/services'

const paramsSchema = z.object({ id: z.string().min(1) })
const leadStatusSchema = z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'])
const updateSchema = z.object({
  companyId: z.string().min(1).optional(),
  contactId: z.string().min(1).optional(),
  ownerId: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: leadStatusSchema.optional(),
  value: z.union([z.string(), z.number()]).optional(),
})

export async function GET(request: Request, context: any) {
  return runApi(async () => {
    const params = await context.params
    const { id } = paramsSchema.parse(params)
    const ctx = await getAuthenticatedTenantContext()
    return leadService.get(ctx, id)
  })
}

export async function PATCH(request: Request, context: any) {
  return runApi(async () => {
    const params = await context.params
    const { id } = paramsSchema.parse(params)
    const body = await request.json()
    const parsed = updateSchema.parse(body)
    const ctx = await getAuthenticatedTenantContext()
    return leadService.update(ctx, id, parsed)
  })
}
