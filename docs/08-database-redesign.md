# 08 — Database Redesign

## Executive Summary
Recommendations for normalizing the schema, adding audit metadata, soft deletes, and versioning.

## Recommendations
- Normalize repeating groups and ensure foreign keys.
- Add `created_by`, `updated_by`, `deleted_at` for auditability.
- Soft deletes via `deleted_at` and filtered queries.
- Index strategy: compound indexes on frequent query predicates.

## Diagrams
Include Mermaid ER diagrams (generate from Prisma schema or DB reverse-engineer tools).
