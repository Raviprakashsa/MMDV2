# A2 Repository Audit

Date: 2026-06-01

Scope

Audit the repository implementations for RBAC models:
- `lib/foundation/repositories/user.repository.ts`
- `lib/foundation/repositories/role.repository.ts`
- `lib/foundation/repositories/permission.repository.ts`
- `lib/foundation/repositories/role-permission.repository.ts`
- `lib/foundation/repositories/session.repository.ts`

This is a review-only audit: no code changes were made.

---

## Repository Inventory

1. `user.repository.ts` (extends `TenantAwareRepository`)
   - Public methods:
     - `findById(context: TenantContext, id: string)`
     - `findByEmail(context: TenantContext, email: string)`
     - `listByTenant(context: TenantContext)`
     - `create(input: CreateUserInput)`
     - `updateById(id: string, input: UpdateUserInput)`
     - `softDeleteById(id: string)`

2. `role.repository.ts` (extends `TenantAwareRepository`)
   - Public methods:
     - `findById(context: TenantContext, id: string)`
     - `findByCode(context: TenantContext, code: string)`
     - `listByTenant(context: TenantContext)`
     - `create(input: CreateRoleInput)`
     - `updateById(id: string, input: UpdateRoleInput)`
     - `softDeleteById(id: string)`

3. `permission.repository.ts` (extends `BaseRepository`)
   - Public methods:
     - `findById(id: string)`
     - `findByCode(code: string)`
     - `listAll()`
     - `create(input: CreatePermissionInput)`
     - `updateById(id: string, input: Partial<CreatePermissionInput>)`
     - `softDeleteById(id: string)`

4. `role-permission.repository.ts` (extends `BaseRepository`)
   - Public methods:
     - `findById(id: string)`
     - `listByRole(roleId: string)`
     - `find(roleId: string, permissionId: string)`
     - `assign(roleId: string, permissionId: string)`
     - `unassignById(id: string)`
     - `unassign(roleId: string, permissionId: string)`

5. `session.repository.ts` (extends `TenantAwareRepository`)
   - Public methods:
     - `findById(context: TenantContext, id: string)`
     - `create(input: CreateSessionInput)`
     - `revokeById(context: TenantContext, id: string)`
     - `cleanupExpired(now: Date)`

---

## Method Categorization

For each public method, categorize as CRUD / Query / Pagination / Tenant Scope / Soft Delete

1. `user.repository.ts`
   - `findById` — Query, Tenant Scope (uses `withTenant`)
   - `findByEmail` — Query, Tenant Scope
   - `listByTenant` — Query + Pagination-ready (returns many), Tenant Scope
   - `create` — CRUD (Create). Tenant value provided in input but not enforced via `withTenant`.
   - `updateById` — CRUD (Update). No tenant context required; updates by id only.
   - `softDeleteById` — CRUD (Soft Delete)

2. `role.repository.ts`
   - `findById` — Query, Tenant Scope
   - `findByCode` — Query, Tenant Scope
   - `listByTenant` — Query + Pagination-ready, Tenant Scope
   - `create` — CRUD (Create). TenantId provided in input; not enforced via `withTenant`.
   - `updateById` — CRUD (Update)
   - `softDeleteById` — CRUD (Soft Delete)

3. `permission.repository.ts`
   - `findById` — Query (global)
   - `findByCode` — Query (global)
   - `listAll` — Query + Pagination-ready (global)
   - `create` — CRUD (Create) (global)
   - `updateById` — CRUD (Update) (global)
   - `softDeleteById` — CRUD (Soft Delete) (global)

4. `role-permission.repository.ts`
   - `findById` — Query (global mapping)
   - `listByRole` — Query (by roleId)
   - `find` — Query
   - `assign` — CRUD (Create mapping)
   - `unassignById` — CRUD (Soft Delete pattern via markDeleted)
   - `unassign` — CRUD (Soft Delete many)

