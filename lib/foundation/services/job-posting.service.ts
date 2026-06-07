import { NotFoundError, ValidationError } from '@/lib/core/app-error'
import { jobPostingRepository, type CreateJobPostingInput, type UpdateJobPostingInput } from '@/lib/foundation/repositories/job-posting.repository'
import type { JobPostingStatus } from '@prisma/client'

type TenantContext = { tenantId: string; userId?: string }

export class JobPostingService {
  async create(ctx: TenantContext, input: CreateJobPostingInput) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')

    if (!input.title || !input.title.trim()) {
      throw new ValidationError('Title is required')
    }

    return jobPostingRepository.create(ctx, {
      ...input,
      title: input.title.trim(),
    })
  }

  async update(ctx: TenantContext, id: string, input: UpdateJobPostingInput) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')

    const existing = await jobPostingRepository.findById(ctx, id)
    if (!existing) throw new NotFoundError('Job posting not found')

    if (input.title !== undefined && (!input.title || !input.title.trim())) {
      throw new ValidationError('Title is required')
    }

    return jobPostingRepository.updateById(ctx, id, {
      ...input,
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
    })
  }

  async get(ctx: TenantContext, id: string) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')

    const jobPosting = await jobPostingRepository.findById(ctx, id)
    if (!jobPosting) throw new NotFoundError('Job posting not found')

    return jobPosting
  }

  async list(ctx: TenantContext) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')

    return jobPostingRepository.listByTenant(ctx)
  }

  async close(ctx: TenantContext, id: string) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')

    const existing = await jobPostingRepository.findById(ctx, id)
    if (!existing) throw new NotFoundError('Job posting not found')

    return jobPostingRepository.updateById(ctx, id, { status: 'CLOSED' as JobPostingStatus })
  }

  async reopen(ctx: TenantContext, id: string) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')

    const existing = await jobPostingRepository.findById(ctx, id)
    if (!existing) throw new NotFoundError('Job posting not found')

    if (existing.status === ('CLOSED' as JobPostingStatus)) {
      throw new ValidationError('Cannot reopen CLOSED posting')
    }

    return jobPostingRepository.updateById(ctx, id, { status: 'OPEN' as JobPostingStatus })
  }

  async delete(ctx: TenantContext, id: string) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')

    const existing = await jobPostingRepository.findById(ctx, id)
    if (!existing) throw new NotFoundError('Job posting not found')

    return jobPostingRepository.softDeleteById(ctx, id)
  }
}

export const jobPostingService = new JobPostingService()
