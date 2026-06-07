import type { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { BaseRepository } from '@/lib/foundation/repositories/base.repository'

export interface CreateFeatureInput {
  tenantId: string
  code: string
  name: string
  description?: string | null
}

export interface UpdateFeatureInput {
  name?: string
  description?: string | null
  isActive?: boolean
}

export class FeatureRepository extends BaseRepository {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient)
  }

  listActive() {
    return this.prisma.feature.findMany({
      where: { deletedAt: null },
      orderBy: { code: 'asc' },
    })
  }

  findById(id: string) {
    return this.prisma.feature.findFirst({ where: { id, deletedAt: null } })
  }

  findByCode(code: string) {
    return this.prisma.feature.findFirst({ where: { code, deletedAt: null } })
  }

  create(input: CreateFeatureInput) {
    return this.prisma.feature.create({
      data: {
        tenantId: input.tenantId,
        code: input.code,
        name: input.name,
        description: input.description ?? null,
      },
    })
  }

  updateById(id: string, input: UpdateFeatureInput) {
    return this.prisma.feature.update({
      where: { id },
      data: {
        ...input,
      },
    })
  }

  softDeleteById(id: string) {
    return this.prisma.feature.update({
      where: { id },
      data: this.markDeleted(),
    })
  }
}

export const featureRepository = new FeatureRepository(prisma)