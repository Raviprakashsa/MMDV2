import { prisma } from '@/lib/prisma'
import { TenantAwareRepository, type TenantContext } from '@/lib/foundation/repositories/tenant-aware.repository'
import type { PrismaClient } from '@prisma/client'

export interface CreateTenantInput {
  tenantId: string
  slug: string
  name: string
  planId: string
}

export interface UpdateTenantInput {
  slug?: string
  name?: string
  planId?: string
  isActive?: boolean
}

export class TenantRepository extends TenantAwareRepository {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient)
  }

  async create(input: CreateTenantInput) {
    return this.prisma.tenant.create({
      data: {
        tenantId: input.tenantId,
        slug: input.slug,
        name: input.name,
        planId: input.planId,
      },
    })
  }

  async findById(id: string) {
    return this.prisma.tenant.findFirst({ where: { id, deletedAt: null } })
  }

  async findByTenantId(context: TenantContext) {
    const where = this.withTenant(context, {})
    return this.prisma.tenant.findFirst({ where })
  }

  async findByBusinessTenantId(tenantId: string) {
    return this.prisma.tenant.findFirst({ where: { tenantId, deletedAt: null } })
  }

  async updateById(id: string, input: UpdateTenantInput) {
    return this.prisma.tenant.update({
      where: { id },
      data: {
        ...input,
      },
    })
  }

  async softDeleteById(id: string) {
    return this.prisma.tenant.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  async softDelete(context: TenantContext) {
    const tenantId = this.requireTenant(context)
    return this.softDeleteById(tenantId)
  }
}

export const tenantRepository = new TenantRepository(prisma)
