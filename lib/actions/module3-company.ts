"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import {
  CompanySchema,
  CompanyUpdateWithIdSchema,
} from "@/lib/validators/common"
import { serializeDoc, serializeDocs } from "@/lib/utils/serialize"
import { createProtectedAction } from "@/lib/core/action-client"
import { companyService } from "@/lib/foundation/services/company.service"
import { contactService } from "@/lib/foundation/services/contact.service"

// Local Schemas
const GetByIdSchema = z.object({ id: z.string().min(1) })
const DeleteSchema = z.object({ id: z.string().min(1) })

/**
 * Get Companies Action
 */
export const getCompanies = createProtectedAction(
  z.any().optional(),
  async (_, session) => {
    const ctx = { tenantId: session.user.tenantId!, userId: session.user.userId, userRole: (session.user as any).role as string }
    const companies = await companyService.list(ctx)
    
    const mapped = await Promise.all(
      companies.map(async (company) => {
        const contacts = await contactService.list(ctx, { companyId: company.id })
        return {
          ...company,
          _id: company.id,
          sector: company.industry,
          location: 'Unknown',
          contacts: contacts.map(c => ({
            _id: c.id,
            name: `${c.firstName} ${c.lastName}`.trim(),
            designation: c.title,
            email: c.email,
            phone: c.phone,
          }))
        }
      })
    )
    
    return serializeDocs(mapped)
  }
)

/**
 * Get Single Company Action
 */
export const getCompanyById = createProtectedAction(
  GetByIdSchema.or(z.string().min(1).transform(id => ({ id }))),
  async (payload, session) => {
    const id = typeof payload === 'string' ? payload : payload.id
    const ctx = { tenantId: session.user.tenantId!, userId: session.user.userId, userRole: (session.user as any).role as string }
    const company = await companyService.get(ctx, id)
    
    const contacts = await contactService.list(ctx, { companyId: company.id })
    const companyCompat = {
      ...company,
      _id: company.id,
      sector: company.industry,
      location: 'Unknown',
      contacts: contacts.map(c => ({
        _id: c.id,
        name: `${c.firstName} ${c.lastName}`.trim(),
        designation: c.title,
        email: c.email,
        phone: c.phone,
      }))
    }
    
    return serializeDoc(companyCompat)
  }
)

/**
 * Create Company Action
 */
export const createCompanyAction = createProtectedAction(
  CompanySchema,
  async (payload, session) => {
    const ctx = { tenantId: session.user.tenantId!, userId: session.user.userId, userRole: (session.user as any).role as string }
    const company = await companyService.create(ctx, {
      name: payload.name,
      website: payload.website || '',
      industry: payload.sector || payload.category || 'IT',
      phone: payload.phone || '',
      email: payload.email || '',
    })

    if (payload.hrContacts && payload.hrContacts.length > 0) {
      for (const contact of payload.hrContacts) {
        const names = contact.name.trim().split(/\s+/)
        const firstName = names[0] || 'Primary'
        const lastName = names.slice(1).join(' ') || 'Contact'
        await contactService.create(ctx, {
          companyId: company.id,
          firstName,
          lastName,
          email: contact.email || '',
          phone: contact.phone || '',
          title: contact.designation || contact.title || 'HR',
        })
      }
    }

    const contacts = await contactService.list(ctx, { companyId: company.id })
    const companyCompat = {
      ...company,
      _id: company.id,
      sector: company.industry,
      location: 'Unknown',
      contacts: contacts.map(c => ({
        _id: c.id,
        name: `${c.firstName} ${c.lastName}`.trim(),
        designation: c.title,
        email: c.email,
        phone: c.phone,
      }))
    }

    revalidatePath('/dashboard/companies')
    return serializeDoc(companyCompat)
  }
)

/**
 * Update Company Action
 */
export const updateCompanyAction = createProtectedAction(
  CompanyUpdateWithIdSchema,
  async (payload, session) => {
    const { id, ...data } = payload
    const ctx = { tenantId: session.user.tenantId!, userId: session.user.userId, userRole: (session.user as any).role as string }

    const company = await companyService.update(ctx, id, {
      name: data.name,
      website: data.website,
      industry: data.sector || data.category,
      phone: data.phone,
      email: data.email,
    })
    
    if (!company) {
      throw new Error("Company not found")
    }

    if (data.hrContacts) {
      const existingContacts = await contactService.list(ctx, { companyId: id })
      for (const contact of existingContacts) {
        await contactService.deactivate(ctx, contact.id)
      }
      for (const contact of data.hrContacts) {
        const names = contact.name.trim().split(/\s+/)
        const firstName = names[0] || 'Primary'
        const lastName = names.slice(1).join(' ') || 'Contact'
        await contactService.create(ctx, {
          companyId: company.id,
          firstName,
          lastName,
          email: contact.email || '',
          phone: contact.phone || '',
          title: contact.designation || contact.title || 'HR',
        })
      }
    }

    const contacts = await contactService.list(ctx, { companyId: company.id })
    const companyCompat = {
      ...company,
      _id: company.id,
      sector: company.industry,
      location: 'Unknown',
      contacts: contacts.map(c => ({
        _id: c.id,
        name: `${c.firstName} ${c.lastName}`.trim(),
        designation: c.title,
        email: c.email,
        phone: c.phone,
      }))
    }

    revalidatePath('/dashboard/companies')
    return serializeDoc(companyCompat)
  }
)

/**
 * Delete Company Action
 */
export const deleteCompany = createProtectedAction(
  DeleteSchema.or(z.string().min(1).transform(id => ({ id }))),
  async (payload, session) => {
    const id = typeof payload === 'string' ? payload : payload.id
    const ctx = { tenantId: session.user.tenantId!, userId: session.user.userId, userRole: (session.user as any).role as string }
    
    await companyService.deactivate(ctx, id)
    
    const contacts = await contactService.list(ctx, { companyId: id })
    for (const c of contacts) {
      await contactService.deactivate(ctx, c.id)
    }

    revalidatePath('/dashboard/companies')
    return { success: true }
  }
)
