import { Prisma, type AuditAction } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export interface AuditLogInput {
  tenantId: string
  actorUserId?: string
  action: AuditAction
  module: string
  entity: string
  entityId?: string
  changesJson?: unknown
  metadataJson?: unknown
}

export class AuditLogService {
  private toPrismaJsonValue(value: unknown): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue | undefined {
    if (value === undefined) {
      return undefined
    }

    if (value === null) {
      return Prisma.JsonNull
    }

    return value as Prisma.InputJsonValue
  }

  async log(input: AuditLogInput) {
    return prisma.auditLog.create({
      data: {
        tenantId: input.tenantId,
        actorUserId: input.actorUserId,
        action: input.action,
        module: input.module,
        entity: input.entity,
        entityId: input.entityId,
        changesJson: this.toPrismaJsonValue(input.changesJson),
        metadataJson: this.toPrismaJsonValue(input.metadataJson),
      },
    })
  }

  async listByEntity(tenantId: string, entity: string, entityId: string) {
    return prisma.auditLog.findMany({
      where: {
        tenantId,
        entity,
        entityId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
  }
}

export const auditLogService = new AuditLogService()
