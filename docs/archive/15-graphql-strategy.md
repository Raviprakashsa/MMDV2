# 15 — GraphQL Strategy

## Executive Summary
Evaluate GraphQL adoption versus REST for the project.

## When to Use GraphQL
- When clients require flexible, compound data queries (dashboards, nested resources).

## Recommendation
- Keep REST for simple endpoints; introduce GraphQL for dashboards and analytics where flexible queries reduce roundtrips.

## Schema Ideas
- Root `Query` for `reports`, `widgets`; `Mutation` for write operations.
