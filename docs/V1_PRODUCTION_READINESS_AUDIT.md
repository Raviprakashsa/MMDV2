# V1 — Production Readiness Audit Report

**Date:** 2026-06-07  
**Scope:** Database, Application, Infrastructure  
**Auditor:** Automated code audit (Antigravity AI)  

---

## Section 1 — Database

### 1.1 Indexes

Audit of `prisma/schema.prisma` — CRM models (Company, Lead, Contact):

#### Company Table Indexes
| Index | Definition | Purpose |
|---|---|---|
| @@index([tenantId]) | Tenant scope | Filters by tenant on all queries |
| @@index([tenantId, name]) | Composite | Company name lookup within tenant |
| @@index([tenantId, email]) | Composite | Email lookup within tenant |
| @@index([deletedAt]) | Soft-delete filter | Speeds up soft-delete exclusion |

**Verdict: ✅ ADEQUATE** — Covers all primary query patterns.

#### Contact Table Indexes
| Index | Definition | Purpose |
|---|---|---|
| @@index([tenantId]) | Tenant scope | |
| @@index([companyId]) | FK lookup | Contact list by company |
| @@index([tenantId, email]) | Composite | Email uniqueness + lookup |
| @@index([deletedAt]) | Soft-delete filter | |

**Verdict: ✅ ADEQUATE**

#### Lead Table Indexes
| Index | Definition | Purpose |
|---|---|---|
| @@index([tenantId]) | Tenant scope | |
| @@index([tenantId, companyId]) | Composite | Leads by company |
| @@index([tenantId, contactId]) | Composite | Leads by contact |
| @@index([tenantId, ownerId]) | Composite | Leads by owner |
| @@index([tenantId, status]) | Composite | Pipeline filter by status |
| @@index([deletedAt]) | Soft-delete filter | |

**Verdict: ✅ COMPREHENSIVE** — Best-indexed of the three CRM tables. All foreign key and filter combinations covered.

#### Supporting Tables Indexes (AuditLog, Session, Tenant, etc.)
- ✅ AuditLog: `[tenantId]`, `[entity, entityId]`, `[createdAt]` — Good for audit queries
- ✅ Session: `[userId]`, `[tenantId]`, `[expiresAt]` — Expiry-based cleanup supported
- ✅ Tenant: `[tenantId]`, `[deletedAt]` — Core lookup patterns covered

**Missing Index Risk:**
- ⚠️ `Lead.title` — No index on `title`. Title-based search (even exact match) would full-scan. Low risk at current scale.
- ⚠️ `Company.name` without `tenantId` prefix — The index `(tenantId, name)` is present so this is covered. No standalone `name` index needed.

---

### 1.2 Foreign Keys

| Relationship | FK Defined | On Delete | Status |
|---|---|---|---|
| Tenant → Plan | `planId` → `Plan.id` | Restrict (default) | ✅ |
| Company → Tenant | `tenantId` → `Tenant.id` | CASCADE | ✅ |
| Contact → Tenant | `tenantId` → `Tenant.id` | CASCADE | ✅ |
| Contact → Company | `companyId` → `Company.id` | Restrict (default) | ⚠️ See note |
| Lead → Tenant | `tenantId` → `Tenant.id` | CASCADE | ✅ |
| Lead → Company | `companyId` → `Company.id` | Restrict (default) | ✅ |
| Lead → Contact | `contactId` → `Contact.id` | Restrict (default) | ✅ |
| Lead → User (owner) | `ownerId` → `User.id` | Restrict (default) | ✅ |
| User → Tenant | `tenantId` → `Tenant.id` | Restrict (default) | ✅ |

**Note on Contact → Company FK:**
If a company is soft-deleted via the application, associated contacts are also soft-deleted via application logic in `deleteCompany`. However, at the database level, the FK has no `onDelete: CASCADE` — meaning if a company record were hard-deleted at the DB level (not through the app), contacts would fail the FK constraint. This is acceptable since hard-deletes never happen in the application.

---

### 1.3 Unique Constraints

| Constraint | Definition | Enforced by |
|---|---|---|
| User email per tenant | `@@unique([tenantId, email])` | Schema + DB |
| Candidate email per tenant | `@@unique([tenantId, email])` | Schema + DB |
| Role code per tenant | `@@unique([tenantId, code])` | Schema + DB |
| FeatureFlag key per tenant | `@@unique([tenantId, key])` | Schema + DB |
| Application per job+candidate | `@@unique([tenantId, jobPostingId, candidateId])` | Schema + DB |
| Plan.code | `@unique` | Schema + DB |
| Feature.code | `@unique` | Schema + DB |
| Tenant.tenantId | `@unique` | Schema + DB |
| Tenant.slug | `@unique` | Schema + DB |

