A3 UI Readiness Report

UI Scope

Company UI

- list
- create
- edit
- delete

Contact UI

- list
- create
- edit
- delete

Lead UI

- list
- create
- edit
- change status

API Mapping

Company

- List companies: `GET /api/v1/companies`
- Create company: `POST /api/v1/companies`
- View company: `GET /api/v1/companies/{id}`
- Edit company: `PATCH /api/v1/companies/{id}`
- Delete company: `DELETE /api/v1/companies/{id}`

Contact

- List contacts: `GET /api/v1/contacts`
- Create contact: `POST /api/v1/contacts`
- View contact: `GET /api/v1/contacts/{id}`
- Edit contact: `PATCH /api/v1/contacts/{id}`
- Delete contact: `DELETE /api/v1/contacts/{id}`

Lead

- List leads: `GET /api/v1/leads`
- Create lead: `POST /api/v1/leads`
- View lead: `GET /api/v1/leads/{id}`
- Edit lead: `PATCH /api/v1/leads/{id}`
- Change lead status: `POST /api/v1/leads/{id}/status`

Required Components

Pages

- Company list page
- Company create page
- Company edit page
- Contact list page
- Contact create page
- Contact edit page
- Lead list page
- Lead create page
- Lead edit page

Forms

- Company form
- Contact form
- Lead form
- Lead status change control (modal, side panel, or inline action)

Tables

- Company table with action column
- Contact table with action column
- Lead table with action column and status display

Filters

- Company filters: name, website, industry, phone, email
- Contact filters: companyId, firstName, lastName, email, phone, title
- Lead filters: companyId, contactId, ownerId, status, title

Status Controls

- Lead status selector for allowed transitions
- Lead status badge / pill display in list and detail views

Validation Requirements

Client-side validations should mirror the API Zod rules:

- Company
  - `name`: required
  - `website`: required
  - `industry`: required
  - `phone`: required
  - `email`: required and valid email format
- Contact
  - `companyId`: required
  - `firstName`: required
  - `lastName`: required
  - `email`: required and valid email format
  - `phone`: required
  - `title`: required
- Lead
  - `title`: required
  - `description`: required
  - `value`: required and numeric/string representation accepted by API
  - `status`: optional on create, required for status change, limited to `NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL`, `WON`, `LOST`
  - `companyId`, `contactId`, `ownerId`: optional but must be valid strings when supplied

Tenant Requirements

- UI must not infer tenant from client state.
- UI requests must continue to send the tenant context headers expected by the API pipeline (`x-tenant-id`, `x-user-id`) through the existing request layer.
- The UI should treat tenant context as a request concern, not a presentation concern, and should never attempt direct repository or Prisma access.
- All list/detail/create/edit/delete actions should rely on the API to enforce tenant scoping and soft-delete visibility.

Risks

- Pagination gaps
  - Company, Contact, and Lead list endpoints are unpaginated.
  - Large tenants may need pagination before the UI becomes production-complete.
- Filtering gaps
  - Filters are exact-match only; there is no fuzzy search or partial text search yet.
  - No advanced sort controls are exposed by the API.
- API limitations
  - The CRM API spec does not yet model rich response bodies or error schemas in detail.
  - Company delete uses soft delete semantics, so the UI should not expect an immediate lifecycle flag.
- Service limitations
  - Status transitions for leads are enforced in service logic only; UI should present only allowed transitions but still rely on API enforcement.
  - Multi-step create/update flows depend on service-side validation and are not transactional at the UI layer.

Build Scope

What belongs in A3 Step 5

- Build the CRM UI pages, tables, forms, filters, and status controls for Company, Contact, and Lead.
- Reuse the existing API client and validation patterns.
- Keep UI-only concerns in the presentation layer.
- Call API endpoints only; do not introduce service, repository, or Prisma imports.
- Implement form validation and error display aligned with the API contract.
- Use the existing tenant-aware request path so the API receives tenant context headers.

What does not belong in A3 Step 5

- Any schema changes
- Any repository changes
- Any service-layer changes
- Any API route changes
- Any OpenAPI changes
- Any Prisma access from UI code

Decision

A3 Step 5 Ready

Rationale

- The schema, repositories, services, API routes, and OpenAPI contract for CRM are aligned enough to begin UI implementation.
- The remaining gaps are UI-phase concerns (pagination, richer filtering, and presentation polish), not blockers to starting the UI layer.
