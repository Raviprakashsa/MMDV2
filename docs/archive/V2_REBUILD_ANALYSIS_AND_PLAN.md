# MMD V2 Rebuild: Analysis and Approval Plan

## 1. Analysis

### 1.1 Current Flow (V1.2)
- Delivery: Next.js App Router pages and route handlers in `app/` and `app/api/`.
- Business logic: service-centric modules in `lib/services/`.
- Data layer: direct Mongoose model usage from services in `lib/db/models/`.
- Auth: NextAuth v5 credentials flow.
- Validation: mixed, primarily Zod in selected areas.

### 1.2 Current Files Snapshot
- API route handlers: 25 (`app/api/**/route.ts`).
- Service modules: 25 (`lib/services/*.service.ts`).
- Data models: 31 Mongo/Mongoose model files (`lib/db/models/*.ts`).
- Dashboard route pages/layouts: 31 (`app/(dashboard)/**`).

### 1.3 Current APIs Snapshot
- Auth endpoints (`/api/auth/[...nextauth]`).
- v1 operational endpoints (`/api/v1/api-keys/*`, `/api/v1/webhooks/*`, `/api/v1/requirements/[id]/matches`).
- Domain and utility endpoints (`/api/search`, `/api/notifications`, document and cron routes).

### 1.4 Current Database Usage
- Database technology: MongoDB + Mongoose.
- Entities already present for reuse/mapping:
	- `User`, `Company`, `Lead`, `Requirement`, `Candidate`, `Placement`, `Invoice`, `Timesheet`.
	- Supporting entities: `ApiKey`, `Webhook`, `AutomationPipelineRun`, `AuditLog`, `Notification`, `Template`, etc.

### 1.5 Technical Debt
- Stack mismatch with V2 target: MongoDB/Mongoose vs required PostgreSQL/Prisma.
- Layer leakage risk: service classes directly query models; repository boundary is not consistently enforced.
- Tenant isolation is not a first-class mandatory pattern across all entities/queries.
- Permission checks are role-based but not consistently normalized to `module.action` RBAC contracts.
- API documentation/contracts are not generated from a single OpenAPI source of truth.

### 1.6 Reusability Score (Initial)
- Business rules in services: 8/10 reusable (logic can be migrated into service layer with repository adapters).
- UI components: 6/10 reusable (good component base, but needs tenant/RBAC and route-contract alignment).
- API handlers: 5/10 reusable (validation and orchestration useful; direct coupling to current data shape).
- Data model design: 4/10 reusable (concepts reusable, storage model requires redesign for Prisma/PostgreSQL).

## 2. Problems Found
- Missing mandatory V2 pattern end-to-end in many modules:
	- Route -> Service -> Repository -> Prisma -> PostgreSQL.
- No universal tenantId enforcement strategy in current model/query conventions.
- Soft delete is inconsistent by entity and query path.
- Existing API surface is mixed between internal and `/api/v1` conventions.
- Build/deploy quality gates exist but are not fully standardized around V2 architecture checkpoints.

## 3. Proposed Solution

### 3.1 Target Architecture
- Modular monolith (feature modules).
- Strict layered implementation per request lifecycle:
	- Route -> auth -> tenant guard -> permission guard -> validation -> service -> repository -> Prisma.
- PostgreSQL + Prisma as the only persistence path.

### 3.2 Approved Phase Order
#### Phase A0 (Foundation)
1. Prisma setup
2. PostgreSQL configuration
3. Base Repository architecture
4. Tenant-aware Repository base class
5. RBAC middleware
6. Audit logging service
7. Storage provider abstraction (Local -> S3)
8. Seed data strategy
9. Feature flag architecture

#### Phase A1
1. Plans
2. Features
3. Tenant

#### Phase A2
1. Roles
2. Permissions
3. Users
4. Auth

#### Phase A3
1. Companies
2. Contacts
3. Leads

#### Phase A4
1. Requirements
2. Candidates
3. Applications
4. Interviews

#### Phase A5
1. Placements
2. Timesheets
3. Invoices

### 3.3 Non-Negotiable Data Conventions
- Every business table includes:
	- `id`, `tenantId`, `createdAt`, `updatedAt`, `deletedAt`.
- Soft delete only for business records.
- Tenant-aware query filters required for all business queries.

## 4. Files Impacted (Planned)

### 4.1 Files Created in This Step
- `docs/V2_REBUILD_ANALYSIS_AND_PLAN.md`
- `docs/phases/README.md`
- `docs/graphify/phases-graph.md`

### 4.2 Generated Documentation Assets
- Copied PDFs into `docs/phases/pdf/**`.
- Converted all phase PDFs to Markdown in `docs/phases/markdown/**` (18 files).

### 4.3 Next Planned Code Impact (After Approval)
- Add V2 repository layer per feature module.
- Introduce Prisma schema and migrations.
- Add v2 API contracts and OpenAPI generation.
- Refactor selected service modules to repository-driven tenant-safe flows.

## 5. Database Impact

### 5.1 Current Step
- No runtime DB migration applied yet.
- Documentation and migration planning only.

### 5.2 Planned
- Define Prisma schema for foundational entities first: Plan, Feature, PlanFeature, TenantFeature, Tenant.
- Then expand with User, Role, Permission, Company, Contact, Lead.
- Create migration scripts from Mongo collections to PostgreSQL tables.
- Add tenant and soft-delete query middleware/helpers.

## 6. API Impact

### 6.1 Current Step
- No API behavior changes yet.
- API inventory captured for migration mapping.

### 6.2 Planned
- Standardize v2 endpoints under `/api/v1` with strict guards and validators.
- Generate OpenAPI 3.1 as source of truth.
- Generate/update Postman collection from OpenAPI and maintain environments.

## 7. Implementation Plan (Approval-Gated)

### Phase A0: Foundation
1. Freeze architecture baselines from phase docs and this analysis.
2. Establish Prisma + PostgreSQL baseline and migration scaffolding.
3. Implement base repository and tenant-aware repository base class.
4. Implement RBAC middleware and audit logging service.
5. Implement storage provider abstraction (local and S3 providers).
6. Implement seed strategy and feature flag architecture.

### Phase A1-A5
1. Deliver A1 through A5 in approved module order.
2. Complete each module end-to-end before proceeding.

### Constraint
- API standardization work starts only after Prisma schema, repositories, and core services are implemented.

## 8. Risks
- Data migration complexity from Mongo document shapes to relational schema.
- Hidden coupling between UI and current API payload contracts.
- Role semantics drift while normalizing permissions to `module.action`.
- Tenantization gaps in legacy flows can cause security regressions if not systematically tested.

## 9. Approval Required
- Status: Approved with modifications; implementation started at Phase A0.
- Requested approval scope:
	1. Approved order captured in A0-A5 blueprint.
	2. Immediate technical start is Phase A0 only.
	3. API standardization deferred until post-A0 core completion.
