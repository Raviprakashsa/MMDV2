import type { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { BaseRepository } from '@/lib/foundation/repositories/base.repository'

export interface CreatePermissionInput {
  code: string
  module: string
  action: string
  description?: string | null
}

export class PermissionRepository extends BaseRepository {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient)
  }

  findById(id: string) {
    return this.prisma.permission.findFirst({ where: { id, deletedAt: null } })
  }

  findByCode(code: string) {
    return this.prisma.permission.findFirst({ where: { code, deletedAt: null } })
  }

  listAll() {
    return this.prisma.permission.findMany({ where: { deletedAt: null }, orderBy: { code: 'asc' } })
  }

  create(input: CreatePermissionInput) {
    return this.prisma.permission.create({ data: { ...input } })
  }

  updateById(id: string, input: Partial<CreatePermissionInput>) {
    return this.prisma.permission.update({ where: { id }, data: { ...input } })
  }

  softDeleteById(id: string) {
    return this.prisma.permission.update({ where: { id }, data: this.markDeleted() })
  }
}

export const permissionRepository = new PermissionRepository(prisma)
