# A4.7 — ATS Business Workflow Audit Report

**Audit Date**: 2026-06-02  
**Auditor**: Antigravity AI  
**Verdict**: **PASS**

This document records the functional workflow audit conducted on the ATS module's recruitment state transitions, evaluating validation rules and server-side constraints.

---

## 1. Job Posting & Candidate CRUD Lifecycles

* **Job Posting**:
  * *Status Transitions*: Controlled via enums (`DRAFT` default, `ACTIVE`, `CLOSED`).
  * *CRUD Operations*: Verified. Triggers creation, updates, and soft deletes (`deletedAt` timestamp update) safely via endpoints.
* **Candidate**:
  * *CRUD Operations*: Verified. Creates profile, updates currentLocation, and manages soft deletes. Emails are constrained to unique indexes per tenant.

---

## 2. Candidate Application Tracking Workflow

Applications track recruiters funnel transitions across 8 distinct states:
`APPLIED` $\rightarrow$ `SCREENING` $\rightarrow$ `SHORTLISTED` $\rightarrow$ `INTERVIEW` $\rightarrow$ `OFFERED` $\rightarrow$ `HIRED` $\rightarrow$ `REJECTED` $\rightarrow$ `WITHDRAWN`.

### A. State Transition Matrix:
* **Allowed Paths**:
  * `APPLIED` $\rightarrow$ `SCREENING`
  * `SCREENING` $\rightarrow$ `SHORTLISTED`, `REJECTED`
  * `SHORTLISTED` $\rightarrow$ `INTERVIEW`, `REJECTED`
  * `INTERVIEW` $\rightarrow$ `OFFERED`, `REJECTED`
  * `OFFERED` $\rightarrow$ `HIRED`, `REJECTED`
  * Any state $\rightarrow$ `WITHDRAWN`
* **Workflow Integrity (Server-Scoped)**:
  * The backend service handles validation. If an invalid jump is requested (e.g. `APPLIED` directly to `HIRED` or `REJECTED` to `SHORTLISTED`), the service throws a `ConflictError`.
* **Error Handling & Feedback**:
  * The UI uses standard `try...catch` blocks to wrap transition updates. When the server rejects a request, the UI catches the `ConflictError` message and displays it in a red toast alert, resetting the Kanban board card layout.

---

## 3. Interview Evaluation Workflow

Interviews manage evaluation cycles across 4 distinct states:
`SCHEDULED` $\rightarrow$ `COMPLETED` | `CANCELLED` | `NO_SHOW`.

### A. State Transition Matrix:
Defined in [`lib/foundation/services/interview.service.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/services/interview.service.ts):
```typescript
const AllowedTransitions: Record<InterviewStatus, InterviewStatus[]> = {
  SCHEDULED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
}
```

* **Transition Integrity**:
  * Interviews default to `SCHEDULED`.
  * Transition from `SCHEDULED` to `COMPLETED`, `CANCELLED`, or `NO_SHOW` is allowed (HTTP 200).
  * `COMPLETED`, `CANCELLED`, and `NO_SHOW` are terminal states. Attempting to transition from `COMPLETED` back to `CANCELLED` or `SCHEDULED` throws an `Invalid status transition` error (HTTP 409 Conflict).
* **UI Handling**:
  * Calendar and details components delegate updates to `changeInterviewStatus()` and display server rejection messages inside toast boxes.

---

## 4. Verdict

```text
ATS Workflow Audit: PASS
```
The state enums align with database definitions, the transition boundaries are validated at the service layer, and client-side error catches prevent UI sync anomalies.
