# A2 Service Layer Audit

Audit Scope
- `lib/foundation/services/user.service.ts`
- `lib/foundation/services/role.service.ts`
- `lib/foundation/services/permission.service.ts`
- `lib/foundation/services/role-permission.service.ts`
- `lib/foundation/services/session.service.ts`

Service Inventory
- UserService
  - public methods: `create(ctx, data)`, `update(ctx, id, updates)`, `activate(ctx, id)`, `deactivate(ctx, id)`, `assignRole(ctx, userId, roleId)`
  - repository dependencies: `userRepo`, `roleRepo`
- RoleService
  - public methods: `create(ctx, data)`, `update(ctx, id, updates)`, `activate(ctx, id)`, `deactivate(ctx, id)`
  - repository dependencies: `roleRepo`
- PermissionService
  - public methods: `list()`, `lookup(id)`
  - repository dependencies: `permissionRepo`
- RolePermissionService
  - public methods: `assign(ctx, roleId, permissionId)`, `remove(ctx, roleId, permissionId)`
  - repository dependencies: `roleRepo`, `permissionRepo`, `rolePermissionRepo`
- SessionService
  - public methods: `create(ctx, data)`, `revoke(ctx, sessionId)`, `cleanupExpired()`
  - repository dependencies: `sessionRepo`, `userRepo`

Dependency Audit
- Repositories discovered under `lib/foundation/repositories` and their exported methods (checked files):
  - `user.repository.ts`
    - `findById(context, id)`, `findByEmail(context, email)`, `listByTenant(context)`, `create(context, input)`, `updateById(id, input)`, `softDeleteById(id)`, exported `userRepository`
  - `role.repository.ts`
    - `findById(context, id)`, `findByCode(context, code)`, `listByTenant(context)`, `create(context, input)`, `updateById(id, input)`, `softDeleteById(id)`, exported `roleRepository`
  - `permission.repository.ts`
    - `findById(id)`, `findByCode(code)`, `listAll()`, `create(input)`, `updateById(id, input)`, `softDeleteById(id)`, exported `permissionRepository`
  - `role-permission.repository.ts`
    - `findById(id)`, `listByRole(roleId)`, `find(roleId, permissionId)`, `assign(roleId, permissionId)`, `unassignById(id)`, `unassign(roleId, permissionId)`, exported `rolePermissionRepository`
  - `session.repository.ts`
    - `findById(context, id)`, `create(context, input)`, `revokeById(context, id)`, `cleanupExpired(now)`, exported `sessionRepository`

Repository Method Verification (service -> repository)
- UserService expects/uses:
  - `userRepo.findByEmail(ctx.tenantId, data.email)` — actual repo: `findByEmail(context, email)` (expects TenantContext as first arg). MISMATCH: service passes tenantId string instead of context.
  - `userRepo.findById(id)` — actual repo: `findById(context, id)`. MISMATCH: missing context param.
  - `userRepo.create({ ...data })` — actual repo: `create(context, input)`. MISMATCH: service is not supplying context and uses different signature.
  - `userRepo.update(id, updates)` — actual repo: `updateById(id, input)`. MISMATCH: method name differs.
  - `userRepo.assignRole(userId, roleId)` — actual repo: no `assignRole` method present. MISSING.

- RoleService expects/uses:
  - `roleRepo.findByName(ctx.tenantId, data.name)` — actual repo: `findByCode(context, code)` and no `findByName`. MISSING/DIFFERENT: repo uses `findByCode` naming and expects context first.
  - `roleRepo.create({ ...data })` — actual repo: `create(context, input)` (requires context). MISMATCH.
  - `roleRepo.findById(id)` — actual repo: `findById(context, id)`. MISMATCH.
  - `roleRepo.update(id, updates)` — actual repo: `updateById(id, input)`. MISMATCH on name/signature.

- PermissionService expects/uses:
  - `permissionRepo.listAll()` — actual repo: `listAll()` — MATCH.
  - `permissionRepo.findById(id)` — actual repo: `findById(id)` — MATCH.

