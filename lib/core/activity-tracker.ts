import { prisma } from "@/lib/prisma";

export interface ActivityContext {
  tenantId: string;
  userId: string;
  module: string;
  entityType: string;
  entityId?: string | null;
  action: string;
  metadata?: Record<string, any> | null;
}

/**
 * Platform-wide centralized Activity Tracking Engine
 * Enforces tenant isolation and updates daily productivity analytics.
 */
export async function trackActivity(context: ActivityContext) {
  const { tenantId, userId, module, entityType, entityId, action, metadata } = context;

  if (!tenantId || !userId) {
    throw new Error("Missing tenantId or userId in trackActivity context");
  }

  // 1. Create the activity log record in PostgreSQL
  const log = await prisma.activityLog.create({
    data: {
      tenantId,
      userId,
      module,
      entityType,
      entityId: entityId || null,
      action,
      metadata: metadata || undefined,
    },
  });

  // 2. Resolve start of current day in UTC
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  // 3. Upsert the DailyWorkSummary to increment action count
  await prisma.dailyWorkSummary.upsert({
    where: {
      userId_date: {
        userId,
        date: todayStart,
      },
    },
    update: {
      totalActions: {
        increment: 1,
      },
    },
    create: {
      tenantId,
      userId,
      date: todayStart,
      totalActions: 1,
      loginHours: 0,
      activeHours: 0,
      idleHours: 0,
      productivityScore: 0,
    },
  });

  return log;
}

/**
 * Parses user agent string to detect browser name and device type
 */
export function parseUserAgent(ua: string) {
  let browser = "Unknown Browser";
  let device = "Desktop";

  if (!ua) return { browser, device };

  // Detect Device
  if (/mobile/i.test(ua)) {
    device = "Mobile";
  } else if (/tablet|ipad|playbook|silk/i.test(ua)) {
    device = "Tablet";
  }

  // Detect Browser
  if (/chrome|crios/i.test(ua) && !/edge|opr\//i.test(ua)) {
    browser = "Chrome";
  } else if (/safari/i.test(ua) && !/chrome|crios|opr\//i.test(ua)) {
    browser = "Safari";
  } else if (/firefox|iceweasel/i.test(ua)) {
    browser = "Firefox";
  } else if (/edge|edg/i.test(ua)) {
    browser = "Edge";
  } else if (/opera|opr/i.test(ua)) {
    browser = "Opera";
  } else if (/msie|trident/i.test(ua)) {
    browser = "Internet Explorer";
  }

  return { browser, device };
}
