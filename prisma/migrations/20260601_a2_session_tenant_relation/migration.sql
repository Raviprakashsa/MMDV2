-- Migration: a2_session_tenant_relation
-- Created: 2026-06-01
-- Development-only migration. Review before applying to any real database.

BEGIN;

-- Add foreign key constraint for Session.tenantId -> Tenant.id
ALTER TABLE "Session"
  ADD CONSTRAINT "fk_session_tenant_id"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") NOT VALID;

COMMIT;

-- NOTE: Constraint created as NOT VALID to allow for staged validation.
-- After backfill/verification run:
-- ALTER TABLE "Session" VALIDATE CONSTRAINT "fk_session_tenant_id";

-- Do not apply to production without DBA review and staging dry-run.
