# A4 Step 5 UI Data Contract Audit Report

**Audit Date**: 2026-06-01  
**Auditor**: Antigravity AI  
**Status**: **PASSED**

This data contract audit inspects the active **Prisma database models, request and response DTO schemas, and API contracts** in the ATS module to verify 100% data compatibility with all planned user interface components (such as KanBan pipeline cards, scheduler pickers, and metric counters).

---

## 1. Schema Models vs UI Fields Comparison

We compared the database columns defined in [`prisma/schema.prisma`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/prisma/schema.prisma) against the fields planned in our UI forms and roster tables:

### A. Job Posting
* **Database Fields**: `id`, `tenantId`, `title`, `department`, `location`, `employmentType`, `description`, `requirements`, `salaryMin`, `salaryMax`, `status`, `createdAt`, `updatedAt`, `deletedAt`
* **UI Requirements**: Fields for listing, creating, and editing match database columns **1:1**. No missing fields or type conflicts.

### B. Candidate
* **Database Fields**: `id`, `tenantId`, `firstName`, `lastName`, `email`, `phone`, `currentLocation`, `totalExperience`, `currentCompany`, `currentDesignation`, `resumeUrl`, `linkedinUrl`, `portfolioUrl`, `createdAt`, `updatedAt`, `deletedAt`
* **UI Requirements**: Roster tables and candidate forms match database columns **1:1**. No missing fields or type conflicts.

### C. Application
* **Database Fields**: `id`, `tenantId`, `jobPostingId`, `candidateId`, `status`, `appliedAt`, `createdAt`, `updatedAt`, `deletedAt`
* **UI Requirements**: Linking dropdowns, dates, and status badges match database columns **1:1**. No missing fields or type conflicts.

### D. Interview
* **Database Fields**: `id`, `tenantId`, `applicationId`, `interviewerId`, `round`, `feedback`, `rating`, `status`, `scheduledAt`, `createdAt`, `updatedAt`, `deletedAt`
* **UI Requirements**: Pickers, round counters, ratings, and schedules match database columns **1:1**. No missing fields or type conflicts.

---

## 2. API DTO Payload Verification

We verified the Zod validation request and response DTO contracts for all route handlers:

### A. Job Postings
* **Request DTOs**: Standard body schemas (`createSchema`, `updateSchema`) require and parse all posting parameters securely.
* **Response DTOs**: API endpoints return standard `JobPosting` objects or list arrays.
* **Verdict**: **COMPATIBLE**

### B. Candidates
* **Request DTOs**: Body schemas correctly validate names, email formats, and URLs.
* **Response DTOs**: Endpoints return standard candidate entities or list arrays.
* **Verdict**: **COMPATIBLE**

### C. Applications
* **Request DTOs**: Validates link ids and status enums correctly.
* **Response DTOs**: Endpoints return application records.
* **Verdict**: **COMPATIBLE**

### D. Interviews
* **Request DTOs**: Validates ISO date strings and rating integers correctly.
* **Response DTOs**: Endpoints return scheduled interview round details.
* **Verdict**: **COMPATIBLE**

---

## 3. Workflow Feasibility Verification

### A. KanBan Pipeline Feasibility
* **Requirement**: The UI needs to fetch all active applications, group them dynamically into pipeline lists by `status` (APPLIED, SCREENING, SHORTLISTED, INTERVIEW, OFFERED, HIRED), and transition them atomically upon drag-and-drop actions.
* **APIs exposed**:
  * `GET /api/v1/applications`: Returns all active applications, allowing client-side grouping.
  * `POST /api/v1/applications/{id}/status`: Atomic endpoint that updates application status, validating against transition matrices.
* **Verdict**: **FULLY FEASIBLE**

### B. Interview Scheduler Feasibility
* **Requirement**: The UI needs to select an application, list available PG Users as Interviewers, schedule rounds, and record rating/feedback scores.
* **APIs exposed**:
  * `GET /api/v1/applications`: Lists active applications to populate candidate targets.
  * `GET /api/v1/users`: Standard MMD V2 User endpoint (`app/api/v1/users/route.ts`) already exists, allowing the UI to populate the Interviewer dropdown list.
  * `POST /api/v1/interviews`: Creates scheduled rounds.
  * `PATCH /api/v1/interviews/{id}`: Submits interviewer feedback and rating scores.
* **Verdict**: **FULLY FEASIBLE**

---

## 4. Assessment of UI Assumptions & Risks

* **uniqueness Constraints**: The database enforces `Candidate` email uniqueness per tenant context (`@@unique([tenantId, email])`). If a candidate is soft-deleted, creating a candidate with the same email in the UI will trigger a 409 Conflict. This is an expected database constraint; the UI must prompt recruiters to restore soft-deleted candidates rather than creating duplicate profiles.
* **Decimal Precision**: Compensations and experience levels are Decimals. The API supports casting numeric values passed as string numbers safely. The UI forms will submit numbers as strings, preserving high-integrity decimals.

---

## 5. Final Audit Verdict

```text
A4 Step 5 Ready
```

The database schemas, Zod validation payload DTOs, and API responses are **100% aligned** and perfectly suited to back the planned React UI views, including KanBan pipelines, autocompletion selectors, and scheduler calendars.
