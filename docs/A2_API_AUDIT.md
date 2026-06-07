# A2 API Layer Audit

Audit Scope
- Routes under `app/api/v1/` for: users, roles, permissions, role-permissions, sessions

Route Inventory
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

Services Called (per route)
- Users routes: `UserService` (`list`, `create`, `get`, `update`)
- Roles routes: `RoleService` (`list`, `create`, `get`, `update`)
- Permissions route: `PermissionService` (`list`)
- Role permissions routes: `RolePermissionService` (`assign`, `remove`)
- Sessions routes: `SessionService` (`list`, `revoke`)

Dependency Audit
- Repository imports found inside routes (violation of "No repository access in routes"):
  - `app/api/v1/users/route.ts` imports `userRepository`, `roleRepository`
  - `app/api/v1/users/[id]/route.ts` imports `userRepository`, `roleRepository`
  - `app/api/v1/roles/route.ts` imports `roleRepository`
  - `app/api/v1/roles/[id]/route.ts` imports `roleRepository`
  - `app/api/v1/permissions/route.ts` imports `permissionRepository`
  - `app/api/v1/roles/[id]/permissions/route.ts` imports `rolePermissionRepository`, `roleRepository`, `permissionRepository`
  - `app/api/v1/roles/[id]/permissions/[permissionId]/route.ts` imports `rolePermissionRepository`, `roleRepository`, `permissionRepository`
  - `app/api/v1/sessions/route.ts` imports `sessionRepository`, `userRepository`
  - `app/api/v1/sessions/[id]/route.ts` imports `sessionRepository`, `userRepository`

Verify: No Prisma access in routes
- Checked route files: none import `@prisma/client` or `prisma`. PASS.

Verify: No business logic in routes
- Routes contain only: header extraction, param extraction, `zod` input parsing (for POST/PATCH where present), `TenantContext` construction, and service calls. Minimal logic. PASS for business logic separation.

Validation Audit
- Zod validation present at API boundary for:
  - `POST /api/v1/users` (`createUserSchema` validates `email`, `passwordHash`, `name`, `roleId`)
  - `PATCH /api/v1/users/{id}` (`updateSchema`)
  - `POST /api/v1/roles` (`createSchema`)
  - `PATCH /api/v1/roles/{id}` (`updateSchema`)
  - `POST /api/v1/roles/{id}/permissions` (`bodySchema` with `permissionId`)
- Missing/insufficient validation:
  - `POST /api/v1/users` route validates `passwordHash` but the call to `userService.create(...)` does not pass `passwordHash` (service currently receives `{ tenantId, email, name }`). MISMATCH: route validates but does not forward required field to service.
  - `GET` and `DELETE` routes do not validate path params shape beyond relying on Next.js routing — consider explicit param validation for `id` and `permissionId`.

TenantContext Audit
- Every route constructs a `TenantContext` from headers:
  - `const tenantId = request.headers.get('x-tenant-id') || ''`
  - `const userId = request.headers.get('x-user-id') || undefined`
  - `const ctx = { tenantId, userId }`
- Propagation is consistent across all routes. RELIABLE but relies entirely on `x-tenant-id` header; recommend centralized auth middleware to assert and canonicalize the tenant.

Error Handling
- All routes wrap handlers with `runApi(...)` which centralizes error handling and maps:
  - `AppError` to `err.statusCode` and message
  - `z.ZodError` to HTTP 400 with validation errors
  - other errors to HTTP 500
- This provides consistent error responses. PASS. Consider richer mapping for common domain errors (e.g., 404 for NotFoundError if thrown by services).

HTTP Status Mapping
- Success responses are returned via `NextResponse.json(result)` from `runApi` (default 200). Observations:
  - `POST` endpoints currently return 200 on success; consider returning 201 for resource creation.
  - `DELETE` and `PATCH` return 200; acceptable but consider 204 for deletes with empty body.

OpenAPI Audit
- `docs/openapi-a2-step4.yaml` exists and enumerates the paths added.
- Mismatches / gaps:
  - OpenAPI file contains path entries but no request/response schemas, parameters or security definitions.
  - The OpenAPI contract does not declare `x-tenant-id` header requirement; routes require this header.
  - Add accurate request body schemas (e.g., `CreateUser` including `passwordHash`) and response schemas for consumers and tests.

Route Logic That Belongs In Services
- Routes instantiate services with repository instances (e.g., `new UserService({ userRepo: userRepository, roleRepo: roleRepository })`) — this DI wiring is acceptable, but importing repositories inside routes violates the rule "No repository access in routes". The wiring/DI should be done in a central module or service registry and routes should import pre-configured service instances.

Missing Validation
- Forwarding of `passwordHash` from `POST /api/v1/users` to service is missing.
- Param validation for `{id}` and `{permissionId}` is not explicit; add `zod`-based param parsing.

Missing Error Handling
- `runApi` centralizes error handling, but services must throw `AppError` or `NotFoundError` to map to correct HTTP codes. Review services to ensure they throw appropriate domain errors.

Missing RBAC Checks
- No RBAC checks in routes. There are also no per-actor permission checks in services. This is a gap — sensitive endpoints (role/permission mutations, session revocation) require enforcement of actor permissions.

Risks
- Architecture rule violation: Repository imports in routes risk bypassing service orchestration and complicate testing. HIGH.
- Security: Relying on `x-tenant-id` header without centralized validation may lead to spoofing; ensure auth middleware asserts tenant and actor identity. CRITICAL.
- Contract drift: OpenAPI lacks schemas and header declarations; consumers may mis-integrate. MEDIUM.

Keep / Refactor / Remove
- Keep: `runApi` centralized error handling; `zod` validation at API boundary; thin route structure.
- Refactor (required):
  - Remove repository imports from routes. Instantiate services in a central DI/registry and import configured service instances in routes.
  - Ensure routes forward validated input fully to services (e.g., `passwordHash`).
  - Add explicit param validation for route params.
  - Update OpenAPI with request/response schemas and header requirements.
- Remove: direct repository instantiation inside route files.

Conclusion / State
- Blocking items:
  1. Routes currently import repository modules (violates "No repository access in routes").
  2. Missing RBAC checks for role/permission/session mutation endpoints.
  3. Mismatch between route validation and service input for `POST /api/v1/users` (password not forwarded).

State: A2 Step 5 Blocked

Actionable next steps to unblock
1. Move repository wiring out of route files: create a central service registry (e.g., `lib/foundation/services/index.ts`) that constructs service instances with repositories; routes then import the pre-configured services.
2. Add param validation for dynamic route params using `zod` or helper utilities.
3. Update `POST /api/v1/users` to forward `passwordHash` to `userService.create(...)` (or change service signature to accept and require it).
4. Implement RBAC checks in services or add middleware to assert actor permissions before calling mutating endpoints.
5. Expand `docs/openapi-a2-step4.yaml` with request/response schemas and security/header requirements.
