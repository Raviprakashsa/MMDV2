# A4 Step 2 — ATS Repository Completion Report

**Date**: 2026-06-01  
**Status**: **COMPLETE**

This report documents the implementation, structural design, and verification of the context-first Repository Layer for the **Applicant Tracking System (ATS)** module in the **MMD V2** platform.

---

## 1. Files Created & Methods Implemented

We created four context-first repositories in `lib/foundation/repositories/`:

### A. [`job-posting.repository.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/repositories/job-posting.repository.ts)
* **Methods**:
  * `create(context, input)`: Inserts a new Job Posting in the active tenant.
  * `findById(context, id)`: Resolves a Job Posting strictly under the active tenant context.
  * `listByTenant(context)`: Lists all Job Postings belonging to the tenant, sorted by `createdAt DESC`.
  * `findByStatus(context, status)`: Resolves Job Postings by status under the active tenant, sorted by `createdAt DESC`.
  * `updateById(context, id, input)`: Transaction-bound atomic update under the active tenant.
  * `softDeleteById(context, id)`: Soft-deletes a Job Posting under the active tenant.

### B. [`candidate.repository.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/repositories/candidate.repository.ts)
* **Methods**:
  * `create(context, input)`: Inserts a new Candidate in the active tenant.
  * `findById(context, id)`: Resolves a Candidate strictly under the active tenant context.
  * `findByEmail(context, email)`: Lookups a Candidate by email scoped to the active tenant.
  * `listByTenant(context)`: Lists all Candidates belonging to the tenant, sorted by `createdAt DESC`.
  * `updateById(context, id, input)`: Transaction-bound atomic update under the active tenant.
  * `softDeleteById(context, id)`: Soft-deletes a Candidate under the active tenant.

### C. [`application.repository.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/repositories/application.repository.ts)
* **Methods**:
  * `create(context, input)`: Inserts a new Application in the active tenant.
  * `findById(context, id)`: Resolves an Application strictly under the active tenant context.
  * `listByTenant(context)`: Lists all Applications belonging to the tenant, sorted by `createdAt DESC`.
  * `findByCandidate(context, candidateId)`: Resolves Applications for a specific candidate scoped to the tenant, sorted by `createdAt DESC`.
  * `findByJobPosting(context, jobPostingId)`: Resolves Applications for a specific job posting scoped to the tenant, sorted by `createdAt DESC`.
  * `updateById(context, id, input)`: Transaction-bound atomic update under the active tenant.
  * `softDeleteById(context, id)`: Soft-deletes an Application under the active tenant.

### D. [`interview.repository.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/repositories/interview.repository.ts)
* **Methods**:
  * `create(context, input)`: Inserts a new Interview in the active tenant.
  * `findById(context, id)`: Resolves an Interview strictly under the active tenant context.
  * `listByTenant(context)`: Lists all Interviews belonging to the tenant, sorted by `createdAt DESC`.
  * `findByApplication(context, applicationId)`: Resolves Interviews scheduled for a specific Application, sorted by `createdAt DESC`.
  * `updateById(context, id, input)`: Transaction-bound atomic update under the active tenant.
  * `softDeleteById(context, id)`: Soft-deletes an Interview under the active tenant.

---

## 2. Architectural Design Strategies

### A. Multi-Tenant Scoping Strategy
Tenant boundaries are secured via mandatory `TenantContext` parameters. The repositories invoke `this.withTenant(context, where)`, which automatically enforces:
1. `tenantId = context.tenantId` for all reads and updates.
2. `deletedAt = null` for all queries.

Creation methods invoke `this.requireTenant(context)` to retrieve the active tenant ID and throw a `ForbiddenError` if context is absent or corrupted, ensuring that no orphaned or mis-associated entities are written.

### B. Soft-Delete Scoping Strategy
Physical deletions (`this.prisma.model.delete`) are completely forbidden. Logical deletion is implemented via:
```typescript
softDeleteById(context: TenantContext, id: string) {
  return this.prisma.model.updateMany({
    where: this.withTenant(context, { id }),
    data: this.markDeleted(),
  })
}
```
Because `this.withTenant` pins `deletedAt: null`, this query is self-gating: it will only mark a record as deleted if it is active and belongs to the correct tenant context. Subsequent finders automatically omit soft-deleted records.

---

## 3. Verification & Validation Results

* **Prisma Schema Check**: **PASS** (Confirmed schema alignment).
* **TypeScript compilation (`npm run typecheck`)**: **PASS** (Completed with 0 errors).
* **Production Bundle Compile (`npm run build`)**: **PASS** (Completed with 0 bundle errors under Turbopack production compilation).
* **Repository Architecture Audit**: **PASS** (Validated via `docs/A4_REPOSITORY_AUDIT.md` verifying no business logic, no RBAC, no service/API imports).

---

## 4. Known Risks & Repository Limitations

### A. Composite Unique Constraints & Soft Deletes
The PostgreSQL database schema defines composite uniqueness rules:
* Candidate: `@@unique([tenantId, email])`
* Application: `@@unique([tenantId, jobPostingId, candidateId])`

* **The Limitation**: If a candidate is soft-deleted (`deletedAt !== null`), PostgreSQL will still enforce the composite unique constraint because `deletedAt` is nullable and not part of the unique index. This means a new candidate cannot be created with that same email under the same tenant if the old record is soft-deleted, until it is hard-deleted or the record is scrubbed.
* **The Mitigation**: This constraint check and record scrub, if needed, will be handled safely at the Service Layer (A4 Step 3) before creating candidates.

### B. Decimal Object Serialization
`salaryMin`, `salaryMax`, and `totalExperience` are stored as `Decimal` objects in Prisma. Downstream components must parse/cast these appropriately during serialization.
