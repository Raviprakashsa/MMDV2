# V1 — DB Constraint Hardening Report

**Date:** 2026-06-07  
**Blocker:** B-6 (DB-level uniqueness hardening)  
**Status:** ✅ REMEDIATED  

---

## 1. Problem Statement

Previously, uniqueness guarantees for Company name per tenant and Contact email per tenant were only enforced at the service layer via query checks. This left the system vulnerable to race conditions where concurrent requests could bypass the check and insert duplicate records.

---

## 2. Solution & Design Decisions

To resolve the vulnerability, we promoted these checks from service-level logic to database-level constraints:
1. **Company Name uniqueness per tenant:** Hardened by adding a unique constraint on `(tenantId, name)`.
2. **Contact Email uniqueness per tenant:** Hardened by adding a unique constraint on `(tenantId, email)`.

### Soft-Delete Compatibility (Partial/Filtered Index)
Standard SQL unique constraints treat soft-deleted rows (`deletedAt IS NOT NULL`) as active, which would prevent a tenant from recreating a company or contact using a name or email that was previously deleted. 

To address this, we defined a **partial unique index** in PostgreSQL using a `WHERE "deletedAt" IS NULL` clause. This allows:
- Uniqueness for all active records.
- Seamless reuse of names/emails once the original record is soft-deleted.

---

## 3. Files Created / Modified

| File | Change |
|---|---|
| `prisma/schema.prisma` | Added `@@unique([tenantId, name])` to `Company` and `@@unique([tenantId, email])` to `Contact` |
| `prisma/migrations/20260607_crm_unique_constraints/migration.sql` | **[NEW]** SQL migration script implementing partial unique indexes |

---

## 4. Prisma Schema Additions

### Company Model
```prisma
model Company {
  id          String    @id @default(cuid())
  tenantId    String
  name        String
  // ... other fields
  
  @@index([tenantId])
  @@index([tenantId, name])
  @@index([tenantId, email])
  @@index([deletedAt])
  @@unique([tenantId, name]) // DB-level unique constraint
}
```

### Contact Model
```prisma
model Contact {
  id          String   @id @default(cuid())
  tenantId    String
  companyId   String
  email       String
  // ... other fields

  @@index([tenantId])
  @@index([companyId])
  @@index([tenantId, email])
  @@index([deletedAt])
  @@unique([tenantId, email]) // DB-level unique constraint
}
```

---

## 5. SQL Migration Script

File: `prisma/migrations/20260607_crm_unique_constraints/migration.sql`

```sql
-- Migration: add_crm_unique_constraints
-- Created: 2026-06-07
-- Adds database-level unique constraints for Company name per tenant
-- and Contact email per tenant, hardening V1 uniqueness guarantees.

BEGIN;

-- Company: unique company name per tenant (active rows only)
CREATE UNIQUE INDEX IF NOT EXISTS "Company_tenantId_name_key"
  ON "Company"("tenantId", "name")
  WHERE "deletedAt" IS NULL;

-- Contact: unique contact email per tenant (active rows only)
CREATE UNIQUE INDEX IF NOT EXISTS "Contact_tenantId_email_key"
  ON "Contact"("tenantId", "email")
  WHERE "deletedAt" IS NULL;

COMMIT;
```

---

## 6. Verification Results

- **Prisma Schema Validation:** `npx prisma generate` compiled successfully without schema warnings.
- **TypeScript & Linting:** Typechecking and ESLint passes clean.
- **Runtime Verification:** Database engine now rejects duplicate inserts at the database layer (throws unique constraint violation `P2002` which is safely caught and mapped to HTTP `409 Conflict`).

---

*Report generated: 2026-06-07*
