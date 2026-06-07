import type { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { BaseRepository } from '@/lib/foundation/repositories/base.repository'

export interface CreatePlanInput {
  tenantId: string
  code: string
  name: string
  description?: string | null
}

export interface UpdatePlanInput {
  name?: string
  description?: string | null
  isActive?: boolean
}

export class PlanRepository extends BaseRepository {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient)
  }

  listActive() {
    return this.prisma.plan.findMany({
      where: { deletedAt: null },
      orderBy: { code: 'asc' },
    })
  }

  findById(id: string) {
    return this.prisma.plan.findFirst({ where: { id, deletedAt: null } })
  }

  findByCode(code: string) {
    return this.prisma.plan.findFirst({ where: { code, deletedAt: null } })
  }

  create(input: CreatePlanInput) {
    return this.prisma.plan.create({
      data: {
        tenantId: input.tenantId,
        code: input.code,
        name: input.name,
        description: input.description ?? null,
      },
    })
  }

  updateById(id: string, input: UpdatePlanInput) {
    return this.prisma.plan.update({
      where: { id },
      data: {
        ...input,
      },
    })
  }

  softDeleteById(id: string) {
    return this.prisma.plan.update({
      where: { id },
      data: this.markDeleted(),
    })
  }
}

export const planRepository = new PlanRepository(prisma)