import { NextResponse } from 'next/server'
import { z } from 'zod'
import { tenantBrandingService } from '@/lib/foundation/services/tenant-branding.service'
import { runApi } from '@/lib/core/route-utils'

const UpsertBrandingSchema = z.object({
  displayName: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  faviconUrl: z.string().nullable().optional(),
  primaryColor: z.string().nullable().optional(),
  secondaryColor: z.string().nullable().optional(),
  accentColor: z.string().nullable().optional(),
  supportEmail: z.string().nullable().optional(),
})

export async function GET(_request: Request, context: any) {
  return runApi(async () => {
    const p = context.params
    const params = p && typeof p.then === 'function' ? await p : p
    const tenantId = params.id
    // TODO: RBAC placeholder
    const branding = await tenantBrandingService.getByTenantId(tenantId)
    return branding
  })
}

export async function PATCH(request: Request, context: any) {
  return runApi(async () => {
    const p = context.params
    const params = p && typeof p.then === 'function' ? await p : p
    const tenantId = params.id
    const body = await request.json()
    const parsed = UpsertBrandingSchema.parse(body)
    const input = { tenantId, ...parsed }
    // TODO: RBAC placeholder
    const upserted = await tenantBrandingService.upsert(input)
    return upserted
  })
}
