# A4.6 — ATS End-to-End Workflow Test Report

**Testing Date**: 2026-06-02  
**Tester**: Antigravity AI  
**Status**: **PASSED**

This document records the end-to-end (E2E) workflow testing outcomes for the integrated Applicant Tracking System (ATS) platform.

---

## 1. Test Scenario 1 — Job Posting Lifecycle

### Objectives:
Verify that recruiters can create, list, view, edit, and delete job posting records.

### Execution Logs:
1. **Creation**: Navigate to `/ats/job-postings/new`. Enter Job Title (`Senior Software Engineer`), Department (`Engineering`), Location (`San Francisco, CA`), Employment Type (`FULL_TIME`), Salary Range (`$130,000 - $175,000`), and requirements description. Click **Submit**.
   * *Outcome*: API request `POST /api/v1/job-postings` completed successfully with HTTP 201. Form redirected back to `/ats/job-postings` with a success toast.
2. **Listing**: Inspect the job postings table.
   * *Outcome*: The new job posting appears in the roster with proper department and location columns.
3. **Edition**: Open details via `/ats/job-postings/{id}`, click **Edit Details**, update Salary Max to `$190,000`, and click **Save Changes**.
   * *Outcome*: API request `PATCH /api/v1/job-postings/{id}` returns updated payload. Recruiter UI updates immediately.
4. **Deletion**: Click **Delete Job Posting** on the detail profile page.
   * *Outcome*: API request `DELETE /api/v1/job-postings/{id}` triggers soft-delete (`deletedAt` field populated). Roster page filters out deleted records.

---

## 2. Test Scenario 2 — Candidate Lifecycle

### Objectives:
Verify that recruiters can register, list, edit, and delete candidate profile details.

### Execution Logs:
1. **Creation**: Navigate to `/ats/candidates/new`. Enter candidate details:
   * First Name: `Jane`
   * Last Name: `Doe`
   * Email: `jane.doe@example.com`
   * Phone: `+1-555-0199`
   * Experience: `6 years`
   * Current Location: `Seattle, WA`
   * Resume Link: `https://magnus-bucket.s3.amazonaws.com/resumes/jane_doe_cv.pdf`
   * Click **Save Candidate**.
   * *Outcome*: API request `POST /api/v1/candidates` completed successfully with HTTP 201. Redirected to candidates roster.
2. **Listing**: Inspect `/ats/candidates` roster.
   * *Outcome*: Name, email, experience, and location are visible in the table rows.
3. **Edition**: Navigate to `/ats/candidates/{id}`, select **Edit Candidate**, change location to `Seattle, WA (Remote)`, and click **Save**.
   * *Outcome*: API request `PATCH /api/v1/candidates/{id}` updates database successfully.
4. **Deletion**: Select **Delete Candidate** on the profile page.
   * *Outcome*: API request `DELETE /api/v1/candidates/{id}` flags candidate record as deleted. Candidate details page redirects safely to directory view.

---

## 3. Test Scenario 3 — Application Lifecycle

### Objectives:
Verify that a candidate profile can be linked to a job posting, and that the application status flow works.

### Execution Logs:
1. **Association**: Navigate to `/ats/applications/new`.
   * Selection: Select candidate `Jane Doe (jane.doe@example.com)` and job posting `Senior Software Engineer (Engineering)`.
   * Click **Submit Application**.
   * *Outcome*: API request `POST /api/v1/applications` links candidate `jane-id` and job posting `job-id` in a new application row. Board redirects to `/ats/applications`.
2. **Listing (Kanban View)**: Inspect the applications Kanban board.
   * *Outcome*: Candidate card for `Jane Doe` is listed under the `APPLIED` lane, displaying Job Title (`Senior Software Engineer`), Department (`Engineering`), and Applied Date.
3. **Workflow Transitions**:
   * Click the update icon on the candidate card. Transition from `APPLIED` to `SCREENING`. (Outcome: **Success**, card moves to Screening column).
   * From Screening, transition to `SHORTLISTED`. (Outcome: **Success**).
   * From Shortlisted, transition to `INTERVIEW`. (Outcome: **Success**).
   * From Interview, transition to `OFFERED`. (Outcome: **Success**).
   * From Offered, transition to `HIRED`. (Outcome: **Success**, candidate successfully placed!).
4. **Invalid Transition Attempt**:
   * Attempt to transition an application from `APPLIED` directly to `HIRED` using the status modal.
   * *Outcome*: API request `POST /api/v1/applications/{id}/status` returns HTTP 409 Conflict. Error payload: `Invalid status transition from APPLIED to HIRED`. UI catches exception and displays red warning toast. The card remains in its original column.

---

## 4. Test Scenario 4 — Interview Lifecycle

### Objectives:
Verify that an application can be progressed to interviews, and that scheduling slots are visible on the calendar.

### Execution Logs:
1. **Creation**: Navigate to `/ats/interviews/new`.
   * Selection: Select application `Jane Doe — Target Job: Senior Software Engineer`.
   * Interviewer: Select `Recruiting Admin (admin@magnuscopo.com)`.
   * Round: `1`
   * Scheduled Date & Time: `2026-06-15 10:00 AM`
   * Click **Schedule Interview**.
   * *Outcome*: API request `POST /api/v1/interviews` completes with HTTP 201. Form redirects to calendar dashboard at `/ats/interviews`.
2. **Calendar month view visibility**: Inspect the month-view calendar.
   * *Outcome*: On day box `June 15`, an event card is rendered: `Jane Doe`, `Senior Software Engineer`, `10:00 AM`, `Round 1`, color-coded with the blue brand status badge for `Scheduled`.
3. **Status changes**:
   * Click the event card to open `InterviewStatusModal`. Transition from `SCHEDULED` to `COMPLETED`. (Outcome: **Success**. Card status badge transitions to green Completed).
   * Navigate to details view `/ats/interviews/{id}`. Attempt to transition status from `COMPLETED` to `CANCELLED`.
   * *Outcome*: API request `POST /api/v1/interviews/{id}/status` returns HTTP 409 Conflict: `Invalid status transition from COMPLETED to CANCELLED`. UI displays warning toast, and evaluation status remains Completed.

---

## 5. Summary Test Verdict

```text
End-to-End ATS Workflow Testing: PASS
```
All four core lifecycles and business workflows run successfully, and client-side error-toasting handles backend validation rejects properly.
