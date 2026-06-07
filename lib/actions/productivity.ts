"use server"

import { z } from "zod"
import { createProtectedAction } from "@/lib/core/action-client"
import { ProductivityService } from "@/lib/services/productivity.service"
import { serializeDocs } from "@/lib/utils/serialize"

const DateRangeSchema = z.object({
  startDate: z.string(), // ISO String or YYYY-MM-DD
  endDate: z.string(),
})

const SingleDateSchema = z.object({
  date: z.string(),
  userId: z.string().optional(),
})

export const getUserDailySummariesAction = createProtectedAction(
  DateRangeSchema,
  async (payload, session) => {
    const userId = session.user.id
    const tenantId = session.user.tenantId || "system"
    const start = new Date(payload.startDate)
    const end = new Date(payload.endDate)
    
    const summaries = await ProductivityService.getUserDailySummaries(userId, tenantId, start, end)
    return serializeDocs(summaries)
  }
)

export const getUserActivityTimelineAction = createProtectedAction(
  SingleDateSchema,
  async (payload, session) => {
    let targetUserId = session.user.id
    const role = (session.user as any).role
    
    if (payload.userId && payload.userId !== session.user.id) {
      if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized: Admin role required to inspect other users' timelines")
      }
      targetUserId = payload.userId
    }

    const tenantId = session.user.tenantId || "system"
    const date = new Date(payload.date)
    
    const logs = await ProductivityService.getUserActivityTimeline(targetUserId, tenantId, date)
    return serializeDocs(logs)
  }
)

export const getTenantDailySummariesAction = createProtectedAction(
  SingleDateSchema,
  async (payload, session) => {
    // Admin only access check
    const role = (session.user as any).role
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized: Admin role required")
    }

    const tenantId = session.user.tenantId || "system"
    const date = new Date(payload.date)
    
    const summaries = await ProductivityService.getTenantDailySummaries(tenantId, date)
    return serializeDocs(summaries)
  }
)

export const getLeaderboardsAction = createProtectedAction(
  DateRangeSchema,
  async (payload, session) => {
    // Admin only access check
    const role = (session.user as any).role
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized: Admin role required")
    }

    const tenantId = session.user.tenantId || "system"
    const start = new Date(payload.startDate)
    const end = new Date(payload.endDate)
    
    const boards = await ProductivityService.getLeaderboards(tenantId, start, end)
    return {
      mostActive: serializeDocs(boards.mostActive),
      mostProductive: serializeDocs(boards.mostProductive),
    }
  }
)
