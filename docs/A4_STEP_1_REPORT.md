# A4 Step 1 — ATS Database Design Report

Date: 2026-06-01
Status: COMPLETE

This report documents the implementation and verification of the database layer for the new **Applicant Tracking System (ATS)** module in the **MMD V2** PostgreSQL database.

---

## 1. Schema Additions

### A. Enums Created
1. **`JobPostingStatus`**: Controls open position lifecycles (`DRAFT`, `OPEN`, `CLOSED`, `ON_HOLD`).
2. **`ApplicationStatus`**: Controls candidate placement funnel states (`APPLIED`, `SCREENING`, `SHORTLISTED`, `INTERVIEW`, `OFFERED`, `HIRED`, `REJECTED`, `WITHDRAWN`).
3. **`InterviewStatus`**: Controls individual round scheduling states (`SCHEDULED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`).

### B. Models Created
1. **`JobPosting`**: Represents open job positions, including compensation details, location, and status.
2. **`Candidate`**: Represents active applicants, capturing experience levels, currentLocation, resume links, and online portfolios.
3. **`Application`**: Links a Candidate to a specific Job Posting, tracking application date and recruiting status.
4. **`Interview`**: Represents schedule rounds for specific applications, linking to the conducting interviewer.

---

## 2. Multi-Tenant Scoping & Referential Integrity

### A. Strict Tenant Constraints
* **Foreign Key**: Every new model contains `tenantId` mapping to the master `Tenant.id` using active PostgreSQL relational bounds (`onDelete: Cascade` applied to `Application` and `Interview` to ensure database cleanliness).
* **Uniqueness Scopes**:
  * **Candidate**: `@@unique([tenantId, email])` — Enforces that candidate emails are unique strictly within a specific tenant context, allowing global overlap across workspace accounts.
  * **Application**: `@@unique([tenantId, jobPostingId, candidateId])` — Prevents double-submission by ensuring a candidate can submit exactly one application per open job vacancy.

### B. Relation Back-References Updated
* **`Tenant`**: Linked cleanly to collections of `JobPosting[]`, `Candidate[]`, `Application[]`, and `Interview[]`.
* **`User`**: Linked to `interviews` (as `Interview[]`) to represent scheduling allocations for interviewers.

---

## 3. Performance Indexing Requirements

We established dedicated composite and single-column indexes on the new entities:

* **`JobPosting`**:
  * `@@index([tenantId])`
  * `@@index([tenantId, status])`
  * `@@index([tenantId, createdAt])`
  * `@@index([deletedAt])`
* **`Candidate`**:
  * `@@index([tenantId])`
  * `@@index([tenantId, createdAt])`
  * `@@index([deletedAt])`
* **`Application`**:
  * `@@index([tenantId])`
  * `@@index([tenantId, status])`
  * `@@index([tenantId, createdAt])`
  * `@@index([deletedAt])`
* **`Interview`**:
  * `@@index([tenantId])`
  * `@@index([tenantId, status])`
  * `@@index([tenantId, createdAt])`
  * `@@index([deletedAt])`

---

## 4. Validation Results

Every compilation and verification command completed successfully:

* **Prisma Validate**: **PASS** (Confirmed 100% syntactic correctness in the schema file).
* **Prisma Client Generation**: **PASS** (Successfully rebuilt the client bindings inside `node_modules/@prisma/client` with the new models).
* **TypeScript Typecheck**: **PASS** (`npm run typecheck` resolved with 0 compiler errors).
* **Next.js Turbopack Build**: **PASS** (Turbopack production compile succeeded, ensuring zero compile-time regressions).

---

## 5. Potential Risks & Future Considerations

### Risks
* **Enum Integrity**: Application and Interview enums are defined statically in the database. Future alterations to candidate pipelines or round states will require migrations.
* **Precise Decimal Handling**: Experience and salary caps are configured as `Decimal` types. In downstream repository and Zod schemas, we must parse and serialize these carefully to avoid floating-point truncations in Javascript.
* **Soft Delete Checking**: All new indexes explicitly include `deletedAt` filters. Standard repositories must systematically filter out logical deletes during query execution.

### Future Repository Plan
During the next step (A4 Step 2), we will create context-first repositories:
1. `JobPostingRepository`
2. `CandidateRepository`
3. `ApplicationRepository`
4. `InterviewRepository`

These repositories will extend the shared `TenantAwareRepository` class to automatically apply multi-tenant isolation filters and soft delete gates (`deletedAt: null`), shielding service layers from database access.
