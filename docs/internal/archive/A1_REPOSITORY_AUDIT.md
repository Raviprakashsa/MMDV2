# A1 Repository Audit

Date: 2026-05-31
Scope: Repository layer only
Authority: `docs/MVP_LOCKDOWN.md`, `docs/A1_IMPLEMENTATION_PLAN.md`, `docs/A1_PLAN_FEATURE_OWNERSHIP_DECISION.md`

## Repository Audit Summary

### Repositories reviewed
1. `lib/foundation/repositories/tenant.repository.ts`
2. `lib/foundation/repositories/plan.repository.ts`
3. `lib/foundation/repositories/feature.repository.ts`
4. `lib/foundation/repositories/tenant-feature.repository.ts`
5. `lib/foundation/repositories/tenant-settings.repository.ts`
6. `lib/foundation/repositories/tenant-branding.repository.ts`

### Public methods by repository

#### `TenantRepository`
- `create(input)`
- `findById(id)`
- `findByTenantId(context)`
- `findByBusinessTenantId(tenantId)`
- `updateById(id, input)`
- `softDeleteById(id)`
- `softDelete(context)`

#### `PlanRepository`
- `listActive()`
- `findById(id)`
- `findByCode(code)`
- `create(input)`
- `updateById(id, input)`
- `softDeleteById(id)`

#### `FeatureRepository`
- `listActive()`
- `findById(id)`
- `findByCode(code)`
- `create(input)`
- `updateById(id, input)`
- `softDeleteById(id)`

#### `TenantFeatureRepository`
- `listByTenant(context)`
- `findByTenantAndFeature(context, featureId)`
- `upsert(input)`
- `softDeleteByTenantAndFeature(context, featureId)`

#### `TenantSettingsRepository`
- `findByTenant(context)`
- `upsert(input)`
- `softDeleteByTenant(context)`

#### `TenantBrandingRepository`
- `findByTenant(context)`
- `upsert(input)`
- `softDeleteByTenant(context)`

### Method categories

#### CRUD
- `TenantRepository.create`, `updateById`, `softDeleteById`, `softDelete`
- `PlanRepository.create`, `updateById`, `softDeleteById`
- `FeatureRepository.create`, `updateById`, `softDeleteById`
- `TenantFeatureRepository.upsert`, `softDeleteByTenantAndFeature`
- `TenantSettingsRepository.upsert`, `softDeleteByTenant`
- `TenantBrandingRepository.upsert`, `softDeleteByTenant`

#### Query/Search
- `TenantRepository.findById`, `findByTenantId`, `findByBusinessTenantId`
- `PlanRepository.listActive`, `findById`, `findByCode`
- `FeatureRepository.listActive`, `findById`, `findByCode`
- `TenantFeatureRepository.listByTenant`, `findByTenantAndFeature`
- `TenantSettingsRepository.findByTenant`
- `TenantBrandingRepository.findByTenant`

#### Pagination
- None exposed.

#### Tenant Scope
- `TenantRepository.findByTenantId`, `softDelete`
- `TenantFeatureRepository.listByTenant`, `findByTenantAndFeature`, `softDeleteByTenantAndFeature`
- `TenantSettingsRepository.findByTenant`, `softDeleteByTenant`
- `TenantBrandingRepository.findByTenant`, `softDeleteByTenant`

#### Soft Delete
- `TenantRepository.findById`, `findByBusinessTenantId`, `softDeleteById`, `softDelete`
- `PlanRepository.listActive`, `findById`, `findByCode`, `softDeleteById`
- `FeatureRepository.listActive`, `findById`, `findByCode`, `softDeleteById`
- `TenantFeatureRepository.listByTenant`, `findByTenantAndFeature`, `softDeleteByTenantAndFeature`
- `TenantSettingsRepository.findByTenant`, `softDeleteByTenant`
- `TenantBrandingRepository.findByTenant`, `softDeleteByTenant`

## Enforcement Review

### Tenant-scoping enforcement
- Enforced in `TenantRepository.softDelete(context)` through `requireTenant(context)` and `where: { id: tenantId }`.
- Enforced in `TenantFeatureRepository`, `TenantSettingsRepository`, and `TenantBrandingRepository` through `withTenant(context, ...)`.
- Not applicable to `PlanRepository` or `FeatureRepository` because `docs/A1_PLAN_FEATURE_OWNERSHIP_DECISION.md` defines them as global catalog entities.

