import type { PrismaClient, Interview, InterviewStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { TenantAwareRepository, type TenantContext } from '@/lib/foundation/repositories/tenant-aware.repository'

export interface CreateInterviewInput {
  applicationId: string
  interviewerId: string
  round?: number
  feedback?: string | null
  rating?: number | null
  status?: InterviewStatus
  scheduledAt: Date | string
}

export interface UpdateInterviewInput {
  interviewerId?: string
  round?: number
  feedback?: string | null
  rating?: number | null
  status?: InterviewStatus
  scheduledAt?: Date | string
}

export class InterviewRepository extends TenantAwareRepository {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient)
  }

  create(context: TenantContext, input: CreateInterviewInput) {
    const tenantId = this.requireTenant(context)
    return this.prisma.interview.create({
      data: {
        tenantId,
        ...input,
      },
    })
  }

  findById(context: TenantContext, id: string) {
    return this.prisma.interview.findFirst({
      where: this.withTenant(context, { id }),
    })
  }

  listByTenant(context: TenantContext) {
    return this.prisma.interview.findMany({
      where: this.withTenant(context, {}),
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  findByApplication(context: TenantContext, applicationId: string) {
    return this.prisma.interview.findMany({
      where: this.withTenant(context, { applicationId }),
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  updateById(context: TenantContext, id: string, input: UpdateInterviewInput) {
    const where = this.withTenant(context, { id })
    return this.prisma.$transaction([
      this.prisma.interview.updateMany({
        where,
        data: { ...input },
      }),
      this.prisma.interview.findFirst({
        where,
      }),
    ]).then(([_res, updated]) => updated)
  }

  softDeleteById(context: TenantContext, id: string) {
    return this.prisma.interview.updateMany({
      where: this.withTenant(context, { id }),
      data: this.markDeleted(),
    })
  }
}

export const interviewRepository = new InterviewRepository(prisma)
