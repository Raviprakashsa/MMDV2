import type { PrismaClient, JobPosting, JobPostingStatus, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { TenantAwareRepository, type TenantContext } from '@/lib/foundation/repositories/tenant-aware.repository'

export interface CreateJobPostingInput {
  title: string
  department: string
  location: string
  employmentType: string
  description: string
  requirements: string
  salaryMin?: Prisma.Decimal | number | string | null
  salaryMax?: Prisma.Decimal | number | string | null
  status?: JobPostingStatus
}

export interface UpdateJobPostingInput {
  title?: string
  department?: string
  location?: string
  employmentType?: string
  description?: string
  requirements?: string
  salaryMin?: Prisma.Decimal | number | string | null
  salaryMax?: Prisma.Decimal | number | string | null
  status?: JobPostingStatus
}

export class JobPostingRepository extends TenantAwareRepository {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient)
  }

  create(context: TenantContext, input: CreateJobPostingInput) {
    const tenantId = this.requireTenant(context)
    return this.prisma.jobPosting.create({
      data: {
        tenantId,
        ...input,
      },
    })
  }

  findById(context: TenantContext, id: string) {
    return this.prisma.jobPosting.findFirst({
      where: this.withTenant(context, { id }),
    })
  }

  listByTenant(context: TenantContext) {
    return this.prisma.jobPosting.findMany({
      where: this.withTenant(context, {}),
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  findByStatus(context: TenantContext, status: JobPostingStatus) {
    return this.prisma.jobPosting.findMany({
      where: this.withTenant(context, { status }),
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  updateById(context: TenantContext, id: string, input: UpdateJobPostingInput) {
    const where = this.withTenant(context, { id })
    return this.prisma.$transaction([
      this.prisma.jobPosting.updateMany({
        where,
        data: { ...input },
      }),
      this.prisma.jobPosting.findFirst({
        where,
      }),
    ]).then(([_res, updated]) => updated)
  }

  softDeleteById(context: TenantContext, id: string) {
    return this.prisma.jobPosting.updateMany({
      where: this.withTenant(context, { id }),
      data: this.markDeleted(),
    })
  }
}

export const jobPostingRepository = new JobPostingRepository(prisma)
