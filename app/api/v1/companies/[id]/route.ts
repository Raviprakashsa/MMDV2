import runApi, { getAuthenticatedTenantContext } from '@/lib/core/route-utils'
import { z } from 'zod'
import { companyService } from '@/lib/foundation/services'

const paramsSchema = z.object({ id: z.string().min(1) })
const updateSchema = z.object({
  name: z.string().min(1).optional(),
  website: z.string().min(1).optional(),
  industry: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email().optional(),
})

export async function GET(request: Request, context: any) {
  return runApi(async () => {
    const params = await context.params
    const { id } = paramsSchema.parse(params)
    const ctx = await getAuthenticatedTenantContext()
    return companyService.get(ctx, id)
  })
}

export async function PATCH(request: Request, context: any) {
  return runApi(async () => {
    const params = await context.params
    const { id } = paramsSchema.parse(params)
    const body = await request.json()
    const parsed = updateSchema.parse(body)
    const ctx = await getAuthenticatedTenantContext()
    return companyService.update(ctx, id, parsed)
  })
}

export async function DELETE(request: Request, context: any) {
  return runApi(async () => {
    const params = await context.params
    const { id } = paramsSchema.parse(params)
    const ctx = await getAuthenticatedTenantContext()
    return companyService.deactivate(ctx, id)
  })
}
