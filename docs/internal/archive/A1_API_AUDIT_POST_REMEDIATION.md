# A1 API Audit — Post Remediation

Date: 2026-05-31

Scope: Re-review of API routes after remediation that moved settings merging/defaulting from route to `TenantSettingsService` and centralized error handling.

Verification Checklist & Results

1. No business logic remains in routes.
   - Verified: All tenant-related route handlers (`app/api/v1/tenants/route.ts`, `app/api/v1/tenants/[id]/route.ts`, `app/api/v1/tenants/[id]/settings/route.ts`, `app/api/v1/tenants/[id]/branding/route.ts`) perform only: parse/validate input via `zod`, resolve `context.params`, and call service methods. The `PATCH /.../settings` route no longer performs merging/defaulting; it calls `tenantSettingsService.upsertPartial(tenantId, parsed)`.
   - Status: PASS

2. No Prisma access in routes.
   - Verified: Route files do not import `prisma` or call Prisma client methods. All DB interactions occur via repositories invoked by services.
   - Status: PASS

3. No repository access in routes.
   - Verified: Routes import only service modules and the `runApi` helper; no imports from `lib/foundation/repositories` are present in route files.
   - Status: PASS

4. Routes only: Validate
   - Verified: Each route uses `zod` schemas to validate request bodies where applicable (`CreateTenantSchema`, `UpdateTenantSchema`, `UpsertSettingsSchema`, `UpsertBrandingSchema`). Path params are resolved from `context.params` consistently.
   - Status: PASS

5. Routes only: Call service
   - Verified: Each route delegates to a service method: `tenantService.create`, `tenantService.getById`, `tenantService.updateById`, `tenantSettingsService.getByTenantId`, `tenantSettingsService.upsertPartial`, `tenantBrandingService.getByTenantId`, `tenantBrandingService.upsert`.
   - Status: PASS

6. Routes only: Return response
   - Verified: Routes return results via the centralized `runApi` wrapper which converts handler return values into `NextResponse.json(...)`. Where a route needs to set explicit status (e.g., `POST` creating tenant), the route returns a `NextResponse` which `runApi` detects and forwards.
   - Status: PASS

7. OpenAPI matches implementation.
   - Verified: `docs/openapi/a1-tenants.yaml`:
     - Contains the `UpsertTenantSettings` schema with optional properties (partial input accepted).
     - The `PATCH /api/v1/tenants/{id}/settings` operation description has been updated to state that partial payloads are accepted and missing fields will be preserved or defaulted by the system; response schema remains `TenantSettings`.
   - Status: PASS (semantic match; recommended: add contract tests to ensure runtime responses include documented defaults)

8. Error handling is centralized.
   - Verified: Introduced `lib/core/route-utils.ts::runApi`, used by tenant-related routes to centralize mapping of `AppError` → statusCode, `z.ZodError` → 400, and other errors → 500. Duplicate try/catch blocks were removed from the audited routes.
   - Status: PASS

9. RBAC placeholders remain intact.
   - Verified: Routes still contain `// TODO: RBAC placeholder` comments at the appropriate authorization insertion points (create/update/tenant access, settings/branding). No RBAC logic was removed or introduced.
   - Status: PASS

Compliance Results (summary)

- All targeted verification points (1–9) PASS. The remediation correctly moved business logic into `TenantSettingsService` and centralized error handling, while preserving RBAC placeholders.

Remaining Risks

- RBAC: Authorization checks are not implemented — this remains a pre-production gating item. The audit accepts the presence of placeholders but flags RBAC as a required next step.
- Contract tests: `docs/openapi/a1-tenants.yaml` documents defaulting behavior, but automated contract tests should validate that responses include the defaulted fields where applicable.
- Prisma migration: Database migration application (`prisma migrate dev`) remains blocked by DB auth (P1000). Manual migration SQL is present in `prisma/migrations/20260531120000_a1_foundation/migration.sql` but not applied.
- Error handling surface: `runApi` centralizes error mapping, but services may throw other error types — consider standardizing service error types and adding tests for error translation.

Step 5 Approval Status

Step 5 Approved

Rationale: The audit criteria specified were satisfied: routes are thin, business logic resides in services, routes do not access Prisma or repositories, the OpenAPI spec documents the enriched settings behavior, error handling is centralized, and RBAC placeholders remain for later enforcement. Remaining risks are operational (RBAC, migration application, contract tests) and do not prevent Step 5 approval per the A1 gating rules.

Next recommended actions (not implemented here)

- Implement RBAC checks and re-run security/authorization tests.
- Add unit tests for `TenantSettingsService.upsertPartial`, covering defaulting and preservation of existing values.
- Add OpenAPI contract tests to verify returned fields and defaults.
- Resolve DB authentication and apply migrations to a staging DB.


Audit complete.
