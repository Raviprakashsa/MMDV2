# MMD V2 Postman Strategy

This folder stores Postman artifacts for MMD V2 as part of API governance.

## Source of Truth
- OpenAPI 3.1 generated from `/api/v1` contracts.
- Postman collection should be generated/synced from OpenAPI to avoid drift.

## Planned Artifacts
- `MMD-V2.postman_collection.json`
- `MMD-V2.local.postman_environment.json`
- `MMD-V2.staging.postman_environment.json`
- `MMD-V2.production.postman_environment.json`

## Collection Folder Standard
- `Authentication`
- `Tenant`
- `Users`
- `Roles`
- `Permissions`
- `Companies`
- `Contacts`
- `Leads`
- `Requirements`
- `Candidates`
- `Placements`
- `Timesheets`
- `Invoices`
- `Webhooks`
- `Admin`

## Required Request Metadata
- Example request body
- Example success response
- Example error response
- Permission annotation (`module.action`)
- Tenant requirement annotation

## Environments
Each environment should include:
- `base_url`
- `auth_email`
- `auth_password`
- `session_cookie` (runtime)
- `tenant_id`
- `api_version` (default `v1`)

## Usage Rule
- No manual-only endpoints in Postman.
- Every API merged to V2 must be represented and testable in Postman before feature sign-off.
