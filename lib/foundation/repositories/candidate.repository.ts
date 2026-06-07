import type { PrismaClient, Candidate, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { TenantAwareRepository, type TenantContext } from '@/lib/foundation/repositories/tenant-aware.repository'

export interface CreateCandidateInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  currentLocation?: string | null
  totalExperience?: Prisma.Decimal | number | string | null
  currentCompany?: string | null
  currentDesignation?: string | null
  resumeUrl: string
  linkedinUrl?: string | null
  portfolioUrl?: string | null
}

export interface UpdateCandidateInput {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  currentLocation?: string | null
  totalExperience?: Prisma.Decimal | number | string | null
  currentCompany?: string | null
  currentDesignation?: string | null
  resumeUrl?: string
  linkedinUrl?: string | null
  portfolioUrl?: string | null
}

export class CandidateRepository extends TenantAwareRepository {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient)
  }

  create(context: TenantContext, input: CreateCandidateInput) {
    const tenantId = this.requireTenant(context)
    return this.prisma.candidate.create({
      data: {
        tenantId,
        ...input,
      },
    })
  }

  findById(context: TenantContext, id: string) {
    return this.prisma.candidate.findFirst({
      where: this.withTenant(context, { id }),
    })
  }

  findByEmail(context: TenantContext, email: string) {
    return this.prisma.candidate.findFirst({
      where: this.withTenant(context, { email }),
    })
  }

  listByTenant(context: TenantContext) {
    return this.prisma.candidate.findMany({
      where: this.withTenant(context, {}),
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  updateById(context: TenantContext, id: string, input: UpdateCandidateInput) {
    const where = this.withTenant(context, { id })
    return this.prisma.$transaction([
      this.prisma.candidate.updateMany({
        where,
        data: { ...input },
      }),
      this.prisma.candidate.findFirst({
        where,
      }),
    ]).then(([_res, updated]) => updated)
  }

  softDeleteById(context: TenantContext, id: string) {
    return this.prisma.candidate.updateMany({
      where: this.withTenant(context, { id }),
      data: this.markDeleted(),
    })
  }
}

export const candidateRepository = new CandidateRepository(prisma)
