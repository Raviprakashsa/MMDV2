import runApi, { getAuthenticatedTenantContext } from '@/lib/core/route-utils'
import { z } from 'zod'
import { candidateService } from '@/lib/foundation/services'

const paramsSchema = z.object({ id: z.string().min(1) })
const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  currentLocation: z.string().optional().nullable(),
  totalExperience: z.union([z.number(), z.string()]).optional().nullable(),
  currentCompany: z.string().optional().nullable(),
  currentDesignation: z.string().optional().nullable(),
  resumeUrl: z.string().url().min(1).optional(),
  linkedinUrl: z.string().url().optional().nullable(),
  portfolioUrl: z.string().url().optional().nullable(),
})

export async function GET(request: Request, context: any) {
  return runApi(async () => {
    const params = await context.params
    const { id } = paramsSchema.parse(params)
    const ctx = await getAuthenticatedTenantContext()
    return candidateService.get(ctx, id)
  })
}

export async function PATCH(request: Request, context: any) {
  return runApi(async () => {
    const params = await context.params
    const { id } = paramsSchema.parse(params)
    const body = await request.json()
    const parsed = updateSchema.parse(body)
    const ctx = await getAuthenticatedTenantContext()
    return candidateService.update(ctx, id, parsed)
  })
}

export async function DELETE(request: Request, context: any) {
  return runApi(async () => {
    const params = await context.params
    const { id } = paramsSchema.parse(params)
    const ctx = await getAuthenticatedTenantContext()
    return candidateService.delete(ctx, id)
  })
}
