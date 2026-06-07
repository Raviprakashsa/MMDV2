# MMD Recruit CRM V1 — Demo Script

**Date:** 2026-06-07  
**Goal:** 15-Minute Technical and Sales Walkthrough  

---

## 1. Demo Flow Timeline
- **0:00 - 0:02:** Welcome & Platform Overview (Tenant Portal)
- **0:02 - 0:06:** ATS module walkthrough (Job Board & Candidate Pipeline)
- **0:06 - 0:11:** CRM module walkthrough (Company Directories & Leads FSM)
- **0:11 - 0:13:** Admin & Roles Management (RBAC verification)
- **0:13 - 0:15:** Q&A & Wrap-up

---

## 2. Walkthrough Steps

### Phase 1: Welcome & Setup (2 mins)
- **Action:** Open `/login`. Log in as `demo_admin@mmd.com`.
- **Talking Point:** "Welcome. MMD Recruit CRM V1 runs as an isolated tenant database instance. The UI automatically configures branding and database filtering based on this login session."
- **Visual:** Point out the clean workspace dashboard and sidebar navigation.

### Phase 2: ATS Module (4 mins)
- **Action 1:** Go to `/ats/job-postings/new`. Create a role: "Staff Engineer". Set status to `ACTIVE`.
- **Action 2:** Go to the public apply page `/apply/staff-engineer`. Show how public candidates see the posting.
- **Action 3:** Navigate to `/ats/candidates/new`. Upload a mock resume PDF.
- **Action 4:** Go to `/ats/interviews/new` and schedule a screening call for tomorrow.
- **Talking Point:** "We see candidates flowing from public applications directly into the recruiter's inbox. Resumes are stored securely and scheduling takes seconds."

### Phase 3: CRM Module (5 mins)
- **Action 1:** Go to `/dashboard/companies`. Open "Client Corp" profile. Show the associated contacts.
- **Action 2:** Navigate to `/dashboard/leads`. Click on a Lead opportunity in status `NEW`.
- **Action 3:** Advance the Lead to `CONTACTED`. 
- **Action 4 (The FSM Demo):** Attempt to move the Lead status dropdown back to `NEW`. Click **Save**.
- **Result:** An error modal pops up saying: *Conflict: Invalid status transition: CONTACTED → NEW. Allowed next stages: [QUALIFIED, LOST]*.
- **Talking Point:** "MMD Recruit CRM has a built-in state machine. This prevents sales reps from corrupting deal pipeline histories, enforcing operational discipline."

### Phase 4: Admin & IAM RBAC (2 mins)
- **Action 1:** Open `/dashboard/users`. Select a user with the `RECRUITER` role.
- **Action 2:** Log out. Log in as that `RECRUITER` user.
- **Action 3:** Go to `/dashboard/companies/new` and attempt to submit a company creation.
- **Result:** System blocks the action and shows a `403 Forbidden` error.
- **Talking Point:** "Our role-based access control is enforced at the database service layer. Even if a Recruiter attempts to call CRM creation actions, the system blocks them automatically."
