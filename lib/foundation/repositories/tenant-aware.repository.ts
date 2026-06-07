import { PrismaClient } from '@prisma/client'
import { ForbiddenError } from '@/lib/core/app-error'
import { BaseRepository } from '@/lib/foundation/repositories/base.repository'

export interface TenantContext {
  tenantId: string
  userId?: string
  /** Platform role (from session) used for service-layer RBAC checks. */
  userRole?: string
}

export abstract class TenantAwareRepository extends BaseRepository {
  protected constructor(prismaClient?: PrismaClient) {
    super(prismaClient)
  }

  protected requireTenant(context: TenantContext): string {
    const tenantId = context.tenantId?.trim()
    if (!tenantId) {
      throw new ForbiddenError('Tenant context is required')
    }
    return tenantId
  }

  protected withTenant<T extends Record<string, unknown>>(context: TenantContext, where: T = {} as T): T {
    const tenantId = this.requireTenant(context)
    return {
      ...where,
      tenantId,
      deletedAt: null,
    }
  }
}
