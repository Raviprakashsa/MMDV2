# A1 Step 4 Remediation Report

Date: 2026-05-31

Summary

This remediation implements the API audit recommendation to remove business/data-shaping logic from the `PATCH /api/v1/tenants/{id}/settings` route and centralize repeated API error handling. The route handlers were made thin: they validate input, call services, and return responses. Validation and build were executed and passed.

Files Modified

- `lib/foundation/services/tenant-settings.service.ts`
  - Added `upsertPartial(tenantId, partial)` that merges existing settings with defaults and calls repository `upsert`.
- `lib/core/route-utils.ts` (new)
  - Added `runApi` helper to centralize `AppError` / `z.ZodError` / 500 handling for routes.
- `app/api/v1/tenants/[id]/settings/route.ts`
  - Removed merging/defaulting logic; now validates with Zod, calls `tenantSettingsService.upsertPartial`, and returns result via `runApi`.
- `app/api/v1/tenants/route.ts`
  - Switched to `runApi` for standardized error handling in `POST` route.
- `app/api/v1/tenants/[id]/route.ts`
  - Switched to `runApi` for standardized error handling in `GET` and `PATCH` routes.
- `app/api/v1/tenants/[id]/branding/route.ts`
  - Switched to `runApi` for standardized error handling in `GET` and `PATCH` routes.
- `docs/openapi/a1-tenants.yaml`
  - Updated `PATCH /api/v1/tenants/{id}/settings` description to document that partial payloads are accepted and missing fields are preserved or defaulted; response returns full `TenantSettings` with defaults applied.

Logic Moved

- The following merging/defaulting logic previously in `app/api/v1/tenants/[id]/settings/route.ts` was moved into `TenantSettingsService.upsertPartial`:
  - Fetch existing settings for tenant
  - Apply system defaults when settings are missing
  - Merge provided partial fields into base settings
  - Build a full `UpsertTenantSettingsInput` and call `tenantSettingsRepository.upsert`

Why moved: Keeps the route thin and ensures business rules (defaults, preservation of existing values) are owned and tested in service layer.

Centralized Error Handling

- Implemented `runApi` in `lib/core/route-utils.ts` which:
  - Catches `AppError` and returns `err.statusCode` with message
  - Catches `z.ZodError` and returns `400` with validation details
  - Catches other errors and returns `500`
- Replaced duplicated try/catch blocks in the tenant routes to use `runApi`.

Validation Results

- TypeScript typecheck: no errors reported (`tsc --noEmit`).
- Next.js build: succeeded (see `npm run build` output). Routes compiled and pages listed; `api/v1/tenants/[id]/settings` present in build manifest.

Remaining Risks

- RBAC: The routes still contain `// TODO: RBAC placeholder` comments. Proper permission checks must be implemented before production.
- Error handling consolidation: `runApi` centralizes mapping of `AppError`/`ZodError`/500, but routes still individually return `NextResponse` for success; ensure future route patterns conform to the same convention.
- OpenAPI sync: The OpenAPI file documents the enriched behavior, but integration tests or contract tests should validate the actual response shape and defaults.
- Prisma migrations: `prisma migrate dev` remains blocked by DB authentication (P1000). Manual migration SQL exists in `prisma/migrations/20260531120000_a1_foundation/migration.sql`.

Architectural Compliance Check

- Routes thinness: PASS — `PATCH /api/v1/tenants/{id}/settings` no longer performs business logic; routes validate and delegate to services.
- Service ownership: PASS — Defaults and merging now live in `TenantSettingsService`.
- No repository/Prisma access from routes: PASS — routes call services only.
- Error handling: IMPROVED — centralized handling via `runApi` reduces duplication.

Next Steps

- Implement RBAC checks in service or route layer as appropriate.
- Add unit tests for `TenantSettingsService.upsertPartial` to cover merging/defaults scenarios.
- Re-run API audit to confirm Step 5 approval.



