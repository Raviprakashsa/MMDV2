# A1 Service Audit

Date: 2026-05-31
Scope: Service layer only
Authority: `docs/MVP_LOCKDOWN.md`, `docs/A1_IMPLEMENTATION_PLAN.md`, `docs/A1_STEP_3_REPORT.md`

## Service Inventory

Services reviewed:
- `lib/foundation/services/tenant.service.ts`
- `lib/foundation/services/tenant-settings.service.ts`
- `lib/foundation/services/tenant-branding.service.ts`
- `lib/foundation/services/tenant-feature.service.ts`
- `lib/foundation/services/plan.service.ts`
- `lib/foundation/services/feature.service.ts`

### Public methods by service

#### `TenantService`
- `create(input: CreateTenantInput)`
- `getById(id: string)`
- `updateById(id: string, input: UpdateTenantInput)`
- `archiveById(id: string)`

#### `TenantSettingsService`
- `getByTenantId(tenantId: string)`
- `ensureForTenant(tenantId: string)`
- `upsert(input: UpsertTenantSettingsInput)`
- `archiveByTenantId(tenantId: string)`

#### `TenantBrandingService`
- `getByTenantId(tenantId: string)`
- `ensureForTenant(tenantId: string)`
- `upsert(input: UpsertTenantBrandingInput)`
- `archiveByTenantId(tenantId: string)`

#### `TenantFeatureService`
- `listByTenantId(tenantId: string)`
- `getByTenantAndFeature(tenantId: string, featureId: string)`
- `upsert(input: UpsertTenantFeatureInput)`
- `archiveByTenantAndFeature(tenantId: string, featureId: string)`

#### `PlanService`
- `listActive()`
- `getById(id: string)`
- `getByCode(code: string)`
- `create(input: Omit<CreatePlanInput,'tenantId'>)`
- `updateById(id: string, input: UpdatePlanInput)`
- `archiveById(id: string)`

#### `FeatureService`
- `listActive()`
- `getById(id: string)`
- `getByCode(code: string)`
- `create(input: Omit<CreateFeatureInput,'tenantId'>)`
- `updateById(id: string, input: UpdateFeatureInput)`
- `archiveById(id: string)`

## Business Rules Implemented

- `TenantService.create` validates `planId` existence, creates tenant, and provisions default settings and branding.
- `TenantService.updateById` validates `planId` when provided.
- `TenantService.archiveById` marks `isActive=false` then performs soft-delete via repository.
- `TenantSettingsService.ensureForTenant` enforces default tenant settings if missing.
- `TenantBrandingService.ensureForTenant` creates a branding record with null defaults when missing.
- `TenantFeatureService.upsert` validates tenant and feature presence and applies service-level defaults for `isEnabled` and `source`.
- `PlanService.create` and `FeatureService.create` write catalog entries under `system` tenant id.
- `PlanService` / `FeatureService` archive methods set `isActive=false` prior to soft-delete.

## Default Values Implemented (Service-level)

- `TenantSettingsService` defaults:
  - `timezone = 'UTC'`
  - `locale = 'en-IN'`
  - `dateFormat = 'DD/MM/YYYY'`
  - `timeFormat = '24h'`
  - `weekStartDay = 1`

- `TenantFeatureService` defaults:
  - `isEnabled = true`
  - `source = 'manual'`

- `PlanService` / `FeatureService` use `SYSTEM_TENANT_ID = 'system'` for catalog creation.

## Validation Rules Implemented

- Existence checks raising `NotFoundError` for:
  - Plan existence in `TenantService.create` and `TenantService.updateById`.
  - Tenant existence in tenant-scoped operations (settings, branding, feature upserts).
  - Feature existence in `TenantFeatureService.upsert`.
  - Record existence before archive operations in several services.

- No other input shape validation (e.g., format checks) present — services rely on TypeScript types and repository/DB constraints.

## Repository Calls Made

- `tenantRepository.create`, `tenantRepository.findById`, `tenantRepository.updateById`, `tenantRepository.softDeleteById`
- `planRepository.findById`, `planRepository.listActive`, `planRepository.findByCode`, `planRepository.create`, `planRepository.updateById`, `planRepository.softDeleteById`
- `featureRepository.findById`, `featureRepository.listActive`, `featureRepository.findByCode`, `featureRepository.create`, `featureRepository.updateById`, `featureRepository.softDeleteById`
- `tenantSettingsRepository.findByTenant`, `tenantSettingsRepository.upsert`, `tenantSettingsRepository.softDeleteByTenant`
- `tenantBrandingRepository.findByTenant`, `tenantBrandingRepository.upsert`, `tenantBrandingRepository.softDeleteByTenant`
- `tenantFeatureRepository.listByTenant`, `tenantFeatureRepository.findByTenantAndFeature`, `tenantFeatureRepository.upsert`, `tenantFeatureRepository.softDeleteByTenantAndFeature`

## Architectural Compliance

1. No direct Prisma client access in services: PASS
   - Services import repositories and call repository methods; none import `prisma` or use Prisma queries directly.

2. No API logic in services: PASS
   - No HTTP, routing, serialization, response formatting, or status code logic is present.

3. No UI logic in services: PASS
   - No rendering, UI formatting, or UI-specific concerns.

4. Repositories remain data-access only: PASS (with caveat)
   - Repositories perform CRUD and basic query behavior. Business defaults were moved to services; however, some repository methods still include minimal data-shaping like `markDeleted()` usage.

## Risks

- Service-level defaults are hard-coded; promoting them to a config layer will be required if they need runtime change.
- Tightening repository input shapes required service callers to provide formerly implicit values; any external callers outside A1 must be audited.
- No schema/format validation in services (e.g., slug format, email format) — these will be needed for public API input validation.
- No RBAC enforcement at service level; responsibility is on route layer as planned.

## Keep / Refactor / Remove Recommendations

- Keep:
  - Service boundary as implemented.
  - Current validation pattern for existence checks in services.
  - Repository data-access responsibilities.

- Refactor:
  - Move service defaults into a single `lib/config` or `lib/constants` module for discoverability.
  - Add a small `validation` helper module for common format checks before persisting (to be introduced in A2 if needed).
  - Consider extracting repeated archive patterns across services into a small lifecycle helper in `lib/foundation/services` (only if cross-service reuse grows).

- Remove:
  - No removals recommended at this stage.

## Recommendation on Step 4

Step 4 Approved

Rationale: The services implement required business rules, enforce existence validations, avoid direct Prisma usage, and keep repositories as data-access only. No API or UI logic is present; the codebase passed typecheck and build.


Status: Service audit complete — ready to proceed to API layer pending your approval.