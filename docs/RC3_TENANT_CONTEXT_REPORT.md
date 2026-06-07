# RC-3 Tenant Context Report

## Design
* **Helper**: `getAuthenticatedTenantContext`
* **File Path**: `lib/core/tenant-context.ts`
* **Interface**:
  ```typescript
  export interface TenantContext {
    tenantId: string
    userId?: string
  }
  
  export function getAuthenticatedTenantContext(): Promise<TenantContext>
  ```

## Flow
1. Calls `auth()` internally to parse the user's active NextAuth session.
2. Checks if a valid session and session user object exist. If not, throws a `ForbiddenError('Unauthorized')`.
3. Checks if `tenantId` is defined on the session user object. If not, throws a `ForbiddenError('Tenant context is required')`.
4. Returns the validated `{ tenantId, userId }` object to the caller.

## Security Guarantees
* **Immutable Resolution**: The tenant identity is extracted from the cryptographically signed and encrypted NextAuth session cookie (JWT).
* **Spoofing Resistance**: Request headers `x-tenant-id` and `x-user-id` are completely ignored, preventing unauthorized cross-tenant operations via header injection.
* **Single Source of Truth**: All server-side route handlers share this centralized validation path, eliminating divergent checking patterns across the API layer.
