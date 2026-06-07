# A4 Step 4 API Blocker Report

**Date**: 2026-06-01  
**Status**: **BLOCKED**

This report details the architectural blockers preventing the implementation of the **Applicant Tracking System (ATS) API Layer (A4 Step 4)** under MMD V2's strict layering rules.

---

## 1. Description of Blocker

The planned Next.js App Router endpoints require the following `DELETE` operations:
* `DELETE /api/v1/job-postings/{id}`
* `DELETE /api/v1/candidates/{id}`

Under MMD V2's strict layering rule, API routes **must remain thin** and are **strictly forbidden** from importing repositories or direct database layers:
```text
UI ➔ API Route ➔ Service ➔ Repository ➔ Prisma/DB
```

However, the approved services **do not expose** any deletion or deactivation methods:
1. `JobPostingService` exposes only: `create`, `update`, `get`, `list`, `close`, `reopen`.
2. `CandidateService` exposes only: `create`, `update`, `get`, `list`.

Because the API routes cannot access the repositories directly, they cannot execute candidate or job posting soft-deletes. Consequently, the API Layer is **BLOCKED**.

---

## 2. Affected Route Files

The following route files cannot be implemented or compiled safely under the current service layer contracts:
1. **[`app/api/v1/job-postings/[id]/route.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/app/api/v1/job-postings/%5Bid%5D/route.ts)**: Cannot implement the `DELETE` handler.
2. **[`app/api/v1/candidates/[id]/route.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/app/api/v1/candidates/%5Bid%5D/route.ts)**: Cannot implement the `DELETE` handler.

---

## 3. Required Service Remediation

To unblock the API layer and maintain strict architectural boundaries, the Service Layer must be amended to expose the following two deletion methods:

### A. Candidate Service Remediation
Add a standard, thin `delete(ctx, id)` method to [`candidate.service.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/services/candidate.service.ts):
```typescript
async delete(ctx: TenantContext, id: string) {
  if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')

  const existing = await candidateRepository.findById(ctx, id)
  if (!existing) throw new NotFoundError('Candidate not found')

  return candidateRepository.softDeleteById(ctx, id)
}
```

### B. Job Posting Service Remediation
Add a standard, thin `delete(ctx, id)` method to [`job-posting.service.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/foundation/services/job-posting.service.ts):
```typescript
async delete(ctx: TenantContext, id: string) {
  if (!ctx || !ctx.tenantId) throw new Error('Tenant context required')

  const existing = await jobPostingRepository.findById(ctx, id)
  if (!existing) throw new NotFoundError('Job posting not found')

  return jobPostingRepository.softDeleteById(ctx, id)
}
```

---

## 4. Unblocking Conditions

Once these two methods are officially approved and added to the service files, the contract mismatch will be fully resolved. The API Layer will transition to `A4 Step 4 Ready` and route implementation can immediately begin.
