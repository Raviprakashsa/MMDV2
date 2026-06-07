"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import {
  LeadSchema,
  LeadStatusSchema,
  AddLeadActivitySchema
} from "@/lib/validators/common"
import { serializeDoc, serializeDocs } from "@/lib/utils/serialize"
import { createProtectedAction } from "@/lib/core/action-client"
import { leadService } from "@/lib/foundation/services/lead.service"
import { companyService } from "@/lib/foundation/services/company.service"
import { contactService } from "@/lib/foundation/services/contact.service"
import type { LeadStatus } from "@prisma/client"

// Local Schemas
const ConvertSchema = z.object({ leadId: z.string().min(1) })
const LeadUpdateSchema = LeadSchema.partial().extend({ id: z.string().min(1) })
const GetLeadsFilterSchema = z.object({ status: LeadStatusSchema.optional() })
const DeleteLeadSchema = z.object({ leadId: z.string().min(1) })

function mapLeadToCompat(lead: any) {
  if (!lead) return null
  let meta: any = {}
  try {
    meta = JSON.parse(lead.description || '{}')
  } catch {
    meta = { notes: lead.description }
  }
  
  // Map PostgreSQL WON/LOST status to UI compat status CONVERTED/REJECTED
  let uiStatus = lead.status
  if (lead.status === 'WON') uiStatus = 'CONVERTED'
  if (lead.status === 'LOST') uiStatus = 'REJECTED'
  
  return {
    ...meta,
    _id: lead.id,
    companyId: lead.companyId,
    contactId: lead.contactId,
    assignedTo: lead.ownerId || undefined,
    status: uiStatus,
    confidenceScore: Number(lead.value) || meta.confidenceScore || 50,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  }
}

function mapStatusToPostgres(uiStatus?: string): LeadStatus {
  if (uiStatus === 'CONVERTED') return 'WON' as LeadStatus
  if (uiStatus === 'REJECTED') return 'LOST' as LeadStatus
  if (uiStatus === 'FOLLOW_UP' || uiStatus === 'STALLED') return 'CONTACTED' as LeadStatus
  return (uiStatus || 'NEW') as LeadStatus
}

/**
 * Get Leads Action
 */
export const getLeads = createProtectedAction(
  GetLeadsFilterSchema.optional().default({}),
  async (payload, session) => {
    const ctx = { tenantId: session.user.tenantId!, userId: session.user.userId, userRole: (session.user as any).role as string }
    const filters: any = {}
    if (payload?.status) filters.status = mapStatusToPostgres(payload.status)
    
    const leads = await leadService.list(ctx, filters)
    const mapped = leads.map(mapLeadToCompat)
    return serializeDocs(mapped)
  }
)

/**
 * Create Lead Action
 */
export const createLead = createProtectedAction(
  LeadSchema,
  async (payload, session) => {
    const ctx = { tenantId: session.user.tenantId!, userId: session.user.userId, userRole: (session.user as any).role as string }
    
    const existingCompany = await companyService.list(ctx, { name: payload.companyName })
    const companyId = existingCompany && existingCompany[0] ? existingCompany[0].id : null
    
    const statusVal = mapStatusToPostgres(payload.status)
    
    const lead = await leadService.create(ctx, {
      title: payload.companyName,
      description: JSON.stringify(payload),
      status: statusVal,
      value: payload.confidenceScore || 50,
      ownerId: payload.assignedTo || session.user.userId || null,
      companyId,
    })
    
    revalidatePath('/dashboard/leads')
    revalidatePath('/dashboard')
    return serializeDoc(mapLeadToCompat(lead)!)
  }
)

/**
 * Bulk Create Leads Action
 */
export const bulkCreateLeads = createProtectedAction(
  z.array(LeadSchema),
  async (payload, session) => {
    const ctx = { tenantId: session.user.tenantId!, userId: session.user.userId, userRole: (session.user as any).role as string }
    for (const lead of payload) {
      const existingCompany = await companyService.list(ctx, { name: lead.companyName })
      const companyId = existingCompany && existingCompany[0] ? existingCompany[0].id : null
      
      const statusVal = mapStatusToPostgres(lead.status)
      
      await leadService.create(ctx, {
        title: lead.companyName,
        description: JSON.stringify(lead),
        status: statusVal,
        value: lead.confidenceScore || 50,
        ownerId: lead.assignedTo || session.user.userId || null,
        companyId,
      })
    }
    revalidatePath('/dashboard/leads')
    revalidatePath('/dashboard')
    return {
      insertedCount: payload.length,
      attemptedCount: payload.length
    }
  }
)

/**
 * Update Lead Action
 */
