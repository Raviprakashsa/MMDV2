# MongoDB to PostgreSQL Migration Plan

Status: Review only. No migration executed.

## 1) Current Mongo Models (Source)
Observed source set in lib/db/models includes:
- User, Account, Session
- Company, HRContact, Lead, Requirement, Candidate, CandidateActivity
- Placement, Timesheet, Invoice
- Template, Notification, Message, CommunicationThread, CommunicationMessage
- ApiKey, Webhook, WebhookDelivery, IntegrationConfig, AutomationPipelineRun
- ReportSchedule, ExportJob, AnalyticsEvent, Document
- AuditLog, DataAccessLog, Activity, Counter, ApplicationForm

## 2) Target Prisma Models (Destination)
Phase-driven target includes:
- SaaS Foundation: plans, features, plan_features, tenant_features, tenants, subscriptions, tenant_settings, tenant_branding
- IAM: users, roles, permissions, role_permissions
- CRM: companies, contacts, leads
- ATS: requirements, candidates, applications, interviews
- Operations: placements, timesheets, invoices
- Platform: audit_logs, notifications, templates, workflows, api_keys, webhooks, reports, analytics_events

## 3) Data Mapping (High-Level)

| Mongo Source | PostgreSQL Target | Notes |
|---|---|---|
| User | users | map role refs to role_id, ensure tenantId normalization |
| Company | companies | preserve historical ids in legacy_id field during transition |
| HRContact | contacts | map company link and owner metadata |
| Lead | leads | map status enums carefully |
| Requirement | requirements | normalize status and owner references |
| Candidate | candidates | deduplicate email/phone by tenant |
| ApplicationForm | applications | split public intake from internal applications if needed |
| Placement | placements | preserve billing references |
| Timesheet | timesheets | normalize date periods and statuses |
| Invoice | invoices | enforce unique invoice number per tenant |
| AuditLog | audit_logs | keep append-only semantics |
| Notification | notifications | keep readAt and user scope |
| Template | templates | normalize type values |
| ApiKey | api_keys | store only key hash |
| Webhook | webhooks | split endpoint and event subscriptions |
| WebhookDelivery | webhook_deliveries | maintain attempts and payload snapshots |
| ReportSchedule | reports or report_schedules | choose single reporting model |
| AnalyticsEvent | analytics_events | convert metadata to JSONB |
| Document | documents (or module tables) | define unified file metadata strategy |

## 4) Migration Risks
- Inconsistent enum values across existing documents.
- Missing tenantId on historical records.
- Soft delete semantics vary by model.
- Embedded documents and denormalized arrays need flattening.
- Potential duplicate candidates/contacts due to weak unique constraints in source.

## 5) Migration Sequence (Recommended)
1. Freeze writes during each model migration window or use dual-write gate.
2. Migrate foundation entities first:
   - plans, features, plan_features, tenants, tenant_features, subscriptions
3. Migrate IAM:
   - roles, permissions, role_permissions, users
4. Migrate CRM:
   - companies, contacts, leads
5. Migrate ATS:
   - requirements, candidates, applications, interviews
6. Migrate operations:
   - placements, timesheets, invoices
7. Migrate platform telemetry and integration entities.
8. Execute reconciliation reports after each phase.

## 6) Rollback Strategy
- Keep source Mongo read-only snapshots per migration batch.
- Use idempotent migration scripts with checkpoint tables in Postgres.
- Maintain reversible mapping table:
  - source_collection
  - source_id
  - target_table
  - target_id
  - migrated_at
- If phase fails, rollback target phase data and restore write path to Mongo.

## 7) Validation Strategy
- Row count reconciliation per tenant per entity.
- Critical business invariant checks:
  - active users per tenant
  - lead to company/contact integrity
  - invoice to placement integrity
- Sample data diff audit for 5 to 10 percent of records.

## Migration Review Verdict
- Migration is feasible with phased cutover.
- Approval should require documented enum mappings, tenant backfill rules, and rollback playbook sign-off.
