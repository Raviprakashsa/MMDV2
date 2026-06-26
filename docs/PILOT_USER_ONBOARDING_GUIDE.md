# MMD Recruit CRM — Pilot User Onboarding Guide
**Operations Phase Onboarding Playbook**

This guide contains the step-by-step processes to scale user onboarding for cohorts of 10, 25, and 50 users during the pilot launch, ensuring secure role assignments and smooth onboarding journeys.

---

## 1. Onboarding Framework by Cohort Size

### A. Cohort Alpha (First 10 Users) — Manual White-Glove Onboarding
* **Target Users**: Core team leaders, senior recruiters, and agency partners.
* **Process**:
  1. Administrator manually creates users via the UI (under Admin Settings -> User Management) or direct db seed command.
  2. Set up tenant allocation carefully (assigning system tenant or specific client tenant).
  3. Send personalized onboarding email containing credentials and schedule a 30-minute walkthrough session.

### B. Cohort Beta (Up to 25 Users) — Batch Processing
* **Target Users**: Expanded recruiting teams, hiring managers, and coordinators.
* **Process**:
  1. Collect details (Email, Full Name, Role, Tenant) via an onboarding CSV.
  2. Run the user creation backend script to batch create the profiles (idempotent user sync).
  3. Set user status to `ACTIVE` and distribute default passwords.
  4. Conduct group training sessions.

### C. Cohort Gamma (Up to 50 Users) — Self-Service + Automated Workflows
* **Target Users**: General recruiters, candidates, and client representatives.
* **Process**:
  1. Trigger email invitation links using the tenant invite system (`/dashboard/settings/invites`).
  2. Users click invite links, create their password, and enter their profile details themselves.
  3. Tenant constraints automatically apply to isolate users based on the invitation token.

---

## 2. Onboarding Steps for Administrators

### Step 1: User Creation & Tenant Mapping
1. Go to **Admin Dashboard -> User Management** (`/dashboard/users` or appropriate panel).
2. Click **Create User**.
3. Input the required details:
   * **Full Name**: e.g., Jane Smith
   * **Email Address**: `jane.smith@clientcompany.com` (Must be unique)
   * **Tenant**: Select their organization (e.g., `client-company`). Never assign system tenant to client users to maintain tenant isolation.

### Step 2: Role Assignment
Assign one of the predefined roles based on the user's operational needs:

| Role Code | Role Name | System Permissions | Use Case |
|:---|:---|:---|:---|
| `super_admin` | Super Administrator | Full read/write across all tenants, user management, global settings | System operators, platform owners |
| `coordinator` | Recruitment Manager | Create/edit requirements, companies, candidates, and manage tenant users | Lead recruiters, agency managers |
| `recruiter` | Recruiter | Create/edit candidates, view requirements, update candidate status | Daily execution recruiters |
| `interviewer` | Interviewer | View assigned candidates, log feedback, submit scorecard ratings | Hiring managers, technical interviewers |

### Step 3: Password Setup
* **Initial Temporary Password Policy**: Generate a strong random temporary password conforming to rules:
  * Minimum 8 characters
  * At least one uppercase letter (`A-Z`)
  * At least one lowercase letter (`a-z`)
  * At least one number (`0-9`)
  * At least one special character (e.g., `!`, `@`, `#`, `$`, `%`, `^`, `&`, `*`)
  * Example: `MagnusStart2026!`
* **Mandatory Action**: Instruct the user to immediately update their password upon first login at `/dashboard/settings/profile`.

---

## 3. Instructions for Onboarded Users

Provide this template to onboarded users:

```text
Subject: Welcome to MMD Recruit CRM — Your Account is Ready!

Hello [User Name],

Your workspace on MMD Recruit CRM is officially ready. Please find your login instructions below:

🌐 Live URL: https://mmd-recruit-crm.blackbay-54673e45.centralindia.azurecontainerapps.io
📧 Login Email: [User Email]
🔑 Temporary Password: [Temporary Password]

Next Steps:
1. Navigate to the Live URL.
2. Log in using your email and temporary password.
3. Click your profile avatar in the sidebar and navigate to "Settings" to update your password immediately.
4. Review the "Recruiter Guide" at /docs/RECRUITER_GUIDE.md to start managing companies, candidates, and requirements.

If you encounter any issues during login, please contact support at: support@magnuscopo.com
```

---

## 4. Support & Escalation Procedures

If a user reports an issue:
1. **Tier 1 (Immediate Helpdesk)**: Verify the user email exists in the database and their account status is `ACTIVE`. Reset password if they are locked out.
2. **Tier 2 (Systems Administration)**: If they see a blank page or 403 error, verify their role assignment matches their tenant ID. Check `/api/auth/session` to ensure cookies are synchronized.
3. **Tier 3 (Developer Escalation)**: If it is a system-wide crash, raise an issue with the DevOps team following the `PRODUCTION_INCIDENT_PLAYBOOK.md`.
