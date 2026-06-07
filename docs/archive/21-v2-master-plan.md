# 21 — Version 2.0 Master Plan

## Executive Summary
High-level executive plan for rework and modernization into Version 2.0.

## Current State
- Monolithic Next.js app with mixed responsibilities and lacking formal API contracts and DB diagrams.

## Major Problems
- Scalability limits in monolith, missing API specs, inconsistent project structure.

## Proposed Architecture
- Move to layered services with clear boundaries, adopt Prisma + Postgres, Redis caching, message queue for jobs.

## Roadmap and Phases
1. Documentation & API contracts (1–2 months)
2. Modularize backend & introduce RBAC (2–4 months)
3. Performance & infra hardening (2–3 months)
4. Optional microservices split (6–12 months)

## Risks
- Migration complexity, data migration risk, team ramp-up for infra changes.

## Budget & Team
- Provide staffing estimates in a follow-up once feature prioritization completes.

## Action Items
- Approval of roadmap, allocate team, schedule spikes for high-risk items.

## Implementation Sequence (exact order)
1. Freeze feature list and finalize docs (`docs/01`–`docs/20`).
2. Generate OpenAPI spec and Postman collection; publish to `postman/`.
3. Add CI checks: lint, typecheck, tests, and doc generation.
4. Implement API contracts and request/response validation (backward-compatible adapters).
5. Introduce RBAC and MFA for auth-critical endpoints.
6. Add caching layer (Redis) and instrument metrics for hot paths.
7. Extract heavy background work to queued jobs (BullMQ) and migrate cron scripts.
8. Normalize DB schema and run a staged migration with verification and backfills.
9. Split backend modules into independent deployable services (auth, reports, automation) if needed.
10. Harden infra: secrets management, image scanning, monitoring dashboards.
11. Run pre-prod load tests, security scans, and finalize production rollout plan.
12. Post-launch: iterate on performance, add analytics warehouse, and consider GraphQL adoption for complex UIs.

