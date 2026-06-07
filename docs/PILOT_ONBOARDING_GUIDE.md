# MMD V2 — Pilot Onboarding Guide

**Date:** 2026-06-07  
**Scope:** Pilot Client Launch & Setup Verification  

---

## 1. Onboarding Checklist
Follow these steps to configure a new client tenant workspace:

1. **Provision Tenant Profile:** Create the tenant workspace via `/dashboard/tenants/new` (Requires `SUPER_ADMIN`).
2. **Assign Client Admin:** Create the primary client administrator user associated with the tenant.
3. **Configure Storage:** Set up custom S3 bucket parameters under `/dashboard/settings` if the tenant requests isolated document hosting.
4. **Define Teams:** Client administrator logs in and registers Coordinator, Recruiter, and Scraper users.

---

## 2. Smoke Testing Workflow
Run these manual checks to verify that the tenant workspace is fully operational:

### 1. Authentication Check
- Log in with the newly created Client Admin account.
- Confirm redirect to `/dashboard`.
- Verify the active tenant indicator displays the client's name.

### 2. CRM Check
- Create a test **Company** with a unique name.
- Add a **Contact** associated with that company.
- Create a **Lead** with status `NEW`. Advance the lead to `CONTACTED`.
- Verify FSM enforcement: Attempt to change lead status from `CONTACTED` back to `NEW`. Verify the system returns a `409 Conflict` error and rejects the save.

### 3. ATS Check
- Create a test **Job Posting** in `ACTIVE` status.
- Open the public page `/apply/[slug]` and verify the job is listed.
- Submit a mock application with a resume PDF.
- Log back into the dashboard, open the application, and verify the resume downloads correctly.

---

## 3. Common Troubleshooting

### Error: "403 Forbidden" on CRM write actions
- **Cause:** The active user is assigned the `RECRUITER` or `SCRAPER` role.
- **Resolution:** Elevate the user role to `COORDINATOR` or `ADMIN` via `/dashboard/users`.

### Error: "500 Internal Server Error" during resume uploads
- **Cause:** The storage driver is misconfigured or S3 credentials are invalid.
- **Resolution:** Check `STORAGE_DRIVER` inside `.env`. If using `local`, verify the `.storage` directory has write permissions. If using `s3`, verify credentials.
