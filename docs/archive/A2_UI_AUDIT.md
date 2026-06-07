A2 UI Audit — Coverage: Users, Roles, Permissions, Sessions, Role Permissions

Summary

This audit reviews the A2 UI artifacts under `app/a2` and the UI component library under `components/ui` and `lib/ui`. Scope: Pages (Users, Roles, Permissions, Sessions, Role Permissions) and Components (Loading, ErrorState, UserForm, RoleForm, AssignPermissionForm). The audit checks architecture rules (no service/repo/Prisma imports), API-only integration, presence of loading/empty/error states, client-side validation, form → API contract mapping, and UX/duplication issues.

Page Inventory

- Users
  - `app/a2/users/page.tsx` — List
  - `app/a2/users/create/page.tsx` — Create
  - `app/a2/users/[id]/page.tsx` — View
  - `app/a2/users/[id]/edit/page.tsx` — Edit

- Roles
  - `app/a2/roles/page.tsx` — List
  - `app/a2/roles/create/page.tsx` — Create
  - `app/a2/roles/[id]/page.tsx` — View
  - `app/a2/roles/[id]/edit/page.tsx` — Edit
  - `app/a2/roles/[id]/permissions/page.tsx` — Role Permissions (assign/remove)

- Permissions
  - `app/a2/permissions/page.tsx` — List (read-only)

- Sessions
  - `app/a2/sessions/page.tsx` — List + Revoke (DELETE)

Component Inventory

- `components/ui/Loading.tsx` — Loading indicator
- `components/ui/EmptyState.tsx` — Empty state UI (more complete, uses LucideIcon types)
- `components/ui/ErrorState.tsx` — Error display
- `components/ui/UserForm.tsx` — Create/Edit user form (client validation via `zod`)
- `components/ui/RoleForm.tsx` — Create/Edit role form (client validation via `zod`)
- `components/ui/AssignPermissionForm.tsx` — Assign-permission form (client validation via `zod`)

API Integration Audit

Findings

- No service imports: PASS
  - Reviewed UI pages and components. UI imports only `@/lib/ui/api` (a client fetch wrapper) and UI components. No imports from `lib/foundation/services` or `lib/foundation/repositories` were found in `app/a2` or `components/ui`.

- No repository imports: PASS
  - No route or UI file imports `.../repositories/...`.

- No Prisma imports: PASS
  - No occurrences of `@prisma/client` or `prisma` in UI files scanned.

- API-only integration: PASS (with caveats)
  - UI uses `lib/ui/api.ts` helper functions which call fetch to the app API endpoints under `/api/v1/*`. This enforces API-only integration.
  - Caveat: the UI currently does not include tenant or authentication headers; it assumes browser defaults. When integrating auth/tenant context, ensure `lib/ui/api` injects headers consistently.

Endpoints used (in `lib/ui/api.ts`)

- Users: `GET /api/v1/users`, `GET /api/v1/users/:id`, `POST /api/v1/users`, `PATCH /api/v1/users/:id`
- Roles: `GET /api/v1/roles`, `GET /api/v1/roles/:id`, `POST /api/v1/roles`, `PATCH /api/v1/roles/:id`
- Permissions: `GET /api/v1/permissions`
- Sessions: `GET /api/v1/sessions`, `DELETE /api/v1/sessions/:id`
- Role Permissions: `POST /api/v1/roles/:id/permissions`, `DELETE /api/v1/roles/:id/permissions/:permissionId`

Validation Audit

- Client-side validation: PASS
  - `components/ui/*Form.tsx` use `zod` schemas imported from `lib/ui/schemas.ts` to validate form input prior to calling the API.
  - `UserForm` validates `email` (email), `passwordHash` (non-empty), optional `name` and `roleId`.
  - `RoleForm` validates `name` (min length 1) and `description` optional.
  - `AssignPermissionForm` validates `permissionId` (min length 1).

- Forms → API contract mapping: PASS (no mismatches found in code)
  - `createUser` expects a payload with `email`, `name?`, `passwordHash`, `roleId?` — `UserForm` produces this shape and `lib/ui/api.createUser` POSTs the form object as JSON.
  - `updateUser` sends partial update fields (the UI `updateUser` call forwards the parsed form object to `PATCH /api/v1/users/:id`) — server must accept the same shape.
  - `RoleForm` maps `name`/`description` to `POST/PATCH /api/v1/roles` as expected.
  - `AssignPermissionForm` posts `{ permissionId }` to `POST /api/v1/roles/:id/permissions` which matches the route's body parsing.

- Dynamic param validation on client: PARTIAL
  - The pages normalize route `id` params to string (guards against `string[]`). This is present in pages such as `app/a2/users/[id]/page.tsx`. There is no zod validation for params on the client beyond `Array.isArray` checks; this is acceptable for client navigation but could be strengthened by zod parse for ids (UUIDs) if required.

UX Audit

Loading states
- Most pages use `Loading` component or render `Loading` (e.g., Users, Roles, Permissions, Sessions, Role and User view/edit). PASS, though small inconsistencies exist (role permissions page uses inline `Loading...` string instead of `Loading` component).

Empty states
- Present on multiple pages but inconsistent:
  - `app/a2/users/page.tsx` and `app/a2/roles/page.tsx` render a simple `<div>No ...</div>` for empty lists. The `EmptyState` component exists but is not consistently used. SUGGEST: standardize on `EmptyState` for consistent UI.

