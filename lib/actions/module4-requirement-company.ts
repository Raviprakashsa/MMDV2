'use server'

import { createProtectedAction } from '@/lib/core/action-client'
import { z } from 'zod'
import Company from '@/lib/db/models/Company'
import { serializeDocs } from '@/lib/utils/serialize'

/**
 * Get Companies for Requirements module – loads from MongoDB directly.
 * Returns a list of companies with the fields required by the UI:
 *   _id, name, sector, location, mouStatus, mouEndDate
 */
export const getRequirementCompanies = createProtectedAction(
  z.any().optional(),
  async (_, session) => {
    // Context is not needed for Mongo read, but we keep the pattern.
    const ctx = {
      tenantId: session.user.tenantId!,
      userId: session.user.userId,
      userRole: (session.user as any).role as string,
    }
    // Direct Mongo query – only active (non‑deleted) companies.
    const companies = await Company.find({ deletedAt: null }).lean()

    const mapped = companies.map((c) => ({
      _id: (c._id as any).toString(),
      name: c.name,
      sector: c.sector,
      location: c.location,
      mouStatus: c.mouStatus,
      mouEndDate: c.mouEndDate,
    }))

    return serializeDocs(mapped)
  }
)
