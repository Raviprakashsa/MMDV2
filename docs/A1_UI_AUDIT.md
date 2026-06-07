# A1 UI Audit

Date: 2026-05-31

Scope

Pages audited:

- `app/dashboard/tenants/page.tsx`
- `app/dashboard/tenants/new/page.tsx`
- `app/dashboard/tenants/[id]/page.tsx`
- `app/dashboard/tenants/[id]/edit/page.tsx`

Components audited:

- `components/tenants/TenantTable.tsx`
- `components/tenants/TenantForm.tsx`
- `components/tenants/TenantDetails.tsx`

## UI Inventory

### Pages

- `app/dashboard/tenants/page.tsx`
  - Tenant listing page.
  - Fetches tenant list from `GET /api/v1/tenants`.
  - Renders `TenantTable`.
  - Includes navigation to create, view, and edit routes.

- `app/dashboard/tenants/new/page.tsx`
  - New tenant page.
  - Renders `TenantForm` in create mode.
  - Navigates to the created tenant details page on success.

- `app/dashboard/tenants/[id]/page.tsx`
  - Tenant details page.
  - Fetches tenant from `GET /api/v1/tenants/{id}`.
  - Renders `TenantDetails`.

- `app/dashboard/tenants/[id]/edit/page.tsx`
  - Tenant edit page.
  - Fetches tenant from `GET /api/v1/tenants/{id}` for initial state.
  - Renders `TenantForm` in edit mode.
  - Navigates back to tenant details on success.

### Components

- `components/tenants/TenantTable.tsx`
  - Displays tenant rows and action buttons.
  - Includes empty-state and loading-state fallback rendering.

- `components/tenants/TenantForm.tsx`
  - Handles create/edit form rendering.
  - Contains client-side `zod` validation.
  - Submits to tenant create/update APIs.
  - Displays loading and API error states.

- `components/tenants/TenantDetails.tsx`
  - Displays the selected tenant fields.
  - Includes a loading fallback when tenant data is absent.

## API Usage

Observed API calls used by the UI:

- `GET /api/v1/tenants`
  - Used by `app/dashboard/tenants/page.tsx`.

- `POST /api/v1/tenants`
  - Used by `components/tenants/TenantForm.tsx` in create mode.
  - Reached from `app/dashboard/tenants/new/page.tsx`.

- `GET /api/v1/tenants/{id}`
  - Used by `app/dashboard/tenants/[id]/page.tsx`.
  - Used by `app/dashboard/tenants/[id]/edit/page.tsx`.

- `PATCH /api/v1/tenants/{id}`
  - Used by `components/tenants/TenantForm.tsx` in edit mode.
  - Reached from `app/dashboard/tenants/[id]/edit/page.tsx`.

## Validation Audit

1. Client-side validation
   - PASS
   - `TenantForm` validates create payloads with `CreateTenantSchema` and edit payloads with `UpdateTenantSchema` before submission.

2. API error handling
   - PASS
   - Pages and form components read API responses, surface error messages, and avoid direct repository/service access.

3. Loading states
   - PASS
   - Loading states exist in the list page, details page, edit page, and form submit flow.
   - `TenantTable` and `TenantDetails` also include fallback loading states.

4. Empty states
   - PASS
   - `TenantTable` renders "No tenants found." when the list is empty.
   - `app/dashboard/tenants/[id]/edit/page.tsx` renders "Tenant not found." when no initial tenant is loaded.

## Architecture Audit

1. No repository access
   - PASS
   - No UI file imports anything from `lib/foundation/repositories`.
   - No direct data access beyond `fetch` to HTTP APIs.

2. No service access
   - PASS
   - No UI file imports anything from `lib/foundation/services`.
   - Business logic remains in API and service layers.

3. No Prisma access
   - PASS
   - No UI file imports Prisma or database modules.

4. Route/UI separation
   - PASS
   - UI pages use public APIs only.
   - UI does not bypass the API layer.

5. RBAC behavior
   - PARTIAL
   - UI does not enforce RBAC itself.
   - This is acceptable for the current scope because API authorization remains the enforcement boundary.

## Duplicated Code

1. Repeated fetch/load/error pattern in pages
   - `app/dashboard/tenants/page.tsx`
   - `app/dashboard/tenants/[id]/page.tsx`
   - `app/dashboard/tenants/[id]/edit/page.tsx`
   - These pages all implement similar `useEffect` + `fetch` + `loading/error` state patterns.

2. Repeated API error parsing in form/page handlers
   - Several handlers read `res.json()` and map `data?.error` to a local error string.
   - This is consistent but duplicated across the UI entry points.

3. Fallback loading state duplication
   - Both pages and components render loading placeholders.
   - `TenantTable` and `TenantDetails` have fallback loading branches that are mostly redundant with page-level loading gates.

4. Form field handling is verbose and local
   - `TenantForm` manages all field state inline, which is acceptable for the current scope but could be centralized if the form grows.

## UI Logic That Belongs Elsewhere

1. Shared API fetch helper
   - The repeated `fetch` / JSON parsing / `!res.ok` handling in pages and form submissions would be better placed in a small client API utility or hook.

2. Shared load/error state hook
   - The repeated page patterns for loading/error could be extracted into a simple hook for list/detail pages.

3. Shared tenant form schema
   - `TenantForm` currently defines its own validation schemas inline.
   - If API contract schemas are shared elsewhere, validation could be aligned with a shared schema module to reduce drift.

4. Empty-state decisions at page level
   - `TenantTable` owns the empty-state message, but page-level responsibilities could be clearer if all data-state decisions were centralized in the page component or a data hook.

## Risks

- The UI is intentionally minimal and functional rather than polished.
- Repeated fetch/error/loading patterns increase maintenance cost as the tenant UI grows.
- `TenantForm` uses raw API error strings, so user-facing messages may need refinement later.
- There are no automated UI tests yet for tenant list/create/detail/edit flows.
- RBAC enforcement is still backend-centric; UI does not hide or disable actions based on permissions.

## Keep / Refactor / Remove

### Keep

- Keep the current page/component split for the tenant UI.
- Keep client-side `zod` validation in `TenantForm`.
- Keep use of existing APIs only.
- Keep loading, error, and empty-state coverage.

### Refactor

- Refactor repeated `fetch` + `loading/error` handling into a shared client helper or hook.
- Refactor form/API error mapping into a reusable utility if more tenant forms are added.
- Refactor fallback loading branches in `TenantTable` and `TenantDetails` if page-level loading control is sufficient.
- Consider aligning form schemas with shared API contract types to reduce duplication.

### Remove

- No current code removal is required for A1 completion.
- Do not add repository, service, or Prisma calls to the UI layer.

## Compliance Summary

- All requested pages exist.
- All requested components exist.
- The UI uses only existing APIs.
- No repository, service, or Prisma access exists in the UI layer.
- Loading, error, empty states, and client-side validation are present.
- Some duplication remains, but it is non-blocking for A1.

## Status

A1 Complete

