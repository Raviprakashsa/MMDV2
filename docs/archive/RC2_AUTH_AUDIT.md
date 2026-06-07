# RC-2 — Authentication & Session Security Audit

**Audit Date**: 2026-06-02  
**Auditor**: Antigravity AI (Independent RC-2 Verification)  
**Scope**: All ATS routes — UI pages, API endpoints, session management

---

## 1. UI Route Authentication

### Dashboard Layout Guard

**File**: [`app/(dashboard)/layout.tsx`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/app/(dashboard)/layout.tsx)

**Mechanism**: Server-side `auth()` call from NextAuth. If `!session?.user`, the user is `redirect('/login')`.

**Verdict**: ✅ **ENFORCED**

All ATS UI pages live under `app/(dashboard)/ats/` and inherit this layout. No ATS page can render without a valid session.

**Verified Pages**:

| Route | File | Protected |
|---|---|---|
| `/ats/job-postings` | `app/(dashboard)/ats/job-postings/page.tsx` | ✅ Yes |
| `/ats/job-postings/[id]` | `app/(dashboard)/ats/job-postings/[id]/page.tsx` | ✅ Yes |
| `/ats/job-postings/new` | `app/(dashboard)/ats/job-postings/new/page.tsx` | ✅ Yes |
| `/ats/candidates` | `app/(dashboard)/ats/candidates/page.tsx` | ✅ Yes |
| `/ats/candidates/[id]` | `app/(dashboard)/ats/candidates/[id]/page.tsx` | ✅ Yes |
| `/ats/candidates/new` | `app/(dashboard)/ats/candidates/new/page.tsx` | ✅ Yes |
| `/ats/applications` | `app/(dashboard)/ats/applications/page.tsx` | ✅ Yes |
| `/ats/applications/[id]` | `app/(dashboard)/ats/applications/[id]/page.tsx` | ✅ Yes |
| `/ats/applications/new` | `app/(dashboard)/ats/applications/new/page.tsx` | ✅ Yes |
| `/ats/interviews` | `app/(dashboard)/ats/interviews/page.tsx` | ✅ Yes |
| `/ats/interviews/[id]` | `app/(dashboard)/ats/interviews/[id]/page.tsx` | ✅ Yes |
| `/ats/interviews/new` | `app/(dashboard)/ats/interviews/new/page.tsx` | ✅ Yes |

---

## 2. Edge Middleware Authentication

