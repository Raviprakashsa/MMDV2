import { NotFoundError } from '@/lib/core/app-error'
import { featureRepository } from '@/lib/foundation/repositories/feature.repository'
import { tenantFeatureRepository, type UpsertTenantFeatureInput } from '@/lib/foundation/repositories/tenant-feature.repository'
import { tenantRepository } from '@/lib/foundation/repositories/tenant.repository'

const DEFAULT_TENANT_FEATURE_ENABLED = true
const DEFAULT_TENANT_FEATURE_SOURCE = 'manual'

export class TenantFeatureService {
  async listByTenantId(tenantId: string) {
    return tenantFeatureRepository.listByTenant({ tenantId })
  }

  async getByTenantAndFeature(tenantId: string, featureId: string) {
    const tenantFeature = await tenantFeatureRepository.findByTenantAndFeature({ tenantId }, featureId)
    if (!tenantFeature) {
      throw new NotFoundError('Tenant feature not found')
    }
    return tenantFeature
  }

  async upsert(input: UpsertTenantFeatureInput) {
    const tenant = await tenantRepository.findById(input.tenantId)
    if (!tenant) {
      throw new NotFoundError('Tenant not found')
    }

    const feature = await featureRepository.findById(input.featureId)
    if (!feature) {
      throw new NotFoundError('Feature not found')
    }

    return tenantFeatureRepository.upsert({
      tenantId: input.tenantId,
      featureId: input.featureId,
      isEnabled: input.isEnabled ?? DEFAULT_TENANT_FEATURE_ENABLED,
      source: input.source ?? DEFAULT_TENANT_FEATURE_SOURCE,
      overrideValue: input.overrideValue ?? null,
    })
  }

  async archiveByTenantAndFeature(tenantId: string, featureId: string) {
    const tenantFeature = await tenantFeatureRepository.findByTenantAndFeature({ tenantId }, featureId)
    if (!tenantFeature) {
      throw new NotFoundError('Tenant feature not found')
    }

    return tenantFeatureRepository.softDeleteByTenantAndFeature({ tenantId }, featureId)
  }
}

export const tenantFeatureService = new TenantFeatureService()