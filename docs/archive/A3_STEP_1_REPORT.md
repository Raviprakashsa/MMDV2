A3 Step 1 — Database Layer Report

Models Added

- `Company`
  - Fields: `id`, `tenantId`, `name`, `website`, `industry`, `phone`, `email`, `createdAt`, `updatedAt`, `deletedAt`
- `Contact`
  - Fields: `id`, `tenantId`, `companyId`, `firstName`, `lastName`, `email`, `phone`, `title`, `createdAt`, `updatedAt`, `deletedAt`
- `Lead`
  - Fields: `id`, `tenantId`, `companyId`, `contactId`, `ownerId`, `title`, `description`, `status`, `value`, `createdAt`, `updatedAt`, `deletedAt`
- `LeadStatus` enum
  - Values: `NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL`, `WON`, `LOST`

Relations Added

- `Tenant` owns CRM entities through foreign keys.
  - `Company.tenantId -> Tenant.id`
  - `Contact.tenantId -> Tenant.id`
  - `Lead.tenantId -> Tenant.id`
- `Company` relationships
  - `Company.contacts -> Contact[]`
  - `Company.leads -> Lead[]`
- `Contact` relationships
  - `Contact.companyId -> Company.id`
  - `Contact.leads -> Lead[]`
- `Lead` relationships
  - `Lead.companyId -> Company.id` (optional)
  - `Lead.contactId -> Contact.id` (optional)
  - `Lead.ownerId -> User.id` (optional)
- Existing parent relations updated for navigation
  - `Tenant.companies -> Company[]`
  - `Tenant.contacts -> Contact[]`
  - `Tenant.leads -> Lead[]`
  - `User.leadsOwned -> Lead[]`

Indexes Added

- `Company`
  - `@@index([tenantId])`
  - `@@index([tenantId, name])`
  - `@@index([tenantId, email])`
  - `@@index([deletedAt])`
- `Contact`
  - `@@index([tenantId])`
  - `@@index([companyId])`
  - `@@index([tenantId, email])`
  - `@@index([deletedAt])`
- `Lead`
  - `@@index([tenantId])`
  - `@@index([tenantId, companyId])`
  - `@@index([tenantId, contactId])`
  - `@@index([tenantId, ownerId])`
  - `@@index([tenantId, status])`
  - `@@index([deletedAt])`

Validation Results

- `npx prisma validate` — passed.
- `npx prisma generate` — passed.
- `npm run typecheck` — passed.
- `npm run build` — passed.

Risks

- Field strictness: the schema uses required fields for Company, Contact, and Lead where the request did not mark them optional. If product decides those should be optional later, a schema adjustment will be needed.
- Tenant FK strategy: any future CRM entity must continue to reference `Tenant.id` only.
- Soft delete behavior: database schema includes `deletedAt`, but repository/service enforcement will be required in later phases to ensure deleted rows are filtered consistently.
- Decimal handling: `Lead.value` uses Prisma `Decimal` semantics; later service/UI code must serialize and validate it carefully.

Rollback Notes

- Revert the `prisma/schema.prisma` changes that introduce `LeadStatus`, `Company`, `Contact`, `Lead`, and the related tenant/user relations.
- Re-run `npx prisma validate` and `npx prisma generate` after rollback to confirm schema health.
- No repository, service, API, or UI changes were made in this step, so rollback is isolated to the Prisma schema.

Status

A3 Step 1 completed successfully.
