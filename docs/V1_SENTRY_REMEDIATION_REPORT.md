# V1 — Sentry Activation Report

**Date:** 2026-06-07  
**Blocker:** B-4 (Sentry not initialized)  
**Status:** ✅ REMEDIATED  

---

## 1. Problem Statement

`@sentry/node` was installed and `lib/sentry.ts` / `lib/sentry-init.ts` existed, but:
1. `captureException()` was not exported — no errors reached Sentry
2. `SENTRY_DSN` was undocumented in `.env.example`

**Discovery:** `app/layout.tsx` line 4 already contained `import "@/lib/sentry-init"`, which means `initSentry(process.env.SENTRY_DSN)` was already called on every server render. The bootstrap was working — only `captureException` was missing from the error handlers.

---

## 2. Files Modified

| File | Change |
|---|---|
| `lib/sentry.ts` | Added module-level `_sentry` singleton; added `captureException()` export |
| `lib/core/route-utils.ts` | `runApi()` catch block now calls `captureException(err)` for unexpected errors |
| `lib/core/action-client.ts` | `createSafeAction()` catch block now calls `captureException(error)` for unexpected errors |
| `.env.example` | Added `SENTRY_DSN=` and `SENTRY_RELEASE=` entries with documentation comments |

---

## 3. Configuration

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SENTRY_DSN` | Required for error monitoring | Data Source Name from Sentry project → Settings → Client Keys |
| `SENTRY_RELEASE` | Optional | Git SHA or version tag for release tracking |

Set `SENTRY_DSN` in your production `.env` file:
```
SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxx@o0.ingest.sentry.io/0000000
SENTRY_RELEASE=v1.0.0
```

If `SENTRY_DSN` is empty or absent, the app behaves identically — Sentry is simply not active.

---

## 4. Initialization Flow

```
App Start (server render)
    │
    ▼ app/layout.tsx → import "@/lib/sentry-init"
    │
    ▼ lib/sentry-init.ts → initSentry(process.env.SENTRY_DSN)
    │
    ├─ If SENTRY_DSN is set:
    │   └─ require('@sentry/node').init({ dsn, tracesSampleRate: 0.05, ... })
    │       _sentry singleton = initialised Sentry instance
    │
    └─ If SENTRY_DSN is absent:
        └─ _sentry = null (no-op)

Error Handling (any API route or server action)
    │
    ▼ runApi() or createSafeAction() catch block
    │
    ├─ AppError → return { status: errorCode } — NOT reported (operational error)
    ├─ ZodError → return { status: 400 } — NOT reported (validation error)
    └─ Unexpected Error → captureException(err) ← NEW ✅
                          return { status: 500 }
```

---

## 5. Error Capture Scope

| Error Type | Reported to Sentry? | Rationale |
|---|---|---|
| `AppError` (404, 403, 409...) | ❌ No | Operational errors — expected by design |
| `ZodError` (validation) | ❌ No | Invalid input — not an application bug |
| Unexpected `Error` | ✅ Yes | Unhandled errors — must be investigated |
| Non-Error throws | ✅ Yes | Safety net for all unexpected throws |

---

## 6. Verification Method

### Development (no DSN):
- The application runs normally with Sentry inactive
- `lib/sentry.ts` logs a warning if the package is missing

### Staging/Production (with DSN):
1. Set `SENTRY_DSN` in environment
2. Start the server
3. Make a deliberate bad request or trigger an unhandled error in a test route
4. Verify the error appears in Sentry Issues dashboard within 30 seconds

### Code-level verification:
```typescript
import { captureException } from '@/lib/sentry'
captureException(new Error('test'))  // routes to Sentry if DSN configured
```

---

*Report generated: 2026-06-07*
