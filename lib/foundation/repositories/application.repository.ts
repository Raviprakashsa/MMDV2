import type { PrismaClient, Application, ApplicationStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { TenantAwareRepository, type TenantContext } from '@/lib/foundation/repositories/tenant-aware.repository'

export interface CreateApplicationInput {
  jobPostingId: string
  candidateId: string
  status?: ApplicationStatus
  appliedAt?: Date | string
}

export interface UpdateApplicationInput {
  status?: ApplicationStatus
  appliedAt?: Date | string
}

export class ApplicationRepository extends TenantAwareRepository {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient)
  }

  create(context: TenantContext, input: CreateApplicationInput) {
    const tenantId = this.requireTenant(context)
    return this.prisma.application.create({
      data: {
        tenantId,
        ...input,
      },
    })
  }

  findById(context: TenantContext, id: string) {
    return this.prisma.application.findFirst({
      where: this.withTenant(context, { id }),
    })
  }

  listByTenant(context: TenantContext) {
    return this.prisma.application.findMany({
      where: this.withTenant(context, {}),
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  findByCandidate(context: TenantContext, candidateId: string) {
    return this.prisma.application.findMany({
      where: this.withTenant(context, { candidateId }),
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  findByJobPosting(context: TenantContext, jobPostingId: string) {
    return this.prisma.application.findMany({
      where: this.withTenant(context, { jobPostingId }),
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  updateById(context: TenantContext, id: string, input: UpdateApplicationInput) {
    const where = this.withTenant(context, { id })
    return this.prisma.$transaction([
      this.prisma.application.updateMany({
        where,
        data: { ...input },
      }),
      this.prisma.application.findFirst({
        where,
      }),
    ]).then(([_res, updated]) => updated)
  }

  softDeleteById(context: TenantContext, id: string) {
    return this.prisma.application.updateMany({
      where: this.withTenant(context, { id }),
      data: this.markDeleted(),
    })
  }
}

export const applicationRepository = new ApplicationRepository(prisma)
