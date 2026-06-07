"use server"

import { revalidatePath } from "next/cache"
import { createProtectedAction } from "@/lib/core/action-client"
import { UserService } from "@/lib/services/user.service"
import { CreateUserSchema, LoginSchema, UserRoleSchema } from "@/lib/validators/common"
import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"
import { z } from "zod"

/**
 * Module 1: Authentication Actions
 * Requirement: MMD-AUTH-001 - User login with role-based access
 */

export async function loginAction(credentials: z.infer<typeof LoginSchema>) {
  try {
    const validated = LoginSchema.parse(credentials)

    await signIn("credentials", {
      email: validated.email.toLowerCase(),
      password: validated.password,
      redirect: false,
    })

    // If we reach here, signIn succeeded
    try {
      const { prisma } = await import("@/lib/prisma")
      const dbUser = await prisma.user.findFirst({
        where: { email: validated.email.toLowerCase(), deletedAt: null },
      })
      if (dbUser) {
        const { headers } = await import("next/headers")
        const { trackActivity, parseUserAgent } = await import("@/lib/core/activity-tracker")
        const reqHeaders = await headers()
        const ua = reqHeaders.get("user-agent") || ""
        const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0] || reqHeaders.get("x-real-ip") || "127.0.0.1"
        const { browser, device } = parseUserAgent(ua)

        await trackActivity({
          tenantId: dbUser.tenantId,
          userId: dbUser.id,
          module: "SYSTEM",
          entityType: "Session",
          entityId: dbUser.id,
          action: "LOGIN",
          metadata: {
            browser,
            device,
            ip,
            timestamp: new Date().toISOString()
          }
        })
      }
    } catch (err) {
      console.error("Failed to log login event:", err)
    }

    return { success: true, data: null }
  } catch (error) {
    console.error('Login action error:', error)

    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: "Invalid email or password" }
        default:
          return { success: false, error: "Authentication failed" }
      }
    }
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }

    // Check if error has a message property
    const errorMessage = error instanceof Error ? error.message : "Login failed"
    return { success: false, error: errorMessage }
  }
}

export async function logoutAction() {
  try {
    const { auth } = await import("@/lib/auth")
    const { headers } = await import("next/headers")
    const { trackActivity, parseUserAgent } = await import("@/lib/core/activity-tracker")
    const { prisma } = await import("@/lib/prisma")

    const session = await auth()
    if (session?.user) {
      const userId = session.user.id
      const tenantId = session.user.tenantId || "system"

      const reqHeaders = await headers()
      const ua = reqHeaders.get("user-agent") || ""
      const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0] || reqHeaders.get("x-real-ip") || "127.0.0.1"
      const { browser, device } = parseUserAgent(ua)

      const lastLogin = await prisma.activityLog.findFirst({
        where: {
          userId,
          tenantId,
          action: "LOGIN",
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      let sessionDurationSeconds = 0
      if (lastLogin) {
        const loginTime = new Date(lastLogin.createdAt)
        sessionDurationSeconds = Math.max(0, Math.floor((Date.now() - loginTime.getTime()) / 1000))
      }

      await trackActivity({
        tenantId,
        userId,
        module: "SYSTEM",
        entityType: "Session",
        entityId: userId,
        action: "LOGOUT",
        metadata: {
          browser,
          device,
          ip,
          sessionDurationSeconds,
          timestamp: new Date().toISOString()
        }
      })

      // Also update loginHours in DailyWorkSummary
      const todayStart = new Date()
      todayStart.setUTCHours(0, 0, 0, 0)
      const sessionDurationHours = sessionDurationSeconds / 3600

      await prisma.dailyWorkSummary.upsert({
        where: {
          userId_date: {
            userId,
            date: todayStart,
          },
        },
        update: {
          loginHours: {
            increment: sessionDurationHours,
          },
        },
        create: {
          tenantId,
          userId,
          date: todayStart,
          loginHours: sessionDurationHours,
          activeHours: 0,
          idleHours: 0,
          totalActions: 1,
          productivityScore: 0,
        },
      })
    }
  } catch (err) {
    console.error("Failed to log logout event:", err)
  }

  const { signOut } = await import("@/lib/auth")
  await signOut({ redirect: false })
}

export const createUserAction = createProtectedAction(
  CreateUserSchema,
  async (payload, session) => {
    const user = await UserService.create(
      { id: session.user.id, role: session.user.role },
      payload
    )
    revalidatePath('/dashboard/users')
    revalidatePath('/dashboard/settings')
    return user
  }
)

// Alias for strict naming if used elsewhere
export const createUser = createUserAction

const UpdateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: UserRoleSchema.optional(),
  isActive: z.boolean().optional(),
})

export const updateUserRoleAction = createProtectedAction(
  UpdateUserRoleSchema,
  async (payload, session) => {
    const user = await UserService.updateRole(
      { id: session.user.id, role: session.user.role },
      payload
    )
    revalidatePath('/dashboard/users')
    revalidatePath('/dashboard/settings')
    return user
  }
)

export const updateUserRole = updateUserRoleAction

// Simple Server Action for getting session user (already protected by logic inside)
export async function authenticateUser() {
  // This is often used by client components to check session efficiently
  // We can leave it, or use auth() directly in server components
  const { auth } = await import("@/lib/auth")
  const session = await auth()
  if (!session?.user) return { success: false, error: "Unauthorized" }
  return { success: true, data: session.user }
}

const GetUsersFilterSchema = z.object({
  role: z.string().optional(),
  isActive: z.boolean().optional()
})

export const getUsers = createProtectedAction(
  GetUsersFilterSchema,
  async (filters, session) => {
    const users = await UserService.getAll(
      { id: session.user.id, role: session.user.role },
      filters
    )
    return users
  }
)

const GetByIdSchema = z.object({ id: z.string() })

export const getUserById = createProtectedAction(
  GetByIdSchema,
  async (payload, session) => {
    const user = await UserService.getById(
      { id: session.user.id, role: session.user.role },
      payload.id
    )
    return user
  }
)

const DeleteUserSchema = z.object({ id: z.string() })

export const deleteUser = createProtectedAction(
  DeleteUserSchema,
  async (payload, session) => {
    await UserService.delete(
      { id: session.user.id, role: session.user.role },
      payload.id
    )
    revalidatePath('/dashboard/users')
    revalidatePath('/dashboard/settings')
    return { success: true }
  }
)

const ResetPasswordSchema = z.object({
  userId: z.string().min(1),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain uppercase, lowercase and number")
    .regex(/[!@#$%^&*(),.?":{}|<>_-]/, "Password must contain a special character"),
})

export const resetPassword = createProtectedAction(
  ResetPasswordSchema,
  async (payload, session) => {
    await UserService.resetPassword(
      { id: session.user.id, role: session.user.role },
      payload
    )
    revalidatePath('/dashboard/settings')
    return { success: true }
  }
)
