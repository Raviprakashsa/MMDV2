# Tenant FK Correction Plan

Date: 2026-06-01

Authority

- `docs/MVP_LOCKDOWN.md`
- `docs/A1_COMPLETION_REPORT.md`
- `docs/A2_READINESS_REPORT.md`

Goal

Correct all tenant-scoped relations to reference `Tenant.id` (primary key) instead of `Tenant.tenantId` (business identifier), across Prisma schema, repositories, services, and APIs. This document is planning-only: no code changes, migrations, or schema edits are performed here.

State: Further Investigation Required

Rationale: The correction impacts multiple models and live data. It requires Data/DB team involvement for safe backfill and ordered migrations. The plan below details scope, strategy, and risks.


1. Current State

- Prisma models include a number of tenant-scoped `tenantId` fields. Some models already reference `Tenant.id` correctly (e.g., `TenantFeature`, `TenantSettings`, `TenantBranding`), while others either use `tenantId` without an explicit relation or define relations referencing `Tenant.tenantId` (policy-violating).
- IAM-related models (`Role`, `User`, `AuditLog`, `FeatureFlag`, `RolePermission`) currently reference or assume `Tenant.tenantId` in their relations/indices.
- Foundation repositories exist for A1 models (`tenant`, `tenant-settings`, `tenant-branding`, `plan`, `feature`, `tenant-feature`), but IAM repositories (user/role/permission) are not present.
- APIs and services for A1 are present; RBAC placeholders exist but no enforcement.


2. Affected Models (inventory)

Models containing `tenantId` field (from `prisma/schema.prisma`) — categorize as "OK" (already referencing `Tenant.id`) or "Needs Correction":

- Plan (tenantId: default "system") — OK (catalog, system tenant convention) — no explicit relation to `Tenant`
- Feature (tenantId: default "system") — OK (catalog)
- PlanFeature (tenantId: default "system") — OK
- Tenant (owner model)
- TenantFeature (tenant relation references `Tenant.id`) — OK
- TenantSettings (tenant relation references `Tenant.id`) — OK
- TenantBranding (tenant relation references `Tenant.id`) — OK
- Role (tenantId: String) — Needs Correction (relation currently references `Tenant.tenantId`)
- Permission (tenantId: default "system") — OK (catalog/system)
- RolePermission (tenantId: String) — Needs Correction (tenantId present and indexed; ensure relation references `Tenant.id` if intended)
- User (tenantId: String) — Needs Correction (relation currently references `Tenant.tenantId`)
- AuditLog (tenantId: String) — Needs Correction (relation currently references `Tenant.tenantId`)
- FeatureFlag (tenantId: String) — Needs Correction (relation currently references `Tenant.tenantId`)

Notes:
- Any model that stores `tenantId` as a business identifier (string) but is intended to be a FK to tenant must be corrected to reference `Tenant.id`.
- Catalog models that use `tenantId` as `system` sentinel may remain as-is if they are intentionally tenant-agnostic (verify business intent before changing).


3. Affected Relationships (foreign keys)

Primary relationships requiring correction (examples from schema):

- `Role.tenantId` currently related as `Tenant` via `references: [tenantId]` → must be migrated to reference `Tenant.id`.
- `User.tenantId` currently related as `Tenant` via `references: [tenantId]` → must reference `Tenant.id`.
- `AuditLog.tenantId` relation to `Tenant.tenantId` → must reference `Tenant.id`.
- `FeatureFlag.tenantId` relation to `Tenant.tenantId` → must reference `Tenant.id`.
- `RolePermission.tenantId` is present (indexed) — confirm intended FK; if it should reference tenant, point to `Tenant.id`.

Cross-check: any table with `@@index([tenantId])` or `tenantId` fields should be reviewed for FK semantics and corrected where tenant ownership is intended.


4. Affected Repositories

Existing repository files (under `lib/foundation/repositories`) that may need updates to use `Tenant.id` semantics or to adjust query predicates:

- `tenant.repository.ts` — likely unaffected except for helpers; used as canonical Tenant lookup
- `tenant-settings.repository.ts` — OK (already uses tenant id relation)
- `tenant-branding.repository.ts` — OK
- `tenant-feature.repository.ts` — OK
- `plan.repository.ts` — catalog-level, OK
- `feature.repository.ts` — catalog-level, OK

Repositories that will require creation or modification upon FK correction (currently absent or partial):