### Soft-delete enforcement
- Read methods in `PlanRepository` and `FeatureRepository` filter on `deletedAt: null`.
- Read methods in `TenantRepository` filter on `deletedAt: null` for global/business-tenant lookups.
- Tenant-scoped repositories use `withTenant(context, ...)` for reads and `markDeleted()` or `deletedAt: null` reset on upsert.
- `upsert()` methods in tenant-scoped repositories restore records by clearing `deletedAt`.

## Logic Review

### Business logic inside repositories
- `PlanRepository.create()` and `FeatureRepository.create()` default `tenantId` to `'system'`.
- `TenantSettingsRepository.upsert()` applies default locale, timezone, date format, time format, and week start day values.
- `TenantBrandingRepository.upsert()` normalizes nullable branding fields.
- `TenantRepository.softDelete()` and `softDeleteById()` also flip `isActive` to `false`.
- `TenantFeatureRepository.upsert()` applies default entitlement behavior: `isEnabled = true`, `source = 'manual'`, `overrideValue = null`.

### Validation logic inside repositories
- No explicit runtime validation, authorization validation, or schema validation is implemented in these repositories.
- Validation is limited to TypeScript input shapes and Prisma constraints.

### RBAC or permission logic inside repositories
- None.
- No role checks, permission checks, or access-control branching exists in the repository layer.

## Duplicate Query / Duplicate Code Review

### Repeated patterns
- `withTenant(context, {})` is repeated across tenant-scoped repositories.
- `markDeleted()` / `deletedAt` soft-delete updates are repeated across several repositories.
- `listActive()` / `findById()` / `findByCode()` patterns are mirrored in `PlanRepository` and `FeatureRepository`.
- `TenantSettingsRepository` and `TenantBrandingRepository` share nearly identical tenant-scoped lookup and soft-delete patterns.

### Duplicate query observations
- `PlanRepository` and `FeatureRepository` both query the same structural shape: active list, id lookup, code lookup, create, update, soft delete.
- `TenantSettingsRepository` and `TenantBrandingRepository` both perform a single-record tenant lookup plus soft delete via `updateMany`.
- `TenantFeatureRepository` repeats the same tenant filter pattern for both list and single-record lookup.

## Recommendations

### Keep
- Keep the tenant-aware repository boundary.
- Keep `PlanRepository` and `FeatureRepository` as separate catalog repositories.
- Keep soft-delete handling at the repository boundary.
- Keep tenant-scoped repositories aligned to `Tenant.id`.

### Refactor
- Extract shared catalog helpers for `PlanRepository` and `FeatureRepository` if more methods are added.
- Consider a shared tenant-settings/tenant-branding base helper if the pattern grows.
- Consider normalizing tenant-scoped soft-delete helpers to reduce repeated `updateMany({ data: this.markDeleted() })` logic.
- Consider moving business defaults like `'system'`, `'UTC'`, `'manual'`, and locale defaults into service constants if they need product-level policy control.

### Remove
- No repository should be removed at this stage.
- No RBAC, validation, or workflow logic should be added to repositories.

## Ownership Decision Summary

### Question 1: Are `Plan` and `Feature` global catalog entities or tenant-owned entities?
- They are global catalog entities.

### Question 2: Explain the chosen model
- `Plan` and `Feature` are shared definitions used across tenants.
- `TenantFeature` stores tenant-specific entitlement state.
- This keeps catalog data centralized and prevents duplicated plan/feature rows per tenant.

### Question 3: SaaS implications
- Multi-tenant impact: one shared catalog simplifies entitlement resolution across all tenants.
- White-label impact: tenant customization stays in tenant-specific records instead of forking the catalog.
- Future subscription impact: billing/subscription layers can reference the same global plan catalog without data migration.

### Question 4: Does the decision align with `docs/MVP_LOCKDOWN.md`?
- Yes.
- `docs/MVP_LOCKDOWN.md` explicitly allows `plans` and `features` in A1 and forbids subscriptions in MVP.
- The global catalog model supports the A1 foundation scope without introducing subscription entities.

## Risks
- Catalog defaults embedded in repositories may become policy drift points if future SaaS rules change.
- Repeated tenant-scoped query patterns may encourage copy/paste growth.
- Soft-delete behavior is consistent, but the repository layer currently relies on convention rather than a shared abstraction for all cases.
- The current model assumes `Plan` and `Feature` stay platform-managed, which should be reviewed before exposing admin UI for catalog editing.

## Refactoring Recommendations
- Add shared helpers for tenant-scoped lookup and soft delete patterns.
- Move policy defaults to service-level constants if these values become configurable.
- Preserve the global catalog model for `Plan` and `Feature` unless product strategy changes.
- Keep repositories free of RBAC and business workflow orchestration.

## Approval Status
- Status: Ready for review
- Step 3 is blocked until this audit is acknowledged.
