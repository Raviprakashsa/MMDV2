import { NotFoundError } from '@/lib/core/app-error'
import { tenantBrandingRepository, type UpsertTenantBrandingInput } from '@/lib/foundation/repositories/tenant-branding.repository'
import { tenantRepository } from '@/lib/foundation/repositories/tenant.repository'

export class TenantBrandingService {
  async getByTenantId(tenantId: string) {
    return tenantBrandingRepository.findByTenant({ tenantId })
  }

  async ensureForTenant(tenantId: string) {
    const tenant = await tenantRepository.findById(tenantId)
    if (!tenant) {
      throw new NotFoundError('Tenant not found')
    }

    return tenantBrandingRepository.upsert({
      tenantId,
      displayName: null,
      logoUrl: null,
      faviconUrl: null,
      primaryColor: null,
      secondaryColor: null,
      accentColor: null,
      supportEmail: null,
    })
  }

  async upsert(input: UpsertTenantBrandingInput) {
    const tenant = await tenantRepository.findById(input.tenantId)
    if (!tenant) {
      throw new NotFoundError('Tenant not found')
    }

    return tenantBrandingRepository.upsert(input)
  }

  async archiveByTenantId(tenantId: string) {
    const branding = await tenantBrandingRepository.findByTenant({ tenantId })
    if (!branding) {
      throw new NotFoundError('Tenant branding not found')
    }

    return tenantBrandingRepository.softDeleteByTenant({ tenantId })
  }
}

export const tenantBrandingService = new TenantBrandingService()