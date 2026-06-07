# A4.6 — ATS Security Review Report

**Audit Date**: 2026-06-02  
**Auditor**: Antigravity AI  
**Status**: **PASSED**

This document details the security review conducted for the ATS platform module, covering Zod schema validation, API authorization, transition integrity, and soft-delete behaviors.

---

## 1. Zod Validation Verification (Client & Server)

We verified that input sanitization is strictly enforced on both the client and the server layers:

### A. Client-Side (Forms)
* **Candidates Form**: Enforces mandatory fields (first name, last name, email) and format checks (valid email syntax) utilizing React Hook Form resolvers.
* **Applications Form** ([`components/ats/applications/ApplicationForm.tsx`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/components/ats/applications/ApplicationForm.tsx)):
  * Enforces candidate selection (`candidateId` min 1) and posting link (`jobPostingId` min 1).
* **Interviews Form** ([`components/ats/interviews/InterviewForm.tsx`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/components/ats/interviews/InterviewForm.tsx)):
  * Preprocesses strings into numbers for `round` and `rating` fields. Enforces constraints (ratings must fall between 1 and 5).

### B. Server-Side (API Endpoints)
The REST endpoints re-validate incoming payloads before handing them to services. For example, in [`app/api/v1/interviews/route.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/app/api/v1/interviews/route.ts):
```typescript
const createSchema = z.object({
  applicationId: z.string().min(1),
  interviewerId: z.string().min(1),
  round: z.number().int().min(1).optional(),
  feedback: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  scheduledAt: z.string().min(1),
})
```
If a client bypasses the frontend and issues a direct REST payload with an invalid string or out-of-bounds integer rating (e.g. `rating: 6`), Zod throws a `ValidationError` at the API boundary, returning HTTP 400.

---

## 2. API Authorization & Input Sanitization

* **Authentication Context**: All endpoints query the `x-user-id` and session context. If the session or context headers are missing, access is denied.
* **SQL Injection Mitigation**: All DB interactions are managed using Prisma Client. Prisma parameterized queries neutralize SQL injections by design.
* **CSRF Mitigation**: Cross-Site Request Forgery is neutralized since NextAuth.js handles session cookies with `SameSite: Lax` and double-submit tokens automatically.

---

## 3. Status Transition Security

Workflow transitions are enforced at the service layer rather than trust-delegated to the UI:
* **Workflow Integrity**: The `AllowedTransitions` matrix prevents unauthorized state manipulation (e.g. bypassing evaluations).
* **Server-Driven Conflict Checks**:
  ```typescript
  if (input.status !== undefined && input.status !== existing.status) {
    const current = existing.status as InterviewStatus
    const allowed = AllowedTransitions[current] ?? []
    if (!allowed.includes(input.status)) {
      throw new ConflictError(`Invalid status transition from ${current} to ${input.status}`)
    }
  }
  ```
* Attempting invalid transitions throws a `ConflictError` (HTTP 409) rather than silent failure or UI corruption, preventing data status tampering.

---

## 4. Database Soft-Delete Behavior

We verified that data deletion is configured safely without deleting physical table records:
* **Repository Soft Deletes**: In `TenantAwareRepository` (base), the `markDeleted()` helper populates the `deletedAt` DateTime field.
* **Filter Exclusions**: The base `withTenant` query mapper automatically appends `deletedAt: null` into standard database queries.
* Soft-deleted candidates or interviews are excluded from searches and calendars, yet remain available in audit logs for compliance reviews.

---

## 5. Verdict

```text
Security Review: PASS
```
The platform enforces input validation schemas at both client and API route boundaries, utilizes ORM query parameterization, scopes transitions at the service level, and manages soft deletes safely, meeting high security standards.
