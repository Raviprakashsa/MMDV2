# V1 Launch Checklist

This checklist tracks all remaining technical, operational, and commercial tasks required before promoting the MMD V2 release candidate to production.

---

## 1. Technical & Infrastructure Tasks

| Task | Owner | Status | Comments / Preconditions |
| --- | --- | --- | --- |
| Deploy Standalone Docker Services | DevOps | `PENDING` | Target VPS must be provisioned. |
| Configure Redis Throttling | DevOps | `PENDING` | Set `THROTTLE_BACKEND=redis` and configure Upstash. |
| Populate Production Environment Secrets | DevOps | `PENDING` | Configure database URLs and `NEXTAUTH_SECRET`. |
| Run Typecheck & Lint in Hosted CI | DevOps | `PENDING` | Must verify green pipeline on the production branch. |
| Run Playwright Smoke Tests on Staging | QA | `PENDING` | Run with `E2E_USE_SEEDED_USERS=1` to verify staging server. |

---

## 2. Database & Operations Tasks

| Task | Owner | Status | Comments / Preconditions |
| --- | --- | --- | --- |
| Refactor CRM UI Actions to PostgreSQL | Engineering | `BLOCKED` | **Blocked.** Needs approval to wire `lib/foundation` services to UI. |
| Create Automated Database Backup Scripts | DevOps | `PENDING` | Set daily backup cron jobs and verify retention storage. |
| Execute Staging DB Dry Run | QA | `PENDING` | Verify migrations and seed scripts against a clean DB. |
| Draft Operational Runbooks | Operations | `PENDING` | Document troubleshooting steps for common container/auth issues. |
| Draft Database Restore Guides | Operations | `PENDING` | Document exact Postgres/Mongo restore procedures from snapshots. |

---

## 3. Commercial & CS Tasks

| Task | Owner | Status | Comments / Preconditions |
| --- | --- | --- | --- |
| Define and Seed Commercial Pricing Tiers | Product | `PENDING` | Need definition of Standard/Enterprise tiers. |
| Set Up Manual Onboarding Procedure | Product | `PENDING` | Document steps for creating tenant accounts manually. |
| Draft End-User Help Center Documentation | CS | `PENDING` | Write initial user manuals for CRM and ATS modules. |
| Complete Business Owner Sign-Off | Business | `PENDING` | Staging walk-through with stakeholders using representative data. |
