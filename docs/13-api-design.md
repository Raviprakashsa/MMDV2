# 13 — API Design

## Executive Summary
Document existing APIs and propose an OpenAPI-based contract for Version 2.0.

## Existing APIs
- Inspect `app/api/` and `lib/actions` to extract routes and verb mappings.

## Recommended API Practices
- Use OpenAPI 3.0 for spec; centralize validation and error formats.
- Standardize pagination, filtering, and sorting.

## Example Endpoint
- `GET /api/reports` — returns paginated reports with `page`, `limit`, `sort`.
