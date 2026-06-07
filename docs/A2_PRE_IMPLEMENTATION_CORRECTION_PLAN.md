# A2 Pre-Implementation Correction Plan

Date: 2026-06-01

Context

- Project state: Pre-production / development only (no confirmed live customer migration).
- Purpose: Plan tenant FK corrections for A2 readiness without performing any code or DB changes now. This is planning-only.

Scope & Constraints

- Do NOT assume live production migration.
- Do NOT assume dual-write strategy.
- Do NOT assume backfill complexity beyond what is needed for development/testing.
- Work targets development environments and staging only; production runbooks handled separately.

Models To Fix

These models in `prisma/schema.prisma` reference `Tenant.tenantId` and must be corrected to reference `Tenant.id`:

- `Role`
- `RolePermission` (if intended to be tenant-scoped)
- `User`
- `AuditLog`
- `FeatureFlag`

Note: Catalog/system models with `tenantId` defaulting to `"system"` (e.g., `Plan`, `Feature`, `PlanFeature`, `Permission`) are intentionally tenant-agnostic and should NOT be changed without product confirmation.

Relationships To Fix (exact)

For each affected model, change the relation definition to reference `Tenant.id` instead of `Tenant.tenantId` and ensure the local FK column datatype matches `Tenant.id` (UUID).

Examples (Prisma snippets, BEFORE → AFTER):

Role (conceptual)

Before:

model Role {
  id        String @id @default(uuid())
  tenantId  String
  tenant    Tenant @relation(fields: [tenantId], references: [tenantId])
  // ...
}

After:

model Role {
  id        String @id @default(uuid())
  tenantId  String @db.Uuid
  tenant    Tenant @relation(fields: [tenantId], references: [id])
  // ...
}

User (conceptual)

Before:

model User {
  id        String @id @default(uuid())
  tenantId  String
  tenant    Tenant @relation(fields: [tenantId], references: [tenantId])
}

After:

model User {
  id        String @id @default(uuid())
  tenantId  String @db.Uuid
  tenant    Tenant @relation(fields: [tenantId], references: [id])
}

RolePermission, AuditLog, FeatureFlag: apply the same pattern — ensure FK column type = UUID and relation references `Tenant(id)`.

Exact Schema Corrections Required

1. For each affected model, update the `@relation` attribute to `references: [id]`.
2. Ensure the local FK column (`tenantId`) uses the same DB type as `Tenant.id` (commonly `String @db.Uuid` in Prisma) or rename to `tenantIdUuid` (dev-only) if preferred for clarity during transitional testing.
3. Add `@@index([tenantId])` where tenant-scoped queries are expected, if not already present.
4. Update any composite relation definitions that incorrectly reference `tenantId` on the Tenant side.

Exact Migrations Required (development-only)

Note: These steps assume you will run migrations only against development/staging databases.

1. Update `prisma/schema.prisma` as described in "Exact Schema Corrections Required".
2. Run in dev:

```bash
npx prisma migrate dev --name a2_tenant_fk_corrections
```

3. Inspect generated SQL in `prisma/migrations/*_a2_tenant_fk_corrections` and verify it aligns with expectations.
4. Apply migration to `dev` database (migrate dev will do this), run `npm run build` and `npm run typecheck`.
5. Seed dev DB with representative test data and run local integration/smoke tests.

If `prisma migrate dev` is not desired in dev, alternative:
- Use `npx prisma db push --accept-data-loss` on a local ephemeral DB only (NOT for production) to sync schema for development testing.

Exact Validation Steps Required

1. Schema-level validation
  - `npx prisma validate` (if available) or inspect generated migration SQL.
2. Typecheck and build
  - `npm run typecheck`
  - `npm run build`
3. Unit & repo tests
  - Run repository/unit tests that filter or join by tenantId to confirm queries work.
4. Integration/Smoke
  - Start the app against the dev DB and exercise tenant-scoped flows:
    - Create tenant, create role/user scoped to tenant, read back role/user, check audit logs and feature flags for tenant association.
5. Data consistency checks (dev data)
  - Confirm `Tenant` rows exist and relations resolve.
  - Run sample joins (SQL) verifying `SELECT r.* FROM "Role" r JOIN "Tenant" t ON r.tenantId = t.id LIMIT 10;` returns expected rows.
6. API contract checks
  - Run API smoke tests to ensure endpoints that surface tenant-scoped data return correct structures and status codes.

Risks (development-only)

- Local/Dev DB drift: migrations applied only to dev may diverge from production if not tracked carefully.
- Tests may pass on dev data but differ on production data shapes.
- Assumption that `Tenant.id` is UUID — if different, the schema change needs adjustment.

Mitigations

- Version-control the Prisma schema and migration files.
- Run this plan first in an isolated dev branch and CI pipeline against a disposable DB snapshot.
- Coordinate with the team before promoting migration files to main or production branches.

Approval Required

- Architecture: approve schema corrections and migration flow.
- DB/Platform (if dev infra is managed): confirm dev DB migration policy and ephemeral DB usage.
- Product: confirm we should change these IAM-related models now (no API contract changes expected).

Estimate Effort (development-only)

- Developer time: 1–3 engineer-days
  - Update schema and generate migrations: 0.5–1 day
  - Run dev migrations, inspect SQL, iterate: 0.5–1 day
  - Write/adjust tests and run validation: 0.5–1 day
- CI adjustments / review: 0.5 day
- Total calendar time: 1–5 days (inclusive of review cycles)

Deliverables (dev-only)

- `prisma/schema.prisma` updated in a feature branch
- One or more `prisma/migrations/*_a2_tenant_fk_corrections/` migration scripts
- Validation checklist and test logs

State Recommendation

- Since the project is confirmed Pre-production / development only (per project context), the plan state is: **Safe To Correct Now** for development and staging environments.

Caveat: Do NOT apply these migrations to production without the full migration/backfill plan in `docs/TENANT_FK_CORRECTION_PLAN.md` and sign-offs from Data/DBA and Security.

Next Steps

- Approve the plan with Architecture and DB team for dev execution.
- Create a feature branch and implement the schema changes and migrations.
- Run the validation steps in CI against an ephemeral dev DB.

(Planning-only. No schema or code changes were made in the repository by this document.)
