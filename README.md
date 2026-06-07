# MMD Recruit CRM V1.10 — Production Hardened SaaS Platform

MMD Recruit CRM is an enterprise-grade, secure, multi-tenant operating platform for recruitment agencies and corporate HR departments. It unifies Applicant Tracking System (ATS) operations and Client Relationship Management (CRM) sales pipelines into a single, high-performance modular monolith.

---

## 1. Product Overview

MMD Recruit CRM unifies hiring operations and sales pipeline tracking in one cohesive system. Built on Next.js 16 (Turbopack) and structured with strict tenant-level isolation, the platform ensures total security, access auditing, and data privacy across all workspaces. The core business values center on:
- **Comprehensive ATS Operations:** From career page job postings to resume management, status pipelines, and calendar scheduling.
- **Robust CRM Opportunities:** Track leads, company directories, HR contact associations, and convert leads to corporate accounts under a unified transaction model.
- **Privacy & Safety:** Absolute cross-tenant query separation, granular RBAC gatechecks, and automated activity logging.

---

## 2. Architecture

The codebase follows a clean, layered modular monolith pattern:
- **Delivery Layer:** App Router pages (`app/`), REST endpoints (`app/api/`), and Server Actions (`lib/actions/`).
- **Domain Service Layer:** Orchestrates business rules (`lib/foundation/services/`, `lib/services/`).
- **Persistence Layer:** Dual-database operations (PostgreSQL via Prisma ORM for structured relational data, MongoDB for unstructured lead logs and settings).
- **Cross-cutting Concerns:** Middleware routing gates (`proxy.ts`), client rate-limiting (`requestThrottle.ts`), and global error wrappers.

---

## 3. Local Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v16)
- MongoDB (v6.0)
- Local folder or S3-compatible bucket for resume file uploads

### Step-by-Step Installation
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Raviprakashsa/MMDV2.git
   cd MMDV2
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Open .env and populate database strings and secure keys.
   ```
4. **Initialize Databases:**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
5. **Populate Demo Seed Data:**
   ```bash
   npm run db:seed
   npm run db:seed:prisma
   ```
6. **Start Dev Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to access the application.

---

## 4. Deployment

### Production Docker Hosting
The platform is optimized for Dockerized standalone VM/VPS hosting using `docker-compose.yml`:
1. **Build and Run Containers:**
   ```bash
   docker compose up --build -d
   ```
2. **Execute Remote Migrations:**
   ```bash
   docker compose exec app npx prisma migrate deploy
   docker compose exec app npm run migrate
   ```
3. **Standalone Static Builds:**
   Alternatively, you can build the production package using:
   ```bash
   npm run build
   npm start
   ```

---

## 5. Environment Variables

Create a root `.env` file containing the following variables:

| Variable Name | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `NEXTAUTH_SECRET` | NextAuth session encryption key | *32-char random string* |
| `DATABASE_URL` | MongoDB connection string | `mongodb://localhost:27017/mmdss` |
| `POSTGRES_DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/mmd_v2` |
| `NEXT_PUBLIC_BASE_URL` | Application root URL | `http://localhost:3000` |
| `STORAGE_DRIVER` | File storage driver (`local` or `s3`) | `local` |
| `LOCAL_STORAGE_ROOT` | Upload path for local storage | `.storage` |
| `CRON_SECRET` | Bearer token verifying background cron API calls | *secure random string* |
| `DOCUMENT_DOWNLOAD_SECRET`| Cryptographic signing key for file downloads | *secure random string* |
| `THROTTLE_BACKEND` | Throttle storage backend (`redis` or `memory`) | `memory` |

---

## 6. Database Setup

The platform uses a hybrid database setup (PostgreSQL and MongoDB):

### Schema Syncing
To sync PostgreSQL models defined in `prisma/schema.prisma` with your physical database instance:
```bash
# Apply pending SQL migrations in production
npx prisma migrate deploy

# Run a local migration and generate new schema files during development
npx prisma migrate dev --name <migration_name>
```

### Seeding Scripts
- Relational schema (Prisma): `npm run db:seed:prisma`
- Document database (MongoDB): `npm run db:seed`

---

## 7. Backup & Restore

Production shell scripts are located in `scripts/`:

### Daily Backups
To execute an on-demand database backup:
```bash
bash scripts/backup-db.sh
```
This dumps both MongoDB collection BSONs and PostgreSQL SQL scripts into compressed archives and runs a 7-day retention sweep.

### Restoring Data
To restore database data from a selected archive file:
```bash
bash scripts/restore-db.sh
```
Follow the interactive prompt confirmations to target your backup file.

---

## 8. User Roles

MMD Recruit CRM enforces role-based access control (RBAC) across 5 standard user roles:

1. **`SUPER_ADMIN`:** Full multi-tenant configuration, identity control, and system diagnostics.
2. **`ADMIN`:** Tenant manager. Full single-tenant CRUD rights. Cannot control multi-tenant identity settings.
3. **`COORDINATOR`:** Operations lead. Full access to CRM Companies/Requirements and ATS candidates/applications.
4. **`RECRUITER`:** Full access to ATS (Jobs, Candidates, Applications, Interviews), but read-only access to CRM.
5. **`SCRAPER`:** Automation intake role. Read-only access to pipeline command centers. All write actions are blocked.

---

## 9. Troubleshooting

### NextAuth Token/Mongoose Session Stale Redirects
- **Issue:** Changing database records causes browser redirects to `/forbidden` or loops.
- **Solution:** Clear browser session cookies (`next-auth.session-token`). Verify `AUTH_SECRET` and `NEXTAUTH_SECRET` are matching in your env file.

### Prisma Dev Client Not Compiling
- **Issue:** TypeScript error "Cannot find module '@prisma/client'".
- **Solution:** Run `npx prisma generate` to rebuild local typescript definitions.

### Upload Failures
- **Issue:** PDF resume uploads return "failed to write to storage".
- **Solution:** Verify the directory specified in `LOCAL_STORAGE_ROOT` exists and has read/write permissions for the application user group.

---

## 10. Support

For customer demonstration requests, pilot access keys, or developer support, contact the system administrator or raise an internal ticket at:
- **Email:** support@magnuscopo.com
- **Website:** www.magnuscopo.com/support
