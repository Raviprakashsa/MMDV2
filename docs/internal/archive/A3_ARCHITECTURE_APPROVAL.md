A3 CRM Architecture Approval

A3 Architecture Approved

Scope Reference

- Source of truth: `docs/MVP_LOCKDOWN.md`
- Approved predecessor: `docs/A2_COMPLETION_REPORT.md`
- Planning reference: `docs/A3_READINESS_REPORT.md`

This document defines the A3 CRM architecture only. No code, schema, or implementation changes are made here.

Database

Required entities

- Company
- Contact
- Lead

Required relationships

- Entity ownership
  - Company records are tenant-owned.
  - Contact records are tenant-owned and belong to a company.
  - Lead records are tenant-owned and may optionally be associated with a company and/or contact.
  - Lead ownership may optionally reference a user owner for assignment workflows.

- Foreign keys
  - All tenant-scoped entities must reference `Tenant.id`.
  - Company.tenantId -> Tenant.id
  - Contact.tenantId -> Tenant.id
  - Contact.companyId -> Company.id
  - Lead.tenantId -> Tenant.id
  - Lead.companyId -> Company.id (optional)
  - Lead.contactId -> Contact.id (optional)
  - Lead.ownerId -> User.id (optional)

- Tenant ownership
  - Every CRM record must be tenant-scoped.
  - Cross-tenant reads and writes are disallowed.
  - Tenant scoping is enforced first in repositories and then preserved through services and routes.

- Soft delete strategy
  - Use soft delete for all CRM entities.
  - Soft delete is represented by a `deletedAt` field.
  - List and lookup methods must exclude soft-deleted records unless explicitly requested.
  - Delete endpoints perform soft delete only; hard delete is not part of A3.

Repository Layer

Required repositories

- `lib/foundation/repositories/company.repository.ts`
- `lib/foundation/repositories/contact.repository.ts`
- `lib/foundation/repositories/lead.repository.ts`

Responsibilities

- Own all Prisma access for CRM entities.
- Enforce tenant-scoped query boundaries.
- Provide create, read, update, list, and soft-delete operations.
- Support filtered lookups required by services, such as by email, company, status, or owner.
- Keep persistence logic out of routes and UI.

Service Layer

Required services

- `lib/foundation/services/company.service.ts`
- `lib/foundation/services/contact.service.ts`
- `lib/foundation/services/lead.service.ts`
- `lib/foundation/services/index.ts` to register and export instances for routes

Business rules

- Company creation and updates must remain tenant-scoped.
- Contact email should be deduplicated per tenant where required by product rules.
- Contact-to-company linking must be validated before persistence.
- Lead creation must validate tenant ownership and optional company/contact ownership.
- Lead assignment must validate the target user and tenant boundary.
- Lead status transitions must be validated in service logic.
- Soft delete must be applied consistently through service methods.

API Layer

Required endpoints

- Companies
  - `GET /api/v1/companies`
  - `POST /api/v1/companies`
  - `GET /api/v1/companies/:id`
  - `PATCH /api/v1/companies/:id`
  - `DELETE /api/v1/companies/:id`

- Contacts
  - `GET /api/v1/contacts`
  - `POST /api/v1/contacts`
  - `GET /api/v1/contacts/:id`
  - `PATCH /api/v1/contacts/:id`
  - `DELETE /api/v1/contacts/:id`

- Leads
  - `GET /api/v1/leads`
  - `POST /api/v1/leads`
  - `GET /api/v1/leads/:id`
  - `PATCH /api/v1/leads/:id`
  - `DELETE /api/v1/leads/:id`
  - `POST /api/v1/leads/:id/assign` if assignment is exposed as a dedicated action

Validation rules

- Validate route params with `zod` before service calls.
- Validate request bodies with `zod` at the API boundary.
- Enforce tenant context extraction on every tenant-scoped route.
- Keep route handlers thin: parse, validate, call service, normalize response.
- Do not call Prisma in routes.
- Do not import repositories in routes.

UI Layer

Required pages

- Companies
  - List
  - Create
  - Edit
  - View

- Contacts
  - List
  - Create
  - Edit
  - View

- Leads
  - List
  - Create
  - Edit
  - View
  - Assign owner panel or action

Required components

- Loading state component
- Error state component
- Empty state component
- Company form component
- Contact form component
- Lead form component
- Lead assignment component
- Shared API client for CRM endpoints

Phase Gates

- Step 1 Database
  - Approve CRM entity set and Prisma relations.
  - Confirm tenant FK alignment with `Tenant.id`.
  - Confirm soft delete fields and indexing strategy.

- Step 2 Repository
  - Implement tenant-aware repositories for Company, Contact, Lead.
  - Confirm Prisma is only used in repositories.

- Step 3 Service
  - Implement business rules for deduplication, ownership, assignments, and status transitions.
  - Confirm services are the only place for orchestration logic.

- Step 4 API
  - Implement thin route handlers and zod validation.
  - Confirm routes import services only.

- Step 5 UI
  - Implement API-only pages and forms.
  - Confirm UI contains presentation logic only.

Validation Requirements

- `npx prisma validate`
- `npx prisma generate`
- `npm run typecheck`
- `npm run build`

Architecture Checks

- Route → Service → Repository → Prisma is required for A3.
- No repository imports in routes.
- No Prisma imports outside repositories.
- No service imports in UI.
- No repository imports in UI.

Dependencies

- A1 foundation must remain stable.
- A2 IAM is approved and must remain the access-control prerequisite.
- OpenAPI updates will be required as part of A3 API work.
- UI API client patterns established in A2 should be reused.

Risks

- Tenant FK mistakes would violate `docs/MVP_LOCKDOWN.md` and must be avoided.
- Lead/contact deduplication rules need explicit product confirmation before implementation.
- RBAC enforcement is still deferred and may affect lead ownership/assignment flows.
- UI and API pagination/filtering requirements may expand the scope if not constrained early.

Decision

A3 Architecture Approved

Rationale: The A3 CRM scope is consistent with the locked MVP entity list, A2 is approved, and the required architecture pattern is already established. A3 remains planning-only here; no schema or implementation changes are made in this document.
