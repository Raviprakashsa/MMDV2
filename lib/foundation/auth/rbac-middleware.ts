import { ForbiddenError } from '@/lib/core/app-error'

export type PermissionCode = `${string}.${string}`

export interface RbacContext {
  tenantId: string
  userId: string
  roleCode: string
  permissions: PermissionCode[]
}

export function hasPermission(context: RbacContext, permission: PermissionCode): boolean {
  return context.permissions.includes(permission)
}

export function requirePermission(context: RbacContext, permission: PermissionCode): void {
  if (!hasPermission(context, permission)) {
    throw new ForbiddenError(`Missing permission: ${permission}`)
  }
}

export function requireTenantAccess(context: RbacContext, tenantId: string): void {
  if (!tenantId || context.tenantId !== tenantId) {
    throw new ForbiddenError('Cross-tenant access is forbidden')
  }
}