**CRM-Specific Uniqueness (enforced at service level, not DB):**
- Company name per tenant: Service-level check in `companyService.create` — **not enforced at DB level**
- Contact email per tenant: Service-level check in `contactService.create` — **not enforced at DB level** (only `@@index([tenantId, email])` exists, not `@@unique`)

**Risk (Medium):**
Contact email uniqueness and company name uniqueness are not enforced at the database constraint level. If two concurrent requests arrive simultaneously, both could pass the service-level uniqueness check and insert duplicates. A proper `@@unique([tenantId, email])` constraint on Contact and `@@unique([tenantId, name])` on Company would provide database-level safety.

---

### 1.4 Soft Delete Patterns

| Model | `deletedAt` Field | Default | Excluded from Queries |
|---|---|---|---|
| Plan | ✅ `DateTime?` | null | ✅ via withTenant() |
| Feature | ✅ `DateTime?` | null | ✅ |
| Tenant | ✅ `DateTime?` | null | ✅ |
| User | ✅ `DateTime?` | null | ✅ |
| Company | ✅ `DateTime?` | null | ✅ |
| Contact | ✅ `DateTime?` | null | ✅ |
| Lead | ✅ `DateTime?` | null | ✅ |
| AuditLog | ✅ `DateTime?` | null | ✅ |
| Session | ❌ None | N/A | Managed via `expiresAt` |

**Verdict: ✅ Soft delete pattern is uniformly implemented.** Session uses expiry instead of soft delete, which is appropriate.

---

## Section 2 — Application

### 2.1 TypeScript Typecheck

**Command:** `npx tsc --noEmit`

| Result | Status |
|---|---|
| Errors | ✅ 0 |
| Output | ✅ Clean (no output = success) |

---

### 2.2 ESLint Lint

**Command:** `npm run lint`

| Result | Count | Files |
|---|---|---|
| Errors | ✅ 0 | — |
| Warnings | ⚠️ 23 | See breakdown below |

**Warning Breakdown (all `@typescript-eslint/no-unused-vars`):**

| File | Warning | CRM-Related? |
|---|---|---|
| `app/api/v1/interviews/route.ts` | unused `request` param | ❌ No (ATS) |
| `app/api/v1/job-postings/route.ts` | unused `request` param | ❌ No (ATS) |
| `app/api/v1/permissions/route.ts` | unused `request` param | ❌ No |
| `app/api/v1/roles/route.ts` | unused `request` param | ❌ No |
| `app/api/v1/sessions/route.ts` | unused `request` param | ❌ No |
| `app/api/v1/tenants/[id]/branding/route.ts` | unused `NextResponse` | ❌ No |
| `app/api/v1/tenants/[id]/route.ts` | unused `NextResponse` | ❌ No |
| `app/api/v1/tenants/[id]/settings/route.ts` | unused `NextResponse` | ❌ No |
| `app/api/v1/users/route.ts` | unused `request` param | ❌ No |
| `components/ats/applications/ApplicationForm.tsx` | unused `ApplicationStatus` | ❌ No (ATS) |
| `components/ats/interviews/InterviewForm.tsx` | unused `InterviewStatus` | ❌ No (ATS) |
| `lib/foundation/repositories/application.repository.ts` | unused `Application` import | ❌ No (ATS) |
| `lib/foundation/repositories/candidate.repository.ts` | unused `Candidate` import | ❌ No (ATS) |
| `lib/foundation/repositories/interview.repository.ts` | unused `Interview` import | ❌ No (ATS) |
| `lib/foundation/repositories/job-posting.repository.ts` | unused `JobPosting` import | ❌ No (ATS) |
| `lib/foundation/repositories/user.repository.ts` | unused `UserModel` import | ❌ No |

**CRM File Warnings: 0**

All 23 warnings are in ATS, admin, or infrastructure files — none in CRM-specific code.

---

### 2.3 Build

**Command:** `npm run build` — Running (result documented in V1_VALIDATION_REPORT.md)

---

## Section 3 — Infrastructure

### 3.1 Environment Variables

**File:** `.env.example` — Verified complete

| Variable | Required | Purpose | Status |
|---|---|---|---|
| `NEXTAUTH_SECRET` | ✅ Required | NextAuth session signing | ✅ Documented |
| `AUTH_SECRET` | ✅ Required | Auth.js secret | ✅ Documented |
| `DATABASE_URL` | ✅ Required | MongoDB connection | ✅ Documented |
| `POSTGRES_DATABASE_URL` | ✅ Required | PostgreSQL connection (CRM) | ✅ Documented |
| `CRON_SECRET` | ✅ Required | Cron job bearer token | ✅ Documented |
| `DOCUMENT_DOWNLOAD_SECRET` | ✅ Required | File signing key | ✅ Documented |
| `THROTTLE_BACKEND` | Optional | `redis` or `memory` | ✅ Documented |
| `UPSTASH_REDIS_REST_URL` | Conditional | Required if `THROTTLE_BACKEND=redis` | ✅ Documented |
| `UPSTASH_REDIS_REST_TOKEN` | Conditional | Redis auth token | ✅ Documented |
| `NEXT_PUBLIC_BASE_URL` | Recommended | App base URL | ✅ Documented |
| `STORAGE_DRIVER` | Optional | `local` or `s3` | ✅ Documented |
| S3 variables | Conditional | Required for S3 storage | ✅ Documented |

