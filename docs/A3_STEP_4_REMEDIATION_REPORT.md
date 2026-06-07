A3 Step 4 — API Remediation Report

Root Cause

- `CompanyService.deactivate()` attempted to update `{ isActive: false }`, but the `Company` model in `prisma/schema.prisma` does not define an `isActive` field.
- This created a schema mismatch in the company delete path and would fail at runtime.

Files Modified

- `lib/foundation/services/company.service.ts`

Fix Applied

- Replaced the invalid `updateById(..., { isActive: false })` call with the existing schema-safe soft delete path:
  - `companyRepository.softDelete(ctx, id)`
- No schema, contact, lead, API, or UI files were modified.

Validation Results

- `npm run typecheck` — passed.
- `npm run build` — passed (with temporary `NEXTAUTH_SECRET` set in the local session).

Risks

- Company delete now follows the shared soft-delete pattern using `deletedAt`, so consumers must continue to treat deleted companies as hidden by default.
- If future business requirements need a non-soft-delete lifecycle flag for companies, that would require a schema change and a separate design decision.

Rollback Notes

- Restore the previous `CompanyService.deactivate()` implementation if needed, then re-run typecheck and build.
- No other files need to be rolled back for this remediation.

Status

A3 Step 5 Approved
