Production Deployment README
===========================

This file summarizes recommended production deployment steps and options.

1. Prepare secrets
   - NEXTAUTH_SECRET: long random string
   - DATABASE_URL: production MongoDB connection string
   - SENTRY_DSN: optional for monitoring
   - THROTTLE_BACKEND: set to `redis` for multi-instance production
   - UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN: required when `THROTTLE_BACKEND=redis`

2. Build and push image
   - `docker build -t myregistry/mmdss:latest .`
   - `docker push myregistry/mmdss:latest`

3. Kubernetes example (apply manifests in `k8s/`), ensure you create `mmdss-secrets` with keys `DATABASE_URL`, `NEXTAUTH_SECRET`, and the Redis throttle secrets for multi-instance deployments.

4. Run smoke tests (Playwright) against the staging URL.
   - For seeded local/staging test data: `E2E_USE_SEEDED_USERS=1 npm run test:smoke`
   - For enterprise demo/staging users: set `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD` instead of relying on seeded defaults.

5. Run role-matrix proof before sign-off.
   - Use explicit `E2E_<ROLE>_EMAIL` and `E2E_<ROLE>_PASSWORD` values for each role.
   - Seeded local fallback is available only when `E2E_USE_SEEDED_USERS=1`.

6. Promote to production and monitor logs for NextAuth, DB, Redis throttling, and Sentry errors.
