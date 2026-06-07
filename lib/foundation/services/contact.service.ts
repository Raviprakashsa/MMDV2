import { NotFoundError, ConflictError } from '@/lib/core/app-error'
import { contactRepository, type CreateContactInput, type UpdateContactInput } from '@/lib/foundation/repositories/contact.repository'
import { companyRepository } from '@/lib/foundation/repositories/company.repository'
import { requireCrmPermission } from '@/lib/core/crm-permissions'
import type { TenantContext } from '@/lib/foundation/repositories/tenant-aware.repository'
import { trackActivity } from '@/lib/core/activity-tracker'

/**
 * ContactService — Service Layer RBAC boundary.
 *
 * Every public method checks CRM permissions via requireCrmPermission()
 * before performing any database operation.
 */
export class ContactService {
  async list(ctx: TenantContext, filters: Parameters<typeof contactRepository.list>[1] = {}) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')
    requireCrmPermission(ctx.userRole, 'crm:read')
    return contactRepository.list(ctx, filters)
  }

  async get(ctx: TenantContext, id: string) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')
    requireCrmPermission(ctx.userRole, 'crm:read')
    const contact = await contactRepository.findById(ctx, id)
    if (!contact) throw new NotFoundError('Contact not found')
    return contact
  }

  async create(ctx: TenantContext, input: CreateContactInput) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')
    requireCrmPermission(ctx.userRole, 'crm:create')

    // ensure associated company belongs to the same tenant
    if (input.companyId) {
      const company = await companyRepository.findById(ctx, input.companyId)
      if (!company) throw new NotFoundError('Company not found')
    }

    // email uniqueness within tenant
    if (input.email) {
      const dup = await contactRepository.findByEmail(ctx, input.email)
      if (dup) throw new ConflictError('Contact email already exists for tenant')
    }

    const result = await contactRepository.create(ctx, input)

    if (ctx.userId) {
      await trackActivity({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        module: 'CRM',
        entityType: 'Contact',
        entityId: result.id,
        action: 'CREATE_CONTACT',
        metadata: { name: `${result.firstName || ''} ${result.lastName || ''}`.trim() }
      }).catch(console.error)
    }

    return result
  }

  async update(ctx: TenantContext, id: string, input: UpdateContactInput) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')
    requireCrmPermission(ctx.userRole, 'crm:update')

    const existing = await contactRepository.findById(ctx, id)
    if (!existing) throw new NotFoundError('Contact not found')

    // If companyId changes, verify new company is in same tenant
    if (input.companyId && input.companyId !== existing.companyId) {
      const company = await companyRepository.findById(ctx, input.companyId)
      if (!company) throw new NotFoundError('Company not found')
    }

    // email uniqueness check on change
    if (input.email && input.email !== existing.email) {
      const dup = await contactRepository.findByEmail(ctx, input.email)
      if (dup) throw new ConflictError('Contact email already exists for tenant')
    }

    const result = await contactRepository.updateById(ctx, id, input)

    if (ctx.userId && result) {
      await trackActivity({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        module: 'CRM',
        entityType: 'Contact',
        entityId: id,
        action: 'UPDATE_CONTACT',
        metadata: { name: `${result.firstName || ''} ${result.lastName || ''}`.trim() }
      }).catch(console.error)
    }

    return result
  }

  async deactivate(ctx: TenantContext, id: string) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')
    requireCrmPermission(ctx.userRole, 'crm:delete')

    const existing = await contactRepository.findById(ctx, id)
    if (!existing) throw new NotFoundError('Contact not found')

    return contactRepository.softDelete(ctx, id)
  }
}

export const contactService = new ContactService()
