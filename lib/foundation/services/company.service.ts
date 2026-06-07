import { NotFoundError, ConflictError } from '@/lib/core/app-error'
import { companyRepository, type CreateCompanyInput, type UpdateCompanyInput } from '@/lib/foundation/repositories/company.repository'
import { requireCrmPermission } from '@/lib/core/crm-permissions'
import type { TenantContext } from '@/lib/foundation/repositories/tenant-aware.repository'

/**
 * CompanyService — Service Layer RBAC boundary.
 *
 * Every public method checks CRM permissions via requireCrmPermission()
 * before performing any database operation.
 */
export class CompanyService {
  async list(ctx: TenantContext, filters: Parameters<typeof companyRepository.list>[1] = {}) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')
    requireCrmPermission(ctx.userRole, 'crm:read')
    return companyRepository.list(ctx, filters)
  }

  async get(ctx: TenantContext, id: string) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')
    requireCrmPermission(ctx.userRole, 'crm:read')
    const company = await companyRepository.findById(ctx, id)
    if (!company) throw new NotFoundError('Company not found')
    return company
  }

  async create(ctx: TenantContext, input: CreateCompanyInput) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')
    requireCrmPermission(ctx.userRole, 'crm:create')

    // uniqueness: name per tenant
    if (input.name) {
      const existing = await companyRepository.list(ctx, { name: input.name })
      if (existing && existing.length > 0) {
        throw new ConflictError('Company name already exists for tenant')
      }
    }

    return companyRepository.create(ctx, input)
  }

  async update(ctx: TenantContext, id: string, input: UpdateCompanyInput) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')
    requireCrmPermission(ctx.userRole, 'crm:update')

    const existing = await companyRepository.findById(ctx, id)
    if (!existing) throw new NotFoundError('Company not found')

    // If name changes, ensure uniqueness within tenant
    if (input.name && input.name !== existing.name) {
      const dup = await companyRepository.list(ctx, { name: input.name })
      if (dup && dup.length > 0) throw new ConflictError('Company name already exists for tenant')
    }

    return companyRepository.updateById(ctx, id, input)
  }

  async deactivate(ctx: TenantContext, id: string) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')
    requireCrmPermission(ctx.userRole, 'crm:delete')

    const existing = await companyRepository.findById(ctx, id)
    if (!existing) throw new NotFoundError('Company not found')

    return companyRepository.softDelete(ctx, id)
  }
}

export const companyService = new CompanyService()
