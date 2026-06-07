# A2 Tenant FK Correction Report (Dev-only)

Date: 2026-06-01

Purpose

This report documents the development-only correction of tenant-scoped relations to reference `Tenant.id` for the following models: `Role`, `RolePermission`, `User`, `AuditLog`.

Scope

- Models changed: `Role`, `RolePermission`, `User`, `AuditLog`.
- No changes to `FeatureFlag`, `Plan`, `Feature`, `PlanFeature`, `Permission`.
- No repositories, services, APIs, or UI were created or modified.
- This is a dev/staging-only correction. Do NOT apply to production without full migration/backfill plan and approvals in `docs/TENANT_FK_CORRECTION_PLAN.md`.

Models Changed

- Role
- RolePermission
- User
- AuditLog

Relations Changed (exact)

1. `Role`
   - Before: `tenant    Tenant @relation(fields: [tenantId], references: [tenantId])`
   - After:  `tenant    Tenant @relation(fields: [tenantId], references: [id])`

2. `RolePermission`
   - Before: no explicit `tenant` relation (had `tenantId` String field)
   - After:  added `tenant Tenant @relation(fields: [tenantId], references: [id])`

3. `User`
   - Before: `tenant    Tenant @relation(fields: [tenantId], references: [tenantId])`
   - After:  `tenant    Tenant @relation(fields: [tenantId], references: [id])`

4. `AuditLog`
   - Before: `tenant    Tenant @relation(fields: [tenantId], references: [tenantId])`
   - After:  `tenant    Tenant @relation(fields: [tenantId], references: [id])`

Schema Corrections

- Updated `prisma/schema.prisma` to point the above relations to `Tenant.id`.
- Ensured local `tenantId` column types remain `String` matching `Tenant.id` (which uses `cuid()`), so no type coercion was performed.
- Added `rolePermissions RolePermission[]` back-reference on `Tenant` to satisfy Prisma relation semantics.

Migration Generated

- Created development-only migration at:
  - `prisma/migrations/20260601_a2_tenant_fk_corrections/migration.sql`

- Migration contents (summary):
  - Adds `NOT VALID` foreign key constraints:
    - `Role.tenantId` -> `Tenant(id)`
    - `RolePermission.tenantId` -> `Tenant(id)`
    - `User.tenantId` -> `Tenant(id)`
    - `AuditLog.tenantId` -> `Tenant(id)`
  - Constraints intentionally created as `NOT VALID` to allow backfill/validation before enforcing.

Validation Results

Commands run and results:

- `npx prisma validate` — Result: schema valid ✅
- `npx prisma generate` — Result: Prisma Client generated ✅
- `npm run typecheck` — Result: TypeScript typecheck completed (no errors) ✅
- `npm run build` — Result: Next.js build completed successfully (compiled and routed) ✅

Notes:
- Attempting `npx prisma migrate dev --name a2_tenant_fk_corrections --create-only` failed due to database authentication (P1000). To avoid blocking development progress, a migration SQL file was created manually in `prisma/migrations/...`.
- The generated SQL should be reviewed by the DBA and run in an isolated dev environment. Because the CLI could not connect to the configured DB, the migration was not created by Prisma automatically.

Risks

- The manual migration SQL may conflict with existing constraints in the target DB; constraint names and existing FK definitions must be inspected before applying.
- Adding FK constraints that reference `Tenant.id` assumes that `tenantId` values in the affected tables match existing `Tenant.id` values; if not, `VALIDATE CONSTRAINT` will fail.
- Prisma migration generation without DB access means the produced migration was hand-authored — requires careful review.
- If production uses a different `Tenant.id` type (e.g., UUID vs cuid), applying this migration in production without verification will cause failures.

Rollback Notes

- Before applying any migration to a live DB, create a full logical backup.
- Because the migration uses `ADD CONSTRAINT ... NOT VALID`, rollback is straightforward: drop the newly created constraint(s) if validation fails:

```sql
ALTER TABLE "Role" DROP CONSTRAINT IF EXISTS "fk_role_tenant_id";
ALTER TABLE "RolePermission" DROP CONSTRAINT IF EXISTS "fk_rolepermission_tenant_id";
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "fk_user_tenant_id";
ALTER TABLE "AuditLog" DROP CONSTRAINT IF EXISTS "fk_auditlog_tenant_id";
```

- If data inconsistencies are found, stop and restore from backup as needed.

Next Steps (manual)

- Review `prisma/migrations/20260601_a2_tenant_fk_corrections/migration.sql` with DBA.
- Run migration in an isolated dev DB and validate referential integrity.
- If dev run succeeds, promote migration files via feature branch and CI.

Status

- Implementation (dev-only) completed: `prisma/schema.prisma` updated and migration SQL created.
- Validation (schema, client generation, typecheck, build) completed locally; DB-connected `prisma migrate` could not run due to DB auth.

Do Not

- Do NOT apply these changes to production without the full migration/backfill plan in `docs/TENANT_FK_CORRECTION_PLAN.md` and approvals from Architecture, Data/DBA, Security, and Product.