Error states
- Pages render inline error `<div style={{ color: 'red' }}>...</div>` in many places. `ErrorState` component exists but is not used consistently. SUGGEST: use `ErrorState` for a unified appearance and to allow richer behavior.

Form UX
- `UserForm` and `RoleForm` perform client validation and show errors, but:
  - No success feedback (toasts or messages) on create/update actions.
  - No confirmation modals for destructive actions (session revoke, remove permission).
  - `UserForm` accepts `passwordHash` directly (raw string field). This is a security/UX gap for production — real flows must use proper password handling or password-creation UX, and not send raw hashes from the client unless intentionally designed.

Interactions
- No confirmation for `revoke` or `remove` actions; these are immediate. SUGGEST: add confirmation dialogs.
- No optimistic UI or disabled state on action buttons beyond button `disabled` while submission is in progress in forms; list action buttons (revoke/remove) are not disabled during request.

Accessibility & labels
- Basic labels present, but inputs lack `id`+`htmlFor` pairing and ARIA attributes. SUGGEST: improve form accessibility.

Duplicate code

- Repeated patterns across pages:
  - `useEffect(() => { load() }, [])` + `load` function with try/catch and setState error handling repeated in every list/view page.
  - Inline error rendering `<div style={{ color: 'red' }}>...</div>` repeated.
  - Loading and empty state handling duplicated (could be abstracted to a `useList` hook returning `{ data, loading, error, reload }` and a consistent `PageShell` layout wrapper.

Missing states

- Confirmation modals for destructive actions.
- Consistent success messages / toasts for create/update/remove/revoke.
- Centralized error handling UI for API errors (server-side validation messages propagated into form fields).

Contract mismatches / inconsistencies

- No direct mismatches detected between the UI payload shapes and the API route expectations as currently implemented in `lib/ui/api.ts` and route handlers. All client forms emit payloads that match the server-side route validation (e.g., `createUser` requires `passwordHash`, routes validate and expect `passwordHash`).
- Caveat: the UI accepts `passwordHash` raw; ensure the server expects this and that client-side handling meets security policies in production.

Risks

- UX/production risk: raw password input lifecycle — unacceptable for production without secure handling (hashing on server, TLS, proper password policies, and not sending pre-hashed passwords from client unless intended).
- Future RBAC risk: UI exposes actions that will later be constrained by RBAC; users may see UI affordances for operations they are not authorized to perform.
- Inconsistent UX risk: mixed use of `EmptyState`, inline empty messages, and `Loading` vs inline strings — leads to an inconsistent user experience.

Keep / Refactor / Remove

- Keep
  - `lib/ui/api.ts` client wrappers — keep as the single integration point for API calls.
  - `lib/ui/schemas.ts` zod schemas — keep for client validation.
  - `components/ui/UserForm.tsx`, `RoleForm.tsx`, `AssignPermissionForm.tsx` — keep, but refactor for accessibility and better error display.
  - `components/ui/Loading.tsx` and `ErrorState.tsx` — keep, standardize usage.

- Refactor
  - Consolidate repeated list/load/error patterns into reusable hooks (`useApiList<T>(fetcher)`) and small layout components.
  - Standardize empty state usage; use `EmptyState` consistently or a simplified, typed variant of it that avoids icon type mismatches.
  - Replace inline error divs with `ErrorState` usage.
  - Add confirmation modals for `revoke` and `remove` actions and consistent success toasts/messages.
  - Improve param validation (zod) for client-side route params where appropriate (UUIDs).
  - Add tenant/auth header injection to `lib/ui/api.ts` so all calls include required tenant context and authentication tokens.

- Remove
  - No files require removal. Consider removing duplicate inline `Loading...` strings in favor of `Loading` component or small `PageLoader` wrapper.

Conclusion & Gate

- Architectural rules: PASS — UI is API-only and contains no service/repository/Prisma imports.
- Functional verification: PASS (client validation and API integration present). Build and typecheck were run previously and passed.
- UX completeness: PARTIAL — multiple UX improvements recommended (confirmations, accessibility, consistent empty/error states, success feedback).

Decision

A2 Approved

Rationale: The UI layer implementation adheres to the architecture constraints (no service/repo/Prisma imports; API-only integration). Client-side validation is present and pages map to the expected API contracts. The TypeScript typecheck and Next.js build succeeded. Outstanding items are UX and polish (confirmations, consistent use of `EmptyState`/`ErrorState`, tenant/auth header injection, secure password handling), which are important but do not block A2 architectural approval.

Recommended immediate follow-ups (post-approval)

- Add tenant/auth header support in `lib/ui/api.ts` before integrating with authentication.
- Standardize Empty/Error/Loading usage and extract repeated data-fetch logic to hooks.
- Add confirmation dialogs for destructive actions; add success toasts.
- Improve form accessibility (`htmlFor` + `id`, ARIA attributes).
- Ensure secure password handling flow before production usage.

Audit performed: scanned all `app/a2` pages and `components/ui` files added during A2 Step 5 scaffolding and compared `lib/ui/api.ts`/`lib/ui/schemas.ts` to route expectations. No code was modified as part of this audit.
