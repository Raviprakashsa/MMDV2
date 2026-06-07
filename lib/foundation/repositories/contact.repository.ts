import type { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { TenantAwareRepository, type TenantContext } from '@/lib/foundation/repositories/tenant-aware.repository'

export interface CreateContactInput {
  companyId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  title: string
}

export interface UpdateContactInput {
  companyId?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  title?: string
}

export interface ContactListFilters {
  companyId?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  title?: string
}

export class ContactRepository extends TenantAwareRepository {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient)
  }

  create(context: TenantContext, input: CreateContactInput) {
    const tenantId = this.requireTenant(context)
    return this.prisma.contact.create({ data: { tenantId, ...input } })
  }

  findById(context: TenantContext, id: string) {
    return this.prisma.contact.findFirst({ where: this.withTenant(context, { id }) })
  }

  findByEmail(context: TenantContext, email: string) {
    return this.prisma.contact.findFirst({ where: this.withTenant(context, { email }) })
  }

  updateById(context: TenantContext, id: string, input: UpdateContactInput) {
    const where = this.withTenant(context, { id })
    return this.prisma.$transaction([
      this.prisma.contact.updateMany({ where, data: { ...input } }),
      this.prisma.contact.findFirst({ where }),
    ]).then(([_res, updated]) => updated)
  }

  list(context: TenantContext, filters: ContactListFilters = {}) {
    const where = this.withTenant(context, {
      ...(filters.companyId !== undefined ? { companyId: filters.companyId } : {}),
      ...(filters.firstName !== undefined ? { firstName: filters.firstName } : {}),
      ...(filters.lastName !== undefined ? { lastName: filters.lastName } : {}),
      ...(filters.email !== undefined ? { email: filters.email } : {}),
      ...(filters.phone !== undefined ? { phone: filters.phone } : {}),
      ...(filters.title !== undefined ? { title: filters.title } : {}),
    })

    return this.prisma.contact.findMany({ where, orderBy: { createdAt: 'desc' } })
  }

  softDelete(context: TenantContext, id: string) {
    return this.prisma.contact.updateMany({
      where: this.withTenant(context, { id }),
      data: this.markDeleted(),
    })
  }
}

export const contactRepository = new ContactRepository(prisma)