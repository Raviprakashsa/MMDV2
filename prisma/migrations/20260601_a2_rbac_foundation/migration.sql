-- Migration: a2_rbac_foundation
-- Created: 2026-06-01
-- Development-only migration. Review before applying to any real database.

BEGIN;

-- Safety: drop FK constraint from RolePermission to Tenant if exists
ALTER TABLE "RolePermission" DROP CONSTRAINT IF EXISTS "fk_rolepermission_tenant_id";

-- Drop tenantId column from RolePermission (if present)
ALTER TABLE "RolePermission" DROP COLUMN IF EXISTS "tenantId" CASCADE;

-- Drop tenantId column from Permission (if present)
ALTER TABLE "Permission" DROP COLUMN IF EXISTS "tenantId" CASCADE;

-- Create Session table
CREATE TABLE IF NOT EXISTS "Session" (
  "id" text PRIMARY KEY,
  "userId" text NOT NULL,
  "tenantId" text NOT NULL,
  "refreshTokenHash" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "expiresAt" timestamptz NOT NULL,
  "lastActiveAt" timestamptz
);

CREATE INDEX IF NOT EXISTS "idx_session_userId" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "idx_session_tenantId" ON "Session"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_session_expiresAt" ON "Session"("expiresAt");

-- Add FK from Session.userId -> User.id
ALTER TABLE "Session" ADD CONSTRAINT IF NOT EXISTS "fk_session_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

COMMIT;

-- NOTE: Do not apply to production without DBA review and staging dry-run.
