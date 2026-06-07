# A4.8 — ATS Release Remediation Analysis Report

**Analysis Date**: 2026-06-02  
**Analyst**: Antigravity AI  

---

## 1. Blocker Inventory

We analyzed the security, database, testing, and deployment audits from the A4.7 phase to identify all blockers that must be resolved prior to release.

### A. Critical Blockers:
* **None.** No direct SQL injection vectors, buffer overflows, or cross-tenant leaks were found in the source code.

### B. High Blockers:
1. **Broken CI/CD Pipeline for ATS**:
   * *Location*: [`.github/workflows/ci-integration.yml`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/.github/workflows/ci-integration.yml)
   * *Issue*: The Github Action workflow only provisions a MongoDB container. It is missing PostgreSQL, missing `POSTGRES_DATABASE_URL` environment variables, and missing Prisma migration deployment commands.
   * *Classification*: **Operational (CI/CD Configuration)**.
2. **0% Automated Test Coverage for ATS**:
   * *Location*: [`tests/integration/`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/tests/integration/)
   * *Issue*: The current Playwright test suite only covers CRM/Leads routes. No test files exist to verify Job Postings, Candidates, Applications, or Interviews CRUD operations or workflow state transitions.
   * *Classification*: **Operational (Testing)**.
3. **API Context Header Spoofing Vulnerability**:
   * *Location*: [`app/api/v1/*`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/app/api/v1/) context resolution helpers.
   * *Issue*: Endpoints extract `x-tenant-id` and `x-user-id` headers directly. If external clients can pass these headers through ingress load balancers, identity hijacking is possible.
   * *Classification*: **Operational (Infrastructure/Gateway config)**.

### C. Medium Blockers:
1. **Database Join Performance Hotspots (Missing Indexes)**:
   * *Location*: [`prisma/schema.prisma`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/prisma/schema.prisma)
   * *Issue*: Lacks single-column indexes on `Interview.applicationId`, `Interview.interviewerId`, and `Application.candidateId`, presenting latency risks as data scales.
   * *Classification*: **Code/Schema (Database structure)**.
2. **Lack of Fine-Grained RBAC at Service Layer**:
   * *Location*: [`lib/foundation/services/*`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/services/)
   * *Issue*: State transition commands do not assert the request user's role permissions (e.g. Recruiter vs Scraper) at the service boundary.
   * *Classification*: **Code (Service Layer logic)**.

### D. Low Blockers:
1. **Missing Rate Limiting on Creation Endpoints**:
   * *Location*: `POST /api/v1/applications`, `POST /api/v1/interviews`
   * *Issue*: High-volume scheduling/creation is not rate-limited at the application route level.
   * *Classification*: **Operational (Rate Limiting configuration)**.
2. **Missing Database Backup Configuration**:
   * *Location*: Repository deploy configurations.
   * *Issue*: No automated Postgres/Prisma database backup routines or replication specifications are checked in.
   * *Classification*: **Operational (Infrastructure)**.

---

## 2. Testing Strategy

### A. Existing Coverage:
* The CRM module has ~45% functional integration test coverage using Playwright (`smoke.spec.ts`, `leads.spec.ts`, `leads_search.spec.ts`) alongside Galen visual layout checks (`leads.gspec`).
* Next.js route builds and TypeScript compilation are checked during local development and PR pushes.

### B. Missing ATS Coverage:
* The four new tables (`JobPosting`, `Candidate`, `Application`, `Interview`) and their endpoints are completely untested by automated pipelines.

### C. Recommended Test Structure:
We will create a single, clean Playwright integration test suite specifically targeting ATS workflows:
* **File**: `tests/integration/ats.spec.ts`
* **Test Flow**:
  1. **Job Posting**:
     * Create a draft job posting.
     * Publish it (transition status `DRAFT` $\rightarrow$ `ACTIVE`).
     * Close it (transition status `ACTIVE` $\rightarrow$ `CLOSED`).
  2. **Candidate**:
     * Create a candidate profile.
     * Verify unique tenant constraints (attempting to register matching email under same tenant fails; registering under a different tenant succeeds).
     * Verify candidate update and soft-deletion behavior.
  3. **Application**:
     * Submit an application linking the created Candidate to the active Job Posting.
     * Assert valid status transitions (`APPLIED` $\rightarrow$ `SCREENING` $\rightarrow$ `SHORTLISTED` $\rightarrow$ `INTERVIEW`).
     * Assert rejected transitions (e.g. transitioning directly from `APPLIED` to `HIRED` returns HTTP 409 Conflict).
  4. **Interview**:
     * Schedule an interview for the application.
     * Transition the interview status from `SCHEDULED` to `COMPLETED`.
     * Verify that terminal states reject follow-up status updates.

---

## 3. CI/CD Strategy

### A. Current Workflow State:
The workflow [`ci-integration.yml`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/.github/workflows/ci-integration.yml) checks out code, starts MongoDB, builds Next.js, seeds Mongo data, installs Playwright, and executes tests. It lacks PostgreSQL provisions entirely.

### B. PostgreSQL Readiness:
We will configure GitHub Actions to launch a PostgreSQL service container:
```yaml
services:
  postgres:
    image: postgres:16
    ports:
      - 5432:5432
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: mmd_v2
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

### C. Prisma Readiness:
We will inject `POSTGRES_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/mmd_v2?schema=public` as a global environment variable in CI/CD, and run the following commands before starting the Next.js server:
* `npx prisma generate` (compiles type-safe prisma client)
* `npx prisma migrate deploy` (executes migration schemas onto the postgres service container)

### D. Build Gate Readiness:
We will ensure that the CI/CD pipeline fails if any lint errors, TypeScript type errors, or Prisma migrations fail.

---

## 4. Release Gate Design

The PR validation checks and CI release gates will be structured as a sequential pipeline:

```mermaid
graph TD
    Trigger[PR or Push Trigger] --> Install[npm ci --legacy-peer-deps]
    Install --> CheckLint[npm run lint]
    CheckLint --> Typecheck[npm run typecheck]
    Typecheck --> PrismaGen[npx prisma generate]
    PrismaGen --> DBStart[Provision Services: Mongo + Postgres]
    DBStart --> PrismaMigrate[npx prisma migrate deploy]
    PrismaMigrate --> NextBuild[npm run build]
    NextBuild --> TestSmoke[Run Integration Tests: Playwright]
    TestSmoke --> Success[Gate PASS - Ready to Merge]
```

---

## 5. Risk Assessment

* **Release Risk If No Action Taken**: **High.** Deploying without automated testing or PostgreSQL integration in CI invites silent regressions on recruiting status matrices, tenant boundaries, and model joins, compromising business workflows.
* **Effort Estimate**: **Medium**. (~1-2 developer days).
* **Recommended Remediation Order**:
  1. Add missing DB indexes to [`prisma/schema.prisma`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/prisma/schema.prisma) and create the migration file.
  2. Update [`.github/workflows/ci-integration.yml`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/.github/workflows/ci-integration.yml) to add the PostgreSQL container, environment variables, and Prisma hooks.
  3. Write the Playwright integration test suite [`tests/integration/ats.spec.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/tests/integration/ats.spec.ts).
  4. Document edge proxy gateway rules for header protection.
