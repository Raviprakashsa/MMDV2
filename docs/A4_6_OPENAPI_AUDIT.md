# A4.6 — ATS OpenAPI & Contract Review Report

**Audit Date**: 2026-06-02  
**Auditor**: Antigravity AI  
**Status**: **PASSED**

This document records the OpenAPI compliance and data contract audit conducted for all active ATS REST API endpoints.

---

## 1. Audited Endpoints Ledger

We audited all route handlers under `app/api/v1/` corresponding to the ATS platform:

### A. Job Postings Endpoints
* **`GET /api/v1/job-postings`**: Lists active postings for the current tenant context.
  * *Response Shape*: `Array<JobPosting>` (HTTP 200).
* **`POST /api/v1/job-postings`**: Creates a new job posting.
  * *Request Body*: Required fields (`title`, `department`, `location`, `employmentType`, `status`). Optional fields (`salaryMin`, `salaryMax`, `description`, `requirements`).
  * *Response Shape*: Created `JobPosting` object (HTTP 201).
* **`GET /api/v1/job-postings/{id}`**: Retrieves a specific job posting.
* **`PATCH /api/v1/job-postings/{id}`**: Updates fields.
* **`DELETE /api/v1/job-postings/{id}`**: Soft-deletes a job posting.

### B. Candidates Endpoints
* **`GET /api/v1/candidates`**: Lists active candidates.
* **`POST /api/v1/candidates`**: Registers a candidate.
  * *Request Body*: Required (`firstName`, `lastName`, `email`, `phone`, `resumeUrl`). Optional (`currentPosition`, `currentCompany`, `totalExperience`, `currentLocation`, `linkedinUrl`, `portfolioUrl`).
  * *Response Shape*: Created `Candidate` (HTTP 201).
* **`GET /api/v1/candidates/{id}`**: Retrieves candidate.
* **`PATCH /api/v1/candidates/{id}`**: Updates profile.
* **`DELETE /api/v1/candidates/{id}`**: Soft-deletes candidate.

### C. Applications Endpoints
* **`GET /api/v1/applications`**: Lists applications.
* **`POST /api/v1/applications`**: Connects candidate to job.
  * *Request Body*: Required (`candidateId`, `jobPostingId`). Optional (`status` defaulting to `APPLIED`).
  * *Response Shape*: Created `Application` (HTTP 201).
* **`GET /api/v1/applications/{id}`**: Retrieves application details.
* **`PATCH /api/v1/applications/{id}`**: Updates fields.
* **`POST /api/v1/applications/{id}/status`**: Requests status transition.
  * *Request Body*: `{ "status": "SCREENING" | "SHORTLISTED" | "INTERVIEW" | "OFFERED" | "HIRED" | "REJECTED" | "WITHDRAWN" }`.

### D. Interviews Endpoints
* **`GET /api/v1/interviews`**: Lists interviews.
* **`POST /api/v1/interviews`**: Schedules an interview round.
  * *Request Body*: Required (`applicationId`, `interviewerId`, `scheduledAt` ISO string). Optional (`round` defaulting to `1`, `feedback`, `rating` 1-5, `status` defaulting to `SCHEDULED`).
  * *Response Shape*: Created `Interview` (HTTP 201).
* **`GET /api/v1/interviews/{id}`**: Retrieves interview round details.
* **`PATCH /api/v1/interviews/{id}`**: Updates feedback, ratings, schedule.
* **`POST /api/v1/interviews/{id}/status`**: Transitions status.
  * *Request Body*: `{ "status": "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW" }`.

---

## 2. API Schema Validation Matrix

We verified that Zod schemas at endpoint borders match UI model bindings:

| Entity | UI Form Fields | Backend Zod Parsing | Schema Verdict |
| :--- | :--- | :--- | :---: |
| **Job Posting** | Aligns with input strings | Aligns with strings and enums | **MATCH** |
| **Candidate** | Experience string, URLs | Experience string, URL validations | **MATCH** |
| **Application** | Candidate/Job IDs, Status | String IDs, ApplicationStatus enum | **MATCH** |
| **Interview** | Candidate ID, round, dates | applicationId, round Int, Date strings | **MATCH** |

* **Date Types**: Dates are captured as local strings (`datetime-local`) in UI inputs and successfully parsed into standard ISO dates by the client before submission. The backend parses them using `new Date(...)`, matching database columns.
* **Int/Float Types**: Form elements are parsed using `z.preprocess()` to guarantee integer types for ratings and rounds, matching server schema constraints.

---

## 3. Verdict

```text
OpenAPI & Contract Review: PASS
```
All routes are verified, schemas align cleanly, and data serialization maps without type warnings or payload drift.
