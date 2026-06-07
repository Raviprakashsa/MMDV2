import { NotFoundError } from '@/lib/core/app-error'
import { planRepository } from '@/lib/foundation/repositories/plan.repository'
import { tenantRepository, type CreateTenantInput, type UpdateTenantInput } from '@/lib/foundation/repositories/tenant.repository'
import { tenantBrandingService } from '@/lib/foundation/services/tenant-branding.service'
import { tenantSettingsService } from '@/lib/foundation/services/tenant-settings.service'

export class TenantService {
  async create(input: CreateTenantInput) {
    const plan = await planRepository.findById(input.planId)
    if (!plan) {
      throw new NotFoundError('Plan not found')
    }

    const tenant = await tenantRepository.create(input)
    await tenantSettingsService.ensureForTenant(tenant.id)
    await tenantBrandingService.ensureForTenant(tenant.id)
    return tenant
  }

  async getById(id: string) {
    const tenant = await tenantRepository.findById(id)
    if (!tenant) {
      throw new NotFoundError('Tenant not found')
    }
    return tenant
  }

  async updateById(id: string, input: UpdateTenantInput) {
    if (input.planId) {
      const plan = await planRepository.findById(input.planId)
      if (!plan) {
        throw new NotFoundError('Plan not found')
      }
    }

    const tenant = await tenantRepository.findById(id)
    if (!tenant) {
      throw new NotFoundError('Tenant not found')
    }

    return tenantRepository.updateById(id, input)
  }

  async archiveById(id: string) {
    const tenant = await tenantRepository.findById(id)
    if (!tenant) {
      throw new NotFoundError('Tenant not found')
    }

    await tenantRepository.updateById(id, { isActive: false })
    return tenantRepository.softDeleteById(id)
  }
}

export const tenantService = new TenantService()