export const updateLead = createProtectedAction(
  LeadUpdateSchema,
  async (payload, session) => {
    const { id, ...data } = payload
    const ctx = { tenantId: session.user.tenantId!, userId: session.user.userId, userRole: (session.user as any).role as string }
    
    const existing = await leadService.get(ctx, id)
    let meta: any = {}
    try {
      meta = JSON.parse(existing.description || '{}')
    } catch {
      meta = {}
    }
    
    const updatedMeta = { ...meta, ...data }
    
    let companyId = existing.companyId
    if (data.companyName && data.companyName !== meta.companyName) {
      const existingCompany = await companyService.list(ctx, { name: data.companyName })
      companyId = existingCompany && existingCompany[0] ? existingCompany[0].id : null
    }
    
    const statusVal = mapStatusToPostgres(updatedMeta.status)
    
    const lead = await leadService.update(ctx, id, {
      title: updatedMeta.companyName || existing.title,
      description: JSON.stringify(updatedMeta),
      status: statusVal,
      value: updatedMeta.confidenceScore || Number(existing.value),
      ownerId: updatedMeta.assignedTo || existing.ownerId,
      companyId,
    })
    
    revalidatePath('/dashboard/leads')
    revalidatePath('/dashboard')
    return serializeDoc(mapLeadToCompat(lead)!)
  }
)

/**
 * Convert Lead to Company Action
 */
export const convertLeadToCompany = createProtectedAction(
  ConvertSchema,
  async (payload, session) => {
    const ctx = { tenantId: session.user.tenantId!, userId: session.user.userId, userRole: (session.user as any).role as string }
    const leadId = payload.leadId
    
    const lead = await leadService.get(ctx, leadId)
    let meta: any = {}
    try {
      meta = JSON.parse(lead.description || '{}')
    } catch {
      meta = {}
    }
    
    if (lead.status === ('WON' as LeadStatus) && lead.companyId) {
      const existingCompany = await companyService.get(ctx, lead.companyId)
      return {
        lead: serializeDoc(mapLeadToCompat(lead)!),
        alreadyConverted: true,
        company: serializeDoc({ ...existingCompany, _id: existingCompany.id })
      }
    }
    
    const company = await companyService.create(ctx, {
      name: meta.companyName,
      website: '',
      industry: meta.sector || 'IT',
      phone: meta.contactPhone || '',
      email: meta.contactEmail || '',
    })
    
    let contact = null
    if (meta.contactName) {
      const names = meta.contactName.trim().split(/\s+/)
      const firstName = names[0] || 'Primary'
      const lastName = names.slice(1).join(' ') || 'Contact'
      contact = await contactService.create(ctx, {
        companyId: company.id,
        firstName,
        lastName,
        email: meta.contactEmail || '',
        phone: meta.contactPhone || '',
        title: 'HR',
      })
    }
    
    meta.status = 'CONVERTED'
    const updatedLead = await leadService.update(ctx, leadId, {
      status: 'WON' as LeadStatus,
      companyId: company.id,
      contactId: contact?.id || null,
      description: JSON.stringify(meta),
    })
    
    revalidatePath('/dashboard/leads')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/companies')
    
    return {
      lead: serializeDoc(mapLeadToCompat(updatedLead)!),
      company: serializeDoc({ ...company, _id: company.id }),
      alreadyConverted: false
    }
  }
)

/**
 * Update Lead Status (Dedicated Action)
 */
const UpdateStatusSchema = z.object({
  leadId: z.string().min(1),
  status: LeadStatusSchema,
})

export const updateLeadStatus = createProtectedAction(
  UpdateStatusSchema,
  async (payload, session) => {
    // Build context with userRole so the service layer can enforce RBAC
    const ctx = { tenantId: session.user.tenantId!, userId: session.user.userId, userRole: (session.user as any).role as string }
    const lead = await leadService.get(ctx, payload.leadId)
    let meta: any = {}
    try {
      meta = JSON.parse(lead.description || '{}')
    } catch {
      meta = {}
    }
    meta.status = payload.status

    const statusVal = mapStatusToPostgres(payload.status)

    // Route through the single FSM transition engine — validates AllowedTransitions
    // then updates status + description JSON atomically in one DB write.
    const updatedLead = await leadService.updateStatusWithMeta(
      ctx,
      payload.leadId,
      statusVal,
      JSON.stringify(meta),
    )

    revalidatePath('/dashboard/leads')
    revalidatePath('/dashboard')
    return serializeDoc(mapLeadToCompat(updatedLead)!)
  }
)

/**
 * Add Activity Action
 */
