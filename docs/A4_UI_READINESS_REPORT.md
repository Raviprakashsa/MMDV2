# A4 Step 5 — ATS UI Readiness & Implementation Plan

**Date**: 2026-06-01  
**Status**: **PENDING REVIEW**

This report documents the architectural audit, layout structure, API mapping, and component design patterns for the new **Applicant Tracking System (ATS) UI Layer** in MMD V2. 

It establishes a high-fidelity implementation plan that adheres strictly to our decoupled layering rules:
```text
React UI ➔ API Routes ➔ Service ➔ Repository ➔ Prisma/PostgreSQL
```

---

## 1. UI Scope & Design System

The ATS module will be integrated seamlessly under the master `/dashboard` CRM route structure, inheriting the modern premium layout (glassmorphism accents, Outfit/Inter typography, harmonious Tailwind HSL color tokens, dark mode compliance, and micro-animations).

The module consists of four primary workspace views:
1. **Job Postings Board**: Grid/Table view showing active postings, metrics (applicants count), and compensation ranges.
2. **Candidates Directory**: Tabular roster with contact badges, experience tags, and clickable resume/portfolio links.
3. **Application Funnel**: KanBan-style status pipeline tracking candidates through stages (Applied, Screening, Shortlisted, Interview, Offered, Hired).
4. **Interview Scheduler**: Calendar-grid and round schedule view matching candidates to active interviewers.

---

## 2. Page & File Mappings

All UI components and pages will be created under Next.js App Router rules:

| Route Path | Type | View Description |
| :--- | :---: | :--- |
| `/dashboard/jobs` | Page | Renders the primary Job Postings dashboard (List, Filter, Metrics). |
| `/dashboard/jobs/new` | Page | Renders the creation form for a new Job Posting. |
| `/dashboard/jobs/[id]/edit` | Page | Renders the modification form for an existing Job Posting. |
| `/dashboard/candidates` | Page | Renders the Candidates list, experience filter, and resume links. |
| `/dashboard/candidates/new` | Page | Renders the new Candidate registration form (Resume upload URL). |
| `/dashboard/candidates/[id]/edit` | Page | Renders the candidate profile editor. |
| `/dashboard/applications` | Page | Renders the Application Funnel pipeline and double-submission check. |
| `/dashboard/applications/new` | Page | Renders the Application submission form linking Candidate to Job Posting. |
| `/dashboard/interviews` | Page | Renders active scheduled rounds, interviewer lists, and rating/feedback panels. |
| `/dashboard/interviews/new` | Page | Renders the interview scheduling panel (application, round, date selection). |

---

## 3. API Route Mapping Matrix

Every user interaction in the UI translates exclusively to a thin JSON API client call:

| Operation | HTTP Method | API Endpoint | Payload Contract |
| :--- | :---: | :--- | :--- |
| **Job Postings** | | | |
| *List Postings* | `GET` | `/api/v1/job-postings` | None (Returns Array) |
| *Create Posting* | `POST` | `/api/v1/job-postings` | `{ title, department, location, employmentType, description, requirements, salaryMin?, salaryMax?, status? }` |
| *Get Details* | `GET` | `/api/v1/job-postings/{id}` | None (Returns JobPosting) |
| *Update Posting* | `PATCH` | `/api/v1/job-postings/{id}` | `{ title?, department?, location?, employmentType?, description?, requirements?, salaryMin?, salaryMax?, status? }` |
| *Deactivate/Delete* | `DELETE` | `/api/v1/job-postings/{id}` | None (Soft Deletion) |
| **Candidates** | | | |
| *List Candidates* | `GET` | `/api/v1/candidates` | None (Returns Array) |
| *Create Candidate* | `POST` | `/api/v1/candidates` | `{ firstName, lastName, email, phone, currentLocation?, totalExperience?, currentCompany?, currentDesignation?, resumeUrl, linkedinUrl?, portfolioUrl? }` |
| *Get Candidate* | `GET` | `/api/v1/candidates/{id}` | None (Returns Candidate) |
| *Update Profile* | `PATCH` | `/api/v1/candidates/{id}` | `{ firstName?, lastName?, email?, phone?, currentLocation?, totalExperience?, currentCompany?, currentDesignation?, resumeUrl?, linkedinUrl?, portfolioUrl? }` |
| *Delete Candidate* | `DELETE` | `/api/v1/candidates/{id}` | None (Soft Deletion) |
| **Applications** | | | |
| *List Applications* | `GET` | `/api/v1/applications` | None (Returns Array) |
| *Create Application* | `POST` | `/api/v1/applications` | `{ candidateId, jobPostingId, status?, appliedAt? }` |
| *Get Details* | `GET` | `/api/v1/applications/{id}` | None (Returns Application) |
| *Update Application* | `PATCH` | `/api/v1/applications/{id}` | `{ status?, appliedAt? }` |
| *Transition Status* | `POST` | `/api/v1/applications/{id}/status` | `{ status }` (Funnels state transitions) |
| **Interviews** | | | |
| *List Schedules* | `GET` | `/api/v1/interviews` | None (Returns Array) |
| *Schedule Round* | `POST` | `/api/v1/interviews` | `{ applicationId, interviewerId, round?, feedback?, rating?, status?, scheduledAt }` |
| *Get Interview* | `GET` | `/api/v1/interviews/{id}` | None (Returns Interview) |
| *Update Round* | `PATCH` | `/api/v1/interviews/{id}` | `{ interviewerId?, round?, feedback?, rating?, status?, scheduledAt? }` |
| *Transition Round* | `POST` | `/api/v1/interviews/{id}/status` | `{ status }` (Saves status like COMPLETED) |

---

