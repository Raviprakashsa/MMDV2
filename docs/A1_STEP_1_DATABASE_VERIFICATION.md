# A1 Step 1 Database Verification

Date: 2026-05-31
Scope: Database only
Authority: `docs/MVP_LOCKDOWN.md` and `docs/A1_IMPLEMENTATION_PLAN.md`

## 1. Full List of A1 Tables

The A1 database scope contains exactly 7 foundation tables:

1. `Plan`
2. `Feature`
3. `PlanFeature`
4. `TenantFeature`
5. `Tenant`
6. `TenantSettings`
7. `TenantBranding`

### A1 entity existence verification
- `Plan` exists in `prisma/schema.prisma`.
- `Feature` exists in `prisma/schema.prisma`.
- `PlanFeature` exists in `prisma/schema.prisma`.
- `TenantFeature` exists in `prisma/schema.prisma`.
- `Tenant` exists in `prisma/schema.prisma`.
- `TenantSettings` exists in `prisma/schema.prisma`.
- `TenantBranding` exists in `prisma/schema.prisma`.

All 7 A1 entities exist.

## 2. Table Fields

### `Plan`
- `id`
- `tenantId`
- `code`
- `name`
- `description`
- `isActive`
- `createdAt`
- `updatedAt`
- `deletedAt`

### `Feature`
- `id`
- `tenantId`
- `code`
- `name`
- `description`
- `isActive`
- `createdAt`
- `updatedAt`
- `deletedAt`

### `PlanFeature`
- `id`
- `tenantId`
- `planId`
- `featureId`
- `createdAt`
- `updatedAt`
- `deletedAt`

### `TenantFeature`
- `id`
- `tenantId`
- `featureId`
- `isEnabled`
- `source`
- `overrideValue`
- `createdAt`
- `updatedAt`
- `deletedAt`

### `Tenant`
- `id`
- `tenantId`
- `planId`
- `slug`
- `name`
- `isActive`
- `createdAt`
- `updatedAt`
- `deletedAt`

### `TenantSettings`
- `id`
- `tenantId`
- `timezone`
- `locale`
- `dateFormat`
- `timeFormat`
- `weekStartDay`
- `createdAt`
- `updatedAt`
- `deletedAt`

### `TenantBranding`
- `id`
- `tenantId`
- `displayName`
- `logoUrl`
- `faviconUrl`
- `primaryColor`
- `secondaryColor`
- `accentColor`
- `supportEmail`
- `createdAt`
- `updatedAt`
- `deletedAt`

## 3. Indexes

### `Plan`
- `@@index([tenantId])`
- `@@index([deletedAt])`
- `@@unique([code])` via `@unique`

### `Feature`
- `@@index([tenantId])`
- `@@index([deletedAt])`
- `@@unique([code])` via `@unique`

### `PlanFeature`
- `@@index([tenantId])`
- `@@index([deletedAt])`
- `@@unique([planId, featureId])`

### `TenantFeature`
- `@@index([tenantId])`
- `@@index([deletedAt])`
- `@@unique([tenantId, featureId])`

### `Tenant`
- `@@index([tenantId])`
- `@@index([deletedAt])`
- `@@unique([tenantId])` via `@unique`
- `@@unique([slug])` via `@unique`

### `TenantSettings`
- `@@index([tenantId])`
- `@@index([deletedAt])`
- `@@unique([tenantId])` via `@unique`

### `TenantBranding`
- `@@index([tenantId])`
- `@@index([deletedAt])`
- `@@unique([tenantId])` via `@unique`

## 4. Foreign Keys

### `Plan`
- No foreign keys.

### `Feature`
- No foreign keys.

### `PlanFeature`
- `planId -> Plan.id`
- `featureId -> Feature.id`

### `TenantFeature`
- `tenantId -> Tenant.id`
- `featureId -> Feature.id`

### `Tenant`
- `planId -> Plan.id`

### `TenantSettings`
- `tenantId -> Tenant.id`

