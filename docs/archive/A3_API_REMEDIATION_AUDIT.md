A3 API Remediation Audit

Scope

- Verify the company delete path after fixing the `CompanyService.deactivate()` schema mismatch.

Verification

1. Company delete path works
- PASS: `DELETE /api/v1/companies/{id}` routes to `companyService.deactivate(ctx, id)`.
- PASS: `companyService.deactivate(...)` now calls `companyRepository.softDelete(ctx, id)`.
- PASS: The repository soft delete path updates `deletedAt`, which exists in the `Company` schema.

2. Service matches schema
- PASS: `CompanyService.deactivate()` no longer references `isActive`.
- PASS: The service uses only schema-defined fields and existing repository methods.

3. Repository matches schema
- PASS: `companyRepository.softDelete(...)` uses `markDeleted()` to set `deletedAt`.
- PASS: The `Company` model contains `deletedAt` and default tenant-scoped queries exclude soft-deleted rows.

4. Route matches service
- PASS: `app/api/v1/companies/[id]/route.ts` still delegates deletion to `companyService.deactivate(...)`.
- PASS: No route changes were needed for the remediation.

5. No Prisma violations
- PASS: No Prisma imports or direct Prisma access were introduced in the API layer.

6. No repository violations
- PASS: Routes continue to call services only.

Validation Results

- `npm run typecheck` — passed.
- `npm run build` — passed.

Risks

- Company deletion is now soft delete only; downstream consumers must respect `deletedAt`-filtered reads.
- Existing API consumers expecting a lifecycle flag-based deactivate behavior will need to be aware of the soft-delete semantics.

Decision

A3 Step 5 Approved

Rationale

- The company delete path is now schema-safe and aligned with the repository contract, and the API layer still satisfies the route→service→repository-only rule with validation and error handling intact.
