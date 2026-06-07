A2 Step 4 — API Remediation Report

Summary

- Removed direct repository imports from route handlers and wired routes to use the central service registry.
- Fixed `POST /api/v1/users` to validate and forward `passwordHash` and `roleId` to `UserService.create`.
- Added Zod validation for dynamic route params (`id`, `permissionId`) where applicable.
- Adjusted `UserService.create` signature to accept `passwordHash` and optional `roleId` and to forward these to the repository.
- Ran `npm run typecheck` and `npm run build` — both succeeded.

Files changed (high level)

- [lib/foundation/services/user.service.ts](lib/foundation/services/user.service.ts)
- [lib/foundation/services/index.ts](lib/foundation/services/index.ts)
- [app/api/v1/users/route.ts](app/api/v1/users/route.ts)
- [app/api/v1/users/[id]/route.ts](app/api/v1/users/[id]/route.ts)
- [app/api/v1/roles/route.ts](app/api/v1/roles/route.ts)
- [app/api/v1/roles/[id]/route.ts](app/api/v1/roles/[id]/route.ts)
- [app/api/v1/permissions/route.ts](app/api/v1/permissions/route.ts)
- [app/api/v1/roles/[id]/permissions/route.ts](app/api/v1/roles/[id]/permissions/route.ts)
- [app/api/v1/roles/[id]/permissions/[permissionId]/route.ts](app/api/v1/roles/[id]/permissions/[permissionId]/route.ts)
- [app/api/v1/sessions/route.ts](app/api/v1/sessions/route.ts)
- [app/api/v1/sessions/[id]/route.ts](app/api/v1/sessions/[id]/route.ts)

Notes & Rationale

- Architectural compliance: routes no longer import repositories directly; they import pre-configured service instances from the service registry. This preserves the Route → Service → Repository separation.
- Backwards-compatible service changes: `UserService.create` was extended to require `passwordHash` and optional `roleId` — this aligns route validation and prevents accidental omission of password data.
- Validation: Zod schemas added/extended for request bodies and dynamic params to avoid runtime parsing errors and to provide consistent 400 responses via `runApi`.

Risks & Rollback

- Risk: Consumers of `UserService.create` must now provide `passwordHash`. Rolling back: revert `user.service.ts` signature and update routes to compute/provide a default (not recommended).
- Risk: Small behavior change if any downstream callers assumed `roleId` defaulting; verify service-call sites.

Next steps

- Continue migrating remaining routes to use the service registry (if any remain).
- Keep RBAC implementation gated until A2 Service/Repo work completes per scope.