- RolePermissionService expects/uses:
  - `roleRepo.findById(roleId)` — actual repo: `findById(context, id)` — MISMATCH (missing context).
  - `permissionRepo.findById(permissionId)` — actual repo: `findById(id)` — MATCH.
  - `rolePermissionRepo.find(roleId, permissionId)` — actual repo: `find(roleId, permissionId)` — MATCH.
  - `rolePermissionRepo.create({ roleId, permissionId })` — actual repo: `assign(roleId, permissionId)` — MISMATCH: service calls `create`, repo provides `assign`.
  - `rolePermissionRepo.deleteByRoleAndPermission(roleId, permissionId)` — actual repo: `unassign(roleId, permissionId)` or `unassignById(id)` — MISMATCH: method name different.

- SessionService expects/uses:
  - `userRepo.findById(data.userId)` — actual repo: `findById(context, id)` — MISMATCH (missing context).
  - `sessionRepo.create({ ...data })` — actual repo: `create(context, input)` — MISMATCH (missing context).
  - `sessionRepo.findById(sessionId)` — actual repo: `findById(context, id)` — MISMATCH.
  - `sessionRepo.revoke(sessionId)` — actual repo: `revokeById(context, id)` — MISMATCH.
  - `sessionRepo.findExpired()` — actual repo: `cleanupExpired(now)` (different behavior/name). MISSING: `findExpired()` does not exist.

Verify: No Prisma Access
- Checked all service files: none import Prisma or `@prisma/client` or reference `prisma` directly. PASS.

Verify: No API logic / No UI logic
- Service files contain no HTTP request/response handling, no Next.js `NextResponse`, no route logic, and no JSX. PASS.

Business Rule Audit
- User uniqueness: Service enforces unique email per tenant via `userRepo.findByEmail(...)`. Implementation intent present, but method call passes wrong args; actual uniqueness enforcement currently lives in repository via tenant-scoped queries — NEEDS adaptation in service to call repository with `TenantContext`. PARTIAL PASS (intent present, implementation mismatched).
- Role uniqueness: Service calls `roleRepo.findByName(ctx.tenantId, name)` but repository exposes `findByCode(context, code)` and `findByCode` semantics. MISMATCH: uniqueness intent present but method name/semantics differ. BLOCKER until normalized.
- Tenant enforcement: Each service contains `ensureTenant(ctx, resource.tenantId)` checks and compares `role.tenantId` etc. PASS at service level. HOWEVER services often obtain resource via repo methods that require/context and some service calls do not supply context; this weakens enforcement because repo queries may return results across tenants if called without context. Thus enforcement is CONDITIONAL and requires service -> repo signature fixes. PARTIAL.
- Permission existence: Service checks `permissionRepo.findById(permissionId)` — repo provides that. PASS.
- Role existence: Service checks `roleRepo.findById(roleId)` — repo requires context param; service misses it — MISMATCH.
- User existence: Service checks `userRepo.findById(userId)` — repo requires context param; service misses it — MISMATCH.
- RolePermission duplicate prevention: Service calls `rolePermissionRepo.find(roleId, permissionId)` (exists) then calls `rolePermissionRepo.create(...)` if not found — repo uses `assign(roleId, permissionId)` to create. Naming mismatch but semantics available. PARTIAL.
- Session lifecycle: Services provide create/revoke/cleanupExpired. Repositories provide `create(context, input)`, `revokeById(context, id)`, `cleanupExpired(now)`. Services call `sessionRepo.create({...})`, `sessionRepo.revoke(id)`, `sessionRepo.findExpired()` — MISMATCH. Session lifecycle behavior exists in repository but method names/signatures mismatch. PARTIAL/BLOCKER.

Missing repository methods (as used by services)
- `userRepo.assignRole(userId, roleId)` — not found. (Role assignment in codebase may be implemented via a role-permission or user-role join repo — search required.)
- `roleRepo.findByName(contextOrTenantId, name)` — not found; repo has `findByCode`.
- `sessionRepo.revoke(sessionId)` — not found; repo has `revokeById(context, id)`.
- `sessionRepo.findExpired()` — not found; repo has `cleanupExpired(now)`.
- `rolePermissionRepo.create({ roleId, permissionId })` — not found; repo has `assign(roleId, permissionId)`.
- `rolePermissionRepo.deleteByRoleAndPermission(roleId, permissionId)` — not found; repo has `unassign(roleId, permissionId)`.
- Various service calls that pass plain `id` or `tenantId` where repositories expect `TenantContext`.

