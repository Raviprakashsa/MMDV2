# Final Prisma Entity Map

Status: Planning only. No schema changes. No migrations.

## Final Scope Decision
True MVP is focused on core multi-tenant staffing operations only.

Moved to Phase 2+ by request:
- webhooks
- api_keys
- workflows
- analytics_events
- reports
- notifications
- templates

## Entity Groups

## Foundation
MVP:
- plans
- features
- plan_features
- tenant_features
- tenants
- tenant_settings
- tenant_branding
- subscriptions
- roles
- permissions
- role_permissions
- users
- audit_logs

Phase 2+:
- feature_flag_events
- data_access_logs
- tenant_domains

## CRM
MVP:
- companies
- contacts
- leads

Phase 2+:
- none

## ATS
MVP:
- requirements
- candidates
- applications
- interviews

Phase 2+:
- documents

## Operations
MVP:
- placements
- timesheets

Phase 2+:
- workflow_runs

## Billing
MVP:
- invoices

Phase 2+:
- subscription_usage
- billing_transactions

## Platform
MVP:
- none

Phase 2+:
- api_keys
- webhooks
- webhook_deliveries
- templates
- notifications
- workflows
- reports
- report_schedules
- export_jobs
- analytics_events
- integration_configs

## Final True MVP Inventory
- plans
- features
- plan_features
- tenant_features
- tenants
- tenant_settings
- tenant_branding
- subscriptions
- roles
- permissions
- role_permissions
- users
- audit_logs
- companies
- contacts
- leads
- requirements
- candidates
- applications
- interviews
- placements
- timesheets
- invoices

Total MVP entities: 24

## Phase 2+ Inventory
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

Total Phase 2+ entities: 18