**File**: [`proxy.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/proxy.ts)

**Mechanism**: Uses `getToken({ req, secret })` from `next-auth/jwt` to verify JWT tokens at the edge. The `AUTHENTICATED` pattern (`/^\/(?!login|apply\/).*$/`) matches all routes except explicit exclusions.

**Key Logic** (lines 47–53):
```typescript
const requireAuth = matches(pathname, [...ADMIN_ONLY, ...ADMIN_COORDINATOR, ...ADMIN_SCRAPER, ...DASHBOARD_ADMIN_ONLY, ...DASHBOARD_SUPER_ADMIN_ONLY, ...AUTHENTICATED])

if (!token && requireAuth) {
    const url = new URL("/login", req.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
}
```

**Bypass Exclusions** (all justified):
- `/api/auth/*` — NextAuth internal routes (required for login flow)
- `/api/health` — Health check endpoint (standard DevOps requirement)
- `/_next/*` — Static assets (standard Next.js)
- `/login` — Login page itself (required)
- `/apply/*` — Public job application portal (by design — public-facing)
- `/` — Landing page (public by design)
- `/forbidden` — Error page (standard)

**Verdict**: ✅ **ENFORCED** — All non-excluded routes require JWT authentication at the edge.

---

## 3. API Route Authentication Analysis

### ATS API Endpoints Inspection

| API Route | File | Auth Method |
|---|---|---|
| `GET/POST /api/v1/job-postings` | `app/api/v1/job-postings/route.ts` | Edge middleware + tenant validation |
| `GET/PATCH/DELETE /api/v1/job-postings/[id]` | `app/api/v1/job-postings/[id]/route.ts` | Edge middleware + tenant validation |
| `GET/POST /api/v1/candidates` | `app/api/v1/candidates/route.ts` | Edge middleware + tenant validation |
| `GET/PATCH/DELETE /api/v1/candidates/[id]` | `app/api/v1/candidates/[id]/route.ts` | Edge middleware + tenant validation |
| `GET/POST /api/v1/applications` | `app/api/v1/applications/route.ts` | Edge middleware + tenant validation |
| `GET/PATCH /api/v1/applications/[id]` | `app/api/v1/applications/[id]/route.ts` | Edge middleware + tenant validation |
| `POST /api/v1/applications/[id]/status` | `app/api/v1/applications/[id]/status/route.ts` | Edge middleware + tenant validation |
| `GET/POST /api/v1/interviews` | `app/api/v1/interviews/route.ts` | Edge middleware + tenant validation |
| `GET/PATCH /api/v1/interviews/[id]` | `app/api/v1/interviews/[id]/route.ts` | Edge middleware + tenant validation |
| `POST /api/v1/interviews/[id]/status` | `app/api/v1/interviews/[id]/status/route.ts` | Edge middleware + tenant validation |

> [!WARNING]
> **Finding AUTH-1**: ATS API route handlers do not independently call `auth()` or verify the JWT session inside the handler. They rely on the edge middleware (`proxy.ts`) for authentication gating. Each handler extracts `x-tenant-id` from request headers and throws `ValidationError` if missing.
>
> **Severity**: Medium (defense-in-depth gap — not exploitable in current config)
> **Current Mitigation**: Edge middleware matcher `/((?!_next/static|_next/image|favicon.ico|.*png$).*)` covers all API paths. No known bypass path exists in Next.js 16.

---

## 4. NextAuth Configuration

**File**: [`lib/auth.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/lib/auth.ts)

| Setting | Value | Assessment |
|---|---|---|
| Strategy | JWT | ✅ Stateless, scalable |
| Max Age | 30 days | ⚠️ Long-lived (acceptable for B2B SaaS) |
| Secret Enforcement | Throws in production if `!AUTH_SECRET` | ✅ Enforced |
| Trust Host | `true` | ✅ Required for reverse proxy |
| Sign-in Page | `/login` | ✅ Custom page |
| Debug Mode | Disabled in production | ✅ Safe |
| Password Verification | `bcryptjs.compare()` | ✅ Secure hashing |
| Soft Delete Check | `deletedAt: null` filter in authorize | ✅ Disabled users blocked |
| Active Check | `isActive: true` filter in authorize | ✅ Inactive users blocked |

---

## 5. Session Security

**File**: [`app/api/auth/[...nextauth]/route.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/app/api/auth/[...nextauth]/route.ts)

- NextAuth catch-all handler properly exports `GET` and `POST` from `handlers`
- Session endpoint at `/api/auth/session` returns authenticated user data
- CSRF token endpoint at `/api/auth/csrf` provides CSRF protection for login forms
- JWT callback enriches token with `id`, `role`, `name`, `isActive`
- Session callback exposes enriched fields to client

**Verified in integration tests**: [`tests/integration/auth.ts`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/tests/integration/auth.ts)
- `signInAsAdmin()` validates CSRF token exchange → credential callback → session verification flow
- Tests verify authenticated cookies are propagated to subsequent requests

---

## 6. Security Headers

**File**: [`next.config.mjs`](file:///c:/Ravi/MY%20WORKS/MMD%20V2/next.config.mjs)

| Header | Value | Assessment |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | ✅ |
| `X-Frame-Options` | `DENY` | ✅ Clickjacking protection |
| `X-XSS-Protection` | `1; mode=block` | ✅ |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | ✅ |
| `Cross-Origin-Opener-Policy` | `same-origin` | ✅ |
| `X-DNS-Prefetch-Control` | `off` | ✅ |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | ✅ Production only |
| `X-Powered-By` | Disabled (`poweredByHeader: false`) | ✅ |

---

## 7. Verdict

```text
AUTHENTICATION & SESSION AUDIT: PASS
```

| Area | Verdict |
|---|---|
| UI Route Protection | ✅ PASS |
| Edge Middleware Auth | ✅ PASS |
| API Auth (defense-in-depth) | ⚠️ CONDITIONAL PASS (AUTH-1 noted) |
| NextAuth Config | ✅ PASS |
| Session Security | ✅ PASS |
| Security Headers | ✅ PASS |
