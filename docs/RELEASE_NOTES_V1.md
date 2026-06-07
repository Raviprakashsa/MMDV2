# MMD Recruit CRM V1 — Release Notes

**Version:** V1.0.0 (Release Candidate V1)  
**Date:** 2026-06-07  
**Build:** Next.js 16.2.6 production compile  

---

## 1. Included Features

### Applicant Tracking System (ATS)
- **Jobs Directory:** Create, edit, and publish job descriptions.
- **Job Pages:** Automatically generated public portals for candidate applications.
- **Candidate Hub:** Centralized database for storing recruiter comments, contact info, and indexing uploaded PDF resumes.
- **Interview Scheduler:** Event management tool linking candidate info to recruiter calendars.

### Customer Relationship Management (CRM)
- **Account Directory:** Structured records for client companies.
- **Contacts Directory:** Corporate contacts connected directly to companies, with cascading deactivation rules.
- **Leads Pipeline:** Rigid opportunities management board.

---

## 2. Security Improvements & Hardening
- **Service Layer RBAC Gate:** Unified role-based access checks. Any non-privileged API/action calls are blocked at the database boundary level (throws `403 Forbidden`).
- **Database-Level Uniqueness:** PostgreSQL unique keys added to prevent duplicate company name or contact emails per tenant, with soft-delete filter support.
- **State Machine Integrity:** The Lead pipeline enforces state validations on all status updates (throws `409 Conflict` on invalid transitions).

---

## 3. Operations & Observability
- **Sentry Integration:** Global unhandled 500 error catch blocks reporting telemetry directly to Sentry.
- **Docker Persistent Volumes:** Named volume attachments for Postgres and MongoDB, safeguarding database state across restarts.
- **Automated Backup Scripts:** Integrated `scripts/backup-db.sh` and `scripts/restore-db.sh` tools.

---

## 4. Known Limitations
- **Search System:** Search queries use exact-string matches rather than full-text or fuzzy string matching. Substring lookup is scheduled for V2.
- **Billing Integration:** Billing, invoicing, and subscription integrations are stubbed or local-only. Automated Stripe integration is scheduled for V2.
- **HRMS Modules:** Placement, LMS, and onboarding workflows are not supported in V1.
- **CRM Cascade Delete restriction:** Mid-tier `COORDINATOR` users have delete permissions because internal company updates cascade contact deactivations. Restricting delete access more granularly is scheduled for V2.