5. `session.repository.ts`
   - `findById` — Query, Tenant Scope (uses `withTenant`)
   - `create` — CRUD (Create). Accepts tenantId in input but does not enforce tenant context via `withTenant`.
   - `revokeById` — CRUD (Soft Delete via updateMany), Tenant Scope
   - `cleanupExpired` — CRUD (Soft Delete many by expiry), not tenant-scoped

---

## Verification Checks

1. No business logic in repositories
- Review: Repositories perform only Prisma data access, construct `where` clauses, and call `prisma` methods. No business rules, policy, or RBAC logic present.
- Result: PASS

2. No validation logic in repositories
- Review: No schema validation (Zod) or input validation; repositories accept typed inputs and pass them to Prisma.
- Result: PASS

3. No RBAC logic in repositories
- Review: No permission checks or role evaluation present.
- Result: PASS

4. No API logic in repositories
- Review: No HTTP/response handling in repositories.
- Result: PASS

5. Tenant scope enforcement
- `UserRepository` and `RoleRepository` use `withTenant` for read/list operations. Create methods accept `tenantId` in input but do not call `requireTenant` or `withTenant`.
- `SessionRepository` uses `withTenant` for `findById` and `revokeById`, but `create` does not require a TenantContext.
- `PermissionRepository` is global and does not enforce tenant scope.

Result: PARTIAL — read/list/update/delete methods enforce tenant scope for reads via `withTenant`, but create methods do not uniformly enforce tenant context. `SessionRepository.create` does not enforce tenant scope.

6. Verify PermissionRepository is global
- `PermissionRepository` extends `BaseRepository` and contains no tenant restrictions.
- Result: PASS

7. Verify SessionRepository enforces tenant scope
- `findById` and `revokeById` enforce tenant via `withTenant`, but `create` does not — a gap.
- Result: PARTIAL (gap: create)

8. Verify RolePermissionRepository does not depend on tenantId
- RolePermissionRepository has no tenantId usage and relies on roleId only.
- Result: PASS

---

## Duplicated Code / Patterns

- `withTenant(context, {})` pattern repeated across repositories for read operations. This is intentional (tenant-aware reads).
- Common CRUD patterns (create, updateById, softDeleteById) repeat across repositories — could be further abstracted into BaseRepository helpers for update/soft-delete, but current explicit methods are clear and simple.

---

## Keep / Refactor / Remove

- Keep:
  - `PermissionRepository` as global and simple CRUD.
  - `RolePermissionRepository` as a mapping repository without tenantId.
  - Use of `TenantAwareRepository` for read/list operations.

- Refactor:
  - Enforce tenant context uniformly on create/update methods for `UserRepository`, `RoleRepository`, and `SessionRepository`. Prefer accepting a `TenantContext` on create or calling `requireTenant` internally.
  - Consider adding `BaseRepository.updateByIdSoftDelete` helper to reduce boilerplate.
  - Add TypeScript types for return values and a consistent pagination signature for list methods.

- Remove:
  - No immediate removals required.

---

## Risks

- If service layer fails to enforce tenant checks on create operations, data could be created under incorrect tenants.
- Session creation without tenant enforcement can lead to orphaned or cross-tenant sessions and potential authorization defects.
- Developers may be tempted to put business logic into repositories; enforce code reviews.

---

## Recommendations

1. Fix create paths to enforce tenant scope:
   - Update `create` in `UserRepository`, `RoleRepository`, and `SessionRepository` to accept `TenantContext` and call `requireTenant(context)` or `withTenant` before creating records.
2. Add unit tests for tenant enforcement on repository methods.
3. Consider small BaseRepository helpers for repetitive patterns.
4. Document repository design rules in `lib/foundation/repositories/README.md` to prevent drift.

---

## State

A2 Step 3 Blocked

Reason: `create` methods for tenant-scoped entities (`User`, `Role`, `Session`) do not uniformly enforce tenant context. Specifically, `SessionRepository.create` accepts a `tenantId` but does not verify it against a `TenantContext`, which leaves a gap in tenant-safety that must be remedied before proceeding to the Service layer.

(Review-only; no code changes made.)
