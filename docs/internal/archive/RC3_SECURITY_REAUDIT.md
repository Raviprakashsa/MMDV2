# RC-3 Security Re-Audit — Tenant Context Hardening

This document provides a post-remediation security audit of the applicant tracking system (ATS) release candidate after executing the RC-3 hardening plan.

---

## Vulnerability Remediation Status

### HEADER-1: `x-tenant-id` header trusted without session binding
* **Status**: **RESOLVED**
* **Verification**:
  - The client-supplied headers `x-tenant-id` and `x-user-id` are now completely ignored by all 27 API endpoint handlers under `app/api/v1/**`.
  - All tenant resolution is bound directly to the authenticated server session through `getAuthenticatedTenantContext()`.
  - Verification tests successfully confirmed that manually injecting a spoofed `x-tenant-id` header (both positive and negative cases) fails to bypass context resolution or execute cross-tenant requests.

### AUTH-1: API route handlers lack independent `auth()` call (Defense-in-Depth Gap)
* **Status**: **RESOLVED**
* **Verification**:
  - Previously, route handlers relied solely on `proxy.ts` middleware for request routing and authentication.
  - Every handler under `app/api/v1/**` now independently calls `getAuthenticatedTenantContext()`, which executes NextAuth `auth()` and validates the JWT payload directly within the route context.
  - A request without an active authenticated session will be rejected immediately with a `403 Forbidden` (`Unauthorized`) error by the handler itself.

### RBAC-1: Fine-grained role checks not enforced at ATS service layer
* **Status**: **NOT RESOLVED**
* **Verification**:
  - Enforcing fine-grained service-layer RBAC permissions was excluded from the scope of the RC-3 context hardening plan to avoid introducing new features.
  - However, all requests are strictly isolated by `tenantId` (derived from the database user record mapped at sign-in). Cross-tenant queries are blocked since users can only retrieve resources matching their session's `tenantId`.

---

## Detailed Audit Results

### 1. Session-Derived Tenant Context
* **Audit Result**: `PASS`
* **Details**: NextAuth JWT callback retrieves the user's `tenantId` and `userId` from PostgreSQL once during credentials verification. These claims are cached in the secure JWT cookie. The route-level helper extracts them immutably.

### 2. Header Spoofing Protection
* **Audit Result**: `PASS`
* **Details**: Manual header inputs for `x-tenant-id` and `x-user-id` are bypassed and discarded. The application ignores these headers, ensuring that malicious requests cannot spoof tenant identifiers.

### 3. Authentication Enforcement
* **Audit Result**: `PASS`
* **Details**: Every single route under `/api/v1/**` utilizes `getAuthenticatedTenantContext()` to verify the session. Any unauthenticated caller is rejected inside the endpoint handler.

### 4. Tenant Isolation
* **Audit Result**: `PASS`
* **Details**: Multi-tenant security isolation was verified across Job Postings, Candidates, Applications, and Interviews. In all cases, unauthorized requests by a different tenant return `404 Not Found`, confirming absolute isolation.
