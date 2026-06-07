A3 Service Readiness Audit

Scope

- Review of all files under `lib/foundation/services/` for repository call signature mismatches relative to repository implementations.

Summary

- I inspected the service files and corresponding repositories for call-signature mismatches and unexpected assumptions.
- No service currently calls the new CRM repositories (`CompanyRepository`, `ContactRepository`, `LeadRepository`). Therefore there are no immediate runtime signature mismatches between existing services and the newly added CRM repositories.

Findings — repository call-site verification

- For each service file, below are repository calls that could be a mismatch if repository signatures differed; each entry includes the service file, the method, the observed call, and the correct call based on the repository implementation.

-- `lib/foundation/services/user.service.ts`
- Method: `update`
- Observed call: `this.userRepo.updateById(id, updates)`
- Repository signature: `user.repository.ts` defines `updateById(id, input)` (no context).  
- Correct call: `this.userRepo.updateById(id, updates)` (call is correct for `user.repository`).

- Method: `activate` / `deactivate` / `assignRole`
- Observed calls: `this.userRepo.updateById(id, {...})`, `this.userRepo.updateById(userId, { roleId })`
- Repository signature: `updateById(id, input)` — call is correct.

-- `lib/foundation/services/role.service.ts`
- Method: `update` / `activate` / `deactivate`
- Observed calls: `this.roleRepo.updateById(id, updates)`, `this.roleRepo.updateById(id, { active: true })`
- Repository signature: `role.repository.ts` defines `updateById(id, input)` — call is correct.

-- `lib/foundation/services/session.service.ts`
- Method: `revoke`
- Observed call: `this.sessionRepo.revokeById(ctx, sessionId)`
- Repository signature: `session.repository.ts` defines `revokeById(context, id)` — call is correct.

-- `lib/foundation/services/role-permission.service.ts`
- Observed calls: `this.rolePermissionRepo.assign(roleId, permissionId)`, `this.rolePermissionRepo.unassign(roleId, permissionId)`
- Repository signature: `role-permission.repository.ts` uses `assign(roleId, permissionId)` and `unassign(roleId, permissionId)` — calls are correct.

-- Tenant & System services (feature/plan/tenant-*/etc.)
- Observed pattern: many system-level repositories accept inputs that include `tenantId` (system tenant) or non-tenant-scoped signatures. The service calls match repository implementations (e.g., `featureRepository.create({ tenantId: 'system', ... })`).

Notable inconsistencies (cross-cutting)

- Inconsistent `updateById` patterns across repositories:
  - Some repositories are tenant-aware and prefer `updateMany` with tenant-scoped `where` (CRM repos currently implemented this way and return `BatchPayload`).
  - Other repositories use `update` and accept `(id, input)` without `context` (e.g., `user.repository.ts`, `role.repository.ts`, `plan.repository.ts`).
- This inconsistency is a repository-surface design issue but does not currently produce service-level signature mismatches because services call the repositories that match their expected signature.

Risk Summary

- Practical risk: When implementing A3 Step 3 service methods for CRM entities, service authors must use `context`-first repository signatures and must handle `updateById` returning `BatchPayload` (current implementation). If services assume an updated record is returned, runtime bugs will occur.
- Consistency risk: Mixed repository contracts increase cognitive overhead and potential mistakes across the codebase.

Recommendations (readiness gating)

1. Harmonize `updateById` return contract (recommendation: return updated entity). See `docs/A3_SERVICE_LAYER_DECISION.md` for full rationale.
2. Add a short migration/compatibility plan: either change CRM repos to return entity-level results, or document/standardize that `updateById` returns `BatchPayload` for repositories that must enforce tenant scoping at the DB layer.
3. Before implementing A3 Step 3 services, confirm the chosen contract and update repository method typings and doc comments so service implementers follow the correct usage.

Mismatch Table (actual mismatches found)

- No direct service-to-repository signature mismatches were found in the current codebase that would cause immediate runtime errors. All observed service calls match their target repository method signatures.

Final State

- A3 Step 3 Blocked (conditional)

Rationale: While there are no immediate service→repository signature mismatches in existing services, proceeding to implement A3 Step 3 (service layer for CRM entities) should be gated on selecting and applying a consistent `updateById` contract. The current CRM repositories return `BatchPayload`, which is inconsistent with many existing repositories and would force extra work in services. To avoid rework and subtle bugs, choose Option A (return updated entity) and apply the small repository changes (or add helper patterns) before starting service implementations. After the contract is harmonized (or documented and accepted), A3 Step 3 can be marked Ready.

Next actions I can take (pick one)

- I can prepare a patch that updates CRM `updateById` to return the updated record and add a shared `updateAndReturn` helper (recommended).
- Or I can generate a compatibility checklist and automated grep to ensure all new service implementations pass `context` correctly and handle update returns.
