import { prisma } from "@/lib/prisma"

export class ProductivityService {
  /**
   * Get DailyWorkSummary records for a user within a date range
   */
  static async getUserDailySummaries(userId: string, tenantId: string, start: Date, end: Date) {
    return prisma.dailyWorkSummary.findMany({
      where: {
        userId,
        tenantId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: "asc",
      },
    })
  }

  /**
   * Get chronological activity log for a user on a specific day
   */
  static async getUserActivityTimeline(userId: string, tenantId: string, date: Date) {
    const dayStart = new Date(date)
    dayStart.setUTCHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setUTCHours(23, 59, 59, 999)

    return prisma.activityLog.findMany({
      where: {
        userId,
        tenantId,
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })
  }

  /**
   * Get tenant-wide summaries for a specific day (Admin view)
   */
  static async getTenantDailySummaries(tenantId: string, date: Date) {
    const dayStart = new Date(date)
    dayStart.setUTCHours(0, 0, 0, 0)

    return prisma.dailyWorkSummary.findMany({
      where: {
        tenantId,
        date: dayStart,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        activeHours: "desc",
      },
    })
  }

  /**
   * Get most active and productive users in the tenant
   */
  static async getLeaderboards(tenantId: string, start: Date, end: Date) {
    // 1. Group daily work summaries by user
    const stats = await prisma.dailyWorkSummary.groupBy({
      by: ["userId"],
      where: {
        tenantId,
        date: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        activeHours: true,
        idleHours: true,
        totalActions: true,
      },
    })

    // 2. Fetch user details
    const userIds = stats.map((s) => s.userId)
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    // 3. Map and sort
    const mapped = stats.map((s) => {
      const user = userMap.get(s.userId)
      const active = s._sum.activeHours || 0
      const idle = s._sum.idleHours || 0
      const total = active + idle
      const productivityScore = total > 0 ? Math.min(100, Math.round((active / total) * 100)) : 0

      return {
        userId: s.userId,
        name: user?.name || "Unknown User",
        email: user?.email || "",
        activeHours: active,
        idleHours: idle,
        totalActions: s._sum.totalActions || 0,
        productivityScore,
      }
    })

    const mostActive = [...mapped].sort((a, b) => b.activeHours - a.activeHours)
    const mostProductive = [...mapped].sort((a, b) => b.productivityScore - a.productivityScore)

    return {
      mostActive,
      mostProductive,
    }
  }

  /**
   * Purge activity logs older than 12 months (Retention Policy)
   */
  static async purgeOldActivityLogs() {
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)

    return prisma.activityLog.deleteMany({
      where: {
        createdAt: {
          lt: twelveMonthsAgo,
        },
      },
    })
  }
}

