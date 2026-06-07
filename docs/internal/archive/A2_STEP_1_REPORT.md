# A2 Step 1 — Database Layer Report

Date: 2026-06-01

Scope

- Database-only changes for RBAC foundation (development-only).
- Models in scope: `User`, `Role`, `Permission`, `RolePermission`, `Session`.
- No repositories, services, APIs, or UI modified.

Summary of Changes

Models Changed

- `Permission` — converted to global catalog (removed `tenantId`).
- `RolePermission` — removed `tenantId` and tenant relation; tenant ownership now inferred via `roleId -> Role(tenantId)`.
- `Session` — new model added to track session lifecycle and tenant context.
- `Tenant` — removed back-reference `rolePermissions` (to keep relations consistent).

Fields Added

- `Session` model fields:
  - `id` (String, PK)
  - `userId` (String, FK -> User.id)
  - `tenantId` (String)
  - `refreshTokenHash` (String?)
  - `createdAt` (DateTime)
  - `expiresAt` (DateTime)
  - `lastActiveAt` (DateTime?)

Fields Removed

- `Permission.tenantId` (removed)
- `RolePermission.tenantId` (removed)
- `Tenant.rolePermissions` back-reference removed

Migration Generated

- Attempted: `npx prisma migrate dev --name a2_rbac_foundation --create-only`
  - Result: failed due to database authentication error (P1000). Prisma requires a valid DB connection to produce a migration in some environments.

- Manual migration SQL created for dev/staging review at:
  - `prisma/migrations/20260601_a2_rbac_foundation/migration.sql`

  Migration summary (development-only):
  - Drops FK constraint `fk_rolepermission_tenant_id` if present
  - Drops `tenantId` column from `RolePermission` (if present)
  - Drops `tenantId` column from `Permission` (if present)
  - Creates `Session` table with indexes and FK `Session.userId -> User.id`

Validation Results

Commands executed and results:

- `npx prisma validate` — Result: schema valid ✅
- `npx prisma generate` — Result: Prisma Client generated ✅
- `npm run typecheck` — Result: TypeScript typecheck passed after a small seed update to remove `Permission.tenantId` usage in `lib/foundation/seed/seed-strategy.ts` ✅
- `npm run build` — Result: Next.js build succeeded ✅

Notes:
- Because `Permission.tenantId` was removed, the local seed script referenced that field; I updated the dev-only seed script to remove `tenantId` in permission creation so typecheck/build would pass. This change is limited to seeding behavior and does not affect runtime logic.
- `prisma migrate dev --create-only` could not run due to DB credentials; the migration SQL was authored manually for review and application to dev/staging by DBAs.

Risks

- Applying the migration in a DB with inconsistent data (RolePermission.tenantId != Role.tenantId) will cause referential/validation issues. Run pre-checks before applying.
- Manual migration SQL may need adjustment for exact constraint/index names in the target DB; DBA review required.
- Removing `Permission.tenantId` assumes no tenant-specific permissions are required; product must confirm.
- Session model introduces storage of refresh-related material — ensure security (hashing, expiry, rotation) is implemented in services.

Rollback Notes

- To revert the migration, the following high-level steps are available:
  - Restore DB from a snapshot taken prior to migration.
  - Or, recreate dropped columns and populate values via joins/backups:

```sql
ALTER TABLE "RolePermission" ADD COLUMN "tenantId" text;
UPDATE "RolePermission" rp
SET "tenantId" = r."tenantId"
FROM "Role" r
WHERE rp."roleId" = r.id;

ALTER TABLE "Permission" ADD COLUMN "tenantId" text DEFAULT 'system';
-- populate from backup if available
```

- Drop `Session` table if created:

```sql
DROP TABLE IF EXISTS "Session";
```

Action Items / Next Steps

- Review `prisma/migrations/20260601_a2_rbac_foundation/migration.sql` with DBA and run pre-check SQL in the target dev/staging DB.
- If approved, apply migration to dev/staging and run validation scripts listed in `docs/A2_RBAC_CORRECTION_PLAN.md` and `docs/TENANT_FK_CORRECTION_PLAN.md` as applicable.

Files changed

- `prisma/schema.prisma` — updated
- `prisma/migrations/20260601_a2_rbac_foundation/migration.sql` — created
- `lib/foundation/seed/seed-strategy.ts` — small dev-only seed adjustment

Status

- Database layer changes prepared and validated locally. Migration file created for DBA review.

Next: stop per instructions. Do you want me to prepare the PR and CI checks for running these migrations in an ephemeral environment?"