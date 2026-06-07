-- Migration: add_crm_unique_constraints
-- Created: 2026-06-07
-- Adds database-level unique constraints for Company name per tenant
-- and Contact email per tenant, hardening V1 uniqueness guarantees.
--
-- SAFETY: Before applying, verify there are no existing duplicate
-- (tenantId, name) rows in Company or (tenantId, email) rows in Contact.
-- Run the following checks first:
--   SELECT tenantId, name, COUNT(*) FROM "Company" WHERE "deletedAt" IS NULL GROUP BY tenantId, name HAVING COUNT(*) > 1;
--   SELECT tenantId, email, COUNT(*) FROM "Contact" WHERE "deletedAt" IS NULL GROUP BY tenantId, email HAVING COUNT(*) > 1;

BEGIN;

-- Company: unique company name per tenant
CREATE UNIQUE INDEX IF NOT EXISTS "Company_tenantId_name_key"
  ON "Company"("tenantId", "name")
  WHERE "deletedAt" IS NULL;

-- Contact: unique contact email per tenant
CREATE UNIQUE INDEX IF NOT EXISTS "Contact_tenantId_email_key"
  ON "Contact"("tenantId", "email")
  WHERE "deletedAt" IS NULL;

COMMIT;

-- NOTE: These are partial unique indexes (WHERE deletedAt IS NULL).
-- Soft-deleted records do not participate in the uniqueness check,
-- allowing a name/email to be re-used after the original record is deleted.
-- Prisma @@unique generates standard unique indexes; this migration uses
-- partial indexes for compatibility with the soft-delete pattern.
