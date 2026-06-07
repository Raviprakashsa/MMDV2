# A2 Implementation Plan (Planning-only)

Date: 2026-06-01

Purpose

Produce a focused implementation-order plan for A2 RBAC features given approved architecture decisions. This is planning-only: do NOT modify schema, code, or create migrations/services/APIs/UI as part of this step.

Approved Decisions (restated)

1. `Permission` = Global Catalog
2. `Role` = Tenant Scoped
3. `RolePermission` = No `tenantId` (tenant implied by Role)
4. `User` = Single Role for A2 (migrate to multi-role later)
5. `Session` model required in A2

Executive summary

- All design decisions are approved. The work is organized into Database → Repository → Service → API → UI phases following the existing Route → Service → Repository → Prisma → PostgreSQL pattern.
- This plan lists exact scopes, implementation order, validation and rollback steps, risks, and approval gates required to mark A2 implementation as complete.

Summary State

- A2 Readiness: A2 Ready (planning complete; execution required in dev/staging and CI). Do not apply changes to production without full migration/backfill plan and DBA sign-off.

1) Database Scope

Goal: apply schema corrections required by approved decisions.

Planned schema deltas (planning-only):
- `RolePermission`: remove `tenantId` column and any FK/index that references it.
- `Permission`: convert to global catalog (preferred: remove `tenantId` entirely; conservative option retain but restrict to `system`).
- `Session`: add new model capturing `id`, `userId`, `tenantId`, `refreshTokenHash`, `createdAt`, `expiresAt`, `lastActiveAt`.

Migration considerations:
- Validate existing `RolePermission.tenantId` values match `Role.tenantId` prior to drop.
- Generate Prisma migration in feature branch (`--create-only`), inspect SQL, apply to dev DB, validate, then promote.
- Use `NOT VALID` constraints (where relevant) and run `VALIDATE CONSTRAINT` after backfills/consistency checks.

Deliverables (DB):
- Prisma schema patch (feature branch)
- One or more Prisma migration files under `prisma/migrations/` (dev-only)
- SQL validation scripts (mismatch checks, sample joins)

2) Repository Scope

Goals: update data-access to reflect schema changes while preserving existing service contracts.

Repositories to change (planning-only):
- `role-permission.repository.ts` (modify queries to drop tenantId usage; ensure queries join `Role` when scoping by tenant)
- `permission.repository.ts` (treat as global; remove tenant-scoped reads or default to system)
- `session.repository.ts` (new) — CRUD for session lifecycle, token hashing storage, expiry cleanup

Repository changes (high-level):
- Update repository signatures to accept `roleId`/`permissionId` and tenantContext where necessary.
- Add helper queries for tenant-scoped permission lookups: join RolePermission -> Role -> Tenant.
- Add indexes at DB level for `roleId`, `permissionId`, `expiresAt` for Session cleanup.

Deliverables (Repo):
- Updated repository files under `lib/foundation/repositories/`
- Unit tests covering repository tenant-scoped queries

3) Service Scope

Goals: adjust business logic to align with RBAC model; keep routes thin.

Services to change/create (planning-only):
- `role.service.ts` — manage role lifecycle and tenant ownership
- `permission.service.ts` — manage global permission catalog
- `role-permission.service.ts` — assign/unassign permissions to roles; ensure referential consistency (role -> tenant)
- `session.service.ts` — session creation, validation, refresh, expiry, and revoke
- `user.service.ts` — ensure user create/update uses single `roleId` and prevents cross-tenant role assignments

Service responsibilities:
- Enforce tenant boundaries in service layer (check role.tenantId == user.tenantId when assigning)
- Provide idempotent APIs for role-permission assignments
- Session service must hash refresh tokens, validate expiry, and expose session invalidation

Deliverables (Service):
- Services under `lib/foundation/services/`
- Unit tests for RBAC logic and session flows

4) API Scope

Goals: expose thin, authorized endpoints for RBAC operations and session management.

APIs to add/modify (planning-only):
- Roles: `GET /api/v1/roles`, `POST /api/v1/roles`, `PATCH /api/v1/roles/[id]`, `DELETE /api/v1/roles/[id]` (tenant-scoped)
- Permissions: `GET /api/v1/permissions` (global catalog), `POST/PUT` restricted to Admin/system
- RolePermissions: `POST /api/v1/roles/[id]/permissions` (assign), `DELETE /api/v1/roles/[id]/permissions/[pid]` (unassign)
- Users: ensure existing user endpoints validate single-role assignment
- Sessions: `POST /api/v1/sessions` (login/create), `POST /api/v1/sessions/refresh`, `DELETE /api/v1/sessions/[id]` (revoke)

