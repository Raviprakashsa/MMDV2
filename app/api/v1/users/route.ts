import { z } from 'zod'
import runApi, { getAuthenticatedTenantContext } from '@/lib/core/route-utils'
import { userService } from '@/lib/foundation/services'

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  passwordHash: z.string(),
  roleId: z.string().optional(),
})

export async function GET(request: Request) {
  return runApi(async () => {
    const ctx = await getAuthenticatedTenantContext()
    return userService.list(ctx)
  })
}

export async function POST(request: Request) {
  return runApi(async () => {
    const body = await request.json()
    const parsed = createUserSchema.parse(body)
    const ctx = await getAuthenticatedTenantContext()
    return userService.create(ctx, { tenantId: ctx.tenantId, email: parsed.email, name: parsed.name, passwordHash: parsed.passwordHash, roleId: parsed.roleId })
  })
}
