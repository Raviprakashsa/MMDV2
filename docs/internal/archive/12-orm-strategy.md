# 12 — ORM Strategy

## Executive Summary
Compare ORM options and recommend a migration path with models and migrations.

## Recommendation
- Use Prisma for TypeScript-first development and strong migration tooling; existing project already references `lib/prisma.ts`.

## Migration Strategy
- Add `prisma/schema.prisma`, run introspect if DB exists, generate models, and add migrations.

## Models
- Provide canonical models for `User`, `Report`, `Widget`, `AuditLog` (to be generated from schema).