**Risk:**
- ⚠️ `SENTRY_DSN` is **not documented** in `.env.example`. Sentry is initialized in `lib/sentry.ts` with `dsn?: string` parameter but the source of the DSN is not wired through environment variables in the current code. Sentry integration is effectively optional/disabled unless manually initialized.
- ⚠️ `NODE_ENV=production` is set in `.env.example` — this is unusual for a `.env.example` file and could cause developers to accidentally run in production mode locally.

---

### 3.2 Docker Configuration

**File:** `Dockerfile`

| Check | Status | Notes |
|---|---|---|
| Multi-stage build | ✅ | 3 stages: `deps`, `builder`, `runner` |
| Node 20 Alpine base | ✅ | Lean production image |
| `NEXT_TELEMETRY_DISABLED=1` | ✅ | No telemetry data sent |
| Production `NODE_ENV` set | ✅ | Set in runner stage |
| Dev dependencies pruned | ✅ | `npm prune --omit=dev` in builder stage |
| Port 3000 exposed | ✅ | Correct |
| Prisma client not regenerated in runner | ⚠️ Risk | Prisma generates client during `npm run build`. If schema changes occur, client must be re-generated before build. |

---

### 3.3 Docker Compose

**File:** `docker-compose.yml`

| Check | Status | Notes |
|---|---|---|
| PostgreSQL 16 service defined | ✅ | `postgres:16` image |
| MongoDB service defined | ✅ | `mongo:6.0` image |
| Health checks on both databases | ✅ | `pg_isready` + `mongosh ping` |
| App depends on both databases | ✅ | `depends_on: [postgres, mongo]` |
| `POSTGRES_DATABASE_URL` wired correctly | ✅ | Points to internal Docker hostname |
| `restart: unless-stopped` | ✅ | Production-appropriate restart policy |
| **`SENTRY_DSN` not in compose** | ⚠️ | Not passed — Sentry disabled in container |
| **No volume persistence for PostgreSQL** | ⚠️ Risk | Postgres data will be lost on container restart. No `volumes:` defined for postgres service. |
| **No volume persistence for MongoDB** | ⚠️ Risk | Same issue — data not persisted across restarts. |
| No resource limits defined | ⚠️ | No `mem_limit` or `cpu_limit` — container can consume all host resources |

**Critical Risk:** Both database services in docker-compose.yml have **no volume mounts** — all data is ephemeral and will be lost when containers are removed or recreated. This is acceptable for local development but **must be addressed before any production or staging deployment with docker-compose**.

---

### 3.4 Sentry Integration

**File:** `lib/sentry.ts`

| Check | Status | Notes |
|---|---|---|
| Sentry package present (`@sentry/node@^8.0.0`) | ✅ | Listed in `package.json` dependencies |
| `initSentry()` function implemented | ✅ | Optional DSN-based initialization |
| Graceful fallback if Sentry not installed | ✅ | `try/catch` with `console.warn` |
| `SENTRY_DSN` environment variable | ❌ | Not wired — no `.env.example` entry, not called anywhere visibly |
| Error capture in routes | ⚠️ | `runApi()` wrapper catches errors but does not report to Sentry |
| Sentry effectively disabled | ⚠️ | `initSentry()` is defined but not called in app bootstrap |

**Risk (Medium):** Sentry is installed and the wrapper exists, but it is never initialized. Production errors will not be captured in Sentry. For a commercial product, this must be wired before launch.

---

## Production Readiness Summary

| Category | Result | Notes |
|---|---|---|
| Database Indexes | ✅ Adequate | All primary patterns covered |
| Foreign Keys | ✅ Good | Cascade on Tenant-level, restrict on cross-entity |
| Unique Constraints | ⚠️ Partial | Contact email + Company name not DB-level constraints |
| Soft Delete Pattern | ✅ Consistent | All CRM + supporting models implemented |
| TypeScript | ✅ Clean | 0 errors |
| ESLint | ✅ 0 errors | 23 warnings in non-CRM files only |
| Build | See validation report | |
| Environment Variables | ✅ Documented | Minor: `SENTRY_DSN` missing, `NODE_ENV` in example |
| Docker Configuration | ⚠️ Dev-only | No volume persistence for databases |
| Docker Compose | ⚠️ Not prod-ready | Volumes required before any real deployment |
| Sentry | ⚠️ Disabled | Package present but not initialized |

---

*Report generated: 2026-06-07*
