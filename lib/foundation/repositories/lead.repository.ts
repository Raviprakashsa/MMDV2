import type { LeadStatus, PrismaClient, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { TenantAwareRepository, type TenantContext } from '@/lib/foundation/repositories/tenant-aware.repository'

export interface CreateLeadInput {
  companyId?: string | null
  contactId?: string | null
  ownerId?: string | null
  title: string
  description: string
  status?: LeadStatus
  value: Prisma.Decimal | number | string
}

export interface UpdateLeadInput {
  companyId?: string | null
  contactId?: string | null
  ownerId?: string | null
  title?: string
  description?: string
  status?: LeadStatus
  value?: Prisma.Decimal | number | string
}

export interface LeadListFilters {
  companyId?: string | null
  contactId?: string | null
  ownerId?: string | null
  status?: LeadStatus
  title?: string
}

export class LeadRepository extends TenantAwareRepository {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient)
  }

  create(context: TenantContext, input: CreateLeadInput) {
    const tenantId = this.requireTenant(context)
    return this.prisma.lead.create({ data: { tenantId, ...input } })
  }

  findById(context: TenantContext, id: string) {
    return this.prisma.lead.findFirst({ where: this.withTenant(context, { id }) })
  }

  updateById(context: TenantContext, id: string, input: UpdateLeadInput) {
    const where = this.withTenant(context, { id })
    return this.prisma.$transaction([
      this.prisma.lead.updateMany({ where, data: { ...input } }),
      this.prisma.lead.findFirst({ where }),
    ]).then(([_res, updated]) => updated)
  }

  list(context: TenantContext, filters: LeadListFilters = {}) {
    const where = this.withTenant(context, {
      ...(filters.companyId !== undefined ? { companyId: filters.companyId } : {}),
      ...(filters.contactId !== undefined ? { contactId: filters.contactId } : {}),
      ...(filters.ownerId !== undefined ? { ownerId: filters.ownerId } : {}),
      ...(filters.status !== undefined ? { status: filters.status } : {}),
      ...(filters.title !== undefined ? { title: filters.title } : {}),
    })

    return this.prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' } })
  }

  findByStatus(context: TenantContext, status: LeadStatus) {
    return this.prisma.lead.findMany({ where: this.withTenant(context, { status }), orderBy: { createdAt: 'desc' } })
  }

  findByOwner(context: TenantContext, ownerId: string) {
    return this.prisma.lead.findMany({ where: this.withTenant(context, { ownerId }), orderBy: { createdAt: 'desc' } })
  }

  softDelete(context: TenantContext, id: string) {
    return this.prisma.lead.updateMany({
      where: this.withTenant(context, { id }),
      data: this.markDeleted(),
    })
  }
}

export const leadRepository = new LeadRepository(prisma)