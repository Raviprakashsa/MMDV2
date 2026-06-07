# V1 — RBAC Remediation Report

**Date:** 2026-06-07  
**Blocker:** B-2 (RBAC not enforced on CRM operations)  
**Status:** ✅ REMEDIATED  

---

## 1. Problem Statement

Any authenticated tenant user — regardless of role — could perform any CRM operation (create, update, delete companies, leads, contacts). The RBAC infrastructure (Role, Permission tables) existed in the schema but was not wired into CRM service methods.

---

## 2. Design Decisions

### Service Layer as Primary Enforcement Boundary

Per the approved V1.3A implementation directive: **the Service Layer is the primary RBAC enforcement boundary**. This means:

- Permissions are checked inside each CRM service method, before any database operation
- Action handlers (UI/API) do not duplicate RBAC logic — they only build the `TenantContext` and call the service
- If a request reaches the service without sufficient permissions, it is rejected with `ForbiddenError (403)` regardless of the call origin (UI action, API route, or any other path)

This architecture ensures that no future code path can bypass CRM authorization — the service is the gate.

### Role-Based Matrix (not DB-Lookup Based)

Rather than querying the PostgreSQL `Role`/`Permission` tables per request (which would add a DB round-trip to every CRM operation), permissions are resolved via a **static compile-time matrix** in `lib/core/crm-permissions.ts`. The user's role (`session.user.role`) is embedded in the JWT at login time.

This trades configurability for performance. For V2, the matrix can be replaced with a DB-backed RBAC service if per-tenant custom permissions are required.

---

## 3. Files Created / Modified

| File | Change |
|---|---|
| `lib/core/crm-permissions.ts` | **[NEW]** Permission matrix and `requireCrmPermission()` / `hasCrmPermission()` helpers |
| `lib/foundation/repositories/tenant-aware.repository.ts` | Extended `TenantContext` to add optional `userRole?: string` |
| `lib/core/tenant-context.ts` | `getAuthenticatedTenantContext()` now extracts `userRole` from session |
| `lib/foundation/services/company.service.ts` | Full rewrite — `requireCrmPermission()` added to every method |
| `lib/foundation/services/lead.service.ts` | `requireCrmPermission()` added to every method |
| `lib/foundation/services/contact.service.ts` | Full rewrite — `requireCrmPermission()` added to every method |
| `lib/actions/module3-company.ts` | All `ctx` objects now include `userRole` from session |
| `lib/actions/module9-leads.ts` | All `ctx` objects now include `userRole` from session |
| `lib/actions/module15-contacts.ts` | All `ctx` objects now include `userRole` from session |

---

## 4. Permission Matrix

```typescript
// lib/core/crm-permissions.ts
const CRM_PERMISSION_MATRIX = {
  SUPER_ADMIN: ['crm:read', 'crm:create', 'crm:update', 'crm:delete'],
  ADMIN:       ['crm:read', 'crm:create', 'crm:update', 'crm:delete'],
  COORDINATOR: ['crm:read', 'crm:create', 'crm:update', 'crm:delete'],
  RECRUITER:   ['crm:read'],
  SCRAPER:     [],
}
```

### Permission Matrix Table

| Role | crm:read | crm:create | crm:update | crm:delete |
|---|---|---|---|---|
| SUPER_ADMIN | ✅ | ✅ | ✅ | ✅ |
| ADMIN | ✅ | ✅ | ✅ | ✅ |
| COORDINATOR | ✅ | ✅ | ✅ | ✅ |
| RECRUITER | ✅ | ❌ | ❌ | ❌ |
| SCRAPER | ❌ | ❌ | ❌ | ❌ |

**Note on COORDINATOR:** The V1.3A specification described a "Manager" role. The existing system uses `COORDINATOR` as the equivalent mid-tier role. COORDINATOR is granted full CRM CRUD access because internal company update operations cascade contact deactivations and re-creations — restricting delete at COORDINATOR level would break the company update workflow without a more complex refactor. This is documented as a V2 enhancement item.

---

## 5. Enforcement Points

| CRM Operation | Service Method | Permission Required |
|---|---|---|
| List companies | `companyService.list()` | `crm:read` |
| Get company by ID | `companyService.get()` | `crm:read` |
| Create company | `companyService.create()` | `crm:create` |
| Update company | `companyService.update()` | `crm:update` |
| Delete company | `companyService.deactivate()` | `crm:delete` |
| List leads | `leadService.list()` | `crm:read` |
| Get lead by ID | `leadService.get()` | `crm:read` |
| Create lead | `leadService.create()` | `crm:create` |
| Update lead | `leadService.update()` | `crm:update` |
| Update lead status | `leadService.updateStatusWithMeta()` | `crm:update` |
| Change lead status | `leadService.changeStatus()` | `crm:update` |
| Delete lead | `leadService.deactivate()` | `crm:delete` |
| List contacts | `contactService.list()` | `crm:read` |
| Get contact by ID | `contactService.get()` | `crm:read` |
| Create contact | `contactService.create()` | `crm:create` |
| Update contact | `contactService.update()` | `crm:update` |
| Delete contact | `contactService.deactivate()` | `crm:delete` |

---

## 6. Data Flow

```
UI Action / API Route
    │
    ▼
createProtectedAction() / getAuthenticatedTenantContext()
    │ builds ctx = { tenantId, userId, userRole }
    ▼
CRM Service Method
    │ requireCrmPermission(ctx.userRole, 'crm:X')
    │ throws ForbiddenError(403) if insufficient
    ▼
Repository (Prisma)
    │ withTenant() → tenantId + deletedAt: null
    ▼
PostgreSQL
```

---

## 7. Validation Results

- **TypeScript:** See `V1_RELEASE_BLOCKER_VALIDATION.md`
- **Lint:** See `V1_RELEASE_BLOCKER_VALIDATION.md`
- **Build:** See `V1_RELEASE_BLOCKER_VALIDATION.md`

### Code-Level Verification
- RECRUITER calling `createCompanyAction` → `companyService.create()` → `requireCrmPermission('RECRUITER', 'crm:create')` → throws `ForbiddenError('Role RECRUITER does not have permission crm:create')`
- SCRAPER calling any CRM action → `requireCrmPermission('SCRAPER', 'crm:read')` → throws `ForbiddenError`
- COORDINATOR, ADMIN, SUPER_ADMIN → all CRM operations permitted ✅

---

*Report generated: 2026-06-07*
