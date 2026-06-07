# Prisma Design Review

Status: Review only. schema.prisma not modified in this task.

Source references reviewed:
- docs/phases/markdown/P-7/06-database-design.md
- docs/phases/markdown/P-4/03-role-permission-matrix.md
- docs/phases/markdown/P-12/11-white-label-saas-design.md
- prisma/schema.prisma
- lib/db/models/* (Mongo source model set)

Approval scale:
- Approved (Concept)
- Approved with Changes
- Pending (Not Yet Modeled)

## Entity Review Matrix

| Entity | Purpose | Relationships | Indexes | Tenant Rules | Soft Delete Rules | Approval Status |
|---|---|---|---|---|---|---|
| Plans | Subscription plans and limits | Plan to Tenant, Plan to PlanFeatures | code unique, tenantId, deletedAt | System-scoped + tenant-aware references | deletedAt required | Approved with Changes (add limits fields) |
| Features | Feature catalog | Feature to PlanFeatures, TenantFeatures | code unique, tenantId, deletedAt | Global catalog; tenant override via tenant_features | deletedAt required | Approved with Changes (add category/type) |
| PlanFeatures | Plan feature mapping | PlanFeatures to Plan, Feature | unique(planId, featureId), tenantId | Use system tenantId by default | deletedAt optional required by standard | Approved (Concept) |
| Tenant | Customer organization root | Tenant to Users, Roles, settings, branding, features | tenantId unique, slug unique, deletedAt | Strict tenant boundary root | deletedAt required | Approved (Concept) |
| TenantSettings | Locale/workflow settings | TenantSettings to Tenant 1:1 | unique(tenantId) | tenantId mandatory | deletedAt optional | Pending (Not Yet Modeled) |
| TenantBranding | White-label assets and colors | TenantBranding to Tenant 1:1 | unique(tenantId), domain index | tenantId mandatory | deletedAt optional | Pending (Not Yet Modeled) |
| Subscriptions | Billing state and lifecycle | Subscription to Tenant, Plan | tenantId, planId, status, periodEnd | tenantId mandatory | deletedAt optional | Pending (Not Yet Modeled) |
| Users | Tenant users | User to Tenant, Role | unique(tenantId,email), tenantId, deletedAt | tenantId mandatory in all reads/writes | soft-delete required | Approved (Concept) |
| Roles | Role definition | Role to Tenant, RolePermissions, Users | unique(tenantId,code), tenantId | tenant-scoped roles, optional system roles | soft-delete required | Approved (Concept) |
| Permissions | Permission catalog module.action | Permission to RolePermissions | code unique, module, action | global catalog with tenant-aware grants | deletedAt optional | Approved with Changes (review tenantId default) |
| RolePermissions | Grant mapping | RolePermissions to Role, Permission | unique(roleId,permissionId), tenantId | tenantId mandatory and validated | deletedAt optional | Approved (Concept) |
| Companies | CRM organizations | Company to Contacts, Leads, Requirements | tenantId, name, status, deletedAt | tenantId mandatory | soft-delete required | Pending (Not Yet Modeled) |
| Contacts | Company contacts | Contact to Company | tenantId, companyId, email | tenantId mandatory | soft-delete required | Pending (Not Yet Modeled) |
| Leads | Lead pipeline records | Lead to Company, Contact, User | tenantId, status, assignedTo, createdAt | tenantId mandatory | soft-delete required | Pending (Not Yet Modeled) |
| Requirements | Open positions | Requirement to Company, Applications | tenantId, status, companyId | tenantId mandatory | soft-delete required | Pending (Not Yet Modeled) |
| Candidates | Candidate master | Candidate to Applications, Interviews, docs | tenantId, email, phone, status | tenantId mandatory | soft-delete required | Pending (Not Yet Modeled) |
| Applications | Candidate to Requirement linkage | Application to Candidate, Requirement, Recruiter | tenantId, candidateId, requirementId, status | tenantId mandatory | soft-delete required | Pending (Not Yet Modeled) |
| Interviews | Interview schedule and outcomes | Interview to Application, Candidate | tenantId, applicationId, scheduledAt, status | tenantId mandatory | soft-delete recommended | Pending (Not Yet Modeled) |
| Placements | Successful joins | Placement to Candidate, Requirement, Invoice | tenantId, joiningDate, status | tenantId mandatory | soft-delete required | Pending (Not Yet Modeled) |
| Timesheets | Work logs and approvals | Timesheet to Placement, User | tenantId, placementId, period, status | tenantId mandatory | soft-delete required | Pending (Not Yet Modeled) |
| Invoices | Billing documents | Invoice to Placement, Tenant | tenantId, invoiceNumber unique per tenant, status | tenantId mandatory | soft-delete required | Pending (Not Yet Modeled) |
| AuditLogs | Immutable operational trails | AuditLog to Tenant, actor user | tenantId, entity/entityId, createdAt | tenantId mandatory; no cross-tenant reads | soft-delete optional but avoid logical edits | Approved with Changes (prefer append-only) |
| Notifications | User-facing alerts | Notification to Tenant, User | tenantId, userId, readAt, createdAt | tenantId mandatory | soft-delete optional | Pending (Not Yet Modeled) |
| Templates | Email/workflow templates | Template to Tenant | tenantId, type, name | tenantId mandatory | soft-delete required | Pending (Not Yet Modeled) |
| Workflows | Automation definitions | Workflow to Tenant, runs | tenantId, trigger, status | tenantId mandatory | soft-delete required | Pending (Not Yet Modeled) |
| APIKeys | Programmatic access keys | ApiKey to Tenant, creator user | tenantId, keyHash unique, status | tenantId mandatory | soft-delete recommended | Pending (Not Yet Modeled) |
| Webhooks | Outbound/inbound integrations | Webhook to Tenant, deliveries | tenantId, event, status | tenantId mandatory | soft-delete recommended | Pending (Not Yet Modeled) |
| Reports | Report definitions and generated jobs | Report to Tenant, creator | tenantId, type, generatedAt | tenantId mandatory | soft-delete recommended | Pending (Not Yet Modeled) |
| AnalyticsEvents | Product telemetry/events | AnalyticsEvent to Tenant, entity | tenantId, eventType, createdAt | tenantId mandatory | generally immutable, no delete preferred | Pending (Not Yet Modeled) |

## Design Gaps Identified
- Missing modeled entities: tenant_settings, tenant_branding, subscriptions, and all CRM/ATS/Operations modules.
- Some currently modeled shared entities use default tenantId system; validate whether this aligns with strict tenant rules.
- createdBy and updatedBy fields from phase design are not yet standardized across current Prisma models.
- Consistent status enums are not yet defined for each operational entity.

## Review Decision
- Prisma foundational direction is valid.
- Full schema is not yet architecture-complete against phase documents.
- Approval recommended only for continuing architecture finalization, not feature implementation yet.
