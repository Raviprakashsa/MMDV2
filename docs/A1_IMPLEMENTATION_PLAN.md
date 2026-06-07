# A1 Implementation Plan

Date: 2026-05-31
Status: Pending approval
Authority: `docs/MVP_LOCKDOWN.md`

## Scope

A1 is limited to the locked foundation set only:
- plans
- features
- plan_features
- tenant_features
- tenants
- tenant_settings
- tenant_branding

Additional A1 constraints:
- Use `Tenant.id` for all tenant-scoped foreign keys.
- Do not implement subscriptions.
- Do not implement feature flag systems.
- Do not implement billing.
- Do not implement analytics.
- Do not implement workflows.
- Do not implement webhooks.
- Do not implement API keys.
- Do not introduce any new utility folders, helper folders, shared abstractions, or architectural layers.

Amended build rules:
- `tenant_branding` is database + API only.
- `features`, `plan_features`, and `tenant_features` are schema + seed data only.
- No feature management UI in A1.
- No tenant branding UI in A1.

## Files to Create

### Database and seed
- `prisma/migrations/<timestamp>_a1_foundation/migration.sql`
- `docs/A1_MIGRATION_SUMMARY.md`

### Backend and API
- `lib/services/tenant.service.ts`
- `lib/services/tenant-branding.service.ts`
- `lib/validators/tenant.ts`
- `lib/validators/tenant-branding.ts`
- `app/api/v1/tenants/route.ts`
- `app/api/v1/tenants/[id]/route.ts`
- `app/api/v1/tenants/[id]/branding/route.ts`
- `docs/openapi/a1-tenant-endpoints.yaml`

### UI
- `app/(dashboard)/dashboard/settings/tenant/new/page.tsx`
- `app/(dashboard)/dashboard/settings/tenant/[id]/page.tsx`
- `app/(dashboard)/dashboard/settings/tenant/[id]/edit/page.tsx`
- `app/(dashboard)/dashboard/settings/tenant/_components/tenant-form.tsx`
- `app/(dashboard)/dashboard/settings/tenant/_components/tenant-details.tsx`

### Completion artifacts
- `docs/A1_COMPLETION_REPORT.md`
- `docs/A1_SCHEMA_DIAGRAM.md`
- `docs/A1_API_SUMMARY.md`

## Files to Modify

### Database and platform wiring
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `lib/prisma.ts`
- `lib/db/postgres.ts`

### Foundation repositories and shared services
- `lib/foundation/repositories/base.repository.ts`
- `lib/foundation/repositories/tenant-aware.repository.ts`
- `lib/foundation/repositories/tenant.repository.ts`
- `lib/foundation/repositories/tenant-branding.repository.ts`
- `lib/foundation/auth/rbac-middleware.ts`
- `lib/foundation/auth/authjs-config.ts`
- `lib/foundation/audit/audit-log.service.ts`
- `lib/foundation/storage/storage-provider.ts`
- `lib/foundation/storage/providers/local-storage.provider.ts`

### App shell
- `app/(dashboard)/dashboard/settings/page.tsx`

## Database Changes

### Prisma schema alignment
- Add or finalize `tenant_settings` and `tenant_branding` models.
- Keep `plans`, `features`, `plan_features`, and `tenant_features` in the A1 schema only.
- Align every tenant-owned relation to use `Tenant.id` as the foreign key target.
- Keep `Tenant.tenantId` as a unique business identifier only.
- Preserve the approved foundation models already in scope.
- Do not add subscriptions or any deferred Phase 2 entities.

### Required table shape
- Every new table must contain `id`.
- Every new table must contain `createdAt`.
- Every new table must contain `updatedAt`.
- Every new table must contain `deletedAt`.
- Every tenant-owned table must contain `tenantId` as an FK to `Tenant.id`.

### Migration
- Create one dedicated A1 migration for the foundation schema increment.
- The migration must cover the new foundation tables and any FK/index updates needed for `Tenant.id` alignment.
- No separate migration for deferred entities.

### Seed data
- Seed only A1-safe foundation data.
- Seed any required default plans and features if the tenant workflow depends on them.
- Seed `tenant_features` only as needed to support the approved foundation defaults.
- Do not seed subscriptions, feature flags, billing, analytics, workflows, webhooks, or API keys.

## API Endpoints

### Tenant create/view/edit
- `POST /api/v1/tenants`
- `GET /api/v1/tenants/[id]`
- `PATCH /api/v1/tenants/[id]`

### Tenant branding
- `GET /api/v1/tenants/[id]/branding`
- `PATCH /api/v1/tenants/[id]/branding`

### Endpoint behavior
- Use REST-style JSON only.
- Validate input before persistence.
- Enforce tenant-aware authorization before service execution.
- Do not call Prisma directly from route handlers.
- Keep endpoints limited to the A1 foundation scope.
- Generate OpenAPI contracts for these tenant endpoints before completion.

## UI Screens

### Tenant Create
- `app/(dashboard)/dashboard/settings/tenant/new/page.tsx`

### Tenant View
- `app/(dashboard)/dashboard/settings/tenant/[id]/page.tsx`

### Tenant Edit
- `app/(dashboard)/dashboard/settings/tenant/[id]/edit/page.tsx`

### UI behavior
- Create screen submits the new tenant payload.
- View screen renders tenant details and foundation metadata.
- Edit screen updates tenant attributes allowed by A1.
- No UI for tenant branding in A1.
- No UI for feature management in A1.
- No UI for subscriptions or deferred modules.

## Risks

- The current codebase still carries older planning documents that mention deferred entities; those must remain subordinate to `docs/MVP_LOCKDOWN.md`.
- FK conversion to `Tenant.id` may require careful backfill or constraint ordering.
- Seed changes can accidentally introduce non-MVP entities if defaults are not tightly scoped.
- Tenant branding is API-only, so its persistence paths must be validated without any UI feedback loop.
- The app already contains unrelated route areas for deferred modules, which can cause accidental cross-scope edits if the A1 change set is not isolated.
- OpenAPI output must stay aligned with the tenant routes; otherwise the contract can drift from the implementation.

## Validation Plan

### Schema and migration validation
- Run `prisma validate`.
- Review the generated A1 migration SQL before applying it.
- Confirm no deferred entities are introduced in the schema diff.
- Confirm every new table includes `id`, `createdAt`, `updatedAt`, and `deletedAt`.
- Confirm every tenant-owned table uses `tenantId -> Tenant.id`.

### Backend validation
- Run `tsc` / project typecheck.
- Validate request/response schemas for tenant create/view/edit and tenant branding.
- Confirm repository calls stay behind the service layer.

### API validation
- Smoke-test `POST`, `GET`, and `PATCH` tenant endpoints.
- Smoke-test tenant branding `GET` and `PATCH` endpoints.
- Confirm tenant-scoped authorization and `Tenant.id` FK behavior.
- Confirm OpenAPI contracts match the implemented route shapes.

### UI validation
- Smoke-test create, view, and edit tenant pages.
- Confirm screens load, submit, and render without referencing deferred modules.

### Safety checks
- Confirm no subscriptions, feature flags, billing, analytics, workflows, webhooks, or API keys are added.
- Confirm the file set remains inside the approved A1 scope.
- Confirm no Postman collections are generated yet.

## Approval Gate

Do not implement A1 until this plan is approved.
