# MMD Recruit CRM V1

MMD Recruit CRM V1 is an enterprise-grade, secure, multi-tenant operating platform for recruitment agencies and corporate HR departments. It unifies Applicant Tracking System (ATS) operations and Client Relationship Management (CRM) sales pipelines into a single, high-performance modular monolith.

---

## 1. Product Overview
MMD Recruit CRM unifies hiring operations and sales pipeline tracking in one cohesive system. Built on Next.js 16 (Turbopack) and structured with strict tenant-level isolation, the platform ensures total security, access auditing, and data privacy across all workspaces.

---

## 2. Key Modules & Features

### 👥 Applicant Tracking System (ATS)
- **Jobs Board:** Create, edit, and automatically publish open roles to public application pages (`/apply/[slug]`).
- **Candidate Hub:** Centralized talent repository for storing contact details, recruiter comments, and parsed resume PDFs.
- **Application Pipeline:** Advance applications through standard stages (`APPLIED` → `SCREENING` → `INTERVIEWING` → `OFFER` → `HIRED`/`REJECTED`).
- **Interview Scheduling:** Align candidates, recruiters, and interviewers with scheduled calendar events.

### 💼 Client Relationship Management (CRM)
- **Account Directory:** Client company profile records with domain and website mapping.
- **Contact Management:** Client contact registry associated with parent companies. Cascading deactivation rules automatically trigger contact locks when companies are deactivated.
- **Leads & Opportunities FSM:** Sales opportunities are governed by a strict Finite State Machine (FSM) pipeline (`NEW` → `CONTACTED` → `QUALIFIED` → `PROPOSAL` → `WON`/`LOST`). Invalid status transitions are rejected at the database boundary level (throws `409 Conflict`).
- **Lead Conversion:** Convert warm leads into Client Companies and Contacts in a single transaction.

### 🔒 Identity & Access Control (IAM)
- **Granular RBAC:** Static authorization matrix enforcing actions across 5 roles:
  - `SUPER_ADMIN`: Full multi-tenant configuration and system diagnostics.
  - `ADMIN`: Tenant-level manager with full single-tenant CRUD rights.
  - `COORDINATOR`: Operational manager with full CRM and ATS CRUD access.
  - `RECRUITER`: Read/write access to ATS, but read-only access to CRM.
  - `SCRAPER`: Read-only access to pipeline endpoints (all write actions blocked).
- **Edge Routing Gate:** Native middleware (`proxy.ts`) checks JWT sessions on all routes, enforcing login or `/forbidden` redirects.
- **Tenant Isolation:** Parameterized queries bound to user session `tenantId` prevent cross-tenant data leaks.

---

## 3. Architecture

The codebase follows a clean, layered modular monolith pattern:
- **Delivery Layer:** App Router pages (`app/`), REST endpoints (`app/api/`), and Server Actions (`lib/actions/`).
- **Domain Service Layer:** Orchestrates business rules (`lib/foundation/services/`, `lib/services/`).
- **Persistence Layer:** Database operations, models, and index rules (`prisma/`, `lib/db/models/`).
- **Cross-cutting Concerns:** Middleware routing gates, client rate-limiting (`requestThrottle.ts`), and global error wrappers (`runApi`, `createSafeAction`).

---

## 4. Installation & Local Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v16) & MongoDB (v6.0)
- Local or S3-compatible document storage

### Steps
1. **Clone & Install:**
   ```bash
   git clone https://github.com/Raviprakashsa/MMDV2.git
   cd MMDV2
   npm install
   ```

2. **Configure Environment:**
   Copy `.env.example` to `.env` and populate the required keys:
   ```bash
   cp .env.example .env
   ```

3. **Migrations & Client Generation:**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

4. **Seed Database:**
   ```bash
   npm run db:seed
   npm run db:seed:prisma
   ```

5. **Start Dev Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to access the login page.

---

## 5. Deployment

### Production Docker Startup
The platform is optimized for Dockerized standalone VM/VPS hosting:
```bash
# Start all containers in detached mode
docker compose up --build -d

# Execute database migrations
docker compose exec app npx prisma migrate deploy
docker compose exec app npm run migrate
```

### Backups & Maintenance
- **Backups:** Running `scripts/backup-db.sh` dumps both Postgres and Mongo data directories, compresses them, and runs a 7-day retention sweep.
- **Restores:** Running `scripts/restore-db.sh` restores database data from a selected archive file after prompt confirmations.

---

## 6. Screenshots
*(Placeholders for application dashboard, Kanban boards, and admin console screenshots)*

---

## 7. License
Proprietary - All rights reserved by Magnus Copo.

---

## 8. Support
For customer demonstration requests, pilot access keys, or developer support, contact the system administrator or raise an internal ticket at `support@magnuscopo.com`.
