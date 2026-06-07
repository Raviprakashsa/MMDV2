import { NotFoundError } from '@/lib/core/app-error'
import { tenantSettingsRepository, type UpsertTenantSettingsInput } from '@/lib/foundation/repositories/tenant-settings.repository'
import { tenantRepository } from '@/lib/foundation/repositories/tenant.repository'

const DEFAULT_TIMEZONE = 'UTC'
const DEFAULT_LOCALE = 'en-IN'
const DEFAULT_DATE_FORMAT = 'DD/MM/YYYY'
const DEFAULT_TIME_FORMAT = '24h'
const DEFAULT_WEEK_START_DAY = 1

export class TenantSettingsService {
  async getByTenantId(tenantId: string) {
    return tenantSettingsRepository.findByTenant({ tenantId })
  }

  async ensureForTenant(tenantId: string) {
    const tenant = await tenantRepository.findById(tenantId)
    if (!tenant) {
      throw new NotFoundError('Tenant not found')
    }

    return tenantSettingsRepository.upsert({
      tenantId,
      timezone: DEFAULT_TIMEZONE,
      locale: DEFAULT_LOCALE,
      dateFormat: DEFAULT_DATE_FORMAT,
      timeFormat: DEFAULT_TIME_FORMAT,
      weekStartDay: DEFAULT_WEEK_START_DAY,
    })
  }

  async upsert(input: UpsertTenantSettingsInput) {
    const tenant = await tenantRepository.findById(input.tenantId)
    if (!tenant) {
      throw new NotFoundError('Tenant not found')
    }

    return tenantSettingsRepository.upsert(input)
  }

  async upsertPartial(tenantId: string, partial: Partial<Omit<UpsertTenantSettingsInput, 'tenantId'>>) {
    const tenant = await tenantRepository.findById(tenantId)
    if (!tenant) {
      throw new NotFoundError('Tenant not found')
    }

    const existing = await tenantSettingsRepository.findByTenant({ tenantId })
    const base = existing ?? {
      timezone: DEFAULT_TIMEZONE,
      locale: DEFAULT_LOCALE,
      dateFormat: DEFAULT_DATE_FORMAT,
      timeFormat: DEFAULT_TIME_FORMAT,
      weekStartDay: DEFAULT_WEEK_START_DAY,
    }

    const input: UpsertTenantSettingsInput = {
      tenantId,
      timezone: partial.timezone ?? base.timezone,
      locale: partial.locale ?? base.locale,
      dateFormat: partial.dateFormat ?? base.dateFormat,
      timeFormat: partial.timeFormat ?? base.timeFormat,
      weekStartDay: partial.weekStartDay ?? base.weekStartDay,
    }

    return tenantSettingsRepository.upsert(input)
  }

  async archiveByTenantId(tenantId: string) {
    const settings = await tenantSettingsRepository.findByTenant({ tenantId })
    if (!settings) {
      throw new NotFoundError('Tenant settings not found')
    }

    return tenantSettingsRepository.softDeleteByTenant({ tenantId })
  }
}

export const tenantSettingsService = new TenantSettingsService()