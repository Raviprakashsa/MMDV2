# MMD Recruit CRM V1 — Pilot Customer Onboarding

**Date:** 2026-06-07  

---

## 1. Customer Setup Process

### Stage 1: Workspace Provisioning
1. The operations team logs in as `SUPER_ADMIN` and accesses `/dashboard/tenants/new`.
2. Input the customer's legal name, primary domain, and logo image assets.
3. Save to automatically partition database slices inside PostgreSQL and MongoDB.

### Stage 2: Admin Registration
1. Navigate to `/dashboard/users`.
2. Create the first user account for the customer, assign the `ADMIN` role, and link it to their newly provisioned tenant.
3. Deliver the initial credentials securely to the client sponsor.

---

## 2. Initial Configuration
Once the Client Admin logs in, they should run through these configuration tasks:
- **Company Profile:** Update tenant settings (phone, contact email) under `/dashboard/settings`.
- **Recruiters Registry:** Navigate to `/dashboard/users` and register all recruiters, assigning the `RECRUITER` role.
- **Coordinators Registry:** Register managers/leads, assigning the `COORDINATOR` role.
- **Job Board Launch:** Upload initial active jobs to verify public apply page generation.

---

## 3. Success Criteria
A pilot client onboarding is considered successful when the following milestones are verified within the first 14 days of operation:

| Milestone | Target Indicator | Verification Method |
|---|---|---|
| **User Adoption** | 100% of registered recruiters logging in weekly. | Admin Session Logs. |
| **Data Integrity** | Zero duplicate companies or contact emails generated. | Database check scripts. |
| **Pipeline Control** | All active opportunities advanced strictly through the FSM pipeline. | Lead history logs. |
| **Operational Safety** | 0 unhandled crash errors reported. | Sentry issue dashboard. |
