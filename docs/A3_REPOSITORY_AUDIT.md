A3 Repository Audit

Scope: Company, Contact, Lead repositories

Repository Inventory

- `lib/foundation/repositories/company.repository.ts`
- `lib/foundation/repositories/contact.repository.ts`
- `lib/foundation/repositories/lead.repository.ts`

Public Methods Audit

- CompanyRepository
  - `create(context, input)`
  - `findById(context, id)`
  - `updateById(context, id, input)`
  - `list(context, filters?)`
  - `softDelete(context, id)`

- ContactRepository
  - `create(context, input)`
  - `findById(context, id)`
  - `updateById(context, id, input)`
  - `list(context, filters?)`
  - `softDelete(context, id)`
  - `findByEmail(context, email)`

- LeadRepository
  - `create(context, input)`
  - `findById(context, id)`
  - `updateById(context, id, input)`
  - `list(context, filters?)`
  - `softDelete(context, id)`
  - `findByStatus(context, status)`
  - `findByOwner(context, ownerId)`

Tenant Enforcement Verification

- PASS: All repositories extend `TenantAwareRepository`.
- PASS: `create(...)` methods call `requireTenant(context)` and never accept arbitrary tenantId values.
- PASS: `findById(...)`, `list(...)`, and lookup methods use `withTenant(context, ...)` to enforce tenant scoping.
- PASS: Soft-delete filtering is applied by default through `withTenant(...)`.

Soft Delete Enforcement Verification

- PASS: `softDelete(...)` methods set `deletedAt` via `markDeleted()`.
- PASS: Default queries exclude deleted rows.
- PASS: No hard delete methods were added for CRM repositories.

No Business Logic Verification

- PASS: Repositories only perform data access and tenant-scoped filtering.
- PASS: No cross-entity orchestration, status-transition logic, or deduplication rules were added.
- PASS: No service decisions or API concerns are present in repository methods.

No Validation Logic Verification

- PASS: No request validation, schema validation, or input normalization logic is implemented in the repositories.
- PASS: Repositories assume inputs have already been validated by higher layers.

No API Logic Verification

- PASS: No route handling, HTTP status handling, or response shaping is present.

Duplicate Code

- Observed duplication: each repository repeats the same tenant-aware create/find/list/soft-delete pattern.
- Observed duplication: default soft-delete filtering and tenant scoping are implemented similarly across all three repositories via `TenantAwareRepository`.
- Recommendation: keep the pattern as-is for clarity unless more CRM repositories are added; if the CRM surface grows, consider small shared query-builder helpers for repeated filter assembly.

Risks

- `updateById(...)` currently returns batch-update results because tenant-safe updates use `updateMany(...)`.
- List filters are exact-match only; more advanced search/pagination would require new repository methods later.
- The repositories are coupled to the current CRM schema and will need synchronized updates if the schema changes.

Keep / Refactor / Remove

- Keep
  - `TenantAwareRepository` pattern
  - Tenant-scoped create/find/list/soft-delete methods
  - Default soft-delete exclusion
- Refactor
  - Consider shared filter builder helpers only if more CRM repositories are added
  - Consider returning record-level updates later if service callers require it
- Remove
  - Nothing

Decision

A3 Step 3 Approved

Rationale: The repository layer satisfies the required tenant-aware data-access contract for Company, Contact, and Lead, with soft delete enforced by default and no business, validation, or API logic present.
