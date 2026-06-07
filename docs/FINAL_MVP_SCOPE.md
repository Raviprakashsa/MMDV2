# Final MVP Scope

Status: Planning only. No implementation changes.

## Scope Rule
A1 to A5 will build only true MVP entities.

Deferred to Phase 2+:
- webhooks
- api_keys
- workflows
- analytics_events
- reports
- notifications
- templates

## A1 - Foundation Core
Build:
- plans
- features
- plan_features
- tenant_features
- tenants
- tenant_settings
- tenant_branding
- subscriptions

Dependencies:
- plans -> subscriptions
- features -> plan_features -> tenant_features
- tenants -> subscriptions
- tenants -> tenant_settings
- tenants -> tenant_branding

Exit criteria:
- Tenant can be created with active subscription and feature entitlements.

## A2 - IAM and Access
Build:
- roles
- permissions
- role_permissions
- users
- audit_logs

Dependencies:
- tenants (A1) -> roles
- roles + permissions -> role_permissions
- tenants + roles -> users
- users + tenant context -> audit_logs

Exit criteria:
- Tenant-scoped user provisioning and role-based access model operational.

## A3 - CRM
Build:
- companies
- contacts
- leads

Dependencies:
- tenants (A1) required on all entities
- users (A2) for ownership/assignment
- companies -> contacts
- companies + contacts + users -> leads
- audit_logs (A2) for create/update/delete tracking

Exit criteria:
- Full company/contact/lead lifecycle within tenant boundary.

## A4 - ATS
Build:
- requirements
- candidates
- applications
- interviews

Dependencies:
- companies (A3) -> requirements
- candidates + requirements -> applications
- applications + candidates -> interviews
- users (A2) for recruiter/interviewer assignment
- audit_logs (A2) for tracking events

Exit criteria:
- Requirement-to-candidate pipeline operational through interview stage.

## A5 - Operations and Billing
Build:
- placements
- timesheets
- invoices

Dependencies:
- candidates + requirements/applications (A4) -> placements
- placements + users (A2) -> timesheets
- placements + subscriptions/tenant (A1) -> invoices
- audit_logs (A2) for approval and billing actions

Exit criteria:
- Joined candidate operationalized to timesheet and invoicing workflow.

## Dependency Chain Summary
- A1 is prerequisite for all later phases.
- A2 is prerequisite for all role-aware and auditable operations.
- A3 depends on A1 and A2.
- A4 depends on A1, A2, A3.
- A5 depends on A1, A2, A4.

## Explicitly Out of MVP (Phase 2+)
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
- subscription_usage
- billing_transactions
- data_access_logs
- feature_flag_events
- tenant_domains
