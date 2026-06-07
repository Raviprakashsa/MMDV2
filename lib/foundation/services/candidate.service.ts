import { NotFoundError, ValidationError, ConflictError } from '@/lib/core/app-error'
import { candidateRepository, type CreateCandidateInput, type UpdateCandidateInput } from '@/lib/foundation/repositories/candidate.repository'
import { trackActivity } from '@/lib/core/activity-tracker'

type TenantContext = { tenantId: string; userId?: string }

export class CandidateService {
  async create(ctx: TenantContext, input: CreateCandidateInput) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')

    if (!input.email || !input.email.trim()) {
      throw new ValidationError('Email is required')
    }

    const email = input.email.trim().toLowerCase()

    const existing = await candidateRepository.findByEmail(ctx, email)
    if (existing) {
      throw new ConflictError('Candidate email already exists in this tenant')
    }

    const result = await candidateRepository.create(ctx, {
      ...input,
      email,
    })

    if (ctx.userId) {
      await trackActivity({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        module: 'ATS',
        entityType: 'Candidate',
        entityId: result.id,
        action: 'CREATE_CANDIDATE',
        metadata: { name: `${result.firstName} ${result.lastName}` }
      }).catch(console.error)
    }

    return result
  }

  async update(ctx: TenantContext, id: string, input: UpdateCandidateInput) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')

    const existing = await candidateRepository.findById(ctx, id)
    if (!existing) throw new NotFoundError('Candidate not found')

    let email = input.email
    if (email !== undefined) {
      if (!email || !email.trim()) {
        throw new ValidationError('Email is required')
      }
      email = email.trim().toLowerCase()
      if (email !== existing.email) {
        const dup = await candidateRepository.findByEmail(ctx, email)
        if (dup) {
          throw new ConflictError('Candidate email already exists in this tenant')
        }
      }
    }

    const result = await candidateRepository.updateById(ctx, id, {
      ...input,
      ...(email !== undefined ? { email } : {}),
    })

    if (ctx.userId && result) {
      await trackActivity({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        module: 'ATS',
        entityType: 'Candidate',
        entityId: id,
        action: 'UPDATE_CANDIDATE',
        metadata: { name: `${result.firstName} ${result.lastName}` }
      }).catch(console.error)
    }

    return result
  }

  async get(ctx: TenantContext, id: string) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')

    const candidate = await candidateRepository.findById(ctx, id)
    if (!candidate) throw new NotFoundError('Candidate not found')

    return candidate
  }

  async list(ctx: TenantContext) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')

    return candidateRepository.listByTenant(ctx)
  }

  async delete(ctx: TenantContext, id: string) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')

    const existing = await candidateRepository.findById(ctx, id)
    if (!existing) throw new NotFoundError('Candidate not found')

    return candidateRepository.softDeleteById(ctx, id)
  }
}

export const candidateService = new CandidateService()
