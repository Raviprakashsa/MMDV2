import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { trackActivity } from "@/lib/core/activity-tracker"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const tenantId = session.user.tenantId || "system"

    let body: any
    const contentType = req.headers.get("content-type") || ""
    
    try {
      if (contentType.includes("application/json")) {
        body = await req.json()
      } else {
        const text = await req.text()
        body = JSON.parse(text)
      }
    } catch (parseErr) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const { activeSeconds = 0, idleSeconds = 0, pageViews = [] } = body

    // 1. Process client page views (triggers trackActivity for each view)
    for (const path of pageViews) {
      if (path && typeof path === "string" && !path.startsWith("/api")) {
        await trackActivity({
          tenantId,
          userId,
          module: "SYSTEM",
          entityType: "Page",
          entityId: path,
          action: "PAGE_VIEW",
          metadata: { path },
        }).catch(console.error)
      }
    }

    // 2. Update DailyWorkSummary active/idle hours and recalculate productivity score
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)

    const activeHoursIncrement = activeSeconds / 3600
    const idleHoursIncrement = idleSeconds / 3600

    await prisma.$transaction(async (tx) => {
      const existing = await tx.dailyWorkSummary.findUnique({
        where: {
          userId_date: {
            userId,
            date: todayStart,
          },
        },
      })

      if (existing) {
        const newActiveHours = existing.activeHours + activeHoursIncrement
        const newIdleHours = existing.idleHours + idleHoursIncrement
        const totalHours = newActiveHours + newIdleHours
        const productivityScore = totalHours > 0 ? Math.min(100, Math.round((newActiveHours / totalHours) * 100)) : 0

        await tx.dailyWorkSummary.update({
          where: { id: existing.id },
          data: {
            activeHours: newActiveHours,
            idleHours: newIdleHours,
            productivityScore,
          },
        })
      } else {
        const totalHours = activeHoursIncrement + idleHoursIncrement
        const productivityScore = totalHours > 0 ? Math.min(100, Math.round((activeHoursIncrement / totalHours) * 100)) : 0

        await tx.dailyWorkSummary.create({
          data: {
            tenantId,
            userId,
            date: todayStart,
            activeHours: activeHoursIncrement,
            idleHours: idleHoursIncrement,
            productivityScore,
            totalActions: 0,
          },
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Heartbeat processing error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
