# A2 Readiness Report — IAM (Identity & Access Management)

Date: 2026-05-31

Authority

- `docs/MVP_LOCKDOWN.md`
- `docs/A1_COMPLETION_REPORT.md`

Purpose

Assess readiness to begin A2 (IAM) based on current repository, schema, services, API, and UI state. This is planning and readiness only — no code or schema changes are made.

Summary Judgment

A2 Blocked

Rationale (high-level): the codebase contains partial IAM scaffolding (models for `User`, `Role`, `Permission`, `RolePermission`) and helper middleware for RBAC, but critical schema-level misalignments with the MVP lockdown (tenant FK referencing `Tenant.tenantId` rather than `Tenant.id`), missing session and user-role m:n support, placeholder authentication wiring, and missing service/API implementations mean A2 cannot safely start until the items below are addressed and approved.


1) Current State Analysis

- Prisma schema includes IAM-related models: `User`, `Role`, `Permission`, `RolePermission`, and `AuditLog`.
- `User` currently has a `roleId` (single role) and a relation to `Role`.
- `RolePermission` exists connecting roles to permissions.
- `rbac-middleware.ts` exists with functions `requirePermission`, `requireTenantAccess` and a `RbacContext` type — a good policy primitive.
- `authjs-config.ts` contains a minimal NextAuth/JWT credentials provider stub; `authorize()` is currently a no-op (returns null).
- There is no `Session` Prisma model.
- No `UserRole` join table/model exists for multi-role per user.
- UI pages and APIs currently contain RBAC placeholders but no enforcement path (A1 intentionally deferred RBAC to A2).
- Repositories for foundation exist under `lib/foundation/repositories/*` for A1 models; no IAM-specific repositories were found (no `user.repository.ts` etc.).
- Services for A1 exist; IAM services are not present.

Observations

- Some models (`Role`, `User`, `RolePermission`, `AuditLog`) use `tenantId` referencing `Tenant.tenantId` in their relation definitions. Per `docs/MVP_LOCKDOWN.md`, tenant-scoped relations must reference `Tenant.id`. This creates a schema-level policy violation that must be corrected before implementing A2.
- The presence of `Role` and `Permission` models indicates a planned RBAC design, but several implementation pieces are missing or placeholders.


2) Required A2 Entities

Minimum entities required for A2 (IAM):

- `User` (exists) — verify fields: id, tenantId (FK -> Tenant.id), email, passwordHash, name, status, lastLoginAt, createdAt, updatedAt, deletedAt
- `Role` (exists) — verify fields: id, tenantId (FK -> Tenant.id), code, name, description, isSystem, createdAt, updatedAt, deletedAt
- `Permission` (exists) — verify fields: id, tenantId (FK -> system or specific tenant), code, module, action, description
- `RolePermission` (exists) — mapping role -> permission
- `UserRole` (REQUIRED if multi-role is desired) — mapping user -> role (absent)
- `Session` (REQUIRED) — store session tokens/refresh lifetimes (if server sessions are used) or audit of JWT if stateless
- `Invite` / `PasswordReset` (optional) — for user lifecycle flows

Notes

- The current `User` model uses a single `roleId`. If the authorization model requires multiple roles per user, introduce `UserRole` as a many-to-many join table and remove `roleId` or keep it for primary role semantics.
- `Session` model is required if you intend to support server-side session revocation or refresh tokens. For JWT-only stateless sessions, a revocation/blacklist table (Sessions) is still recommended.


3) Required Relationships

- All tenant-scoped FK fields must reference `Tenant.id` (not `Tenant.tenantId`). Current models reference `Tenant.tenantId` — this must be corrected across `User`, `Role`, `RolePermission`, `AuditLog`, `FeatureFlag`, and any tenant-scoped entity.
- `RolePermission.permissionId -> Permission.id` and `RolePermission.roleId -> Role.id` (already present in model semantics)
- If adding `UserRole`: `UserRole.userId -> User.id`, `UserRole.roleId -> Role.id` with unique constraint on (userId, roleId)
- `Session.userId -> User.id`


