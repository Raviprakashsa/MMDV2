import { userResolutionService } from './user-resolution.service'
import { exportJobRepository } from '@/lib/foundation/repositories/export-job.repository'
import { userRepository } from '@/lib/foundation/repositories/user.repository'
import { roleRepository } from '@/lib/foundation/repositories/role.repository'
import { ExportService } from '@/lib/services/export.service'
import { type TenantContext } from '@/lib/foundation/repositories/tenant-aware.repository'
import { ForbiddenError } from '@/lib/core/app-error'
import { z } from 'zod'

const ExportFormatSchema = z.enum(['CSV', 'JSON', 'XLSX'])

export class ExportJobService {
  async getGdprJobs(context: TenantContext, limit: number = 25) {
    if (!context.tenantId) {
      throw new ForbiddenError('Tenant context is required')
    }

    // 1. Resolve MongoDB user ObjectIds scoped to this tenant
    const mongoUserIds = await userResolutionService.resolveMongoUserIds(context)
    if (mongoUserIds.length === 0) {
      return []
    }

    // 2. Fetch scoped export jobs from repository
    return exportJobRepository.listByUsers(mongoUserIds, limit)
  }

  async createGdprJob(context: TenantContext, format: string) {
    if (!context.tenantId || !context.userId) {
      throw new ForbiddenError('Tenant and User context are required')
    }

    const parsedFormat = ExportFormatSchema.safeParse(format)
    if (!parsedFormat.success) {
      throw new Error('Invalid export format')
    }

    // 1. Verify user existence in PostgreSQL tenant context
    const pgUser = await userRepository.findById(context, context.userId)
    if (!pgUser) {
      throw new ForbiddenError('User not found in tenant')
    }

    // 2. Resolve user's role code string from PostgreSQL Role definition
    const role = await roleRepository.findById(context, pgUser.roleId)
    const roleCode = role ? role.code : 'RECRUITER'

    // 3. Delegate to the ExportService under resolved user context
    return ExportService.createJob(
      { id: pgUser.id, role: roleCode },
      {
        entityType: 'GDPR_PORTABILITY',
        format: parsedFormat.data,
        filter: {
          scope: 'CANDIDATE_DATA_PORTABILITY',
          requestedByRole: roleCode,
        },
      }
    )
  }
}

export const exportJobService = new ExportJobService()