API concerns:
- All endpoints must use `runApi` wrapper for central error mapping and RBAC checks.
- Routes must be thin: validate input (Zod) → authorize (rbac middleware) → call service → return response.
- Permission checks: permission evaluation should use role->rolePermissions->permission lookup at service level; cache permitted.

Deliverables (API):
- Route files under `app/api/v1/*`
- OpenAPI updates and Postman collection updates reflecting changed RBAC endpoints

5) UI Scope

Goals: minimal UI to manage roles and role-permission assignments in admin tenant dashboard; session UI handled by auth flows.

UI changes (planning-only):
- Tenant admin: Roles list/detail pages (re-use `components/tenants/TenantTable`, `TenantForm` patterns)
- Role editor: UI to add/remove permissions (fetch global permissions list)
- User management: ensure single-role selector in `UserForm`
- Session UX: logout/refresh flows integrated into client auth handling

Deliverables (UI):
- Pages under `app/dashboard/roles/*` and updates to `app/dashboard/users/*`
- Client-side Zod validation for forms

6) Validation Requirements

Pre-migration (must pass before dropping columns):
- SQL mismatch queries return zero rows (RolePermission.tenantId matches Role.tenantId)
- Backups/snapshots of dev DB

Post-migration validation:
- `npx prisma validate`; `npx prisma generate`
- `npm run typecheck`; `npm run build`
- Repository unit tests pass
- Integration tests: role-permission workflows, user assignment, session lifecycle
- API smoke tests: endpoints create/read/update/delete roles and assign permissions successfully
- UI smoke tests: role editor, user role selector, login/session flows

Validation artifacts:
- Test logs, migration SQL, and sample SQL queries used for verification

7) Risks

- Inconsistent tenant ownership in existing RolePermission rows causing drop failures — mitigate with pre-checks and backup
- Permission globalization may limit tenant customizations; product acceptance required
- Session storage introduces security considerations for refresh tokens — must be hashed and rotated
- Rollout complexity: code must be deployed in order to avoid errors (schema change then code change or vice-versa) — use blue/green and feature-flagged deploys

8) Approval Gates

Before applying migrations to staging or production, require sign-off from:
- Architecture: schema and design review
- DB/Platform/DBA: migration SQL review and execution plan
- Security: session storage and refresh token design review
- Product: confirm permission catalog decisions and UI implications

Implementation Order (recommended)

Phase 0 — Prep (small PRs and checks)
- Create feature branch and PR template for A2 RBAC work
- Add migration SQL templates and validation scripts (create-only)
- Add unit/integration test scaffolding

Phase 1 — Database (dev-only)
- Run pre-checks for `RolePermission` tenant consistency
- Apply Prisma schema change in feature branch (remove tenantId from RolePermission; adjust Permission; add Session)
- Generate migration files (create-only) and inspect SQL
- Apply migration to dev DB and run validation

Phase 2 — Repository + Services (dev)
- Update repositories to stop relying on RolePermission.tenantId; add join queries to Role for tenant scoping
- Implement `session.repository` and `session.service`
- Update `permission.repository` to read global catalog
- Add unit tests

Phase 3 — API (dev)
- Add/modify routes using `runApi` and `rbac-middleware`
- Wire services to routes, add Zod validation
- Run API smoke tests

Phase 4 — UI (dev)
- Add role management pages and role-permission editor
- Update user management for single-role selector
- UI validation and smoke tests

Phase 5 — Staging Validation
- Run full integration and E2E tests against a staging environment with migration applied
- Security review and load/perf checks

Phase 6 — Release Plan
- Merge feature branch after approvals
- Execute migration in production only after full backfill plan and maintenance window (not part of this doc)

Deliverables

- `prisma/schema.prisma` diff (feature branch)
- `prisma/migrations/*` (dev-only)
- Updated repositories/services (feature branch)
- New/updated API routes
- UI pages/components
- Validation test suites and migration check scripts

Notes

- This plan follows the project's Route → Service → Repository → Prisma → PostgreSQL pattern.
- All changes must be validated in dev/staging before production rollout.

State: A2 Ready (planning complete). Execution required to mark A2 implemented.

Next steps (optional)

- I can generate the exact Prisma schema patch and a set of migration SQL templates for review, plus a PR checklist. Proceed?"