A3 Step 4 — API Layer Report

Routes Created

- `app/api/v1/companies/route.ts`
- `app/api/v1/companies/[id]/route.ts`
- `app/api/v1/contacts/route.ts`
- `app/api/v1/contacts/[id]/route.ts`
- `app/api/v1/leads/route.ts`
- `app/api/v1/leads/[id]/route.ts`
- `app/api/v1/leads/[id]/status/route.ts`

Validation Schemas

- Params
  - All item routes validate `{ id: string }` with Zod.
- Query
  - Company list validates optional filters: `name`, `website`, `industry`, `phone`, `email`.
  - Contact list validates optional filters: `companyId`, `firstName`, `lastName`, `email`, `phone`, `title`.
  - Lead list validates optional filters: `companyId`, `contactId`, `ownerId`, `status`, `title`.
- Body
  - Company create/update validates company fields with email format enforcement.
  - Contact create/update validates contact fields with email format enforcement.
  - Lead create/update validates lead fields and `LeadStatus` enum values.
  - Lead status route validates `{ status: LeadStatus }`.

Service Usage

- Company routes call `companyService.list`, `companyService.create`, `companyService.get`, `companyService.update`, and `companyService.deactivate`.
- Contact routes call `contactService.list`, `contactService.create`, `contactService.get`, `contactService.update`, and `contactService.deactivate`.
- Lead routes call `leadService.list`, `leadService.create`, `leadService.get`, `leadService.update`, and `leadService.changeStatus`.
- Routes import services only from `@/lib/foundation/services` and use `runApi` for shared error handling.

OpenAPI Coverage

- Added `docs/openapi/a3-crm.yaml` covering:
  - `GET /companies`, `POST /companies`, `GET /companies/{id}`, `PATCH /companies/{id}`, `DELETE /companies/{id}`
  - `GET /contacts`, `POST /contacts`, `GET /contacts/{id}`, `PATCH /contacts/{id}`, `DELETE /contacts/{id}`
  - `GET /leads`, `POST /leads`, `GET /leads/{id}`, `PATCH /leads/{id}`, `POST /leads/{id}/status`
  - tenant and user headers: `x-tenant-id`, `x-user-id`

Validation Results

- `npm run typecheck` — passed.
- `npm run build` — passed (Next.js compiled successfully with a temporary `NEXTAUTH_SECRET`).

Risks

- The API routes currently rely on service-level thin wrappers for `get` and `list`; if service contracts change, these routes must be kept in sync.
- `DELETE /api/v1/companies/{id}` delegates to `companyService.deactivate`; that service currently uses an `isActive` update path, so the endpoint should be treated carefully if the underlying model changes.
- List filtering is exact-match only and unpaginated; future search/pagination work will need additional API schema and service support.

Rollback Notes

- Remove the seven CRM route files listed above.
- Remove `docs/openapi/a3-crm.yaml`.
- Revert the service registry additions and the thin `get`/`list` wrappers in `company.service.ts`, `contact.service.ts`, and `lead.service.ts` if you want to fully restore the pre-API state.
- Re-run `npm run typecheck` and `npm run build` after rollback.

Status

A3 Step 5 Approved
