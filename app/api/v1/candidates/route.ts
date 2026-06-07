import runApi, { getAuthenticatedTenantContext } from '@/lib/core/route-utils'
import { z } from 'zod'
import { candidateService } from '@/lib/foundation/services'

const createSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  currentLocation: z.string().optional().nullable(),
  totalExperience: z.union([z.number(), z.string()]).optional().nullable(),
  currentCompany: z.string().optional().nullable(),
  currentDesignation: z.string().optional().nullable(),
  resumeUrl: z.string().url().min(1),
  linkedinUrl: z.string().url().optional().nullable(),
  portfolioUrl: z.string().url().optional().nullable(),
})

export async function GET(request: Request) {
  return runApi(async () => {
    const ctx = await getAuthenticatedTenantContext()
    return candidateService.list(ctx)
  })
}

export async function POST(request: Request) {
  return runApi(async () => {
    const body = await request.json()
    const parsed = createSchema.parse(body)
    const ctx = await getAuthenticatedTenantContext()
    return candidateService.create(ctx, parsed)
  })
}