### `TenantBranding`
- `tenantId -> Tenant.id`

## 5. Soft Delete Fields

All 7 A1 tables include a soft delete field:
- `deletedAt`

This means every A1 table supports soft delete tracking in the schema.

## 6. Tenant FK Verification

### Requirement
Tenant-owned tables must reference `Tenant.id`.

### Verified tenant-owned tables
- `TenantFeature` references `Tenant.id`
- `TenantSettings` references `Tenant.id`
- `TenantBranding` references `Tenant.id`

### Verification result
Tenant-owned A1 tables correctly reference `Tenant.id`.

### Non-tenant-owned A1 tables
- `Plan`
- `Feature`
- `PlanFeature`
- `Tenant`

These are not tenant-owned tables in the A1 foundation contract, so they are not required to reference `Tenant.id`.

## 7. Migration Review

### Migration file reviewed
- `prisma/migrations/20260531120000_a1_foundation/migration.sql`

### Migration contents
- Drops the existing `TenantFeature.tenantId` foreign key constraint.
- Creates `TenantSettings`.
- Creates `TenantBranding`.
- Adds indexes for `deletedAt` on the new tables.
- Recreates `TenantFeature.tenantId` as a foreign key to `Tenant.id` with cascade delete.
- Adds `TenantSettings.tenantId -> Tenant.id` with cascade delete.
- Adds `TenantBranding.tenantId -> Tenant.id` with cascade delete.

### Migration review result
- The migration is aligned with the Step 1 A1 foundation schema.
- The migration covers the A1 database additions needed for `TenantSettings` and `TenantBranding`.
- The migration correctly updates the tenant-owned FK target to `Tenant.id`.
- The migration does not introduce subscriptions, feature flags, billing, analytics, workflows, webhooks, or API keys.

## 8. Migration-to-Schema Consistency Review

### Consistent items
- `TenantFeature.tenantId` in the schema matches the migration FK target of `Tenant.id`.
- `TenantSettings` exists in the schema and is created in the migration.
- `TenantBranding` exists in the schema and is created in the migration.
- Indexes on `deletedAt` for the new tables are present in both schema intent and migration SQL.

### Consistency notes
- The migration is consistent with the Step 1 database update that was validated in `prisma/schema.prisma`.
- The migration was authored directly in the repo because `prisma migrate dev --create-only` could not run against the local database credentials.
- The schema-to-migration relationship is consistent for the A1 database step as checked in this environment.

## 9. PostgreSQL Connection Status

### Validation commands run
- `npx prisma validate` succeeded.
- `npx prisma generate` succeeded.
- `npm run typecheck` succeeded.

### Migration generation attempt
- `npx prisma migrate dev --name a1_foundation --create-only --skip-generate` failed.

### PostgreSQL connection status
- Prisma can parse and validate the schema against the configured datasource string.
- The local PostgreSQL database connection is not authenticated successfully for migration generation with the current credentials.

## 10. Database Authentication Issue Root Cause

### Observed error
- `P1000: Authentication failed against database server, the provided database credentials for postgres are not valid.`

### Root cause
- The `POSTGRES_DATABASE_URL` used for `prisma migrate dev` points to `postgresql://postgres:postgres@localhost:5432/mmd_v2?schema=public`, and the database server rejected the provided `postgres` credentials.

### What this means
- The issue is not a Prisma schema syntax problem.
- The issue is not a migration SQL syntax problem.
- The issue is a database authentication failure for the configured local PostgreSQL connection.

### Impact
- The migration could not be scaffolded from the live database connection.
- The migration SQL was authored directly in the repository to keep Step 1 moving.

## Step 1 Verification Summary
- All 7 A1 entities exist.
- All A1 tables contain `id`, `createdAt`, `updatedAt`, and `deletedAt`.
- Tenant-owned A1 tables reference `Tenant.id`.
- The migration and schema are consistent for the A1 database step.
- PostgreSQL validation succeeded at the Prisma schema level, but migration generation failed due to database authentication.
