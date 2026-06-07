import { userResolutionService } from './user-resolution.service'
import { dataAccessLogRepository } from '@/lib/foundation/repositories/data-access-log.repository'
import { type TenantContext } from '@/lib/foundation/repositories/tenant-aware.repository'
import { ForbiddenError } from '@/lib/core/app-error'

export class DataAccessLogService {
  async getLogs(context: TenantContext, limit: number = 100) {
    if (!context.tenantId) {
      throw new ForbiddenError('Tenant context is required')
    }

    // 1. Resolve MongoDB user ObjectIds in this tenant
    const mongoUserIds = await userResolutionService.resolveMongoUserIds(context)
    if (mongoUserIds.length === 0) {
      return []
    }

    // 2. Fetch scoped data access logs from repository
    return dataAccessLogRepository.listByUsers(mongoUserIds, limit)
  }
}

export const dataAccessLogService = new DataAccessLogService()
