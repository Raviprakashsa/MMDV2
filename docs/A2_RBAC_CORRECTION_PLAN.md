# A2 RBAC Correction Plan (Planning-only)

Date: 2026-06-01

Scope

- Models: `RolePermission`, `Permission`, `Session`.
- Changes: Remove `tenantId` from `RolePermission`; treat `Permission` as global catalog; add `Session` model.
- This document is planning-only. No schema, migration, or code changes are made here.

Decisions Approved

1. `Permission` = Global Catalog
2. `Role` = Tenant Scoped
3. `RolePermission` = Remove `tenantId`
4. `User` = Single Role for A2
5. `Session` model required in A2


Schema Changes (planned)

1) `RolePermission` — remove tenantId

Prisma BEFORE (excerpt):

model RolePermission {
  id           String   @id @default(cuid())
  tenantId     String
  roleId       String
  permissionId String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  deletedAt    DateTime?

  role       Role       @relation(fields: [roleId], references: [id])
  permission Permission @relation(fields: [permissionId], references: [id])

  @@unique([roleId, permissionId])
  @@index([tenantId])
  @@index([deletedAt])
}

Prisma AFTER (planned):

model RolePermission {
  id           String   @id @default(cuid())
  roleId       String
  permissionId String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  deletedAt    DateTime?

  role       Role       @relation(fields: [roleId], references: [id])
  permission Permission @relation(fields: [permissionId], references: [id])

  @@unique([roleId, permissionId])
  @@index([roleId])
  @@index([deletedAt])
}

Notes:
- Tenant ownership of RolePermission is inferred via `roleId -> Role(tenantId)`.
- Remove `tenantId` index and any FK/relations tied to it.

2) `Permission` — treat as global catalog

Prisma BEFORE (excerpt):

model Permission {
  id          String   @id @default(cuid())
  tenantId    String   @default("system")
  code        String   @unique
  module      String
  action      String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  rolePermissions RolePermission[]

  @@index([tenantId])
  @@index([deletedAt])
}

Prisma AFTER (planned):

Option A (preferred): make Permission global by removing `tenantId` entirely:

model Permission {
  id          String   @id @default(cuid())
  code        String   @unique
  module      String
  action      String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  rolePermissions RolePermission[]

  @@index([deletedAt])
}

Option B (conservative): keep `tenantId` but restrict values to `"system"` for catalog permissions and enforce via application logic/DB CHECK.

3) `Session` — new model

Planned Prisma snippet:

model Session {
  id                 String   @id @default(cuid())
  userId             String
  tenantId           String
  refreshTokenHash   String?
  createdAt          DateTime @default(now())
  expiresAt          DateTime
  lastActiveAt       DateTime?

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([tenantId])
  @@index([expiresAt])
}

Notes:
- `tenantId` here captures the effective tenant context for the session and is useful for caching/authorization checks.
- `tenantId` must reference `Tenant.id` if tenant-scoped; for development, match existing Tenant PK type.


Migration Strategy (development-first)

Objective: safe, reversible changes targeted at dev/staging first. No production run.

Planned migration steps (per migration file and DBA review):

A. Preparation / Validation (run before schema change)

- Validate `RolePermission` consistency:

```sql
-- Find mismatches where RolePermission.tenantId != Role.tenantId
SELECT rp.id
FROM "RolePermission" rp
LEFT JOIN "Role" r ON r.id = rp."roleId"
WHERE rp."tenantId" IS DISTINCT FROM r."tenantId"
LIMIT 20;
```

- If any rows returned, abort and investigate; determine whether to correct RolePermission rows or Roles.

B. Development migration (safe path)

1. Update `prisma/schema.prisma` (feature branch): remove `tenantId` from `RolePermission`; apply `Permission` change (Option A or B); add `Session` model.
2. Generate migration files in dev branch (create-only):

```bash
npx prisma migrate dev --name a2_rbac_remove_rolepermission_tenantid --create-only
```

3. Inspect generated SQL under `prisma/migrations/*`.

4. Apply migration to dev DB (migrate dev will apply). If DB auth unavailable, run SQL against a disposable dev DB.

C. Backfill / Apply (if needed)

- If `RolePermission.tenantId` existed and must be retained elsewhere, backfill any derived columns before drop. For the chosen path (remove), no backfill required if consistency validated.

D. Finalize

- After migration applied and tests pass, remove references in application code to `RolePermission.tenantId` and to `Permission.tenantId` (if removed).

E. Promotion

- Merge feature branch and run migration in CI against ephemeral DB to validate.


Validation Steps

1. Schema validation
  - `npx prisma validate`
  - `npx prisma generate`
2. Compile & typecheck
  - `npm run typecheck`
  - `npm run build`
3. Data validation (dev DB)
  - Run the SQL mismatch check again; expect 0 rows.
  - Sample join query verifying role->permissions resolving correctly:

```sql
SELECT r.id, r.code, p.code
FROM "Role" r
JOIN "RolePermission" rp ON rp."roleId" = r.id
JOIN "Permission" p ON p.id = rp."permissionId"
WHERE r."tenantId" = '<sample-tenant-id>'
LIMIT 20;
```

4. Application tests
  - Unit tests for RBAC logic
  - Integration tests verifying that tenant-scoped role queries return expected permissions
  - Session tests: create session, validate tenantId, expiry, refresh flow

5. API smoke tests (dev only)
  - Create role, assign permission, create user with role, authenticate and check effective permissions via session.


Rollback Plan

- Steps to revert if validation fails:
  1. Stop rollout.
  2. Restore dev DB snapshot if schema change caused corruption.
  3. Recreate `tenantId` column on `RolePermission` and restore values from backup if needed:

```sql
ALTER TABLE "RolePermission" ADD COLUMN "tenantId" text;
-- restore from backup or populate via join
UPDATE "RolePermission" rp
SET "tenantId" = r."tenantId"
FROM "Role" r
WHERE rp."roleId" = r.id;
```

  4. Revert Prisma schema changes and redeploy previous version.


Risks

- Data inconsistency if RolePermission rows have mismatched tenantId values.
- Permission scope decision (global) may reduce tenant-specific flexibility; product must confirm.
- Session model introduces new storage and lifecycle that must be secured (refresh token handling).
- Removing `tenantId` slightly increases join complexity and may impact performance; mitigate with indexes.


A2 Readiness Decision

- Current state: Planning complete for these RBAC changes.
- Execution required: run the planned migrations and validation in dev/staging.

State: A2 Blocked

Reason: Although design decisions are approved, A2 remains blocked until the migration and validation steps are executed successfully in staging. After successful validation, A2 can be marked Ready.


Next Steps (if you want me to continue)

- I can generate the exact Prisma schema diff (patch) and the migration SQL (dev-only) for review.
- I can prepare CI steps for running migrations against an ephemeral DB and validation tests.

(Planning-only. No code or schema changes made.)