export const addLeadActivity = createProtectedAction(
  AddLeadActivitySchema,
  async (payload, session) => {
    const ctx = { tenantId: session.user.tenantId!, userId: session.user.userId, userRole: (session.user as any).role as string }
    const leadId = payload.leadId
    
    const lead = await leadService.get(ctx, leadId)
    let meta: any = {}
    try {
      meta = JSON.parse(lead.description || '{}')
    } catch {
      meta = {}
    }
    
    const newActivity = {
      type: payload.activity.type,
      summary: payload.activity.summary,
      outcome: payload.activity.outcome,
      date: payload.activity.date,
      time: payload.activity.time,
      createdBy: session.user.id,
      createdByName: session.user.name || 'Unknown',
      nextFollowUp: payload.activity.nextFollowUp,
    }
    
    if (!meta.activities) meta.activities = []
    meta.activities.unshift(newActivity)
    
    let statusVal = lead.status
    if (lead.status === ('NEW' as LeadStatus)) {
      statusVal = 'CONTACTED' as LeadStatus
      meta.status = 'CONTACTED'
    }
    
    if (payload.activity.nextFollowUp) {
      meta.followUpDate = payload.activity.nextFollowUp
    }
    
    const updatedLead = await leadService.update(ctx, leadId, {
      description: JSON.stringify(meta),
      status: statusVal,
    })
    
    revalidatePath('/dashboard/leads')
    revalidatePath('/dashboard')
    return serializeDoc(mapLeadToCompat(updatedLead)!)
  }
)

/**
 * Delete Lead Action
 */
export const deleteLead = createProtectedAction(
  DeleteLeadSchema,
  async (payload, session) => {
    const ctx = { tenantId: session.user.tenantId!, userId: session.user.userId, userRole: (session.user as any).role as string }
    await leadService.deactivate(ctx, payload.leadId)
    revalidatePath('/dashboard/leads')
    revalidatePath('/dashboard')
    return { success: true }
  }
)

/**
 * Get Metrics Action
 */
export const getLeadMetrics = createProtectedAction(
  z.any().optional(),
  async (_, session) => {
    const ctx = { tenantId: session.user.tenantId!, userId: session.user.userId, userRole: (session.user as any).role as string }
    const leads = await leadService.list(ctx)
    const mapped = leads.map(mapLeadToCompat)
    
    const groups: Record<string, { total: number, converted: number }> = {}
    mapped.forEach(l => {
      if (!l) return
      const src = l.sourcePlatform || 'LEAD'
      if (!groups[src]) groups[src] = { total: 0, converted: 0 }
      groups[src].total++
      if (l.status === 'CONVERTED') groups[src].converted++
    })
    
    const result = Object.entries(groups).map(([sourcePlatform, val]) => ({
      sourcePlatform,
      conversionRate: val.total > 0 ? (val.converted / val.total) * 100 : 0,
      avgTimeToConvertHours: 0,
    }))
    
    return result
  }
)

/**
 * Get Enhanced Metrics Action
 */
export const getEnhancedLeadMetrics = createProtectedAction(
  z.any().optional(),
  async (_, session) => {
    const ctx = { tenantId: session.user.tenantId!, userId: session.user.userId, userRole: (session.user as any).role as string }
    const leads = await leadService.list(ctx)
    const mapped = leads.map(mapLeadToCompat).filter(Boolean) as any[]
    const now = new Date()
    
    const total = mapped.length
    const converted = mapped.filter(l => l.status === 'CONVERTED').length
    const conversionRate = total > 0 ? (converted / total) * 100 : 0
    
    const followUpsDue = mapped.filter(l => {
      if (!l.followUpDate) return false
      const followUp = new Date(l.followUpDate)
      return followUp <= now && l.status !== 'CONVERTED'
    }).length
    
    const overdue = mapped.filter(l => {
      if (!l.followUpDate) return false
      const followUp = new Date(l.followUpDate)
      const daysBehind = Math.floor((now.getTime() - followUp.getTime()) / (1000 * 60 * 60 * 24))
      return daysBehind > 0 && l.status !== 'CONVERTED'
    }).length
    
    const avgConfidence = total > 0
      ? Math.round(mapped.reduce((acc, l) => acc + (l.confidenceScore || 0), 0) / total)
      : 0
      
    const byStatus: Record<string, number> = {}
    mapped.forEach(l => {
      byStatus[l.status] = (byStatus[l.status] || 0) + 1
    })
    
    const sourceMap = new Map<string, number>()
    mapped.forEach(l => {
      const src = l.sourcePlatform || 'LEAD'
      const count = sourceMap.get(src) || 0
      sourceMap.set(src, count + 1)
    })
    const bySource = Array.from(sourceMap.entries()).map(([name, value]) => ({ name, value }))
    
    return {
      total,
      converted,
      conversionRate,
      followUpsDue,
      overdue,
      avgConfidence,
      byStatus,
      bySource,
      avgDaysToContact: 0,
      avgDaysToConvert: 0,
    }
  }
)
