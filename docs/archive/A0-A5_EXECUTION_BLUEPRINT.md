# MMD V2 Execution Blueprint (Approved)

## Phase A0 - Foundation
1. Prisma setup
2. PostgreSQL configuration
3. Base Repository architecture
4. Tenant-aware Repository base class
5. RBAC middleware
6. Audit logging service
7. Storage provider abstraction (Local -> S3)
8. Seed data strategy
9. Feature flag architecture

## Phase A1
1. Plans
2. Features
3. Tenant

## Phase A2
1. Roles
2. Permissions
3. Users
4. Auth

## Phase A3
1. Companies
2. Contacts
3. Leads

## Phase A4
1. Requirements
2. Candidates
3. Applications
4. Interviews

## Phase A5
1. Placements
2. Timesheets
3. Invoices

## Guardrail
Do not begin API standardization until Prisma schema, repositories, and core services are implemented.

## Source of Truth
- `docs/phases/markdown/P-1/00-product-requirements-document.md`
- `docs/phases/markdown/P-2/01-master-feature.md`
- `docs/phases/markdown/P-3/02-module-breakdown.md`
- `docs/phases/markdown/P-4/03-role-permission-matrix.md`
- `docs/phases/markdown/P-7/06-database-design.md`
- `docs/phases/markdown/P-8/07-api-contracts.md`
- `docs/phases/markdown/P-9/08-system-architecture.md`
- `docs/phases/markdown/P-16/15-openapi-postman-strategy.md`
- `docs/phases/markdown/P-17/16-prisma-schema-blueprint.md`
