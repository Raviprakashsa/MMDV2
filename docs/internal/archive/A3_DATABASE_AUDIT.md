A3 Database Audit

Scope: Company, Contact, Lead, LeadStatus

Entity Inventory

- Company
  - Present fields: `id`, `tenantId`, `name`, `website`, `industry`, `phone`, `email`, `createdAt`, `updatedAt`, `deletedAt`
  - Status: PASS
- Contact
  - Present fields: `id`, `tenantId`, `companyId`, `firstName`, `lastName`, `email`, `phone`, `title`, `createdAt`, `updatedAt`, `deletedAt`
  - Status: PASS
- Lead
  - Present fields: `id`, `tenantId`, `companyId`, `contactId`, `ownerId`, `title`, `description`, `status`, `value`, `createdAt`, `updatedAt`, `deletedAt`
  - Status: PASS
- LeadStatus
  - Present values: `NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL`, `WON`, `LOST`
  - Status: PASS

Relationship Audit

- Confirmed: `Company -> Tenant`
  - `Company.tenantId` references `Tenant.id`
  - Status: PASS
- Confirmed: `Contact -> Company`
  - `Contact.companyId` references `Company.id`
  - Status: PASS
- Confirmed: `Lead -> Tenant`
  - `Lead.tenantId` references `Tenant.id`
  - Status: PASS
- Confirmed: `Lead -> Company (optional)`
  - `Lead.companyId` is nullable and references `Company.id`
  - Status: PASS
- Confirmed: `Lead -> Contact (optional)`
  - `Lead.contactId` is nullable and references `Contact.id`
  - Status: PASS
- Confirmed: `Lead -> User (optional)`
  - `Lead.ownerId` is nullable and references `User.id`
  - Status: PASS

Tenant Ownership Audit

- All CRM entities are tenant-owned through `tenantId`.
- `Company.tenantId` -> `Tenant.id`: PASS
- `Contact.tenantId` -> `Tenant.id`: PASS
- `Lead.tenantId` -> `Tenant.id`: PASS
- No CRM entity uses a non-tenant foreign key target for tenant ownership.
- Status: PASS

Soft Delete Audit

- `Company.deletedAt`: present, nullable, aligns with soft delete strategy.
- `Contact.deletedAt`: present, nullable, aligns with soft delete strategy.
- `Lead.deletedAt`: present, nullable, aligns with soft delete strategy.
- List/filter enforcement to exclude soft-deleted rows is a later repository/service concern, but the database fields are present.
- Status: PASS

Index Audit

- Company
  - `@@index([tenantId])`: present
  - `@@index([tenantId, name])`: present
  - `@@index([tenantId, email])`: present
  - `@@index([deletedAt])`: present
  - Status: PASS
- Contact
  - `@@index([tenantId])`: present
  - `@@index([companyId])`: present
  - `@@index([tenantId, email])`: present
  - `@@index([deletedAt])`: present
  - Status: PASS
- Lead
  - `@@index([tenantId])`: present
  - `@@index([tenantId, companyId])`: present
  - `@@index([tenantId, contactId])`: present
  - `@@index([tenantId, ownerId])`: present
  - `@@index([tenantId, status])`: present
  - `@@index([deletedAt])`: present
  - Status: PASS

Required vs Optional Relationships

- Required
  - Company.tenantId: required
  - Contact.tenantId: required
  - Contact.companyId: required
  - Lead.tenantId: required
  - Lead.title: required
  - Lead.description: required in current schema
  - Lead.value: required in current schema
  - Lead.status: required with default `NEW`
- Optional
  - Lead.companyId: optional
  - Lead.contactId: optional
  - Lead.ownerId: optional
- Status: PASS

Missing Fields

- None identified within the A3 CRM scope.
- Status: PASS

Incorrect Nullability

- None identified within the A3 CRM scope.
- Status: PASS

Tenant FK Violations

- None identified within the A3 CRM scope.
- Status: PASS
- Note: the broader schema contains legacy non-CRM tenant relations outside this audit scope, but they do not affect Company, Contact, Lead, or LeadStatus.

MVP Scope Violations

- None identified in the CRM database additions.
- No extra CRM entities were added.
- No activities, pipelines, or lead stages were introduced.
- Status: PASS

Risks

- `Lead.value` uses Prisma `Decimal` semantics and will need careful serialization in later layers.
- Soft delete is modeled in the database, but consistent filtering will still depend on repository/service implementation in later steps.
- If product later requires optionality changes for `Lead.description` or `Lead.value`, a schema revision will be needed.

Keep / Refactor / Remove

- Keep
  - `Company`, `Contact`, `Lead`, and `LeadStatus` as modeled.
  - Tenant-scoped foreign keys and soft-delete fields.
  - Tenant-scoped indexes on CRM entities.
- Refactor
  - Nothing required at the database layer for A3 Step 2 approval.
- Remove
  - Nothing.

Decision

A3 Step 2 Approved

Rationale: The CRM database layer matches the requested scope for Company, Contact, Lead, and LeadStatus. All required fields, relations, tenant ownership, soft-delete fields, and indexes are present, and no CRM scope violations were found.
