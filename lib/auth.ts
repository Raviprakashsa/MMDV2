import NextAuth, { type DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import type { UserRole } from "@/lib/db/models/User"

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      isActive: boolean
      tenantId?: string
      userId?: string
      mongoUserId?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    isActive: boolean
    tenantId?: string
    userId?: string
    mongoUserId?: string
  }
}

// Use explicit secret from env, but provide a stable default for local development
let AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

if (!AUTH_SECRET && process.env.NODE_ENV !== 'production') {
  // Development fallback secret (do NOT use in production)
  AUTH_SECRET = 'nextauth_dev_fallback_secret_change_me'
}

if (process.env.NODE_ENV === 'production' && !AUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET or AUTH_SECRET must be set in production')
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // ── Query PostgreSQL via Prisma (the source of truth for users) ──
        // NOTE: MongoDB (lib/db/models/User) is the legacy operational DB for
        // ATS data (candidates, requirements, etc.) but auth users live in
        // PostgreSQL as seeded by prisma/seed.ts.
        const { prisma } = await import('@/lib/prisma')

        const normalizedEmail =
          typeof credentials.email === "string"
            ? credentials.email.toLowerCase().trim()
            : ""

        const dbUser = await prisma.user.findFirst({
          where: {
            email: normalizedEmail,
            status: 'ACTIVE',
            deletedAt: null,
          },
          include: {
            role: true,
          },
        })

        if (!dbUser) {
          return null
        }

        // Prisma User model stores the hash in `passwordHash` (not `password`)
        const isPasswordValid = await compare(
          credentials.password as string,
          dbUser.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        // Connect to MongoDB and resolve the mongoUserId (User._id string)
        let mongoUserId = ""
        try {
          const connectDB = (await import('@/lib/db/mongodb')).default
          const MongoUser = (await import('@/lib/db/models/User')).default
          await connectDB()
          const mongoUser = await MongoUser.findOne({ email: normalizedEmail, deletedAt: null })
          if (mongoUser) {
            mongoUserId = mongoUser._id.toString()
          }
        } catch (err) {
          console.error("Failed to resolve MongoDB user ID in authorize:", err)
        }

        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          // role.code is e.g. "super_admin" — normalise to uppercase for app
          role: dbUser.role.code.toUpperCase() as UserRole,
          isActive: dbUser.status === 'ACTIVE',
          tenantId: dbUser.tenantId,
          userId: dbUser.id,
          mongoUserId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // On initial sign-in, user object is populated by authorize() above.
        // Persist all fields into the JWT so we don't need another DB query
        // on every request.
        token.id = user.id
        token.email = user.email
        token.role = user.role
        token.name = user.name
        token.isActive = user.isActive
        token.tenantId = user.tenantId
        token.userId = user.userId
        token.mongoUserId = user.mongoUserId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.role = token.role as UserRole
        session.user.name = (token.name as string) ?? session.user.name
        session.user.isActive = token.isActive as boolean
        session.user.tenantId = token.tenantId as string
        session.user.userId = token.userId as string
        session.user.mongoUserId = token.mongoUserId as string
      }
      return session
    },
  },
})

/**
 * Role-based authorization check.
 * SUPER_ADMIN is always included when ADMIN is allowed.
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  if (!session.user.isActive) {
    throw new Error("Account is inactive")
  }

  const roles = [...allowedRoles]
  if (roles.includes("ADMIN" as UserRole) && !roles.includes("SUPER_ADMIN" as UserRole)) {
    roles.push("SUPER_ADMIN" as UserRole)
  }

  if (!roles.includes(session.user.role)) {
    throw new Error("Forbidden: Insufficient permissions")
  }

  return session
}

/**
 * Get current user from session
 */
export async function getCurrentUser() {
  const session = await auth()
  return session?.user ?? null
}
