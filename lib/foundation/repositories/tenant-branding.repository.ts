import type { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { TenantAwareRepository, type TenantContext } from '@/lib/foundation/repositories/tenant-aware.repository'

export interface UpsertTenantBrandingInput {
  tenantId: string
  displayName?: string | null
  logoUrl?: string | null
  faviconUrl?: string | null
  primaryColor?: string | null
  secondaryColor?: string | null
  accentColor?: string | null
  supportEmail?: string | null
}

export class TenantBrandingRepository extends TenantAwareRepository {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient)
  }

  findByTenant(context: TenantContext) {
    const where = this.withTenant(context, {})
    return this.prisma.tenantBranding.findFirst({ where })
  }

  upsert(input: UpsertTenantBrandingInput) {
    return this.prisma.tenantBranding.upsert({
      where: { tenantId: input.tenantId },
      update: {
        displayName: input.displayName ?? null,
        logoUrl: input.logoUrl ?? null,
        faviconUrl: input.faviconUrl ?? null,
        primaryColor: input.primaryColor ?? null,
        secondaryColor: input.secondaryColor ?? null,
        accentColor: input.accentColor ?? null,
        supportEmail: input.supportEmail ?? null,
        deletedAt: null,
      },
      create: {
        tenantId: input.tenantId,
        displayName: input.displayName ?? null,
        logoUrl: input.logoUrl ?? null,
        faviconUrl: input.faviconUrl ?? null,
        primaryColor: input.primaryColor ?? null,
        secondaryColor: input.secondaryColor ?? null,
        accentColor: input.accentColor ?? null,
        supportEmail: input.supportEmail ?? null,
      },
    })
  }

  softDeleteByTenant(context: TenantContext) {
    const where = this.withTenant(context, {})
    return this.prisma.tenantBranding.updateMany({
      where,
      data: this.markDeleted(),
    })
  }
}

export const tenantBrandingRepository = new TenantBrandingRepository(prisma)