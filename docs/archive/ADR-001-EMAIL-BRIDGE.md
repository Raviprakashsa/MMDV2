# ADR-001: Email Resolution Bridge for Multi-Database Multi-Tenancy

## Status
Approved

## Context
In Phase A1/A2 of **MMD V2**, the Identity Access Management (IAM) layer was migrated from legacy MongoDB/Mongoose to PostgreSQL via Prisma. During this migration, active user records were assigned a `tenantId` column to establish strict tenant boundaries. 

However, historical logs (`DataAccessLog`) and export jobs (`ExportJob`) remain stored in the legacy MongoDB database. Neither MongoDB schema contains a `tenantId` field, creating a high-risk data exposure threat where administrators of one tenant can query global access logs or view portability export file URLs belonging to other tenants.

Directly mapping SQL and MongoDB user records using primary keys is **invalid** because:
* PostgreSQL uses 25-character CUID string identifiers.
* MongoDB uses 24-character hexadecimal BSON ObjectIds.
* The MongoDB governance logger `logDataAccess` rejects non-hexadecimal ObjectIds.

## Decision
We will implement an **Email Resolution Bridge** inside the Service layer:
1. Query the PostgreSQL `userRepository.listByTenant(context)` using the requesting `tenantId` context to extract active tenant user records.
2. Resolve unique, normalized emails of those tenant users.
3. Query the legacy MongoDB `User` collection for matching active user documents: `{ email: { $in: tenantEmails }, deletedAt: null }`.
4. Map those MongoDB documents to their corresponding BSON `ObjectId`s.
5. Filter MongoDB repositories `DataAccessLogRepository` and `ExportJobRepository` using the resolved `ObjectId` arrays.

All bridging logic is isolated inside a centralized `UserResolutionService` at the Service boundary. Repositories remain data-access only and receive MongoDB `ObjectId` string arrays only.

## Consequences
### Positive
* **Strict Tenant Scoping**: Prevents cross-tenant data leaks by bounding legacy audits securely to active workspace users.
* **No Database Schema Changes**: Leverages existing columns (`email` is uniquely indexed in both engines), avoiding complex data migrations or structural updates on historical tables.
* **Clean Layer Isolation**: MongoDB repositories remain simple, lightweight, and completely free of Prisma SQL imports, satisfying architectural boundary rules.

### Negative / Trade-offs
* **Database Performance**: Querying data requires a two-step process (resolving emails in PostgreSQL, mapping ObjectIds in MongoDB, then querying the logs/jobs). We mitigate this by utilizing indexes on PostgreSQL `[tenantId, email]` and MongoDB `email` columns, keeping latency to a minimum (< 20ms).
* **Data Synced Assumption**: Relies on user emails being synced and unique across both environments. Because both schemas enforce strict uniqueness constraints and case-insensitive normalization, this is technically highly secure.
