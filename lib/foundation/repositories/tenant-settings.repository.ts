import type { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { TenantAwareRepository, type TenantContext } from '@/lib/foundation/repositories/tenant-aware.repository'

export interface UpsertTenantSettingsInput {
  tenantId: string
  timezone: string
  locale: string
  dateFormat: string
  timeFormat: string
  weekStartDay: number
}

export class TenantSettingsRepository extends TenantAwareRepository {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient)
  }

  findByTenant(context: TenantContext) {
    const where = this.withTenant(context, {})
    return this.prisma.tenantSettings.findFirst({ where })
  }

  upsert(input: UpsertTenantSettingsInput) {
    return this.prisma.tenantSettings.upsert({
      where: { tenantId: input.tenantId },
      update: {
        timezone: input.timezone,
        locale: input.locale,
        dateFormat: input.dateFormat,
        timeFormat: input.timeFormat,
        weekStartDay: input.weekStartDay,
        deletedAt: null,
      },
      create: {
        tenantId: input.tenantId,
        timezone: input.timezone,
        locale: input.locale,
        dateFormat: input.dateFormat,
        timeFormat: input.timeFormat,
        weekStartDay: input.weekStartDay,
      },
    })
  }

  softDeleteByTenant(context: TenantContext) {
    const where = this.withTenant(context, {})
    return this.prisma.tenantSettings.updateMany({
      where,
      data: this.markDeleted(),
    })
  }
}

export const tenantSettingsRepository = new TenantSettingsRepository(prisma)