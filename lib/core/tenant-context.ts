import { auth } from '@/lib/auth'
import { ForbiddenError } from '@/lib/core/app-error'

export interface TenantContext {
  tenantId: string
  userId?: string
  userRole?: string
}

/**
 * Resolves the authenticated user's tenant context from the session.
 * Throws a ForbiddenError if the user is not authenticated or lacks a valid tenantId.
 */
export async function getAuthenticatedTenantContext(): Promise<TenantContext> {
  const session = await auth()

  if (!session?.user) {
    throw new ForbiddenError('Unauthorized')
  }

  const tenantId = (session.user as any).tenantId
  const userId = (session.user as any).userId
  const userRole = (session.user as any).role

  if (!tenantId) {
    throw new ForbiddenError('Tenant context is required')
  }

  return {
    tenantId,
    userId,
    userRole,
  }
}

