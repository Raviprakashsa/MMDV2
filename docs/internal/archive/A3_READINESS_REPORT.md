A3 Readiness Report — CRM Scope (Planning Only)

Context

- Source references: `docs/MVP_LOCKDOWN.md` (defines A3 as CRM) and `docs/A2_COMPLETION_REPORT.md` (A2 completed and approved).
- A3 implements CRM entities and flows: Companies, Contacts, Leads within tenant boundaries. A3 depends on A1 and A2 being available (tenant and IAM). A2 is APPROVED and A1 is assumed present per MVP_LOCKDOWN.

A3 Scope (high level)

Implement core CRM features required for MVP: Companies, Contacts, Leads.

Database entities required

- Company
  - id (uuid)
  - tenantId (FK -> Tenant.id)
  - name
  - website
  - industry
  - createdAt, updatedAt, deletedAt

- Contact
  - id (uuid)
  - tenantId (FK -> Tenant.id)
  - companyId (FK -> Company.id)
  - firstName
  - lastName
  - email
  - phone
  - jobTitle
  - createdAt, updatedAt, deletedAt

- Lead
  - id (uuid)
  - tenantId (FK -> Tenant.id)
  - contactId (FK -> Contact.id) optional
  - companyId (FK -> Company.id) optional
  - source
  - status
  - ownerId (FK -> User.id) optional
  - createdAt, updatedAt, deletedAt

Repository files required

- `lib/foundation/repositories/company.repository.ts` — tenant-aware CRUD for Company (findById, listByTenant, create, updateById, softDeleteById)
- `lib/foundation/repositories/contact.repository.ts` — tenant-aware CRUD for Contact (by company, by email, create, update, delete)
- `lib/foundation/repositories/lead.repository.ts` — tenant-aware CRUD for Lead (list, create, update, assign owner)
- Ensure repositories extend `tenant-aware.repository` and use Prisma client only in repositories.

Service files required

- `lib/foundation/services/company.service.ts` — business rules for company creation, deduping, ownership, and cross-entity operations
- `lib/foundation/services/contact.service.ts` — contact creation/update, email uniqueness per tenant, linking to companies
- `lib/foundation/services/lead.service.ts` — lead creation, status transitions, assignment to users, validation, dedup logic
- `lib/foundation/services/index.ts` — register new services and export them for route handlers

API routes required

- Companies
  - `GET /api/v1/companies` — list companies (tenant-scoped)
  - `POST /api/v1/companies` — create company
  - `GET /api/v1/companies/:id` — view company
  - `PATCH /api/v1/companies/:id` — update company
  - `DELETE /api/v1/companies/:id` — soft-delete company

- Contacts
  - `GET /api/v1/contacts` — list contacts (tenant-scoped, filterable by company)
  - `POST /api/v1/contacts` — create contact
  - `GET /api/v1/contacts/:id` — view contact
  - `PATCH /api/v1/contacts/:id` — update contact
  - `DELETE /api/v1/contacts/:id` — soft-delete contact

- Leads
  - `GET /api/v1/leads` — list leads (filterable by status/owner/source)
  - `POST /api/v1/leads` — create lead
  - `GET /api/v1/leads/:id` — view lead
  - `PATCH /api/v1/leads/:id` — update lead (status transitions)
  - `DELETE /api/v1/leads/:id` — soft-delete lead
  - `POST /api/v1/leads/:id/assign` — assign owner (optional endpoint)

UI pages required (initial MVP scaffold)

- Companies
  - List `/a3/companies`
  - Create `/a3/companies/create`
  - Edit `/a3/companies/[id]/edit`
  - View `/a3/companies/[id]`

- Contacts
  - List `/a3/contacts`
  - Create `/a3/contacts/create`
  - Edit `/a3/contacts/[id]/edit`
  - View `/a3/contacts/[id]`

- Leads
  - List `/a3/leads`
  - Create `/a3/leads/create`
  - Edit `/a3/leads/[id]/edit`
  - View `/a3/leads/[id]`
  - Assign owner UI in lead detail page or a dedicated assignment panel

Risks

- Data model FK correctness: Must follow `Tenant.id` rule from `MVP_LOCKDOWN.md` for all tenant-scoped entities.
- RBAC dependencies: A3 will require role/permission checks when restricting lead ownership and sensitive operations — coordinate with A2 RBAC implementation.
- UX debt: Listing and filtering may require pagination and indexing; plan DB indexes accordingly.
- Duplicate data: Ensure dedup and uniqueness constraints (email for contacts) are implemented to avoid noisy lead/contact creation.

Dependencies

- A1 (Foundation — tenants, plans, tenant settings) MUST be present and stable.
- A2 (IAM) MUST be present and approved (it is approved now).
- Database migrations: schema additions require safe migration plan and review (manual SQL if DB access constraints persist).
- OpenAPI: update API spec to include new CRM endpoints.
- UI: reuse `lib/ui/api.ts` pattern and client schemas; extend `lib/ui/schemas.ts` with Company/Contact/Lead schemas.

A3 Status

A3 Ready

Rationale: A2 is approved and the repo has a consistent architecture pattern (Route → Service → Repository → Prisma). With A1 assumed present, the CRM scope is well-defined. No blocking technical constraints were discovered in A2 completion that prevent starting A3 design and implementation. The primary precondition is to ensure schema changes follow `MVP_LOCKDOWN.md` rules and migrations are coordinated.

Notes

- This document is planning-only. No code changes were made.
- Next practical step: create design tickets and DB schema drafts (Prisma schema additions) for Company, Contact, Lead and review migration strategy with the Data team.
