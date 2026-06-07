A3 Step 2 — Repository Contract Harmonization Remediation Report

Summary

- Purpose: Harmonize repository `updateById` contract for CRM repositories to return the updated entity (record) instead of Prisma `BatchPayload`.
- Scope: `CompanyRepository`, `ContactRepository`, `LeadRepository` (repository-only changes). No services, APIs, or UI modified.

Repository Files Modified

- `lib/foundation/repositories/company.repository.ts` — `updateById` changed to return the updated company record using a transactional pattern (updateMany + findFirst inside a transaction).
- `lib/foundation/repositories/contact.repository.ts` — `updateById` changed to return the updated contact record using a transactional pattern.
- `lib/foundation/repositories/lead.repository.ts` — `updateById` changed to return the updated lead record using a transactional pattern.

Contract Changes

- Previous: `updateById(context, id, input)` returned Prisma `BatchPayload` (affected count).
- New: `updateById(context, id, input)` returns the updated entity (or `null` if not found). Implementation: transaction performs tenant-scoped `updateMany` then `findFirst` and returns the `findFirst` result.

Tenant Enforcement Verification

- Tenant enforcement preserved: All updated methods still call `this.withTenant(context, { id })` to build a tenant-scoped `where` clause used by both the update and the subsequent `findFirst`.
- `requireTenant(context)` still enforces presence of `tenantId` in `withTenant`.

Soft Delete Verification

- Soft-delete behavior unchanged: default queries still include `deletedAt: null` via `withTenant(...)` and soft-delete methods remain unchanged.
- `softDelete(...)` still uses `updateMany` and `markDeleted()` to set `deletedAt`.

Validation Results

- `npm run typecheck` — passed (TypeScript `tsc --noEmit` completed without errors).
- `npm run build` — passed (Next.js build completed: "Compiled successfully").

Risks

- Transactional pattern used (updateMany + findFirst in a transaction) adds slight complexity but preserves tenant-safety and returns the updated record. If your Prisma version or DB does not support multi-statement transactions as expected, test under load.
- Services that previously expected `BatchPayload` from CRM `updateById` must be updated if any exist; currently no services call CRM repos, but future service implementers must assume an entity return.

Rollback Notes

- To rollback: restore the previous `updateById` implementations in the three repository files to use `updateMany` and return the `BatchPayload`.
- After rollback, re-run:

```powershell
npm --prefix "c:\Ravi\MY WORKS\MMD V2" run typecheck
npm --prefix "c:\Ravi\MY WORKS\MMD V2" run build
```

Status

A3 Step 2 Remediation completed for repository contract harmonization.