- `user.repository.ts` — CREATE/UPDATE/LOOKUP by `user.id` and `tenantId -> Tenant.id`
- `role.repository.ts` — adjust to join on `tenant.id`
- `role-permission.repository.ts` — ensure tenant scoping uses `Tenant.id`
- `audit-log.repository.ts` — adjust relations to `Tenant.id`
- `feature-flag.repository.ts` — adjust relations to `Tenant.id`

Notes:
- Any repository that filters by `tenantId` must be updated to use `Tenant.id` values and to consistently accept tenant context.


5. Affected Services

Services that use tenant-scoped data will require updates to expect `Tenant.id` FK and to validate tenant existence by `Tenant.id`:

- `tenant.service.ts` — primary owner, verify unaffected
- `tenant-settings.service.ts` — OK
- `tenant-branding.service.ts` — OK
- New/updated services to be created/modified:
  - `user.service.ts` — user lifecycle, password, invites
  - `role.service.ts` — role lifecycle and role ownership by tenant
  - `permission.service.ts` — catalog/service for permissions
  - `session.service.ts` — session lifecycle
  - `audit-log.service.ts` — ensure tenant FK points to `Tenant.id`


6. Affected APIs

Existing endpoints that may be impacted by tenant FK semantics or that will need RBAC checks:

- Tenant endpoints (already A1) — mostly unaffected but ensure they use `Tenant.id` where necessary.
- Any future IAM endpoints (to be added in A2) — will need to use `Tenant.id` in path params and payloads.
- Audit and feature-flag APIs (if present) — must be checked and updated.

Currently present API files referencing tenant routes (review):
- `app/api/v1/tenants/*` — OK (tenant-centric)
- No `users`, `roles`, `permissions` APIs currently exist — will be created in A2 but must use `Tenant.id`.


7. Data Migration Requirements

High-level plan to migrate existing tables to `Tenant.id` FK without data loss.

Pre-conditions:
- Full logical backup of the production database.
- Read-only snapshot capability or maintenance window defined if needed.
- Mapping between `Tenant.tenantId` (business key) and `Tenant.id` (UUID) verified.

Migration steps (per table) — zero-downtime friendly approach where practical:

1. Add new column `tenant_uid` (or `tenantIdRef`) of type UUID NULLABLE to each affected table.
2. Backfill `tenant_uid` with `SELECT t.id FROM Tenant t WHERE t.tenantId = table.tenantId` (batch updates to avoid locks).
3. Validate backfill: count of rows where `tenant_uid IS NULL` must be 0 for tables intended to be tenant-scoped.
4. Add foreign key constraint referencing `Tenant.id` on `tenant_uid` (deferred or validated after backfill) — add index on `tenant_uid`.
5. Update application code (repositories/services) to read/write `tenant_uid` for FK relationships while still writing business `tenantId` if required for compatibility. Deploy code that supports both columns (dual-write) in a backward-compatible release.
6. After sufficient verification and a safe window, swap: drop old `tenantId` FK/constraint if present, rename `tenant_uid` to `tenantId` (or standardize naming), and update code to use the new column exclusively.
7. Remove any temporary compatibility code and any duplicate columns after confirmation.

Notes on batching and performance:
- For large tables, perform backfill in controlled batches using IDs ranges, createdAt ranges, or pagination to reduce locks and liveness impact.
- Use transaction boundaries carefully; avoid long-running transactions.


8. Backfill Requirements

- Source mapping: `Tenant.tenantId` (string) -> `Tenant.id` (UUID). Produce a mapping table or temporary materialized join to speed updates.
- Backfill order: start with leaf/low-traffic tables, then move to higher-traffic and critical tables.
- Validation checks: row counts, foreign key integrity, referential consistency, and application-level smoke tests.
- Housekeeping: index new columns before enforcing constraints to reduce migration time for constraint creation.


9. Rollback Strategy

- Pre-migration snapshot and logical backups are mandatory.
- Keep old `tenantId` column and associated constraints until the migration is fully validated and can be rolled forward.
- If an issue is detected during backfill or constraint creation, the rollback options are:
  1. Stop migration, revert schema changes that were applied (drop new FK/constraint, drop new column if necessary), and restore from backup if corruption occurred.
  2. If using dual-write compatibility, switch application reads back to old column and redeploy previous code path.
- Ensure rollback playbook is exercised in a staging run before production.


10. Downtime Requirements