4) Authentication Design (recommendation)

Goals: secure user auth, password storage, session lifecycle, account states, and integration with external identity providers later.

Design options:

- Use NextAuth.js (already referenced) with `CredentialsProvider` for local auth and strategy `jwt` for session storage. Implement `authorize()` to verify credentials against `User` records and password hash.
- Passwords: store a salted hashed password with `argon2` or `bcrypt` (recommend Argon2id for modern safety).
- Sessions: use JWT for stateless sessions (fast) plus a `Session` table for revocation (store token jti + expiry). Alternatively use database-backed sessions with refresh tokens.
- Email flows: implement invitation and password reset tokens (DB-backed) — optional for initial rollout.
- MFA: defer to later phases.

Required DB work for Authentication:

- Add `Session` model (id, userId -> User.id, tokenId/jti, issuedAt, expiresAt, ipAddress, userAgent, revokedAt)
- Add indexes on `userId` and `expiresAt` for session housekeeping
- Ensure `User.passwordHash` exists and is required for credentialed auth (already present)

API endpoints (initial):

- `POST /api/v1/auth/login` — accept credentials, return JWT cookie or token
- `POST /api/v1/auth/logout` — revoke session
- `GET /api/v1/auth/me` — returns current user + roles/permissions
- `POST /api/v1/auth/password-reset-request` (optional)
- `POST /api/v1/auth/password-reset` (optional)

Security considerations:

- Rate-limit login attempts
- Lock accounts after repeated failed attempts
- Store password hashes with Argon2 and enforce strong password policy
- Use secure HTTP-only cookies for JWT when using browser-based sessions


5) Authorization Design

Goals: RBAC enforced consistently in services and routes, tenant-aware checks, least privilege.

Design elements:

- Permissions are scoped strings (e.g., `tenants.read`, `tenants.update`, `users.create`)
- Permissions live in `Permission` table (system or tenant-scoped as needed)
- Roles map to sets of permissions via `RolePermission`
- User-role assignment via `UserRole` (or single `roleId`) determines user permissions
- `RbacContext` (tenantId, userId, roleCode, permissions[]) should be constructed on each authenticated request (middleware) and passed to `requirePermission`/`requireTenantAccess`
- Authorization checks should occur at service boundaries, not in repositories; routes call services which enforce authorization using the provided RbacContext

Required APIs for authorization management (admin):

- CRUD endpoints for `roles` and `permissions` (admin/system tenant)
- Endpoints to assign/remove roles to users and role-permission linking


6) RBAC Design (detailed)

- Support multi-tenant RBAC: roles and permissions are tenant-scoped; system-level roles/permissions exist for platform admins
- Permission model: `code` canonical string, `module` and `action` metadata
- Roles: `code` string and `isSystem` boolean
- RolePermission: map role -> permission
- UserRole: map user -> role (supports multiple roles)
- Decision: keep `User.roleId` only if you want an explicit primary role; otherwise prefer `UserRole` exclusively
- Implement a `permission cache` per request (populate RbacContext.permissions once per request) to avoid repeated DB lookups


7) Session Design

- Add `Session` model for server-side session management / revocation
- Fields: `id`, `userId`, `jti` (token id), `issuedAt`, `expiresAt`, `revokedAt`, `ip`, `userAgent`, `createdAt`
- Use short-lived JWTs with refresh tokens; store refresh token sessions in DB for revocation
- Provide `logout` endpoint that sets `revokedAt` and blacklists `jti` until expiry
- Optional: maintain a sliding expiration policy


8) Database Impact

Immediate schema changes required before A2 work:

- Fix tenant FK references: change all tenant-scoped relations to reference `Tenant.id` (not `Tenant.tenantId`). This affects: `Role`, `User`, `RolePermission`, `AuditLog`, `FeatureFlag`, and any other model using `tenantId` to reference `tenantId`.
- Add `Session` model.
- Add `UserRole` model if multi-role support is chosen.
- Review and add indexes and unique constraints for role/permission/code as needed.

Caveats

