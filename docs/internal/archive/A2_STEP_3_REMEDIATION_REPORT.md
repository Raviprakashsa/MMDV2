# A2 Step 3 — Service Remediation Report

Services Modified
- `lib/foundation/services/user.service.ts`
- `lib/foundation/services/role.service.ts`
- `lib/foundation/services/permission.service.ts` (no-op changes)
- `lib/foundation/services/role-permission.service.ts`
- `lib/foundation/services/session.service.ts`

Repository Signature Corrections
- `UserService` now calls:
  - `userRepo.findByEmail(ctx, email)`
  - `userRepo.findById(ctx, id)`
  - `userRepo.create(ctx, input)`
  - `userRepo.updateById(id, input)`
  - assignment implemented via `userRepo.updateById(userId, { roleId })`
- `RoleService` now calls:
  - `roleRepo.findByCode(ctx, code)`
  - `roleRepo.create(ctx, input)`
  - `roleRepo.findById(ctx, id)`
  - `roleRepo.updateById(id, input)`
- `PermissionService` unchanged (uses `permissionRepo.listAll()` and `permissionRepo.findById(id)`).
- `RolePermissionService` now calls:
  - `roleRepo.findById(ctx, id)`
  - `permissionRepo.findById(id)`
  - `rolePermissionRepo.find(roleId, permissionId)`
  - `rolePermissionRepo.assign(roleId, permissionId)`
  - `rolePermissionRepo.unassign(roleId, permissionId)`
- `SessionService` now calls:
  - `userRepo.findById(ctx, id)`
  - `sessionRepo.create(ctx, input)`
  - `sessionRepo.findById(ctx, id)`
  - `sessionRepo.revokeById(ctx, id)`
  - `sessionRepo.cleanupExpired(now)`

Tenant Context Corrections
- All tenant-aware repository calls now receive the `TenantContext` (`ctx`) as the first argument where the repository API requires it.
- Services continue to validate tenant ownership using `ensureTenant(ctx, resource.tenantId)` before performing mutations.

Validation Results
- `npm run typecheck`: completed successfully.
- `npm run build`: Next.js build completed successfully; TypeScript completed during build.

Risks
- Several service methods provide simplified inputs to repository creates (e.g., `userRepo.create(ctx, { passwordHash: '' })`) because the service layer does not currently have all required fields (passwordHash) — these must be supplied by callers (routes or other services) in production.
- Some repositories expose update methods without `TenantContext` (`updateById(id, input)`) — services ensure tenant ownership by reading the entity with `ctx` first and then calling `updateById` to avoid cross-tenant updates, but this pattern requires discipline and review.
- RoleService uniqueness semantics changed to use `findByCode(ctx, code)`; if the desired uniqueness is by `name` instead of `code`, further review is needed.

Rollback Notes
- Remediation changes are limited to service files; rolling back is reverting the modified `lib/foundation/services/*.ts` files.
