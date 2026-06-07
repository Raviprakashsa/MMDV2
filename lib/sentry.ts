/**
 * Sentry integration — V1.3A
 *
 * Provides a graceful, optional Sentry initialisation and a safe
 * captureException() helper used throughout the application.
 *
 * Usage:
 *   initSentry(process.env.SENTRY_DSN)   ← called once in sentry-init.ts
 *   captureException(err)                ← called in route-utils and action-client
 */

// Module-level singleton — shared across all imports within the same process.
let _sentry: any = null

/**
 * Initialise Sentry exactly once per process.
 * Safe to call multiple times — subsequent calls return the cached instance.
 * Returns null (without throwing) if DSN is absent or the package is missing.
 */
export function initSentry(dsn?: string) {
  if (!dsn) return null
  if (_sentry) return _sentry // already initialised

  try {
    // Dynamic require keeps @sentry/node out of the client bundle.
    const Sentry = require('@sentry/node')
    const release = process.env.SENTRY_RELEASE || process.env.GITHUB_SHA
    const environment = process.env.NODE_ENV || 'production'
    Sentry.init({
      dsn,
      tracesSampleRate: 0.05,
      release,
      environment,
    })
    _sentry = Sentry
    return Sentry
  } catch (err) {
    // Sentry not installed or failed to init; skip — never crash the app.
    // console.warn is intentional here: this is bootstrap-phase diagnostics.
    console.warn('Sentry not installed or failed to init, skipping', err)
    return null
  }
}

/**
 * Report an unexpected error to Sentry.
 * - No-ops silently if Sentry was not initialised (SENTRY_DSN absent).
 * - Swallows its own errors so Sentry never interrupts the application.
 */
export function captureException(err: unknown): void {
  try {
    if (_sentry && typeof _sentry.captureException === 'function') {
      _sentry.captureException(err)
    }
  } catch {
    // Never let Sentry error propagate to the caller.
  }
}
