import type { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { TenantAwareRepository, type TenantContext } from '@/lib/foundation/repositories/tenant-aware.repository'

export interface CreateSessionInput {
  id: string
  userId: string
  refreshTokenHash?: string | null
  expiresAt: Date
}

export class SessionRepository extends TenantAwareRepository {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient)
  }

  findById(context: TenantContext, id: string) {
    const where = this.withTenant(context, { id })
    return this.prisma.session.findFirst({ where })
  }

  create(context: TenantContext, input: CreateSessionInput) {
    const tenantId = this.requireTenant(context)
    const data = { tenantId, ...input }
    return this.prisma.session.create({ data: { ...data } })
  }

  revokeById(context: TenantContext, id: string) {
    const where = this.withTenant(context, { id })
    return this.prisma.session.updateMany({ where, data: this.markDeleted() })
  }

  cleanupExpired(now: Date) {
    return this.prisma.session.updateMany({ where: { expiresAt: { lt: now } }, data: this.markDeleted() })
  }

  listByTenant(context: TenantContext) {
    const where = this.withTenant(context, {})
    return this.prisma.session.findMany({ where, orderBy: { createdAt: 'desc' } })
  }
}

export const sessionRepository = new SessionRepository(prisma)
