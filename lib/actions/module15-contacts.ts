"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { serializeDoc, serializeDocs } from "@/lib/utils/serialize"
import { createProtectedAction } from "@/lib/core/action-client"
import { contactService } from "@/lib/foundation/services/contact.service"
import { companyService } from "@/lib/foundation/services/company.service"

const ContactActionSchema = z.object({
  companyId: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  title: z.string().min(1),
})

const ContactUpdateActionSchema = ContactActionSchema.partial().extend({
  id: z.string().min(1),
})

const GetByIdSchema = z.object({ id: z.string().min(1) })

function mapContactToCompat(c: any, companyName = 'Unknown Company') {
  if (!c) return null
  return {
    ...c,
    _id: c.id,
    name: `${c.firstName} ${c.lastName}`.trim(),
    designation: c.title,
    companyName,
  }
}

/**
 * Get Contacts Action
 */
export const getContacts = createProtectedAction(
  z.any().optional(),
  async (_, session) => {
    const ctx = { tenantId: session.user.tenantId!, userId: session.user.userId, userRole: (session.user as any).role as string }
    const contacts = await contactService.list(ctx)
    
    const mapped = await Promise.all(
      contacts.map(async (c) => {
        let companyName = 'Unknown Company'
        try {
          const comp = await companyService.get(ctx, c.companyId)
          companyName = comp.name
        } catch {
          // ignore
        }
        return mapContactToCompat(c, companyName)
      })
    )
    
    return serializeDocs(mapped.filter(Boolean))
  }
)

/**
 * Get Single Contact Action
 */
export const getContactById = createProtectedAction(
  GetByIdSchema,
  async (payload, session) => {
    const ctx = { tenantId: session.user.tenantId!, userId: session.user.userId, userRole: (session.user as any).role as string }
    const contact = await contactService.get(ctx, payload.id)
    if (!contact) throw new Error('Contact not found')
    
    let companyName = 'Unknown Company'
    try {
      const comp = await companyService.get(ctx, contact.companyId)
      companyName = comp.name
    } catch {
      // ignore
    }
    
    return serializeDoc(mapContactToCompat(contact, companyName)!)
  }
)

/**
 * Create Contact Action
 */
export const createContactAction = createProtectedAction(
  ContactActionSchema,
  async (payload, session) => {
    const ctx = { tenantId: session.user.tenantId!, userId: session.user.userId, userRole: (session.user as any).role as string }
    const contact = await contactService.create(ctx, payload)
    
    let companyName = 'Unknown Company'
    try {
      const comp = await companyService.get(ctx, contact.companyId)
      companyName = comp.name
    } catch {
      // ignore
    }
    
    revalidatePath('/contacts')
    return serializeDoc(mapContactToCompat(contact, companyName)!)
  }
)

/**
 * Update Contact Action
 */
export const updateContactAction = createProtectedAction(
  ContactUpdateActionSchema,
  async (payload, session) => {
    const { id, ...data } = payload
    const ctx = { tenantId: session.user.tenantId!, userId: session.user.userId, userRole: (session.user as any).role as string }
    const contact = await contactService.update(ctx, id, data)
    if (!contact) throw new Error('Contact not found')
    
    let companyName = 'Unknown Company'
    try {
      const comp = await companyService.get(ctx, contact.companyId)
      companyName = comp.name
    } catch {
      // ignore
    }
    
    revalidatePath('/contacts')
    return serializeDoc(mapContactToCompat(contact, companyName)!)
  }
)

/**
 * Delete Contact Action
 */
export const deleteContact = createProtectedAction(
  GetByIdSchema,
  async (payload, session) => {
    const ctx = { tenantId: session.user.tenantId!, userId: session.user.userId, userRole: (session.user as any).role as string }
    await contactService.deactivate(ctx, payload.id)
    revalidatePath('/contacts')
    return { success: true }
  }
)