## 4. Required Reusable UI Components

We will build modular, client-side React components (prefixed with `"use client"`) utilizing standard Lucide icons, glass card wrappers, and loading skeletons:

1. **`AtsCard`**: Standard card wrapper with subtle hovers, borders, and smooth dark/light gradients.
2. **`StatusBadge`**: Multi-state colored indicator representing Enums (`JobPostingStatus`, `ApplicationStatus`, `InterviewStatus`) mapped to Tailwind colors:
   * `OPEN` / `APPLIED`: Blue
   * `SCREENING` / `SHORTLISTED`: Indigo
   * `INTERVIEW`: Violet
   * `OFFERED` / `HIRED`: Emerald
   * `CLOSED` / `REJECTED`: Rose
   * `ON_HOLD` / `WITHDRAWN`: Amber
3. **`MetricTile`**: Compact analytics widget for dashboards showing items like "Active Openings", "Total Candidates", "Scheduled Interviews".
4. **`FormInput`**: High-fidelity animated floating input box with error flags.
5. **`DeleteConfirmModal`**: Clean, non-disruptive modal overlay ensuring recruiters confirm deletion actions prior to triggering HTTP `DELETE` calls.

---

## 5. Forms Layout & Structure

All forms will leverage `react-hook-form` paired with `zodResolver` to implement robust validation:

### A. Job Posting Form (`/dashboard/jobs/new` & `/[id]/edit`)
* **Inputs**:
  * Title: text input (Required).
  * Department: selection dropdown (Required).
  * Location: text input (Required).
  * Employment Type: select dropdown (Full-time, Part-time, Contract, Remote).
  * Description: rich text/textarea.
  * Requirements: rich text/textarea.
  * salaryMin & salaryMax: side-by-side numeric/decimal inputs.
  * Status: selection dropdown (Draft, Open, On Hold, Closed).

### B. Candidate Form (`/dashboard/candidates/new` & `/[id]/edit`)
* **Inputs**:
  * First & Last Name: side-by-side text inputs (Required).
  * Email: text input with email validation format (Required).
  * Phone: text input (Required).
  * Experience (Years): numeric decimal input.
  * Current Company & Designation: side-by-side text inputs.
  * Resume URL: text input (Required).
  * LinkedIn & Portfolio URLs: text inputs (Optional).

### C. Application Form (`/dashboard/applications/new`)
* **Inputs**:
  * Candidate Selection: search-suggest autocomplete lookup.
  * Job Posting Selection: search-suggest autocomplete lookup.
  * Status: read-only preset `APPLIED` during creation.

### D. Interview Form (`/dashboard/interviews/new` & `/[id]/edit`)
* **Inputs**:
  * Application Selection: search-suggest autocompletion.
  * Interviewer Selection: search-suggest lookup listing pgSQL Users.
  * Round: numeric/integer input (Default 1).
  * Scheduled Date & Time: high-integrity datetime picker.
  * Rating & Feedback: slide-in panel (for completed status transitions).

---

## 6. Roster Tables & Filter Systems

### Roster Tables
Tables will render clean, interactive layout frames with:
* Responsive columns (auto-hiding on mobile).
* Candidate name with email/phone subtitles.
* Compensation ranges with localized format (e.g. `INR` / `$`).
* Context action buttons (View, Edit, Delete, Transition).
* Grid skeleton animations during loading transitions.

### Filter Systems
Sticky sidebar or header filter blocks:
* **Job filters**: status, department, location.
* **Candidate filters**: experience range, current designation.
* **Application filters**: status, job vacancy.
* **Search boxes**: client-side debounced text search queries.

---

## 7. Pipeline Workflow & Status Controls

We will build a pipeline board rendering status lists side-by-side:
1. **Interactive State Transitions**: Recruiters can transition application states through status controls (e.g., clicking `Screen`, `Shortlist`, `Schedule Interview`, `Make Offer`, `Hire` or `Reject` actions).
2. **Transition Validation**: The client UI parses the current status and disables buttons for disallowed transitions based on the service state machine, shielding the user from invalid transitions.
3. **Atomic API Execution**: Clicking transition triggers `POST /api/v1/applications/{id}/status` instantly updating the database with atomic transition queries.

---

## 8. Tenant & Security Requirements

1. **Context Building**: The UI fetches the current logged-in user's `tenantId` and `userId` from NextAuth session scopes and includes them in custom HTTP headers (`x-tenant-id` and `x-user-id`) in every `fetch`/`axios` request.
2. **Isolation Guarantee**: The UI never directly requests database ids without headers. This ensures that a user can never view or modify candidates, applications, or schedules belonging to other tenant workspaces.

---

## 9. Major Risks & Mitigation Strategies

* **Composite Constraint Conflicts on Soft Deletes**:
  * **Risk**: The database enforces `Candidate` email uniqueness per tenant. If a recruiter soft-deletes a candidate, creating a new candidate with that same email will fail.
  * **Mitigation**: The candidate list view will include a toggle to "View Soft-Deleted Candidates", allowing recruiters to restore the profile rather than creating a duplicate.
* **Decimal Casting Loss**:
  * **Risk**: Total experience and salary fields are Decimals. High-precision Javascript conversions might truncate values.
  * **Mitigation**: Zod schemas in forms cast and serialize decimals cleanly as string numbers (`z.string().regex(/^\d+(\.\d+)?$/)`) prior to API posts.

---

## 10. Final UI Readiness Verdict

The MMD V2 platform is **Fully Ready** for A4 Step 5. 

With all 10 API endpoints, 8 repositories, and 6 core services compiled, validated, and building successfully, the backend foundation is incredibly stable. We are ready to begin the React UI implementation once this plan is approved.
