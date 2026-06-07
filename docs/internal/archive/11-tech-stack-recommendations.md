# 11 — Tech Stack Recommendations

## Executive Summary
Evaluate current stack and recommend technologies for frontend, backend, storage, and infra.

## Frontend
- Keep Next.js 13+ with App router for SSR/ISR where appropriate.
- TailwindCSS for utility-first styling and component library.

## Backend
- Node.js + TypeScript; split into services if needed.
- Use Prisma as ORM for TypeScript-first schema management.

## Database
- PostgreSQL for transactional data; use Timescale or warehouse for analytics.

## Caching & Storage
- Redis for caching and session store; S3-compatible blob storage for large artifacts.

## Monitoring & Logging
- Sentry for error tracking; structured logs with Winston or Pino; Prometheus/Grafana for metrics.

## CI/CD
- GitHub Actions for pipelines; containerized builds; image scanning.
