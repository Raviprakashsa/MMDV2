A3 Repository Contract Audit

Scope

- Verify repository contracts and behavior after harmonization for `CompanyRepository`, `ContactRepository`, and `LeadRepository`.

Checks

1. `updateById` returns entity

- `company.repository.ts` — `updateById` now returns the updated company record (transaction: updateMany + findFirst → returns record).
- `contact.repository.ts` — `updateById` now returns the updated contact record.
- `lead.repository.ts` — `updateById` now returns the updated lead record.

2. `findById` returns entity|null

- All three `findById` methods use `findFirst({ where: this.withTenant(context, { id }) })` and therefore return `Model | null` as expected.

3. `list` returns entity[]

- All three `list(...)` methods call `findMany({ where, orderBy: { createdAt: 'desc' } })` and return arrays of entities.

4. `softDelete` behavior unchanged

- `softDelete` still calls `updateMany({ where: this.withTenant(context, { id }), data: this.markDeleted() })` — behavior preserved.

5. Tenant enforcement unchanged

- All repository methods continue to call `this.withTenant(context, ...)` or `this.requireTenant(context)` to ensure tenant scoping; `deletedAt: null` is still enforced in default reads.

Validation Results

- Typecheck: `npm run typecheck` — passed.
- Build: `npm run build` — passed (Next.js compiled successfully).

Risks

- Transactional pattern may add slight overhead; ensure connection/transaction settings are compatible with production DB.
- Services must adopt the entity-returning contract; failure to do so will cause mismatches.

Decision

- A3 Step 3 Ready

Rationale

- Repository contract is harmonized to a developer-friendly entity-returning pattern for `updateById` while preserving tenant enforcement and soft-delete semantics. Typecheck and build pass locally.