- Aim for zero-downtime migration using dual-write and online backfill techniques.
- Constraint creation can be an online operation if supported by DB (Postgres can CREATE CONSTRAINT NOT VALID then VALIDATE CONSTRAINT in separate step) — use `NOT VALID` followed by `VALIDATE CONSTRAINT` after backfill.
- For high-risk tables or if the DB cannot validate quickly, schedule a short maintenance window.

Estimate:
- Small deployments (low data volume): likely zero-downtime with careful batching.
- Large deployments (many millions of rows): may require maintenance windows for constraint validation or heavy backfill.


11. Estimate Migration Complexity

- Complexity: High

Factors:
- Number of affected tables and their row counts.
- Presence of active writes during migration (need dual-write support to avoid inconsistencies).
- Foreign key constraint re-creation and validation time.
- Cross-service code changes required for dual-write/read compatibility.

Estimated effort (rough):
- Planning & approvals: 2–5 days (architecture, data, security reviews)
- Staging test run and dry-run migrations: 3–7 days (depends on data volume)
- Production migration window and execution: 1–2 days (plus monitoring)
- Cleanup and follow-up: 1–3 days

Total: 1–3 weeks of calendar time including testing and coordination; engineering effort ~3–10 engineer-days depending on team and data size.


12. Validation Plan

- Pre-migration: full DB backup and schema snapshot. Staging dry-run with representative data volume.
- During backfill: row count checks, sample record verification, referential integrity checks, application smoke tests against staging environment.
- Post-constraint: run `VALIDATE CONSTRAINT` and run application test-suite + E2E smoke tests.
- Post-cutover: monitor error rates, database slow queries, 500s in logs, and audit logs for anomalies.

Validation checklist:
- All `tenant_uid` columns populated (no NULLs where tenant-scoped)
- FK constraints created and validated
- Application can read/write tenant-scoped data correctly
- No data loss or referential anomalies


13. Risks

- Data loss or corruption if backfill mapping is incorrect.
- Long-running backfill/constraint validation causing performance issues.
- Application code mismatch if dual-write compatibility is not implemented correctly.
- Human error during column swap/constraint operations.
- Unexpected references in code not covered by the analysis (hidden/legacy code paths).

Mitigations:
- Full backups, staging dry-run, incremental rollouts, monitoring, and DBA involvement.


14. Implementation Order (recommended)

1. Governance & Approvals: obtain sign-off from Architecture, Data/DBA, Security, and Product.
2. Prepare migration scripts, staging environment, and test dataset.
3. Implement dual-write/dual-read compatibility in application code (repositories/services) in a blue/green deploy pattern.
4. Add new nullable UUID FK columns (`tenant_uid`) to target tables.
5. Backfill `tenant_uid` values in batches using mapping join to `Tenant`.
6. Create FK constraints as `NOT VALID`, then `VALIDATE CONSTRAINT` after batch completion.
7. Switch application to read from `tenant_uid` (or rename to canonical column) in a controlled release.
8. Remove old `tenantId` usage from codebase, drop old columns after monitoring period.
9. Final cleanup and documentation update.


15. Approval Requirements

- Architecture: approve schema changes and migration strategy.
- Data/DBA: approve backfill approach, batching strategy, and execution window.
- Security: review and approve that migration preserves access controls and does not leak tenant boundaries.
- Product: approve any API contract changes or naming changes visible to clients.


Appendix: Quick Mapping SQL (conceptual)

-- Add new column (example)
ALTER TABLE "Role" ADD COLUMN tenant_uid uuid;

-- Backfill (conceptual)
UPDATE "Role" r
SET tenant_uid = t.id
FROM "Tenant" t
WHERE r.tenantId = t.tenantId
AND r.tenant_uid IS NULL;

-- Add FK constraint not valid
ALTER TABLE "Role" ADD CONSTRAINT fk_role_tenant_uid FOREIGN KEY (tenant_uid) REFERENCES "Tenant"(id) NOT VALID;

-- Validate
ALTER TABLE "Role" VALIDATE CONSTRAINT fk_role_tenant_uid;

(Do not run these statements without DBA review and staging dry-run.)


Conclusion

Correcting tenant-scoped FKs to reference `Tenant.id` is essential to comply with `docs/MVP_LOCKDOWN.md` and to safely proceed with A2. The work is high complexity and requires coordinated planning, staging runs, and approvals. At this time the project must undertake the defined planning steps; therefore the plan status is: **Further Investigation Required**.

Next immediate action items:
- Convene Architecture + Data + Security + Product to review and approve this plan.
- Build staging migration scripts and run a dry-run on a representative dataset.
- Allocate an engineer and DBA to execute the staged migration.

