# A1 Readiness Report

Date: 2026-05-31
Status: Review only
Scope: Validate A1 readiness against `docs/MVP_LOCKDOWN.md`, `docs/FINAL_PRISMA_ENTITY_MAP.md`, `docs/FINAL_MVP_SCOPE.md`, and `docs/SCHEMA_ALIGNMENT_REPORT.md`.

## Scope

### A1 is ready only as a locked foundation phase
A1 is not approved for implementation yet. Based on the current locked documents, A1 remains a foundation phase that must stay inside the MVP contract and tenant FK rule.

### A1 scope in the locked documents
The approved A1 foundation scope is:
- plans
- features
- plan_features
- tenant_features
- tenants
- tenant_settings
- tenant_branding

### Confirmation against MVP_LOCKDOWN.md
- The locked MVP document allows the foundation entity set above.
- The locked MVP document also forbids billing, analytics, workflows, webhooks, API keys, notifications, templates, feature flags, and subscriptions.
- The locked MVP document is the highest-priority authority.

### Confirmation against the requested A1 tenant-only statement
- A1 is **not** limited to the `Tenant` model alone in the locked docs.
- A1 is tenant-centered, but it includes the full foundation set above.
- If a Tenant-only A1 scope is desired, that would conflict with `docs/MVP_LOCKDOWN.md` and requires explicit approval before any change.

## Dependencies

### Ready foundation dependencies
- Prisma is already present and validated.
- `prisma/schema.prisma` is valid.
- The repository pattern exists in foundation form: Route -> Service -> Repository -> Prisma -> PostgreSQL.
- RBAC foundation exists.
- Audit foundation exists.
- Storage abstraction exists.

### A1 dependency position
- A1 must not start until the MVP lockdown is approved.
- A1 must not introduce any Phase 2+ entities.
- A1 must use `Tenant.id` as the foreign key target for tenant-scoped relations.
- A1 should not depend on subscriptions, since subscriptions are forbidden by `docs/MVP_LOCKDOWN.md`.

### Conflict notes from source documents
- `docs/FINAL_PRISMA_ENTITY_MAP.md` still includes non-locked MVP entities such as `subscriptions`, `invoices`, `placements`, `timesheets`, and ATS entities; those conflict with `docs/MVP_LOCKDOWN.md`.
- `docs/FINAL_MVP_SCOPE.md` also includes `subscriptions` in A1 and later phases that are now disallowed by the lockdown.
- `docs/SCHEMA_ALIGNMENT_REPORT.md` confirms the current schema is missing many MVP entities and still uses `Tenant.tenantId` as a foreign key target in multiple places.

## Risks

- The current schema and older planning docs are not fully aligned with the lockdown document.
- If A1 begins from the older entity map, it will drift beyond the current MVP contract.
- Tenant FK inconsistency remains a design risk until all tenant-scoped relations are standardized on `Tenant.id`.
- Some previously approved planning docs reference entities that are now excluded by the lockdown, which can cause scope creep if not treated as subordinate.
- The current schema does not yet include the full locked MVP foundation entity set.

## Blockers

- `docs/MVP_LOCKDOWN.md` is not yet represented by a matching schema.
- `docs/FINAL_PRISMA_ENTITY_MAP.md` conflicts with `docs/MVP_LOCKDOWN.md` on multiple entities.
- `docs/FINAL_MVP_SCOPE.md` conflicts with `docs/MVP_LOCKDOWN.md` by including `subscriptions` in A1 and later billing-related dependencies.
- A1 cannot begin until the locked MVP contract is approved and the implementation backlog is rewritten to match it.
- A1 cannot proceed with `Tenant.tenantId` as a foreign key target for tenant-scoped relations.

## Approval Required

A1 implementation requires explicit approval for the following points:
- Confirm the locked MVP entity list in `docs/MVP_LOCKDOWN.md` is final.
- Confirm A1 scope is the full foundation set in the lockdown document, not Tenant-only.
- Confirm all tenant-scoped relations must reference `Tenant.id`.
- Confirm older entity-map content that conflicts with the lockdown is subordinate and must not drive implementation.
- Confirm no A1 migration work begins until the approval gate is cleared.

## Final Repository Pattern
- Route -> Service -> Repository -> Prisma -> PostgreSQL.
- Route handlers stay thin and do not call Prisma directly.
- Services own business logic and orchestration.
- Repositories own persistence and tenant-aware access patterns.
- Prisma remains the only database access layer.

## Final API Pattern
- Next.js App Router route handlers only.
- REST-style JSON endpoints only.
- Auth and authorization happen before service execution.
- A1 endpoints must be tenant-aware and RBAC-aware.
- No direct Prisma usage in route handlers.

## Final Tenant FK Strategy
- Use `Tenant.id` as the foreign key target for all tenant-scoped relations.
- Keep `Tenant.tenantId` as a unique business identifier only.
- Do not reference `Tenant.tenantId` in new or revised foreign keys.

## Prisma Migration Strategy for A1
- No migration should be created until the locked A1 scope is approved.
- When approved, create a dedicated A1 migration after the schema is updated to match the lockdown.
- Use Prisma migrate for the first A1 schema increment only after the schema and entity list are aligned.
- Do not mix A1 foundation work with any deferred Phase 2+ entities in the same migration.

## Exact Files Expected to Change for A1
If and only if A1 is approved, the expected files are:
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `lib/prisma.ts`
- `lib/db/postgres.ts`
- `lib/foundation/repositories/base.repository.ts`
- `lib/foundation/repositories/tenant-aware.repository.ts`
- `lib/foundation/repositories/tenant.repository.ts`
- `lib/foundation/auth/rbac-middleware.ts`
- `lib/foundation/auth/authjs-config.ts`
- `lib/foundation/audit/audit-log.service.ts`
- `lib/foundation/storage/storage-provider.ts`
- `lib/foundation/storage/providers/local-storage.provider.ts`
- `docs/MVP_LOCKDOWN.md`
- `docs/SCHEMA_ALIGNMENT_REPORT.md`
- `docs/FINAL_MVP_SCOPE.md`
- `docs/FINAL_PRISMA_ENTITY_MAP.md`

## Readiness Conclusion
- **Schema alignment:** partial, not yet fully aligned to the locked MVP contract.
- **Tenant FK strategy:** not yet fully aligned until all tenant-scoped relations use `Tenant.id`.
- **A1 readiness:** **blocked pending approval**.
- **Approval status:** not ready to start A1.
