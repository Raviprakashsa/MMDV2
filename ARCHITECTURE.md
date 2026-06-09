# MMD Recruit CRM — System Architecture

This document describes the high-level architecture and structure of the **MMD Recruit CRM** platform.

---

## 1. Modular Monolith Pattern
The codebase is organized as a clean, layered modular monolith:
* `/app`: The Delivery Layer containing layouts, routing, views, and REST API endpoints.
* `/components`: Reusable frontend UI components and modular design elements.
* `/lib`: Domain logic, core services, database connections, and helper actions.
* `/prisma`: Database schema definitions, migrations, and PostgreSQL seeding scripts.
* `/styles` & `/types`: Global styling and TypeScript declarations.
* `/tests`: End-to-end (E2E), integration, and visual regression test suites.

---

## 2. Layered Architecture
```
┌─────────────────────────────────────────────────────────┐
│                     Delivery Layer                      │
│      (App pages, REST endpoints, Server Actions)        │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│                  Domain Service Layer                   │
│           (Business logic & RBAC gatechecks)            │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│                    Persistence Layer                    │
│   (Prisma ORM for PostgreSQL | Mongoose for MongoDB)    │
└─────────────────────────────────────────────────────────┘
```

### 2.1. Delivery Layer (`app/` & `lib/actions/`)
- **Pages & Routes**: Next.js App Router renders pages, layout wrappers, and public career sites (`app/apply/`).
- **APIs (`app/api/`)**: Serves background triggers (cron jobs), upload endpoints, and integrations.
- **Server Actions (`lib/actions/`)**: Encapsulates client-invoked mutations securely behind server boundaries.

### 2.2. Domain Service Layer (`lib/services/` & `lib/foundation/services/`)
- Encapsulates target business rules (e.g. Applicant Tracking System and Client Relationship Management operations).
- Executes granular permission checks using Role-Based Access Control (RBAC).

### 2.3. Persistence Layer (`lib/db/` & `prisma/`)
- **PostgreSQL (relational database)**: Serves as the source of truth for structural models (Users, Tenants, Roles, Permissions, Invoices) via Prisma ORM.
- **MongoDB (document database)**: Stores unstructured/semi-structured operational data (Candidates, Requirements, Activity Logs, Leads) via Mongoose.

---

## 3. Security & Multitenancy

### 3.1. Tenant Isolation
Every query to the PostgreSQL or MongoDB database requires filtering on a valid `tenantId`. The application enforces strict data boundaries between corporate workspaces:
- Relational tables include a `tenantId` field validated on write.
- MongoDB collections partition document search boundaries using the tenant context.

### 3.2. Role-Based Access Control (RBAC)
The platform Normalizes users into 5 distinct roles:
1. **`SUPER_ADMIN`**: Full multi-tenant configuration, identity control, and diagnostics.
2. **`ADMIN`**: Full single-tenant administration. Cannot alter multi-tenant parameters.
3. **`COORDINATOR`**: Operations lead. Full read/write on CRM and ATS modules.
4. **`RECRUITER`**: Focuses on ATS candidates, jobs, and workflows; has read-only access to CRM.
5. **`SCRAPER`**: Automation integration profile with read-only access to command centers.

### 3.3. Routing Security (`proxy.ts`)
The `proxy.ts` file acts as the platform's reference routing gate. It intercepts incoming requests, validates NextAuth session tokens and RBAC credentials, and redirects unauthorized traffic.
