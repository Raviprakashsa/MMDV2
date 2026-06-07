import { NotFoundError, ValidationError, ConflictError, ForbiddenError } from '@/lib/core/app-error'
import { applicationRepository, type CreateApplicationInput, type UpdateApplicationInput } from '@/lib/foundation/repositories/application.repository'
import { candidateRepository } from '@/lib/foundation/repositories/candidate.repository'
import { jobPostingRepository } from '@/lib/foundation/repositories/job-posting.repository'
import type { ApplicationStatus } from '@prisma/client'

type TenantContext = { tenantId: string; userId?: string }

const AllowedTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  APPLIED: ['SCREENING', 'WITHDRAWN'],
  SCREENING: ['SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
  SHORTLISTED: ['INTERVIEW', 'REJECTED', 'WITHDRAWN'],
  INTERVIEW: ['OFFERED', 'REJECTED', 'WITHDRAWN'],
  OFFERED: ['HIRED', 'REJECTED', 'WITHDRAWN'],
  HIRED: [],
  REJECTED: [],
  WITHDRAWN: [],
}

export class ApplicationService {
  async create(ctx: TenantContext, input: CreateApplicationInput) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')

    if (!input.candidateId) throw new ValidationError('Candidate ID is required')
    if (!input.jobPostingId) throw new ValidationError('Job posting ID is required')

    const candidate = await candidateRepository.findById(ctx, input.candidateId)
    if (!candidate) throw new NotFoundError('Candidate not found')
    if (candidate.tenantId !== ctx.tenantId) throw new ForbiddenError('Candidate tenant mismatch')

    const jobPosting = await jobPostingRepository.findById(ctx, input.jobPostingId)
    if (!jobPosting) throw new NotFoundError('Job posting not found')
    if (jobPosting.tenantId !== ctx.tenantId) throw new ForbiddenError('Job posting tenant mismatch')

    const existingApps = await applicationRepository.findByCandidate(ctx, input.candidateId)
    const duplicate = existingApps.find(app => app.jobPostingId === input.jobPostingId)
    if (duplicate) {
      throw new ConflictError('Candidate has already applied for this job posting')
    }

    return applicationRepository.create(ctx, input)
  }

  async update(ctx: TenantContext, id: string, input: UpdateApplicationInput) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')

    const existing = await applicationRepository.findById(ctx, id)
    if (!existing) throw new NotFoundError('Application not found')

    if (input.status !== undefined && input.status !== existing.status) {
      const current = existing.status as ApplicationStatus
      const allowed = AllowedTransitions[current] ?? []
      if (!allowed.includes(input.status)) {
        throw new ConflictError(`Invalid status transition from ${current} to ${input.status}`)
      }
    }

    return applicationRepository.updateById(ctx, id, input)
  }

  async changeStatus(ctx: TenantContext, id: string, newStatus: ApplicationStatus) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')

    const existing = await applicationRepository.findById(ctx, id)
    if (!existing) throw new NotFoundError('Application not found')

    const current = existing.status as ApplicationStatus
    const allowed = AllowedTransitions[current] ?? []
    if (!allowed.includes(newStatus)) {
      throw new ConflictError(`Invalid status transition from ${current} to ${newStatus}`)
    }

    return applicationRepository.updateById(ctx, id, { status: newStatus })
  }

  async get(ctx: TenantContext, id: string) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')

    const application = await applicationRepository.findById(ctx, id)
    if (!application) throw new NotFoundError('Application not found')

    return application
  }

  async list(ctx: TenantContext) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')

    return applicationRepository.listByTenant(ctx)
  }
}

export const applicationService = new ApplicationService()
