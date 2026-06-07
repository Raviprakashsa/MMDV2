# Work Intelligence Platform — Work Intelligence Audit

This audit document details the event capture coverage across **MMD Recruit CRM V1** features (ATS, CRM, HR, and Auth).

---

## 1. Event Capture Integration Matrix

To ensure full coverage without modifying core business workflows, tracking calls were hooked into the service and server action layers:

| Feature / Module | File Hook Path | Log Actions Logged |
| :--- | :--- | :--- |
| **Auth Session** | Auth callbacks / sign-out action | `LOGIN`, `LOGOUT` (captures browser, device, IP) |
| **ATS - Candidates** | [candidate.service.ts](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/services/candidate.service.ts) | `CREATE_CANDIDATE`, `UPDATE_CANDIDATE`, `DELETE_CANDIDATE` |
| **ATS - Jobs** | [job-posting.service.ts](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/services/job-posting.service.ts) | `CREATE_JOB`, `UPDATE_JOB`, `DELETE_JOB` |
| **ATS - Applications** | [application.service.ts](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/services/application.service.ts) | `CREATE_APPLICATION`, `UPDATE_APPLICATION_STATUS` |
| **ATS - Interviews** | [interview.service.ts](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/services/interview.service.ts) | `CREATE_INTERVIEW`, `UPDATE_INTERVIEW_STATUS` |
| **CRM - Leads** | [lead.service.ts](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/services/lead.service.ts) | `CREATE_LEAD`, `UPDATE_LEAD`, `CONVERT_LEAD` (Won/Lost statuses) |
| **CRM - Companies** | [company.service.ts](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/services/company.service.ts) | `CREATE_COMPANY`, `UPDATE_COMPANY` |
| **CRM - Contacts** | [contact.service.ts](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/services/contact.service.ts) | `CREATE_CONTACT`, `UPDATE_CONTACT` |
| **HR - Requirements** | [module4-requirement.ts](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/actions/module4-requirement.ts) | `CREATE_REQUIREMENT`, `UPDATE_REQUIREMENT`, `CLOSE_REQUIREMENT` |
| **Navigation views** | Heartbeat route (Client pathname) | `PAGE_VIEW` |

---

## 2. Integrity and Surveillance Constraints

* **Strict Metadata Sanity**: The system logs target document IDs and action kinds (e.g., candidate creation, requirement status shift). It **never** captures raw keystrokes, screenshots, webcam outputs, or detailed click positions.
* **Tenant Isolation**: All database logs and aggregates partition queries by `tenantId` to ensure total isolation.
* **Error Resilience**: Database writes in `trackActivity` run asynchronously or inside safe catch blocks to prevent logging issues from interfering with standard app functionality.
