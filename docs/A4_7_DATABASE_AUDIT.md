# A4.7 — ATS Database Schema Audit Report

**Audit Date**: 2026-06-02  
**Auditor**: Antigravity AI  
**Verdict**: **PASS**

This document records the schema structural database audit for all ATS database tables configured inside [`prisma/schema.prisma`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/prisma/schema.prisma).

---

## 1. Database Table Configurations Reviewed

We audited the schema structures for the four new ATS tables:

### A. JobPosting
* **Primary Key**: `cuid()` String index.
* **Relations**: Linked to `Tenant` via foreign key `tenantId`.
* **State Enums**: Bound to `JobPostingStatus` defaulting to `DRAFT`.
* **Soft Delete**: Uses optional DateTime `deletedAt`.

### B. Candidate
* **Primary Key**: `cuid()` String index.
* **Relations**: Linked to `Tenant`.
* **Soft Delete**: Uses optional DateTime `deletedAt`.

### C. Application
* **Primary Key**: `cuid()` String.
* **Relations**: Maps `jobPostingId` and `candidateId` as foreign keys.
* **State Enums**: Bound to `ApplicationStatus` (`APPLIED` default).

### D. Interview
* **Primary Key**: `cuid()` String.
* **Relations**: Maps `applicationId` and `interviewerId` (User model) as foreign keys.
* **State Enums**: Bound to `InterviewStatus` (`SCHEDULED` default).

---

## 2. Structural Strengths

* **Multi-Tenant Unique Constraints**:
  * **Candidate**: `@@unique([tenantId, email])` enforces that email addresses are unique *within* the scope of the tenant, allowing different tenants to register the same candidate email.
  * **Application**: `@@unique([tenantId, jobPostingId, candidateId])` guarantees that a candidate cannot apply multiple times to the same open posting under the same tenant.
* **Scoping Indexes**:
  * All tables declare `@@index([tenantId])` to speed up multi-tenant lookups.
  * Compound indices like `@@index([tenantId, status])` and `@@index([tenantId, createdAt])` optimize sorting and state filtering on the Kanban board and listing pages.
  * All tables declare `@@index([deletedAt])` to ensure soft-delete queries run efficiently.

---

## 3. Risks & Missing Index Hotspots

While the database design is highly compliant, we identified potential query latency hotspots as records scale:
* **Unindexed Foreign Keys in Join Operations**:
  * **`Interview`**: Lacks individual index keys on `applicationId` and `interviewerId`. Tracing all interviews for a specific candidate application (e.g. `applicationRepository.findByApplication()`) requires table scans.
  * **`Application`**: Lacks an individual index on `candidateId`. Finding all active applications submitted by a single candidate will slow down as the database scales.

---

## 4. Recommended Enhancements

For future production optimization, we recommend adding the following database indexes:
```prisma
model Application {
  // ...
  @@index([candidateId])
  @@index([jobPostingId])
}

model Interview {
  // ...
  @@index([applicationId])
  @@index([interviewerId])
}
```
Adding these indices will ensure join queries maintain sub-millisecond execution speeds as transaction volumes grow.
