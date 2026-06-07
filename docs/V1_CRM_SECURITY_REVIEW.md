# V1 CRM — Security Review Report

**Date:** 2026-06-07  
**Scope:** CRM Module — Security Architecture Review  
**Layers Audited:** Repository, Service, API Route, UI Action  
**Standard:** RC-3 Compliance Verification  

---

## 1. Tenant Isolation

### 1.1 Repository Layer — ✅ SECURE

**Implementation:** `TenantAwareRepository` base class (`lib/foundation/repositories/tenant-aware.repository.ts`)

```
protected requireTenant(context: TenantContext): string
protected withTenant<T>(context: TenantContext, where: T): T
  → always appends: { tenantId, deletedAt: null }
```

| Control | Status | Evidence |
|---|---|---|
| All CRM repositories extend `TenantAwareRepository` | ✅ | `CompanyRepository`, `LeadRepository`, `ContactRepository` verified |
| `requireTenant()` throws `ForbiddenError` if tenantId absent | ✅ | Line 17-20 in `tenant-aware.repository.ts` |
| `withTenant()` enforces `deletedAt: null` at query level | ✅ | Line 28 in `tenant-aware.repository.ts` |
| Create operations inject tenantId at insert | ✅ | All `create()` methods call `requireTenant()` and include `tenantId` in `data` |
| Update operations scope `where` clause by tenantId | ✅ | `updateById()` uses `withTenant(context, { id })` — cross-tenant update impossible |
| Delete operations scope `where` clause by tenantId | ✅ | `softDelete()` uses `withTenant(context, { id })` — cross-tenant delete impossible |

**Verdict: Tenant isolation is structurally enforced at the data layer. No cross-tenant data access is possible through normal application paths.**

---

### 1.2 Service Layer — ✅ SECURE

**Implementation:** `lib/foundation/services/*.service.ts`

| Control | Status | Evidence |
|---|---|---|
| Every service method validates `ctx.tenantId` before calling repository | ✅ | `if (!ctx || !ctx.tenantId) throw new Error(...)` in every method |
| Cross-entity relationships validated within same tenant context | ✅ | `companyRepository.findById(ctx, ...)` — uses caller's context, not global lookup |
| Lead FSM transitions enforced in `changeStatus()` | ✅ | `AllowedTransitions` map in `lead.service.ts` |
| Conflict errors thrown for uniqueness violations | ✅ | `ConflictError` thrown in company name + contact email uniqueness checks |

---

### 1.3 API Route Layer — ✅ SECURE

**Implementation:** `app/api/v1/*/route.ts`, `lib/core/route-utils.ts`, `lib/core/tenant-context.ts`

| Control | Status | Evidence |
|---|---|---|
| `getAuthenticatedTenantContext()` called on every API handler | ✅ | All CRM routes use `await getAuthenticatedTenantContext()` |
| Unauthenticated requests throw `ForbiddenError(401)` | ✅ | `tenant-context.ts` line 16-18 |
| Missing tenantId throws `ForbiddenError(403)` | ✅ | `tenant-context.ts` line 23-25 |
| `runApi()` wrapper catches and maps `AppError` to correct HTTP status | ✅ | `route-utils.ts` handles `AppError`, `ZodError`, generic 500 |
| Input validated with Zod before service is called | ✅ | `createSchema.parse(body)` + `querySchema.parse(...)` in all routes |
| No raw SQL / template literals used | ✅ | All queries go through Prisma ORM |

**Gap Identified:**
- **No DELETE endpoint for leads** — `DELETE /api/v1/leads/:id` does not exist. Lead deletion is only accessible via the UI server action `deleteLead`. This is not a security issue but an API completeness gap.
- **No DELETE endpoint for contacts** — Same observation.

---

### 1.4 UI Action Layer — ✅ SECURE

**Implementation:** `lib/actions/module3-company.ts`, `module9-leads.ts`, `module15-contacts.ts`

| Control | Status | Evidence |
|---|---|---|
| All actions use `createProtectedAction()` | ✅ | Verified in all 3 action files |
| `createProtectedAction` enforces session existence | ✅ | `action-client.ts` line 79: `if (!session?.user) throw AppError(401)` |
| `createProtectedAction` enforces user is active | ✅ | `action-client.ts` line 83: `if (!session.user.isActive) throw AppError(403)` |
| `tenantId` derived from session (not user input) | ✅ | `ctx = { tenantId: session.user.tenantId! }` — cannot be spoofed |
| Errors sanitized in production | ✅ | `action-client.ts` line 58: generic "Operation failed" in production |

---

## 2. Soft Deletes

