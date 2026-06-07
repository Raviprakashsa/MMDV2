# SCHEMA_ALIGNMENT_REPORT

Date: 2026-05-31
Mode: Review only (no schema edits, no migrations, no A1 start)

## Inputs Reviewed
- `prisma/schema.prisma` (current)
- `docs/FINAL_MVP_SCOPE.md` (approved scope)
- `docs/FINAL_PRISMA_ENTITY_MAP.md` (approved entity inventory)

## Executive Summary
- Current Prisma schema contains **11 models**.
- Approved MVP target is **24 entities**.
- Present from MVP now: **10/24**.
- Missing MVP entities: **14** (expected before A1-A5 implementation, but still identified below).
- Extra non-MVP entity present now: **1** (`FeatureFlag`).
- Key structural risk: most tenant-scoped relations use `Tenant.tenantId` (business key) rather than `Tenant.id` (primary key).

## Current vs Approved MVP

### Present in current schema and in MVP
- `Plan`
- `Feature`
- `PlanFeature`
- `TenantFeature`
- `Tenant`
- `Role`
- `Permission`
- `RolePermission`
- `User`
- `AuditLog`

### Missing MVP entities
- A1 Foundation core: `tenant_settings`, `tenant_branding`, `subscriptions`
- A3 CRM: `companies`, `contacts`, `leads`
- A4 ATS: `requirements`, `candidates`, `applications`, `interviews`
- A5 Operations/Billing: `placements`, `timesheets`, `invoices`

## Extra Non-MVP Entities
- `FeatureFlag` is not in approved MVP inventory.

Recommendation:
- **Move to Phase 2** (preferred), unless product governance explicitly re-adds it to MVP scope.

## Relationship and Integrity Review

### Correct/acceptable patterns
- `PlanFeature.planId -> Plan.id` is correct.
- `PlanFeature.featureId -> Feature.id` is correct.
- `Tenant.planId -> Plan.id` is correct.
- `TenantFeature.featureId -> Feature.id` is correct.

### Incorrect or high-risk patterns
1. **Tenant FK strategy inconsistency**
   - `TenantFeature.tenantId -> Tenant.tenantId`
   - `Role.tenantId -> Tenant.tenantId`
   - `User.tenantId -> Tenant.tenantId`
   - `AuditLog.tenantId -> Tenant.tenantId`
   - `FeatureFlag.tenantId -> Tenant.tenantId`

   Why this is risky:
   - Foreign keys should generally target immutable PKs (`Tenant.id`).
   - `tenantId` appears to be a business identifier and may change due to operational/business events.
   - Using business keys as FK targets increases cascade/update complexity and cross-table coupling.

2. **Tenant-scoped columns without FK enforcement**
   - `Plan.tenantId`, `Feature.tenantId`, `PlanFeature.tenantId`, `Permission.tenantId`, `RolePermission.tenantId` are plain strings with no tenant FK relation.
   - If intentional for global/system data, this should be explicit and constrained by clear semantics (e.g., nullable tenant FK + system scope flag).

3. **Mixed global vs tenant scope not normalized**
   - `Plan` and `Feature` use `tenantId = "system"` defaults while `Tenant` references `Plan.id`.
   - This can work, but current design does not strictly enforce global catalog behavior at schema level.

## Specific Entity Review

### `Plan`
- Current: Has `tenantId` string default `"system"`, relation to `Tenant` via `Tenant.planId`.
- MVP alignment: In-scope.
- Recommendation: **Keep** (MVP).
- Note: Clarify if plans are globally owned; if yes, avoid faux tenant FK string patterns.

### `Feature`
- Current: Has `tenantId` string default `"system"`; connected to `PlanFeature` and `TenantFeature`.
- MVP alignment: In-scope.
- Recommendation: **Keep** (MVP).
- Note: Same global/system scoping clarification needed.

### `PlanFeature`
- Current: Correct join between `Plan` and `Feature`; unique composite on `[planId, featureId]`; also has standalone `tenantId` string.
- MVP alignment: In-scope.
- Recommendation: **Keep** (MVP).
- Note: `tenantId` here is likely redundant if plan-feature matrix is global.

### `TenantFeature`
- Current: Override model with unique `[tenantId, featureId]`; `tenantId` FK points to `Tenant.tenantId`.
- MVP alignment: In-scope.
- Recommendation: **Keep** (MVP).
- Required correction direction (for implementation phase): tenant relation should target `Tenant.id`.

### `FeatureFlag`
- Current: Tenant-scoped key/value flags; FK to `Tenant.tenantId`.
- MVP alignment: **Not in approved MVP**.
- Recommendation: **Move to Phase 2**.
- Alternative if strictly minimizing scope: **Remove from A1-A5 implementation plan**.

## Tenant FK Decision: `tenant.id` vs `tenant.tenantId`

Decision for alignment with robust relational design:
- Prefer FK references to `Tenant.id` for all tenant-scoped relations.
- Keep `Tenant.tenantId` as a unique business/external identifier (lookup/display/integration), not core FK target.

Applies to:
- `TenantFeature`
- `Role`
- `User`
- `AuditLog`
- `FeatureFlag` (if retained in any phase)
- Any upcoming A1-A5 tenant-scoped entities

## Keep / Move / Remove Recommendations

### Keep (MVP)
- `Plan`
- `Feature`
- `PlanFeature`
- `Tenant`
- `TenantFeature`
- `Role`
- `Permission`
- `RolePermission`
- `User`
- `AuditLog`

### Move to Phase 2
- `FeatureFlag`

### Remove (from current approved plan)
- None mandatory at this stage, provided `FeatureFlag` is formally deferred and not implemented in A1-A5.

## Pre-A1 Alignment Checklist (Review Output)
- Confirm MVP entity backlog includes missing A1/A3/A4/A5 entities listed above.
- Confirm tenant FK policy: **all tenant relations target `Tenant.id`**.
- Confirm whether `Plan`/`Feature` are global catalog entities and document strict scoping rule.
- Confirm `FeatureFlag` status as Phase 2 deferred.

---
This report is analysis-only and applies no schema or migration changes.
