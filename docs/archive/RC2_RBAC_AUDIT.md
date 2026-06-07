# RC-2 — RBAC & Authorization Audit

**Audit Date**: 2026-06-02  
**Auditor**: Antigravity AI (Independent RC-2 Verification)  
**Scope**: Role-based access control enforcement across ATS modules

---

## 1. RBAC Infrastructure

### 1.1 RBAC Middleware

**File**: [`lib/foundation/auth/rbac-middleware.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/auth/rbac-middleware.ts)

The platform provides an RBAC middleware with three core functions:

```typescript
export function hasPermission(context: RbacContext, permission: PermissionCode): boolean
export function requirePermission(context: RbacContext, permission: PermissionCode): void
export function requireTenantAccess(context: RbacContext, tenantId: string): void
```

- `RbacContext` requires: `tenantId`, `userId`, `roleCode`, `permissions[]`
- `requirePermission()` throws `ForbiddenError` on missing permission
- `requireTenantAccess()` throws `ForbiddenError` on cross-tenant access

**Verdict**: ✅ **Infrastructure exists and is architecturally sound.**

---

### 1.2 Edge Middleware Role Enforcement

**File**: [`proxy.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/proxy.ts) (lines 59–81)

The edge middleware enforces role-based access on UI routes:

| Route Pattern | Required Roles |
|---|---|
| `/dashboard/users/*` | `SUPER_ADMIN` only |
| `/dashboard/admin/*` | `ADMIN` or `SUPER_ADMIN` |
| `/admin/*` | `ADMIN` or `SUPER_ADMIN` |
| `/coordinator/*` | `ADMIN`, `SUPER_ADMIN`, or `COORDINATOR` |
| `/scraping/*` | `ADMIN`, `SUPER_ADMIN`, or `SCRAPER` |
| `/ats/*` | Any authenticated user (via AUTHENTICATED pattern) |

**Verdict**: ✅ **Edge-level role gating is enforced for admin-tier routes.**

---

## 2. ATS Service-Layer Authorization

### 2.1 Tenant Context Enforcement

Every ATS service method validates tenant context before executing:

**Job Posting Service** — [`lib/foundation/services/job-posting.service.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/services/job-posting.service.ts)
```typescript
if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')
```

**Candidate Service** — [`lib/foundation/services/candidate.service.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/services/candidate.service.ts)
```typescript
if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')
```

**Application Service** — [`lib/foundation/services/application.service.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/services/application.service.ts)
```typescript
if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')
```

**Interview Service** — [`lib/foundation/services/interview.service.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/services/interview.service.ts)
```typescript
if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')
```

**Verdict**: ✅ All 4 ATS services enforce tenant context on every method.

---

### 2.2 Cross-Entity Ownership Validation

The Application and Interview services perform cross-entity ownership checks:

**Application creation** (`application.service.ts` lines 27–33):
```typescript
const candidate = await candidateRepository.findById(ctx, input.candidateId)
if (!candidate) throw new NotFoundError('Candidate not found')
if (candidate.tenantId !== ctx.tenantId) throw new ForbiddenError('Candidate tenant mismatch')

const jobPosting = await jobPostingRepository.findById(ctx, input.jobPostingId)
if (!jobPosting) throw new NotFoundError('Job posting not found')
if (jobPosting.tenantId !== ctx.tenantId) throw new ForbiddenError('Job posting tenant mismatch')
```

**Interview creation** (`interview.service.ts` lines 23–29):
```typescript
const application = await applicationRepository.findById(ctx, input.applicationId)
if (!application) throw new NotFoundError('Application not found')
if (application.tenantId !== ctx.tenantId) throw new ForbiddenError('Application tenant mismatch')

const interviewer = await userRepository.findById(ctx, input.interviewerId)
if (!interviewer) throw new NotFoundError('Interviewer not found')
if (interviewer.tenantId !== ctx.tenantId) throw new ForbiddenError('Interviewer tenant mismatch')
```

**Verdict**: ✅ Cross-entity ownership is validated at the service layer.

---

## 3. Status Transition Authorization

### 3.1 Application Status Machine

**File**: [`lib/foundation/services/application.service.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/services/application.service.ts) (lines 9–18)

```
APPLIED    → [SCREENING, WITHDRAWN]
SCREENING  → [SHORTLISTED, REJECTED, WITHDRAWN]
SHORTLISTED→ [INTERVIEW, REJECTED, WITHDRAWN]
INTERVIEW  → [OFFERED, REJECTED, WITHDRAWN]
OFFERED    → [HIRED, REJECTED, WITHDRAWN]
HIRED      → [] (terminal)
REJECTED   → [] (terminal)
WITHDRAWN  → [] (terminal)
```

Invalid transitions throw `ConflictError` (HTTP 409).

**Verified by test**: `ats.spec.ts:222` — "Applications status flow and invalid transitions" ✅ PASSED

---

### 3.2 Interview Status Machine

**File**: [`lib/foundation/services/interview.service.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/services/interview.service.ts) (lines 9–14)

```
SCHEDULED  → [COMPLETED, CANCELLED, NO_SHOW]
COMPLETED  → [] (terminal)
CANCELLED  → [] (terminal)
NO_SHOW    → [] (terminal)
```

Invalid transitions throw `ConflictError` (HTTP 409).

**Verified by test**: `ats.spec.ts:342` — "Interviews lifecycle & invalid transitions" ✅ PASSED

---

## 4. Findings

> [!WARNING]
> **Finding RBAC-1**: Fine-Grained Role Checks Not Enforced at ATS Service Layer
>
> **Description**: The ATS service methods do not check the user's role (e.g., `RECRUITER`, `COORDINATOR`, `SCRAPER`, `ADMIN`) before executing operations. Any authenticated user with a valid tenant context can create, read, update, or delete ATS records.
>
> **Severity**: Medium
>
> **Current Mitigation**: The edge middleware restricts route access by role for admin-tier routes. ATS routes (`/ats/*`) are accessible to all authenticated users, which aligns with the current product design where all tenant members can manage ATS data.
>
> **Recommendation**: When role-based restrictions are needed (e.g., only HR managers can approve offers), implement `requirePermission()` calls in the service layer using the existing RBAC middleware infrastructure.

> [!NOTE]
> **Finding RBAC-2**: RBAC Infrastructure is Production-Ready
>
> The `rbac-middleware.ts` module, `Permission` model, `RolePermission` model, and `Role` model are all present and functional. The Prisma schema supports fine-grained permission assignments. The infrastructure is ready for activation when business rules require it.

---

## 5. Verdict

```text
RBAC AUDIT: CONDITIONAL PASS
```

| Area | Verdict |
|---|---|
| Tenant Context Enforcement | ✅ PASS |
| Cross-Entity Ownership Validation | ✅ PASS |
| Status Transition Guards | ✅ PASS |
| Edge Middleware Role Gating | ✅ PASS |
| Fine-Grained ATS RBAC | ⚠️ NOT YET ACTIVATED (infrastructure ready) |
| RBAC Infrastructure | ✅ PASS |
