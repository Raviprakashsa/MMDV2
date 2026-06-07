# RBAC Review

Status: Review only. No implementation changes.

Source references:
- docs/phases/markdown/P-4/03-role-permission-matrix.md
- Current foundation and legacy RBAC utilities

## 1) Roles
Target hierarchy from phase docs:
- SUPER_ADMIN
- TENANT_OWNER
- ADMIN
- MANAGER
- RECRUITER
- SCRAPER
- VIEWER

Current gaps:
- TENANT_OWNER and MANAGER behaviors are not yet fully architecture-specified in code-level contracts.
- Role lifecycle and custom role extension policy are not finalized.

## 2) Permissions
Required format:
- module.action
Examples:
- companies.create
- companies.read
- companies.update
- companies.delete

Current gaps:
- Permission catalog governance not centralized.
- Missing convention for wildcard or inherited permissions.

Recommendation:
- Keep atomic permission codes only.
- Store role-permission mappings tenant-scoped.

## 3) Permission Matrix
Critical matrix categories:
- Platform level: SUPER_ADMIN
- Tenant admin: TENANT_OWNER, ADMIN
- Team level: MANAGER, RECRUITER, SCRAPER
- Read-only: VIEWER

Current gaps:
- No single canonical matrix file currently governing both backend and documentation.

Recommendation:
- Maintain one machine-readable matrix under docs and validate with tests later.

## 4) Backend Enforcement
Required chain:
- Authentication
- Tenant validation
- Permission validation
- Business validation

Current gaps:
- Legacy and foundation RBAC approaches coexist.
- Enforcement not yet uniformly routed through one middleware contract.

Recommendation:
- Standardize one RBAC middleware contract per route family before feature build resumes.

## 5) Tenant Restrictions
Required rule:
- No cross-tenant access under any role except explicit platform-only operations.

Current gaps:
- Need explicit deny-first behavior for missing tenant context.

Recommendation:
- Require tenant context in all non-platform operations.

## 6) Admin Restrictions
Required:
- ADMIN cannot access platform billing and global tenant management.
- TENANT_OWNER cannot access other tenants.

Current gaps:
- Boundaries are documented but need strict backend matrix mapping.

## 7) Cross-Tenant Risks
Key risks:
- Query missing tenantId filter.
- Indirect lookup by global ID without tenant ownership check.
- Report/export endpoints returning mixed-tenant data.

Mitigation design requirements:
- Tenant-aware repository base class mandatory.
- Route-level tenant assertions mandatory.
- Audit records for authorization failures.

## RBAC Review Verdict
- RBAC architecture is directionally strong.
- Approval should be conditional on final permission matrix and explicit platform-versus-tenant boundary policy document.
