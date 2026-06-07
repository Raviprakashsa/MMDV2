# A2 Step 4 — API Layer Report

Routes Created
- `GET /api/v1/users` -> `app/api/v1/users/route.ts`
- `POST /api/v1/users` -> `app/api/v1/users/route.ts`
- `GET /api/v1/users/{id}` -> `app/api/v1/users/[id]/route.ts`
- `PATCH /api/v1/users/{id}` -> `app/api/v1/users/[id]/route.ts`
- `GET /api/v1/roles` -> `app/api/v1/roles/route.ts`
- `POST /api/v1/roles` -> `app/api/v1/roles/route.ts`
- `GET /api/v1/roles/{id}` -> `app/api/v1/roles/[id]/route.ts`
- `PATCH /api/v1/roles/{id}` -> `app/api/v1/roles/[id]/route.ts`
- `GET /api/v1/permissions` -> `app/api/v1/permissions/route.ts`
- `POST /api/v1/roles/{id}/permissions` -> `app/api/v1/roles/[id]/permissions/route.ts`
- `DELETE /api/v1/roles/{id}/permissions/{permissionId}` -> `app/api/v1/roles/[id]/permissions/[permissionId]/route.ts`
- `GET /api/v1/sessions` -> `app/api/v1/sessions/route.ts`
- `DELETE /api/v1/sessions/{id}` -> `app/api/v1/sessions/[id]/route.ts`

Services Used
- `UserService` — list, create, get, update
- `RoleService` — list, create, get, update
- `PermissionService` — list
- `RolePermissionService` — assign, remove
- `SessionService` — list, revoke

Validation Rules
- Input validation performed at API boundary using `zod` for POST/PATCH bodies.
- Tenant propagation: `x-tenant-id` header is required by routes and passed as `TenantContext` to services.
- `x-user-id` header forwarded as `userId` in `TenantContext`.

OpenAPI Changes
- Added `docs/openapi-a2-step4.yaml` with minimal paths for the new endpoints.

Validation Results
- `npm run typecheck`: completed successfully.
- `npm run build`: Next.js build completed successfully.

Risks
- Tenant extraction currently uses `x-tenant-id` header — ensure auth/middleware sets and validates this header in production.
- Some service methods accept fields like `passwordHash` which must be provided by the caller; ensure routes supply required fields (or derive them securely).
- Routes assume services will handle business logic and error types; make sure services map domain errors to appropriate HTTP statuses via `AppError`.

Rollback Notes
- Routes are additive. Remove the created `app/api/v1/*` files and revert `docs/openapi-a2-step4.yaml` to roll back.

State: A2 Step 4 Approved
