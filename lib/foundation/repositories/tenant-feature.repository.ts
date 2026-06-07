import type { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { TenantAwareRepository, type TenantContext } from '@/lib/foundation/repositories/tenant-aware.repository'

export interface UpsertTenantFeatureInput {
  tenantId: string
  featureId: string
  isEnabled: boolean
  source: string
  overrideValue: string | null
}

export class TenantFeatureRepository extends TenantAwareRepository {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient)
  }

  listByTenant(context: TenantContext) {
    const where = this.withTenant(context, {})
    return this.prisma.tenantFeature.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    })
  }

  findByTenantAndFeature(context: TenantContext, featureId: string) {
    const where = this.withTenant(context, { featureId })
    return this.prisma.tenantFeature.findFirst({ where })
  }

  upsert(input: UpsertTenantFeatureInput) {
    return this.prisma.tenantFeature.upsert({
      where: {
        tenantId_featureId: {
          tenantId: input.tenantId,
          featureId: input.featureId,
        },
      },
      update: {
        isEnabled: input.isEnabled,
        source: input.source,
        overrideValue: input.overrideValue,
        deletedAt: null,
      },
      create: {
        tenantId: input.tenantId,
        featureId: input.featureId,
        isEnabled: input.isEnabled,
        source: input.source,
        overrideValue: input.overrideValue,
      },
    })
  }

  softDeleteByTenantAndFeature(context: TenantContext, featureId: string) {
    const where = this.withTenant(context, { featureId })
    return this.prisma.tenantFeature.updateMany({
      where,
      data: this.markDeleted(),
    })
  }
}

export const tenantFeatureRepository = new TenantFeatureRepository(prisma)