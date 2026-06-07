# Production Security Hardening Report

**Date:** 2026-06-07  
**Auditor:** Antigravity (Advanced Agentic Coding Partner)  
**Status:** COMPLETE  

---

## 1. Authentication Security
- **JWT Session Configuration:** NextAuth uses secure JSON Web Tokens (JWT) for session management with a standard `maxAge` of 30 days.
- **Cookie Hardening:** In production, NextAuth uses `__Secure-next-auth.session-token` over HTTPS, enforcing `HttpOnly`, `SameSite=Lax`, and `Secure` cookie policies to mitigate cross-site scripting (XSS) and session hijacking.
- **Secret Enforcement:** The app validates the existence of `AUTH_SECRET` / `NEXTAUTH_SECRET` during bootstrap in production mode, halting server startup with an error if it is missing or insecure.
- **CSRF Mitigation:** NextAuth automatically implements CSRF token exchange and validation for all credential login paths.

---

## 2. Authorization Security
- **Unified RBAC:** A role-to-permission mapping matrix governs API and operational actions across 5 roles (`SUPER_ADMIN`, `ADMIN`, `COORDINATOR`, `RECRUITER`, `SCRAPER`).
- **Service-Layer Guardrails:** Permissions are strictly checked inside services (`CompanyService`, `ContactService`, `LeadService`) before any DB mutations occur. Unauthorized attempts throw a `403 Forbidden` error.
- **Route-Level Gates:** Next.js 16 uses `proxy.ts` natively as the project's routing middleware. The middleware inspects JWT session tokens on every route request and enforces login redirects or `/forbidden` page redirects.
- **Data Segregation:** The repository layer extends `TenantAwareRepository` to strictly filter all query inputs by `tenantId` (derived directly from the user session), ensuring absolute tenant isolation at the query compile time.

---

## 3. API Security
- **IDOR Protection:** All entity operations validate database matches within the user's session `tenantId` scope. Unauthorized lookup attempts yield empty responses or `404 Not Found` errors.
- **Rate Limiting:** Integrated `throttleRequest` inside `requestThrottle.ts` to limit request volumes from clients. Key endpoints (public resume upload and cron automations) rate-limit clients using Upstash Redis rest calls or memory fallback.
- **Input Validation:** Zod schemas are defined on all endpoint inputs, checking types and field limits.
- **Error Response Sanitization:** Global wrapper `runApi` catches unhandled exceptions, logs the raw stack trace to server logs and Sentry, and returns a clean, sanitized `"Internal Server Error"` payload to client calls to prevent information leakage.

---

## 4. Database Security
- **Safe Queries:** Prisma client executes parameterized database calls to eliminate SQL injection vectors.
- **Credentials Masking:** All database paths and credentials reside inside environment variables (`DATABASE_URL`, `POSTGRES_DATABASE_URL`). No raw credentials are hardcoded.
- **Automatic Backups:** Database backup script `backup-db.sh` runs container-level dumps (`pg_dump` / `mongodump`), compresses the files, and applies a 7-day retention sweep.

---

## 5. Sensitive Data Protection
- **Password Hashing:** Seed scripts and registration actions hash user credentials using `bcryptjs` with 12 salt rounds.
- **Secret Leakage Prevention:** Next.js distinguishes client and server variables. Only public parameters are prefixed with `NEXT_PUBLIC_`, ensuring all secret credentials remain strictly server-side.

---

## 6. Frontend Security
- **Console Stripping:** The configuration in `next.config.mjs` has `removeConsole` enabled for production, stripping `console.log` statements from dynamic frontend bundles.
- **Source Maps:** Excluded from production builds by default.

---

## 7. Infrastructure Security
- **Docker Hardening:** Named volumes (`postgres_data`, `mongo_data`) persist database directories. Containers run as restricted services on a private Docker bridge network.
- **HTTP Headers:** Configured strict headers inside `next.config.mjs` including `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, and HSTS `Strict-Transport-Security` in production.

---

## 8. Monitoring & Telemetry
- **Sentry Integration:** The server singleton captures unhandled errors from API routes and Server Actions.
- **Audit Logging:** An operational logging table (`AuditLog`) records all key administrative events (e.g. user creation, sign-ins, deactivations) for security investigations.

---

*Report generated: 2026-06-07*
