import type { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { TenantAwareRepository, type TenantContext } from '@/lib/foundation/repositories/tenant-aware.repository'

export interface CreateCompanyInput {
  name: string
  website: string
  industry: string
  phone: string
  email: string
}

export interface UpdateCompanyInput {
  name?: string
  website?: string
  industry?: string
  phone?: string
  email?: string
}

export interface CompanyListFilters {
  name?: string
  website?: string
  industry?: string
  phone?: string
  email?: string
}

export class CompanyRepository extends TenantAwareRepository {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient)
  }

  create(context: TenantContext, input: CreateCompanyInput) {
    const tenantId = this.requireTenant(context)
    return this.prisma.company.create({ data: { tenantId, ...input } })
  }

  findById(context: TenantContext, id: string) {
    return this.prisma.company.findFirst({ where: this.withTenant(context, { id }) })
  }

  updateById(context: TenantContext, id: string, input: UpdateCompanyInput) {
    const where = this.withTenant(context, { id })
    return this.prisma.$transaction([
      this.prisma.company.updateMany({ where, data: { ...input } }),
      this.prisma.company.findFirst({ where }),
    ]).then(([_res, updated]) => updated)
  }

  list(context: TenantContext, filters: CompanyListFilters = {}) {
    const where = this.withTenant(context, {
      ...(filters.name !== undefined ? { name: filters.name } : {}),
      ...(filters.website !== undefined ? { website: filters.website } : {}),
      ...(filters.industry !== undefined ? { industry: filters.industry } : {}),
      ...(filters.phone !== undefined ? { phone: filters.phone } : {}),
      ...(filters.email !== undefined ? { email: filters.email } : {}),
    })

    return this.prisma.company.findMany({ where, orderBy: { createdAt: 'desc' } })
  }

  softDelete(context: TenantContext, id: string) {
    return this.prisma.company.updateMany({
      where: this.withTenant(context, { id }),
      data: this.markDeleted(),
    })
  }
}

export const companyRepository = new CompanyRepository(prisma)