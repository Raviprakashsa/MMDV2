import type { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { BaseRepository } from '@/lib/foundation/repositories/base.repository'

export class RolePermissionRepository extends BaseRepository {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient)
  }

  findById(id: string) {
    return this.prisma.rolePermission.findFirst({ where: { id, deletedAt: null } })
  }

  listByRole(roleId: string) {
    return this.prisma.rolePermission.findMany({ where: { roleId, deletedAt: null } })
  }

  find(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.findFirst({ where: { roleId, permissionId, deletedAt: null } })
  }

  assign(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.create({ data: { roleId, permissionId } })
  }

  unassignById(id: string) {
    return this.prisma.rolePermission.update({ where: { id }, data: this.markDeleted() })
  }

  unassign(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.updateMany({ where: { roleId, permissionId, deletedAt: null }, data: this.markDeleted() })
  }
}

export const rolePermissionRepository = new RolePermissionRepository(prisma)
