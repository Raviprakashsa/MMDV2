import type { PrismaClient, User as UserModel } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { TenantAwareRepository, type TenantContext } from '@/lib/foundation/repositories/tenant-aware.repository'

export interface CreateUserInput {
  email: string
  passwordHash: string
  name: string
  roleId: string
}

export interface UpdateUserInput {
  email?: string
  name?: string
  roleId?: string
  status?: string
}

export class UserRepository extends TenantAwareRepository {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient)
  }

  findById(context: TenantContext, id: string) {
    const where = this.withTenant(context, { id })
    return this.prisma.user.findFirst({ where })
  }

  findByEmail(context: TenantContext, email: string) {
    const where = this.withTenant(context, { email })
    return this.prisma.user.findFirst({ where })
  }

  listByTenant(context: TenantContext) {
    const where = this.withTenant(context, {})
    return this.prisma.user.findMany({ where, orderBy: { createdAt: 'desc' } })
  }

  create(context: TenantContext, input: CreateUserInput) {
    const tenantId = this.requireTenant(context)
    const data = { tenantId, ...input }
    return this.prisma.user.create({ data })
  }

  updateById(id: string, input: UpdateUserInput) {
    const data: Record<string, any> = {}
    if (input.email !== undefined) data.email = input.email
    if (input.name !== undefined) data.name = input.name
    if (input.roleId !== undefined) data.roleId = input.roleId
    if (input.status !== undefined) data.status = input.status
    return this.prisma.user.update({ where: { id }, data })
  }

  softDeleteById(id: string) {
    return this.prisma.user.update({ where: { id }, data: this.markDeleted() })
  }
}

export const userRepository = new UserRepository(prisma)
