# A4 Step 3 — ATS Service Completion Report

**Date**: 2026-06-01  
**Status**: **COMPLETE**

This report documents the implementation, structural design, and verification of the business-focused Service Layer for the **Applicant Tracking System (ATS)** module in the **MMD V2** platform.

---

## 1. Services Created & Methods Implemented

We created four new core services in `lib/foundation/services/` and registered them in the central services entrypoint [`lib/foundation/services/index.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/services/index.ts):

### A. [`job-posting.service.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/services/job-posting.service.ts)
* **Methods**: `create`, `update`, `get`, `list`, `close`, `reopen`.
* **Business & Validation Rules**:
  * `title` presence check (throws `ValidationError` if missing or empty).
  * Update and retrieval require verifying entity existence (throws `NotFoundError`).
  * `close()` updates status to `CLOSED`.
  * `reopen()` is only allowed if current status is NOT `CLOSED` (otherwise throws `ValidationError`).
* **Dependencies**: `JobPostingRepository`

### B. [`candidate.service.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/services/candidate.service.ts)
* **Methods**: `create`, `update`, `get`, `list`.
* **Business & Validation Rules**:
  * Candidate email uniqueness scoped strictly *per tenant* (validated via `CandidateRepository.findByEmail` before create/update). Normalizes email to trim/lowercase to prevent duplicates. Throws `ConflictError` on duplicates.
  * Validates existence before performing updates (throws `NotFoundError`).
* **Dependencies**: `CandidateRepository`

### C. [`application.service.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/services/application.service.ts)
* **Methods**: `create`, `update`, `get`, `list`, `changeStatus`.
* **Business & Validation Rules**:
  * Verifies candidate exists and belongs to the active tenant (throws `NotFoundError` / `ForbiddenError`).
  * Verifies job posting exists and belongs to the active tenant (throws `NotFoundError` / `ForbiddenError`).
  * Prevents duplicate applications (same candidate + job posting in active tenant) by querying `applicationRepository.findByCandidate` scoped to the tenant context. Throws `ConflictError` on duplicate detection.
  * Enforces strict workflow state transitions using the specified state machine:
    * `APPLIED ➔ SCREENING`
    * `SCREENING ➔ SHORTLISTED | REJECTED`
    * `SHORTLISTED ➔ INTERVIEW | REJECTED`
    * `INTERVIEW ➔ OFFERED | REJECTED`
    * `OFFERED ➔ HIRED | REJECTED`
    * `HIRED`, `REJECTED`, `WITHDRAWN` are terminal states (throws `ConflictError` on invalid transitions).
* **Dependencies**: `ApplicationRepository`, `CandidateRepository`, `JobPostingRepository`

### D. [`interview.service.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/services/interview.service.ts)
* **Methods**: `create`, `update`, `get`, `list`, `changeStatus`.
* **Business & Validation Rules**:
  * Verifies application exists and belongs to the active tenant (throws `NotFoundError` / `ForbiddenError`).
  * Verifies interviewer exists and belongs to the active tenant (throws `NotFoundError` / `ForbiddenError`).
  * Enforces strict workflow state transitions:
    * `SCHEDULED ➔ COMPLETED | CANCELLED | NO_SHOW`
    * `COMPLETED`, `CANCELLED`, `NO_SHOW` are terminal states (throws `ConflictError` on invalid transitions).
* **Dependencies**: `InterviewRepository`, `ApplicationRepository`, `UserRepository`

---

## 2. Standardized Error Handling

All services utilize standard exception classes imported from [`lib/core/app-error.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/core/app-error.ts):
* **`ValidationError`** (400): Thrown when required parameters are missing or incorrect (e.g., empty job posting title, reopening closed postings).
* **`NotFoundError`** (404): Thrown when requested entities are missing or belong to another tenant.
* **`ConflictError`** (409): Thrown for duplicate constraints or invalid state transitions in state machines.
* **`ForbiddenError`** (403): Thrown on direct multi-tenant validation mismatch checks.

---

## 3. Verification & Validation Results

* **TypeScript Compilation (`npm run typecheck`)**: **PASS** (Completed with 0 errors).
* **Production Bundle Compile (`npm run build`)**: **PASS** (Optimized Next.js production Turbopack compile succeeded with 0 warnings/errors).
* **Service Layer Audit**: **PASS** (Validated via `docs/A4_SERVICE_AUDIT.md` verifying no Prisma query execution, pure repository dependencies, and state-machine checks).

---

## 4. Known Risks & Service Layer Limitations

### A. Non-Transactional State Transition Checks
State machine checks perform standard non-blocking verification (`existing.status`) prior to updating. If concurrent API requests try to update the status of the exact same application simultaneously, a minor race condition could occur. Since state transitions are typically driven by deliberate human recruiter action, this is extremely low-risk.

### B. Email Normalization Gaps
We normalization-gated emails strictly to `trim` and `lowercase`. If a user enters emails with sub-addressing (e.g., `recruiter+candidate@company.com`), they are treated as unique candidates by standard database rules. This is consistent with CRM/IAM models.
