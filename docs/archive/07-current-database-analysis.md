# 07 — Current Database Analysis

## Executive Summary
This document examines the current database usage and tables referenced in the codebase. It contains a template for a full ER analysis.

## Observations
- `lib/prisma.ts` indicates Prisma is in use. Inspect `prisma/schema.prisma` if present to extract tables.

## Table Analysis Template
- Table: `users`
  - Purpose: store user accounts
  - Columns: id, email, name, role, createdAt, updatedAt
  - Relationships: hasMany(reports)
  - Indexes: email unique
  - Issues: enforce stronger password rules, MFA fields

## Next steps
- Run `npx prisma db pull` or inspect `migrations/` to produce an accurate ER diagram.
