-- Migration: a2_tenant_fk_corrections
-- Created: 2026-06-01
-- Development-only migration. Review before applying to any real database.

BEGIN;

-- Add foreign key constraint for Role.tenantId -> Tenant.id
ALTER TABLE "Role"
  ADD CONSTRAINT "fk_role_tenant_id"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") NOT VALID;

-- Add foreign key constraint for RolePermission.tenantId -> Tenant.id
ALTER TABLE "RolePermission"
  ADD CONSTRAINT "fk_rolepermission_tenant_id"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") NOT VALID;

-- Add foreign key constraint for User.tenantId -> Tenant.id
ALTER TABLE "User"
  ADD CONSTRAINT "fk_user_tenant_id"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") NOT VALID;

-- Add foreign key constraint for AuditLog.tenantId -> Tenant.id
ALTER TABLE "AuditLog"
  ADD CONSTRAINT "fk_auditlog_tenant_id"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") NOT VALID;

COMMIT;

-- NOTE: These constraints are created as NOT VALID to allow backfill/validation steps.
-- Review and validate with: ALTER TABLE <table> VALIDATE CONSTRAINT <constraint_name>;
-- Do not apply to production without DBA review and a full backfill plan.
