# MMD-Main 1.2 Production Readiness TODO

Date: 2026-05-28
Branch: chore/production-hardening

## Step 1 - Stabilize automated release proof
- [x] Make Playwright smoke tests deterministic by using programmatic authentication instead of UI login.
- [x] Re-run the smoke suite and attach the result to the final readiness report.
- [x] Keep `npm ci --legacy-peer-deps` in CI for deterministic installs.

## Step 2 - Close manual test failures
- [x] Re-test company add/edit validation and error feedback.
- [x] Re-test lead required-field and phone validation.
- [x] Re-test candidate resume upload/download and missing-resume behavior.
- [x] Re-test requirement assignment empty-state and status messaging.
- [x] Re-test reports export and no-data states.
- [x] Re-check dashboard/requirements rendering time after warm route prefetch.

## Step 3 - Prove role access deterministically
- [x] Make the role-matrix test environment-driven so demo credentials are not hard-coded.
- [x] Validate `SUPER_ADMIN`, `ADMIN`, `COORDINATOR`, `RECRUITER`, and `SCRAPER`.
- [x] Capture route authorization outcomes for each role.

## Step 4 - Harden production operations
- [x] Replace or front in-memory throttling with Redis-compatible shared storage for multi-instance deployments.
- [x] Document required production secrets and fail-fast behavior.
- [x] Verify health checks, migrations, and observability are ready for CI and production.

## Step 5 - Protect enterprise demos
- [x] Remove hard-coded reusable demo passwords from test helpers where practical.
- [x] Move test credentials to environment variables with documented local defaults only for seeded development data.
- [ ] Ensure reports shared externally do not expose real passwords or secrets.

## Step 6 - Final sign-off package
- [x] Run `npm run typecheck`.
- [x] Run `npm run lint`.
- [x] Run `npm run build`.
- [x] Run `npm audit --audit-level=moderate`.
- [x] Run Playwright smoke tests.
- [x] Run role-matrix validation.
- [x] Create a final readiness report with commit SHA, environment, test evidence, unresolved risks, and sign-off.

## Remaining production gate
- [ ] Run the same verification in hosted CI after the final push.
- [ ] Configure production secrets, Redis throttling, email, storage, and monitoring in the target environment.
- [ ] Perform business-owner sign-off on a non-seeded staging database.
