# A1 API Audit

Date: 2026-05-31
Scope: API routes + OpenAPI
Authority: `docs/MVP_LOCKDOWN.md`, `docs/A1_STEP_4_REPORT.md`

## Endpoint Inventory

1. POST /api/v1/tenants
   - File: `app/api/v1/tenants/route.ts`
   - Request payload (Zod schema `CreateTenantSchema`):
     - `tenantId` (string, required)
     - `slug` (string, required)
     - `name` (string, required)
     - `planId` (string, required)
   - Response: 201 Created with `Tenant` object returned from `tenantService.create`
   - Service call: `tenantService.create(parsed)`
   - RBAC placeholder: `// TODO: RBAC placeholder - ensure caller has permission to create tenants`

2. GET /api/v1/tenants/{id}
   - File: `app/api/v1/tenants/[id]/route.ts`
   - Request: path param `id`
   - Response: 200 OK with `Tenant` object from `tenantService.getById`
   - Service call: `tenantService.getById(id)`
   - RBAC placeholder: `// TODO: RBAC placeholder - validate access`

3. PATCH /api/v1/tenants/{id}
   - File: `app/api/v1/tenants/[id]/route.ts`
   - Request payload (Zod schema `UpdateTenantSchema`):
     - `slug` (string, optional)
     - `name` (string, optional)
     - `planId` (string, optional)
     - `isActive` (boolean, optional)
   - Response: 200 OK with updated `Tenant` from `tenantService.updateById`
   - Service call: `tenantService.updateById(id, parsed)`
   - RBAC placeholder: `// TODO: RBAC placeholder - validate permission to update tenant`

4. GET /api/v1/tenants/{id}/settings
   - File: `app/api/v1/tenants/[id]/settings/route.ts`
   - Request: path param `id`
   - Response: 200 OK with `TenantSettings` from `tenantSettingsService.getByTenantId`
   - Service call: `tenantSettingsService.getByTenantId(tenantId)`
   - RBAC placeholder present

5. PATCH /api/v1/tenants/{id}/settings
   - File: `app/api/v1/tenants/[id]/settings/route.ts`
   - Request payload (Zod schema `UpsertSettingsSchema`): optional fields
     - `timezone` (string, optional)
     - `locale` (string, optional)
     - `dateFormat` (string, optional)
     - `timeFormat` (string, optional)
     - `weekStartDay` (integer, optional)
   - Route behavior: merges existing settings (via `tenantSettingsService.getByTenantId`) with provided partials and defaults to produce a full `UpsertTenantSettingsInput` before calling `tenantSettingsService.upsert(input)`
   - Service call: `tenantSettingsService.getByTenantId`, `tenantSettingsService.upsert`
   - RBAC placeholder present

6. GET /api/v1/tenants/{id}/branding
   - File: `app/api/v1/tenants/[id]/branding/route.ts`
   - Request: path param `id`
   - Response: 200 OK with `TenantBranding` from `tenantBrandingService.getByTenantId`
   - Service call: `tenantBrandingService.getByTenantId(tenantId)`
   - RBAC placeholder present

7. PATCH /api/v1/tenants/{id}/branding
   - File: `app/api/v1/tenants/[id]/branding/route.ts`
   - Request payload (Zod schema `UpsertBrandingSchema`): optional nullable strings
     - `displayName`, `logoUrl`, `faviconUrl`, `primaryColor`, `secondaryColor`, `accentColor`, `supportEmail`
   - Route behavior: merges `tenantId` with parsed body and calls `tenantBrandingService.upsert(input)`
   - Service call: `tenantBrandingService.upsert`
   - RBAC placeholder present

## Validation Audit

- Validation uses `zod` schemas in each route file.
- `CreateTenantSchema` and `UpdateTenantSchema` enforce required/optional fields for tenant payloads.
- `UpsertSettingsSchema` and `UpsertBrandingSchema` validate types for settings and branding payloads.
- Additional runtime enforcement: settings `PATCH` fills missing required fields by merging existing settings or defaults before calling the service.

## Service Usage Audit

- All routes call service-layer functions; no route imports repository or prisma directly.
- Service calls per endpoint listed above.
- Error handling: routes catch `AppError` and `z.ZodError` and return appropriate status codes (AppError.statusCode or 400); other errors map to 500.

## OpenAPI Audit

- `docs/openapi/a1-tenants.yaml` defines the same endpoints and similar request/response schemas.
- Create/Update/Upsert schemas map to the Zod schemas used in routes.
- Observed minor gap: OpenAPI `UpsertTenantSettings` properties are optional — route enforces all required fields by merging with existing/default values before the service call. Contract is compatible but the route behavior enriches inputs beyond schema minimality.
- Path and parameter naming match the implemented routes.

## Architectural Compliance

1. No repository access from routes: PASS
   - Verified: none of the route files import repositories; they call services only.

2. No Prisma access from routes: PASS
   - Verified: no `prisma` imports in route files.

3. No business logic in routes: PARTIAL
   - Most routes are thin and delegate to services.
   - Exception: `PATCH /.../settings` merges existing settings and defaults to construct a full upsert payload in the route. This is data-shaping/business logic that should ideally live in the `TenantSettingsService`.

4. Error handling: PASS
   - Routes catch `AppError` and `z.ZodError` and respond with meaningful HTTP statuses.

5. RBAC placeholders: PASS
   - Each route includes `// TODO: RBAC placeholder` comments where permission checks should be inserted.

6. Duplicated code:
   - Repeated error handling blocks across routes.
   - Repeated pattern resolving `context.params` which may be a Promise.
   - Repeated RBAC placeholder comments.

## Risks

- Business logic in `settings` route: merging defaults in route layer violates the thin-route principle and can lead to duplicated behavior and harder testing.
- Error handling duplication increases maintenance overhead and risks inconsistent responses.
- Minor contract-enrichment in route (settings defaulting) is not reflected in OpenAPI explicitly.

## Keep / Refactor / Remove

- Keep:
  - Zod-based validation in routes.
  - Thin delegation to services for create/get/update flows.
  - RBAC placeholders at call sites.

- Refactor:
  - Move settings merging logic into `TenantSettingsService.ensureForTenant` or `upsert` so routes remain thin.
  - Extract shared error handler middleware or helper to centralize `AppError`/`ZodError` mapping.
  - Normalize `context.params` resolution into a small helper for route handlers.
  - Update OpenAPI to document that settings `PATCH` will return enriched/defaulted fields.

- Remove:
  - Do not introduce repository or Prisma calls in routes.

## Step 5 Status

Step 5 Blocked

Reason: `PATCH /api/v1/tenants/{id}/settings` performs business logic (merging existing settings and defaults) in the route handler. Move this behavior into the `TenantSettingsService` and re-run validation/build. After moving, Step 5 can be approved.


Status: API audit complete — awaiting remediation and re-review.
