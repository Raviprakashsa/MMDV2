import { NotFoundError, ConflictError } from '@/lib/core/app-error'
import { leadRepository, type CreateLeadInput, type UpdateLeadInput } from '@/lib/foundation/repositories/lead.repository'
import { companyRepository } from '@/lib/foundation/repositories/company.repository'
import { contactRepository } from '@/lib/foundation/repositories/contact.repository'
import { userRepository } from '@/lib/foundation/repositories/user.repository'
import { requireCrmPermission } from '@/lib/core/crm-permissions'
import type { TenantContext } from '@/lib/foundation/repositories/tenant-aware.repository'
import type { LeadStatus } from '@prisma/client'
import { trackActivity } from '@/lib/core/activity-tracker'

/**
 * Lead pipeline state machine — the single source of truth for valid transitions.
 * Only this map is used to validate status changes; there is no other FSM path.
 */
const AllowedTransitions: Record<LeadStatus, LeadStatus[]> = {
  NEW:       ['CONTACTED'],
  CONTACTED: ['QUALIFIED', 'LOST'],
  QUALIFIED: ['PROPOSAL',  'LOST'],
  PROPOSAL:  ['WON',       'LOST'],
  WON:       [],
  LOST:      [],
}

/**
 * LeadService — Service Layer RBAC boundary and single FSM transition engine.
 *
 * Every public method checks CRM permissions via requireCrmPermission().
 * All status transitions are validated by the private validateStatusTransition()
 * method; no caller bypasses this check.
 */
export class LeadService {
  // ─── Private FSM Engine ─────────────────────────────────────────────────────

  /**
   * Single transition engine. Called by every code path that changes lead status.
   * Throws ConflictError for invalid transitions; no-ops when status is unchanged.
   */
  private validateStatusTransition(from: LeadStatus, to: LeadStatus): void {
    if (from === to) return // status unchanged — always valid
    const allowed = AllowedTransitions[from] ?? []
    if (!allowed.includes(to)) {
      throw new ConflictError(
        `Invalid status transition: ${from} → ${to}. Allowed from ${from}: [${allowed.join(', ') || 'none'}]`,
      )
    }
  }

  // ─── Public Service Methods ──────────────────────────────────────────────────

  async list(ctx: TenantContext, filters: Parameters<typeof leadRepository.list>[1] = {}) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')
    requireCrmPermission(ctx.userRole, 'crm:read')
    return leadRepository.list(ctx, filters)
  }

  async get(ctx: TenantContext, id: string) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')
    requireCrmPermission(ctx.userRole, 'crm:read')
    const lead = await leadRepository.findById(ctx, id)
    if (!lead) throw new NotFoundError('Lead not found')
    return lead
  }

  async create(ctx: TenantContext, input: CreateLeadInput) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')
    requireCrmPermission(ctx.userRole, 'crm:create')

    // validate related entities if provided
    if (input.companyId) {
      const c = await companyRepository.findById(ctx, input.companyId)
      if (!c) throw new NotFoundError('Company not found')
    }
    if (input.contactId) {
      const ct = await contactRepository.findById(ctx, input.contactId)
      if (!ct) throw new NotFoundError('Contact not found')
    }
    if (input.ownerId) {
      const owner = await userRepository.findById(ctx, input.ownerId)
      if (!owner) throw new NotFoundError('Owner not found')
    }

    if (!input.status) input.status = 'NEW' as LeadStatus

    const result = await leadRepository.create(ctx, input)

    if (ctx.userId) {
      await trackActivity({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        module: 'CRM',
        entityType: 'Lead',
        entityId: result.id,
        action: 'CREATE_LEAD',
        metadata: { title: result.title }
      }).catch(console.error)
    }

    return result
  }

  async update(ctx: TenantContext, id: string, input: UpdateLeadInput) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')
    requireCrmPermission(ctx.userRole, 'crm:update')

    const existing = await leadRepository.findById(ctx, id)
    if (!existing) throw new NotFoundError('Lead not found')

    // FSM validation when status changes — single engine
    if (input.status && input.status !== existing.status) {
      this.validateStatusTransition(existing.status as LeadStatus, input.status)
    }

    // validate cross-entity changes
    if (input.companyId && input.companyId !== existing.companyId) {
      const c = await companyRepository.findById(ctx, input.companyId)
      if (!c) throw new NotFoundError('Company not found')
    }
    if (input.contactId && input.contactId !== existing.contactId) {
      const ct = await contactRepository.findById(ctx, input.contactId)
      if (!ct) throw new NotFoundError('Contact not found')
    }
    if (input.ownerId && input.ownerId !== existing.ownerId) {
      const owner = await userRepository.findById(ctx, input.ownerId)
      if (!owner) throw new NotFoundError('Owner not found')
    }

    const result = await leadRepository.updateById(ctx, id, input)

    if (ctx.userId && result) {
      const isConvert = input.status === 'WON'
      await trackActivity({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        module: 'CRM',
        entityType: 'Lead',
        entityId: id,
        action: isConvert ? 'CONVERT_LEAD' : 'UPDATE_LEAD',
        metadata: { title: result.title, status: result.status }
      }).catch(console.error)
    }

    return result
  }

  /**
   * updateStatusWithMeta — primary FSM transition + metadata update in one atomic write.
   *
   * This is the canonical method for changing a lead's pipeline status from the UI.
   * It calls validateStatusTransition() (the single FSM engine) and updates both
   * the status column and the description JSON in a single repository call.
   */
  async updateStatusWithMeta(
    ctx: TenantContext,
    id: string,
    newStatus: LeadStatus,
    metaJson?: string,
  ) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')
    requireCrmPermission(ctx.userRole, 'crm:update')

    const existing = await leadRepository.findById(ctx, id)
    if (!existing) throw new NotFoundError('Lead not found')

    // Single FSM engine — same validateStatusTransition used everywhere
    this.validateStatusTransition(existing.status as LeadStatus, newStatus)

    const result = await leadRepository.updateById(ctx, id, {
      status: newStatus,
      ...(metaJson !== undefined ? { description: metaJson } : {}),
    })

    if (ctx.userId && result) {
      const isConvert = newStatus === 'WON'
      await trackActivity({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        module: 'CRM',
        entityType: 'Lead',
        entityId: id,
        action: isConvert ? 'CONVERT_LEAD' : 'UPDATE_LEAD',
        metadata: { title: result.title, status: result.status }
      }).catch(console.error)
    }

    return result
  }

  /**
   * changeStatus — lightweight wrapper around updateStatusWithMeta.
   * Retained for backwards compatibility with API routes.
   * No FSM logic here — delegates entirely to updateStatusWithMeta.
   */
  async changeStatus(ctx: TenantContext, id: string, newStatus: LeadStatus) {
    return this.updateStatusWithMeta(ctx, id, newStatus)
  }

  async deactivate(ctx: TenantContext, id: string) {
    if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')
    requireCrmPermission(ctx.userRole, 'crm:delete')

    const existing = await leadRepository.findById(ctx, id)
    if (!existing) throw new NotFoundError('Lead not found')
    return leadRepository.softDelete(ctx, id)
  }
}

export const leadService = new LeadService()
