# Repository & Service Segregation Design Decision — A3.5

Date: 2026-06-01
Status: APPROVED (with Architecture Amendment)

This document formalizes the architectural separation of concerns for the Phase A3.5 Privacy and Governance remediation. In compliance with strict layering rules, all cross-database bridging and email-to-ObjectId resolution logic is isolated inside a new Service layer component, keeping the Repository layer purely focused on single-database queries.

---

## 1. Architectural Layout & Design Pattern

To prevent database coupling at the repository level, we will employ a decoupled bridging pattern:

```text
UI (Admin Dashboard)
 ↓ [API Client Fetch]
API Route Handler (/api/v1/privacy/*)
 ↓ [Resolves Context Headers]
Privacy Services (DataAccessLogService / ExportJobService)
 ↓ [Calls resolution]
UserResolutionService ➔ [Queries PostgreSQL via UserRepository]
                     ➔ [Queries MongoDB via Mongoose User model]
                     ➔ [Returns scoped MongoDB ObjectIds]
Privacy Services
 ↓ [Passes ObjectIds]
MongoDB Repositories (DataAccessLogRepository / ExportJobRepository)
 ↓ [Executes Mongoose Query]
MongoDB / Mongoose
```

---

## 2. Component Design Specifications

### A. Repositories (Data-Access Only)
The repositories `DataAccessLogRepository` and `ExportJobRepository` are strictly bounded:
* **No Prisma access**: They only interact with the Mongoose database connection and models.
* **No User Resolution logic**: They do not look up emails, user names, or tenant associations.
* **Interface Contract**: They accept raw arrays of 24-character hexadecimal MongoDB `ObjectId` strings.

#### DataAccessLogRepository Contract
* **File**: `lib/foundation/repositories/data-access-log.repository.ts`
* **Core Methods**:
  * `listByUsers(userIds: string[], limit: number)`: Queries `DataAccessLog` where `userId` is in `userIds`, returning formatted log payloads.
  * `createLog(userId: string, entity: string, entityId: string, action: string)`: Creates a log record in MongoDB.

#### ExportJobRepository Contract
* **File**: `lib/foundation/repositories/export-job.repository.ts`
* **Core Methods**:
  * `listByUsers(userIds: string[], limit: number)`: Queries `ExportJob` where `requestedBy` is in `userIds` (populating requested user name & email from MongoDB), returning formatted GDPR export items.

---

### B. UserResolutionService (The Bridge Service)
A new service is introduced to bridge the PostgreSQL IAM tables with the legacy MongoDB database using consistent email keys.
* **File**: `lib/foundation/services/user-resolution.service.ts`
* **Core Method**:
  * `resolveMongoUserIds(context: TenantContext): Promise<string[]>`:
    1. Calls `userRepository.listByTenant(context)` to retrieve active PostgreSQL users for the tenant.
    2. Maps users to their unique email addresses array.
    3. Connects to MongoDB via `connectDB()`.
    4. Queries MongoDB `User` model: `User.find({ email: { $in: emails }, deletedAt: null })` to extract the corresponding MongoDB BSON `ObjectId`s.
    5. Returns an array of string-serialized MongoDB user IDs.

---

### C. Privacy Services (Orchestrators)
The Privacy services (`DataAccessLogService` and `ExportJobService`) act as the boundary coordinators:
* They receive the incoming `TenantContext` from route handlers.
* They call `UserResolutionService.resolveMongoUserIds(context)` to securely fetch the current tenant's legacy user ObjectIds.
* They invoke the repositories (`DataAccessLogRepository.listByUsers(mongoUserIds)` and `ExportJobRepository.listByUsers(mongoUserIds)`) to retrieve scoped data.

---

## 3. Advantages of This Segregation

1. **Clear Segregation**: Repositories remain lightweight and focus entirely on single-table/collection CRUD operations.
2. **Prevented Layer Violations**: No Prisma instance or repository wiring is leaked into MongoDB repositories, keeping Graphify extraction graphs completely clean of cross-ORM lines.
3. **Optimized Testing**: Each repository and service can be isolated and mocked independently during unit and integration test runs.
4. **Guaranteed Multi-Tenant Isolation**: The bridge is completely enclosed inside the service layer, preventing any developers from accidentally invoking un-scoped global database searches in the presentation layers.