Assumed repository methods (service-side assumptions)
- `userRepo.findByEmail(tenantId, email)`
- `userRepo.findById(id)`
- `userRepo.create(data)`
- `userRepo.update(id, updates)`
- `userRepo.assignRole(userId, roleId)`
- `roleRepo.findByName(tenantId, name)`
- `roleRepo.findById(id)`
- `roleRepo.create(data)`
- `roleRepo.update(id, updates)`
- `permissionRepo.listAll()` (this one exists)
- `permissionRepo.findById(id)` (exists)
- `rolePermissionRepo.find(roleId, permissionId)` (exists)
- `rolePermissionRepo.create({roleId,permissionId})`
- `rolePermissionRepo.deleteByRoleAndPermission(roleId, permissionId)`
- `sessionRepo.findById(id)`
- `sessionRepo.create(data)`
- `sessionRepo.revoke(id)`
- `sessionRepo.findExpired()`

Duplicate Business Rules
- Tenant enforcement checks appear in multiple services (`ensureTenant`) — acceptable but consider centralizing tenant-validation helper to reduce duplication. RECOMMEND: extract common tenant guard utility.
- Existence checks repeated in user/role/session services — expected; could be standardized (e.g., `repositories.requireExists(context, id, 'User')`).

Logic That Belongs Elsewhere
- `assignRole` on `UserService` calls into `userRepo.assignRole` (missing). Role assignment may require transactional changes and cross-entity validation (e.g., logging, audit). Consider moving complex role assignment orchestration to a dedicated `authorization` or `membership` service that can coordinate repositories and emit audit logs.
- `cleanupExpired` on `SessionService` uses repository-level cleanup but service calls `findExpired()` which repository does not expose; consider ensuring cleanup is a repository responsibility with a clear signature, and keep service as a thin scheduler wrapper.

Risks
- API-contract mismatch: Several service methods assume repository signatures that differ from actual repository implementations; this will cause runtime errors if services are wired as-is. HIGH.
- Missing repository methods: `assignRole`, `findByName`, `create` vs `create(context, input)` mismatches — require adapters or changes. HIGH.
- Tenant enforcement gap: Services frequently call repo methods without providing `TenantContext`, while repositories expect it. This can result in either TypeErrors or security gaps that allow cross-tenant access. CRITICAL.
- Naming inconsistency: Repositories use explicit `ById` and context-first signatures; services assume simpler signatures. This indicates mismatch in coding conventions between layers — medium risk.

Keep / Refactor / Remove
- Keep: Service responsibilities (business logic, validation, repo orchestration) — conceptually correct. Keep the `ensureTenant` checks.
- Refactor (required):
  - Update service calls to pass `TenantContext` when invoking tenant-aware repository methods (e.g., `userRepo.findById(ctx, id)`).
  - Align method names or add repository adapters to match expected names (e.g., provide `userRepo.findById(id)` wrapper if desired).
  - Replace direct `rolePermissionRepo.create(...)` calls with `rolePermissionRepo.assign(...)` (or add adapter) to avoid runtime errors.
  - Normalize role lookup method naming (`findByName` vs `findByCode`) and ensure semantics (code vs name) are correct.
- Remove: No files need removal; no API/UI logic found in services.

Conclusion / State
- Blocker summary: Multiple service -> repository signature/name mismatches and missing methods would cause runtime failures and potential tenant enforcement gaps if services are integrated without remediation.

State: A2 Step 4 Blocked

Actionable next steps to unblock
1. Update service implementations to call repositories with correct signatures: pass `TenantContext` for tenant-aware repos and call the correct method names (e.g., `findById(ctx, id)`, `create(ctx, input)`, `revokeById(ctx, id)`).
2. If preferred, add repository adapters that expose the simpler signatures services assume (adapter delegates to repo and injects `TenantContext`).
3. Implement missing repository helpers or methods (e.g., `userRepo.assignRole`) or centralize role assignment in a dedicated repository/service.
4. Add unit tests mocking repositories to assert that tenant enforcement and uniqueness rules execute correctly.
