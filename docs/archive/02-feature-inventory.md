# 02 — Feature Inventory

## Executive Summary
This document enumerates features discovered in the repository and maps them to pages, APIs, and database artifacts.

## How to use
Run a code scan to populate the detailed lists below; this file contains the template and initial entries discovered from the workspace tree.

## Example feature entry
- Feature Name: Dashboard
- Description: Multi-panel business dashboards presenting KPIs and reports.
- User Type: Business user
- Pages involved: `app/(dashboard)/` and `components/dashboards`
- API endpoints: `app/api/reports/*` (inspect folder)
- DB tables: `reports`, `users` (to be confirmed)
- Current issues: Performance on large datasets; missing API contract
- Suggested improvements: Paginated APIs, caching, telemetry

## Next steps
- Scripted extraction of endpoints and DB tables; associate with frontend routes.
