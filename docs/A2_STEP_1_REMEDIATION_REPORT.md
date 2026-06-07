# A2 Step 1 — Remediation Report (Session → Tenant relation)

Date: 2026-06-01

Scope

- Small remediation to enforce Session tenant FK: add Prisma relation `Session.tenant -> Tenant(id)` and add `sessions Session[]` back-reference on `Tenant`.
- Database-only change; no repositories/services/APIs/UI modified.

Models Changed

- `Tenant` — added back-reference: `sessions Session[]`.
- `Session` — added Prisma relation: `tenant Tenant @relation(fields: [tenantId], references: [id])`.

Relations Added

- `Session.tenant` relation pointing to `Tenant.id`.
- `Tenant.sessions` back-reference to `Session`.

Migration Generated

- Attempted: `npx prisma migrate dev --name a2_session_tenant_relation --create-only`
  - Result: failed due to DB auth (P1000). Prisma requires DB connection to generate migrations in this environment.

- Manual migration SQL created for dev/staging review:
  - `prisma/migrations/20260601_a2_session_tenant_relation/migration.sql`
  - Contains: ALTER TABLE "Session" ADD CONSTRAINT "fk_session_tenant_id" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") NOT VALID;

Validation Results

Commands executed and results:

- `npx prisma validate` — Result: schema valid ✅
- `npx prisma generate` — Result: Prisma Client generated ✅
- `npm run typecheck` — Result: TypeScript typecheck passed ✅
- `npm run build` — Result: Next.js build succeeded ✅

Notes:
- The migration could not be created/applied by Prisma CLI due to DB authentication; manual SQL was authored. DBA review is required before applying.

Risks

- Applying FK constraint may fail if `Session.tenantId` contains values not present in `Tenant.id`. Run pre-check:

```sql
SELECT s.id FROM "Session" s LEFT JOIN "Tenant" t ON s."tenantId" = t.id WHERE t.id IS NULL LIMIT 20;
```

- If rows exist, they must be corrected before validating constraint.
- Constraint is created as `NOT VALID` to allow staged validation.

Rollback Notes

- To drop the FK if needed:

```sql
ALTER TABLE "Session" DROP CONSTRAINT IF EXISTS "fk_session_tenant_id";
```

- To remove back-reference in Prisma, revert `prisma/schema.prisma` and regenerate client.

Action Items

- Review migration SQL with DBA and run pre-check queries in dev/staging.
- If pre-check passes, apply migration in dev/staging and run validation steps.

Status

- Remediation implemented in schema and validated locally. Migration SQL created for review.

Next steps (per your direction): stop. If you'd like, I can prepare the PR containing schema diff and migration SQL for review by DBA and Architecture.
