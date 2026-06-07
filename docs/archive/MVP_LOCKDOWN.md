# MMD V2 MVP Lockdown

Date: 2026-05-31
Status: Draft for approval
Purpose: Single source of truth for the MMD V2 MVP before any schema modification or A1 implementation.

## Lockdown Rules
- MVP entity count must not exceed 15.
- No billing entities in MVP.
- No analytics entities in MVP.
- No workflow entities in MVP.
- No webhooks in MVP.
- No API keys in MVP.
- No notifications in MVP.
- No templates in MVP.
- No feature flags in MVP.
- No subscriptions in MVP.
- Tenant foreign keys must reference `Tenant.id` only.
- No A1 implementation begins until this document is approved.

## 1. Final MVP Entity List
MVP entities are limited to the following 15 entities:

### Foundation
- plans
- features
- plan_features
- tenant_features
- tenants
- tenant_settings
- tenant_branding

### IAM
- roles
- permissions
- role_permissions
- users
- audit_logs

### CRM
- companies
- contacts
- leads

Total MVP entities: 15

## 2. Deferred Entity List
These entities are deferred to Phase 2+ and are not part of the MVP:

### ATS
- requirements
- candidates
- applications
- interviews

### Operations
- placements
- timesheets

### Billing
- invoices
- subscriptions
- billing_transactions
- subscription_usage

### Platform / Cross-Cutting
- api_keys
- webhooks
- webhook_deliveries
- templates
- notifications
- workflows
- workflow_runs
- reports
- report_schedules
- export_jobs
- analytics_events
- integration_configs
- documents
- data_access_logs
- feature_flag_events
- tenant_domains

## 3. Removed Entity List
- None at this time.
- All non-MVP entities are deferred to Phase 2+ rather than removed from the broader product direction.

## 4. Final Module List
### MVP Modules
- Foundation
- IAM
- CRM

### Deferred Modules
- ATS
- Operations
- Billing
- Platform / Integrations

## 5. Final Phase A1-A5 Scope
### A1 - Foundation
Build only:
- plans
- features
- plan_features
- tenant_features
- tenants
- tenant_settings
- tenant_branding

Exit criteria:
- Tenant can be created and associated to a plan.
- Tenant feature entitlements can be resolved.
- No subscription model is introduced in MVP.

### A2 - IAM and Access
Build only:
- roles
- permissions
- role_permissions
- users
- audit_logs

Exit criteria:
- Tenant-scoped users and RBAC are operational.
- Audit logs are captured for allowed actions.

### A3 - CRM
Build only:
- companies
- contacts
- leads

Exit criteria:
- Core CRM lifecycle works within tenant boundaries.

### A4 - ATS
Deferred to Phase 2+:
- requirements
- candidates
- applications
- interviews

### A5 - Operations and Billing
Deferred to Phase 2+:
- placements
- timesheets
- invoices

## 6. Final Dependency Map
- A1 is prerequisite for A2, A3, A4, and A5.
- A2 is prerequisite for all tenant-aware access control and audit behavior.
- A3 depends on A1 and A2.
- A4 depends on A1, A2, and A3, but is deferred outside MVP.
- A5 depends on A1, A2, and A4, but is deferred outside MVP.
- No billing, subscription, or feature-flag dependency is allowed in MVP.

## 7. Final Tenant FK Strategy
- All tenant-scoped relations must reference `Tenant.id`.
- `Tenant.tenantId` remains a unique business identifier only.
- `Tenant.tenantId` must not be used as a foreign key target.
- Global catalog tables should not introduce tenant foreign keys unless they are truly tenant-owned.
- Any new tenant-scoped entity added later must follow the `Tenant.id` FK rule.

## 8. Final Repository Pattern
- Route -> Service -> Repository -> Prisma -> PostgreSQL.
- Route handlers may validate and authorize, but they do not contain persistence logic.
- Services own business rules and cross-entity orchestration.
- Repositories own all database access.
- Repositories should be tenant-aware by default for tenant-scoped data.
- Prisma is the only persistence API used by repositories.
- Soft delete and audit behavior should be centralized at the service or repository boundary.

## 9. Final API Pattern
- Use Next.js App Router route handlers as the only HTTP entry point.
- Use REST-style JSON endpoints only.
- Keep handlers thin: parse input, enforce auth, call a service, return a normalized response.
- Protect tenant-scoped endpoints with tenant context resolution and RBAC checks.
- Keep write operations in `POST`, `PATCH`, and `DELETE` handlers.
- Keep read operations in `GET` handlers.
- Do not call Prisma directly from route handlers.
- Publish endpoint contracts through OpenAPI after the MVP scope is approved.

## 10. Final Approval Matrix
| Change Type | Required Approvers |
| --- | --- |
| MVP entity list change | Product + Architecture + Data |
| Tenant FK strategy change | Architecture + Data + Security |
| Any schema field or relation change | Data + Architecture |
| Any new module or removal from MVP | Product + Architecture |
| Repository pattern change | Architecture + Engineering |
| API pattern change | Architecture + Engineering |
| A1 start approval | Product + Architecture + Data + Engineering |
| A2-A5 start approval | Same as above, plus Security for IAM-related scope |

## Approval Gate
- This document is the current MVP contract.
- Do not modify schema.
- Do not generate migrations.
- Do not start A1 until explicit approval is given for this lockdown document.
