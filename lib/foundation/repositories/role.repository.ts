import type { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { TenantAwareRepository, type TenantContext } from '@/lib/foundation/repositories/tenant-aware.repository'

export interface CreateRoleInput {
  code: string
  name: string
  description?: string | null
  isSystem?: boolean
}

export interface UpdateRoleInput {
  name?: string
  description?: string | null
  isSystem?: boolean
}

export class RoleRepository extends TenantAwareRepository {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient)
  }

  findById(context: TenantContext, id: string) {
    const where = this.withTenant(context, { id })
    return this.prisma.role.findFirst({ where })
  }

  findByCode(context: TenantContext, code: string) {
    const where = this.withTenant(context, { code })
    return this.prisma.role.findFirst({ where })
  }

  listByTenant(context: TenantContext) {
    const where = this.withTenant(context, {})
    return this.prisma.role.findMany({ where, orderBy: { code: 'asc' } })
  }

  create(context: TenantContext, input: CreateRoleInput) {
    const tenantId = this.requireTenant(context)
    const data = { tenantId, ...input }
    return this.prisma.role.create({ data })
  }

  updateById(id: string, input: UpdateRoleInput) {
    return this.prisma.role.update({ where: { id }, data: { ...input } })
  }

  softDeleteById(id: string) {
    return this.prisma.role.update({ where: { id }, data: this.markDeleted() })
  }
}

export const roleRepository = new RoleRepository(prisma)
