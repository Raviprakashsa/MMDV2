# A2 Step 2 — Remediation Report

Date: 2026-06-01

Scope

- Repository remediation only for tenant enforcement on create operations.
- Files modified:
  - `lib/foundation/repositories/user.repository.ts`
  - `lib/foundation/repositories/role.repository.ts`
  - `lib/foundation/repositories/session.repository.ts`

Purpose

Enforce tenant context for create operations to prevent creating tenant-owned entities with arbitrary `tenantId` values. Repositories remain data-access only; no business, validation, RBAC, or API logic introduced.

Files Modified

- `user.repository.ts` — `create(context: TenantContext, input: CreateUserInput)` now requires `TenantContext` and uses `requireTenant(context)` to set `tenantId`.
- `role.repository.ts` — `create(context: TenantContext, input: CreateRoleInput)` now requires `TenantContext` and uses `requireTenant(context)` to set `tenantId`.
- `session.repository.ts` — `create(context: TenantContext, input: CreateSessionInput)` now requires `TenantContext` and uses `requireTenant(context)` to set `tenantId`.

Methods Modified

- `UserRepository.create` — signature changed to accept `TenantContext`; implementation sets `tenantId = requireTenant(context)` and uses it when creating the user.
- `RoleRepository.create` — signature changed to accept `TenantContext`; implementation sets `tenantId = requireTenant(context)` and uses it when creating the role.
- `SessionRepository.create` — signature changed to accept `TenantContext`; implementation sets `tenantId = requireTenant(context)` and uses it when creating the session.

Tenant Enforcement Changes

- Create methods for tenant-scoped repositories now require `TenantContext` and call `requireTenant(context)` to derive the tenantId.
- This prevents callers from specifying arbitrary `tenantId` values in input; tenant assignment is authoritative from the context.
- Read/list/update/delete methods continue to use `withTenant(context, where)` to scope queries.

Validation Results

- `npm run typecheck` — TypeScript typecheck passed ✅
- `npm run build` — Next.js build succeeded ✅

Risks

- Callers must now pass `TenantContext` into create methods; updating service layer call-sites is required when services are implemented.
- If services forget to pass the correct `TenantContext`, tenant enforcement will throw ForbiddenError — ensure tests and service implementations provide context.

Rollback Notes

- Revert changes by restoring previous versions of the modified repository files from VCS.
- No DB changes were applied in this remediation.

Status

- Repository remediation applied and validated locally.

Next steps

- Implement services that call these repositories and pass `TenantContext` for create operations.

(Repository remediation complete.)
