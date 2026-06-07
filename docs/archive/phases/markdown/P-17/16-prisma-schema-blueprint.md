# 16-prisma-schema-blueprint

Source PDF: P-17/16-prisma-schema-blueprint.pdf

## Page 1

docs/16-prisma-schema-blueprint.md 
 
enum UserStatus { 
  ACTIVE 
  INACTIVE 
  SUSPENDED 
} 
 
enum LeadStatus { 
  NEW 
  CONTACTED 
  QUALIFIED 
  PROPOSAL_SENT 
  CONVERTED 
  LOST 
} 
 
enum RequirementStatus { 
  OPEN 
  IN_PROGRESS 
  ON_HOLD 
  CLOSED 
} 
 
enum ApplicationStatus { 
  SOURCED 
  SCREENED 
  SUBMITTED

## Page 2

INTERVIEW 
  OFFERED 
  JOINED 
  REJECTED 
} 
 
enum InvoiceStatus { 
  DRAFT 
  SENT 
  PAID 
  OVERDUE 
} 
 
 
 
Core Models 
Build in this order: 
Foundation 
Tenant 
Plan 
TenantBranding 
TenantSettings 
Identity 
User 
Role 
Permission 
RolePermission 
Session 
CRM

## Page 3

Company 
Contact 
Lead 
ATS 
Requirement 
Candidate 
CandidateDocument 
Application 
Interview 
Operations 
Placement 
Timesheet 
Invoice 
Automation 
Template 
Workflow 
WorkflowRun 
Notification 
Job 
Administration 
AuditLog 
ApiKey 
Webhook 
WebhookDelivery 
Analytics 
Report 
AnalyticsEvent 
 
Prisma Rules 
Every table must contain: 
id        String   @id @default(cuid()) 
tenantId  String 
createdAt DateTime @default(now())

## Page 4

updatedAt DateTime @updatedAt 
deletedAt DateTime? 
 
Index Strategy 
Every table: 
@@index([tenantId]) 
Frequently searched: 
@@index([status]) 
@@index([createdAt]) 
 
Query Strategy 
Never: 
prisma.company.findMany() 
Always: 
prisma.company.findMany({ 
  where: { 
    tenantId 
  } 
}) 
Tenant filtering should become mandatory.
