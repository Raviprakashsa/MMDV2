# RC-3 Test Suite Update Report — Tenant Context Hardening

This document details the modifications, additions, and validation strategies implemented in the integration testing suite to verify robust tenant context isolation and header spoofing protections.

---

## Test Infrastructure & Strategy

The integration tests for the Applicant Tracking System (ATS) have been upgraded to utilize **NextAuth credentials-based authentication** instead of trusted request headers. 

- **Stateful Authentication**: The test suite now communicates with NextAuth authentication callbacks (`/api/auth/callback/credentials`) directly to establish a verified encrypted session cookie on the server.
- **Tenant Context Extraction**: The server decrypts the session cookie and extracts user identities securely using the hardened JWT and session callbacks.
- **Header Deprecation**: Request headers such as `x-tenant-id` and `x-user-id` are completely ignored by all route handlers.

---

## Covered Test Cases

### 1. Credentials-Based Authentication
* **Goal**: Validate that users can authenticate through credentials and that a session is correctly established.
* **Scope**: Performed in `tests/integration/auth.ts` inside the `signInAs` helper, checking:
  - Retrieval of CSRF token.
  - POST credentials request returning a valid session redirect.
  - Querying `/api/auth/session` to confirm correct session details.

### 2. Tenant Isolation Coverage
* **Goal**: Confirm that resources (Job Postings, Candidates, Applications, and Interviews) created by one tenant cannot be accessed, modified, or deleted by any other tenant.
* **Scope**: Verified inside `tests/integration/ats.spec.ts` under the **Tenant Isolation** block:
  - **Job Posting Isolation**:
    - Tenant B attempting to read Tenant A's Job Posting returns `404 Not Found`.
    - Tenant B attempting to patch Tenant A's Job Posting returns `404 Not Found`.
    - Tenant B attempting to delete Tenant A's Job Posting returns `404 Not Found`.
  - **Candidate Isolation**:
    - Tenant B attempting to read, update, or delete Tenant A's Candidate returns `404 Not Found`.
  - **Application Isolation**:
    - Tenant B attempting to read or change the status of Tenant A's Application returns `404 Not Found`.
  - **Interview Isolation**:
    - Tenant B attempting to read or complete Tenant A's Interview returns `404 Not Found`.

### 3. Session Switching
* **Goal**: Authenticate as a Tenant A user, perform operations, and dynamically switch to a Tenant B user to attempt unauthorized cross-tenant operations in a single test flow.
* **Scope**:
  - The test initiates authenticated session under Tenant A (`interviewer-a@example.com`).
  - Resources are created under Tenant A's context.
  - `signInAs(request, context, 'interviewer-b@example.com')` is invoked to switch the authentication cookies.
  - The test verifies all cross-tenant requests now fail under the Tenant B context.

### 4. Header Spoofing Protection
* **Goal**: Verify that sending manual HTTP headers (`x-tenant-id` / `x-user-id`) does not bypass, spoof, or overwrite the server-side resolved context.
* **Scope**:
  - **Positive Header Spoof Test**: Tenant A sends a request to read their own Job Posting, but manually injects a spoofed header `x-tenant-id: tenant-B`. The request **succeeds (200 OK)** because the backend completely ignores the header and resolves the tenant to Tenant A using the session.
  - **Negative Header Spoof Test**: Tenant B sends a request to read Tenant A's Job Posting, but manually injects a spoofed header `x-tenant-id: tenant-A`. The request **fails (404 Not Found)** because the backend ignores the spoofed header and resolves the context to Tenant B using the session.
