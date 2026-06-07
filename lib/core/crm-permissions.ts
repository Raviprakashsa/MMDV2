/**
 * CRM Permission Matrix — V1.3A
 *
 * Defines which platform roles are authorised to perform CRM operations.
 * The Service Layer is the primary enforcement boundary; every CRM service
 * method calls requireCrmPermission() before touching the database.
 *
 * Role hierarchy (from MongoDB User.role enum):
 *   SUPER_ADMIN > ADMIN > COORDINATOR > RECRUITER > SCRAPER
 *
 * Permission matrix:
 *   crm:read    — list/get companies, leads, contacts
 *   crm:create  — create companies, leads, contacts
 *   crm:update  — update companies, leads, contacts; change lead status
 *   crm:delete  — soft-delete companies, leads, contacts
 */

import { ForbiddenError } from '@/lib/core/app-error'

export type CrmPermission = 'crm:read' | 'crm:create' | 'crm:update' | 'crm:delete'

/**
 * Maps every known platform role to its allowed CRM permissions.
 * COORDINATOR maps to the "Manager" role described in the V1.3A spec.
 */
const CRM_PERMISSION_MATRIX: Record<string, CrmPermission[]> = {
  SUPER_ADMIN: ['crm:read', 'crm:create', 'crm:update', 'crm:delete'],
  ADMIN:       ['crm:read', 'crm:create', 'crm:update', 'crm:delete'],
  COORDINATOR: ['crm:read', 'crm:create', 'crm:update', 'crm:delete'],
  RECRUITER:   ['crm:read'],
  SCRAPER:     [],
}

/**
 * Asserts that the calling user's role grants the requested CRM permission.
 * Throws ForbiddenError (403) when the check fails.
 * Call this at the top of every CRM service method.
 */
export function requireCrmPermission(
  userRole: string | undefined,
  permission: CrmPermission,
): void {
  if (!userRole) {
    throw new ForbiddenError('No role assigned — CRM access denied')
  }
  const allowed = CRM_PERMISSION_MATRIX[userRole] ?? []
  if (!allowed.includes(permission)) {
    throw new ForbiddenError(
      `Role '${userRole}' does not have permission '${permission}'`,
    )
  }
}

/**
 * Non-throwing predicate version — use in UI guards or conditional rendering.
 */
export function hasCrmPermission(
  userRole: string | undefined,
  permission: CrmPermission,
): boolean {
  if (!userRole) return false
  const allowed = CRM_PERMISSION_MATRIX[userRole] ?? []
  return allowed.includes(permission)
}

/** Export the matrix for documentation / report generation. */
export { CRM_PERMISSION_MATRIX }
