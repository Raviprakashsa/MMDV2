import { NotFoundError, ValidationError, ConflictError, ForbiddenError } from '@/lib/core/app-error'
import { interviewRepository, type CreateInterviewInput, type UpdateInterviewInput } from '@/lib/foundation/repositories/interview.repository'
import { applicationRepository } from '@/lib/foundation/repositories/application.repository'
import { userRepository } from '@/lib/foundation/repositories/user.repository'
import type { InterviewStatus } from '@prisma/client'

type TenantContext = { tenantId: string; userId?: string }

const AllowedTransitions: Record<InterviewStatus, InterviewStatus[]> = {
  SCHEDULED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
}

export class InterviewService {
  async create(ctx: TenantContext, input: CreateInterviewInput) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')

    if (!input.applicationId) throw new ValidationError('Application ID is required')
    if (!input.interviewerId) throw new ValidationError('Interviewer ID is required')

    const application = await applicationRepository.findById(ctx, input.applicationId)
    if (!application) throw new NotFoundError('Application not found')
    if (application.tenantId !== ctx.tenantId) throw new ForbiddenError('Application tenant mismatch')

    const interviewer = await userRepository.findById(ctx, input.interviewerId)
    if (!interviewer) throw new NotFoundError('Interviewer not found')
    if (interviewer.tenantId !== ctx.tenantId) throw new ForbiddenError('Interviewer tenant mismatch')

    return interviewRepository.create(ctx, input)
  }

  async update(ctx: TenantContext, id: string, input: UpdateInterviewInput) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')

    const existing = await interviewRepository.findById(ctx, id)
    if (!existing) throw new NotFoundError('Interview not found')

    if (input.interviewerId !== undefined) {
      const interviewer = await userRepository.findById(ctx, input.interviewerId)
      if (!interviewer) throw new NotFoundError('Interviewer not found')
      if (interviewer.tenantId !== ctx.tenantId) throw new ForbiddenError('Interviewer tenant mismatch')
    }

    if (input.status !== undefined && input.status !== existing.status) {
      const current = existing.status as InterviewStatus
      const allowed = AllowedTransitions[current] ?? []
      if (!allowed.includes(input.status)) {
        throw new ConflictError(`Invalid status transition from ${current} to ${input.status}`)
      }
    }

    return interviewRepository.updateById(ctx, id, input)
  }

  async changeStatus(ctx: TenantContext, id: string, newStatus: InterviewStatus) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')

    const existing = await interviewRepository.findById(ctx, id)
    if (!existing) throw new NotFoundError('Interview not found')

    const current = existing.status as InterviewStatus
    const allowed = AllowedTransitions[current] ?? []
    if (!allowed.includes(newStatus)) {
      throw new ConflictError(`Invalid status transition from ${current} to ${newStatus}`)
    }

    return interviewRepository.updateById(ctx, id, { status: newStatus })
  }

  async get(ctx: TenantContext, id: string) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')

    const interview = await interviewRepository.findById(ctx, id)
    if (!interview) throw new NotFoundError('Interview not found')

    return interview
  }

  async list(ctx: TenantContext) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')

    return interviewRepository.listByTenant(ctx)
  }
}

export const interviewService = new InterviewService()