- Changing foreign key target from `Tenant.tenantId` to `Tenant.id` is a non-trivial DB migration: existing data will need backfill (map tenant.tenantId -> tenant.id) and FK recreation. This requires Data team + DBA coordination and an ordered migration script.


9) API Impact

New endpoints (suggested initial set):

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/roles` (admin)
- `POST /api/v1/roles` (admin)
- `PATCH /api/v1/roles/{id}` (admin)
- `DELETE /api/v1/roles/{id}` (admin)
- `GET /api/v1/permissions` (admin)
- `POST /api/v1/permissions` (admin)
- `POST /api/v1/users/{id}/roles` (assign role)
- `DELETE /api/v1/users/{id}/roles/{roleId}` (remove role)

Design constraints

- All new endpoints must follow the route -> service -> repository pattern
- Authorization checks must be performed in services using `RbacContext` populated by auth middleware


10) UI Impact

- Minimal UI needs for A2 (planned, not implemented now):
  - Login page
  - User management pages (list, create/invite, edit)
  - Role management pages (list, create, assign permissions)
  - Permission management pages (list)

- For A2 readiness planning, confirm that UI routing and shell can accept these pages; current dashboard layout can be reused.


11) Risks

- Schema FK mismatch to `Tenant.id` is a policy violation; applying A2 changes without correcting this risks inconsistent tenant scoping and data corruption.
- DB migration for tenant FK fix is disruptive and will require careful backfill, downtime planning, or phased migration.
- RBAC design choices (single role vs multi-role) have downstream effects on user management APIs and UI.
- Authentication implementation must be hardened (password hashing, rate limiting) to avoid security incidents.
- Lack of session model will make token revocation and logout semantics harder to implement correctly.


12) Dependencies

- Data/DB team to assist with FK migration planning and execution.
- Security review for authentication and password storage choices.
- Product approval for role/permission taxonomy and whether multi-role users are required.
- A2 requires sign-off from Architecture + Data + Security + Product to proceed.


13) A2 Implementation Order (recommended)

1. Approve schema correction plan (Tenant FK fix): define migration strategy and data backfill mapping.
2. Add `Session` model and `UserRole` model (if chosen). Prepare migration scripts (review by Data team).
3. Implement authentication plumbing: NextAuth or custom, credential verification, password hashing, session creation/revocation.
4. Implement basic user repository + service and `auth` routes (`/auth/login`, `/auth/logout`, `/auth/me`).
5. Implement role/permission repositories + services and admin APIs to manage roles and permissions.
6. Implement RBAC middleware to populate `RbacContext` for each request (userId, tenantId, roleCodes, permissions list) cached per request.
7. Replace RBAC placeholders in existing routes with `requirePermission`/`requireTenantAccess` calls where appropriate.
8. Add UI stubs for login and admin pages and guard navigation based on `auth/me` response.
9. Run security review, penetration tests, and audit logging validation.
10. Add automated contract tests for auth and authorization flows.


14) Approval Requirements

Per `docs/MVP_LOCKDOWN.md` and A1 approvals, the following approvers are required before executing A2 schema or production-impacting migrations:

- Architecture (schema and FK changes)
- Data / DBA (migration & backfill plan)
- Security (authentication/authorization design)
- Product (feature approval and role/permission taxonomy)


Conclusion

Current state: partial IAM scaffolding exists, but critical items (tenant FK alignment to `Tenant.id`, session model, robust auth implementation, user-role many-to-many, and services/APIs) are missing.

Decision: A2 Blocked — remedial schema and planning work is required before implementation can begin. Address the listed items (schema FK correction, session model addition, clear RBAC design decision) and obtain the required approvals, then re-run readiness assessment.


Next recommended immediate actions (short checklist)

- Convene Architecture + Data + Security to approve the Tenant FK migration plan.
- Decide single-role vs multi-role policy and confirm `UserRole` requirement.
- Approve `Session` model approach (DB-backed sessions vs stateless JWT with revocation DB).
- Allocate a DB migration window and assign owners for data backfill.


Report generated by: automated readiness assessment tooling (developer agent)
