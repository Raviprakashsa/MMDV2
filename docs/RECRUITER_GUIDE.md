# MMD V2 — Recruiter User Guide

**Date:** 2026-06-07  
**Scope:** ATS Workflows (Jobs, Candidates, Applications, Interviews)  

---

## 1. Overview
The Applicant Tracking System (ATS) enables recruiters to source, evaluate, and hire candidates. Recruiters have full read/write access to all ATS objects within their active tenant.

---

## 2. Job Postings
Job postings define the requirements and details of open roles.

### Creating a Job Posting
1. Navigate to `/ats/job-postings/new`.
2. Enter Job Title, Department, Description, and status (e.g. `DRAFT`, `ACTIVE`).
3. Click **Save**. Active jobs are published automatically to the public apply page (`/apply/[slug]`).

---

## 3. Candidate Profile Management
Candidates represent the talent pool.

### Sourcing & Uploads
1. Go to `/ats/candidates/new`.
2. Fill in the candidate name, email, phone number, and experience details.
3. Upload the resume PDF. The system stores the resume in S3/Local storage and indexes it for search.

---

## 4. Application Pipeline
Applications track the candidate's progress through active job stages.

### Stages of an Application
- `APPLIED` -> `SCREENING` -> `INTERVIEWING` -> `OFFER` -> `HIRED` / `REJECTED`

### Status Management
- Open an application via `/ats/applications/[id]`.
- Use the pipeline card component to advance stages.
- Changing stage updates audit logs automatically.

---

## 5. Interview Scheduling
1. Open the application or go to `/ats/interviews/new`.
2. Select the candidate, interviewer (user), date, and time.
3. Save to register the calendar event. Interviewers receive dashboard alerts.
