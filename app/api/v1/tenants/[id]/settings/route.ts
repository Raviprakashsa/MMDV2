import { NextResponse } from 'next/server'
import { z } from 'zod'
import { tenantSettingsService } from '@/lib/foundation/services/tenant-settings.service'
import { runApi } from '@/lib/core/route-utils'

const UpsertSettingsSchema = z.object({
  timezone: z.string().min(1).optional(),
  locale: z.string().min(1).optional(),
  dateFormat: z.string().min(1).optional(),
  timeFormat: z.string().min(1).optional(),
  weekStartDay: z.number().int().optional(),
})

export async function GET(_request: Request, context: any) {
  return runApi(async () => {
    const p = context.params
    const params = p && typeof p.then === 'function' ? await p : p
    const tenantId = params.id
    // TODO: RBAC placeholder
    const settings = await tenantSettingsService.getByTenantId(tenantId)
    return settings
  })
}

export async function PATCH(request: Request, context: any) {
  return runApi(async () => {
    const p = context.params
    const params = p && typeof p.then === 'function' ? await p : p
    const tenantId = params.id
    const body = await request.json()
    const parsed = UpsertSettingsSchema.parse(body)
    // TODO: RBAC placeholder
    const upserted = await tenantSettingsService.upsertPartial(tenantId, parsed)
    return upserted
  })
}