| Control | Status | Notes |
|---|---|---|
| All CRM models have `deletedAt DateTime?` field | ✅ | Verified in `schema.prisma` for Company, Lead, Contact |
| `markDeleted()` helper in `BaseRepository` | ✅ | Sets `{ deletedAt: new Date() }` |
| Soft-deleted records excluded from ALL queries | ✅ | `withTenant()` always appends `deletedAt: null` |
| Soft-deleted records cannot be updated | ✅ | Update uses `withTenant()` in where clause — `deletedAt: null` prevents matching |
| Hard delete not implemented | ✅ | No `delete()` or `deleteMany()` used in any CRM repository |
| Audit log of deletions | ⚠️ Not present | `AuditLog` table exists in schema but is not written on CRM soft deletes |

**Risk (Low):** Soft deletes happen without an audit trail entry. `AuditLog` table exists in the schema but is not wired to CRM delete operations. This is a V2 enhancement, acceptable for V1.

---

## 3. Authorization Boundaries

### RBAC Framework

| Control | Status | Notes |
|---|---|---|
| Role model exists in schema | ✅ | `Role`, `Permission`, `RolePermission` tables defined |
| Per-tenant role system | ✅ | `Role.tenantId` scopes roles per tenant |
| Permission codes defined | ✅ | `Permission.code` + `module` + `action` fields |
| RBAC enforcement on CRM server actions | ⚠️ Not enforced | CRM actions only check auth + active status; no per-module permission check |
| RBAC enforcement on CRM API routes | ⚠️ Not enforced | `getAuthenticatedTenantContext()` only validates session, not permissions |

**Risk (Medium):** Any authenticated user of a tenant can perform all CRM operations (create, update, delete) regardless of their role. The RBAC infrastructure exists in the schema but has not been wired into CRM server actions or API routes.

This is a known **V1 architectural limitation** — auth boundary is tenant-level, not role-level within the CRM. This must be addressed in V2 before commercial deployment.

---

## 4. SQL Injection Protection

| Control | Status | Evidence |
|---|---|---|
| Prisma ORM used exclusively | ✅ | No raw SQL in any CRM repository |
| No `prisma.$queryRaw` or `prisma.$executeRaw` | ✅ | Searched entire repository layer — not present |
| User input never concatenated into queries | ✅ | All input passes through Prisma's parameterized query builder |
| Filter values passed as Prisma `where` object properties | ✅ | `{ name: filters.name }` pattern used — never string interpolation |
| Zod validation pre-sanitizes input types | ✅ | String, email, enum validators applied before data reaches repository |

**Verdict: SQL injection is not possible through any CRM code path. Prisma's query builder provides structural protection.**

---

## 5. RC-3 Compliance Verification

RC-3 is treated as the internal release compliance standard, covering:

### RC-3.1 Authentication Required
- ✅ All CRM actions behind `createProtectedAction`
- ✅ All CRM API routes behind `getAuthenticatedTenantContext`

### RC-3.2 Tenant Isolation
- ✅ Enforced structurally at repository layer via `TenantAwareRepository`

### RC-3.3 Input Validation
- ✅ Zod schemas applied at all entry points (actions + API routes)

### RC-3.4 Error Handling & Information Leakage Prevention
- ✅ Production mode returns generic error messages
- ✅ `runApi()` wrapper prevents stack traces from reaching client
- ⚠️ Server action errors may include entity-specific messages (e.g., "Company not found") — not a leakage risk but worth documenting

### RC-3.5 Soft Delete Pattern
- ✅ All CRM entities use `deletedAt`-based soft delete
- ✅ Deleted records excluded from all queries

### RC-3.6 Audit Logging
- ⚠️ `AuditLog` table defined but not populated on CRM CRUD operations
- This is a V1 scope gap — must be implemented in V2

### RC-3.7 Rate Limiting / Throttling
- ⚠️ No per-action rate limiting observed on CRM actions
- Throttle backend is configurable via `THROTTLE_BACKEND` env var
- Not verified to be active on CRM endpoints specifically

---

## Security Review Summary

### ✅ Secure Controls (No Action Required)
- Tenant isolation: structurally enforced at repository level
- SQL injection: Prisma ORM provides complete protection
- Authentication: `createProtectedAction` + `getAuthenticatedTenantContext` enforced
- Soft deletes: consistently implemented
- Session-derived tenant context: cannot be spoofed by user input
- Zod input validation: present at all entry points
- Error sanitization in production: implemented

### ⚠️ Risks (Non-Blocking for V1, Must Address for V2)

| # | Risk | Severity | Impact |
|---|---|---|---|
| R-1 | RBAC not enforced on CRM operations | Medium | Any tenant user can perform any CRM CRUD |
| R-2 | Audit log not written on CRM soft deletes | Low | No tamper-evident log of deletions |
| R-3 | Lead FSM bypassed by UI action | Medium | Invalid pipeline transitions possible via UI |
| R-4 | No rate limiting verified on CRM actions | Low | Potential for automated abuse |

### ❌ No Critical Security Defects Found

No authentication bypass, SQL injection vector, or cross-tenant data access path was identified.

---

*Report generated: 2026-06-07*
