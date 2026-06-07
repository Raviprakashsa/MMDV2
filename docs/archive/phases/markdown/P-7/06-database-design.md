# 06-database-design

Source PDF: P-7/06-database-design.pdf

## Page 1

MMD V2 - Database Design
DATABASE OVERVIEW
Database Engine: PostgreSQL
ORM: Prisma
Architecture: Multi Tenant SaaS
Pattern: Shared Database Shared Schema Tenant Isolation
Every business table contains: tenantId
This ensures tenant-level isolation.
DATABASE STANDARDS
Every table contains: id createdAt updatedAt createdBy updatedBy
Optional: deletedAt
Soft delete strategy: deletedAt IS NULL
CORE IDENTITY MODULE
tenants Purpose: Represents customer organizations. Fields: id name slug logo primaryColor domain status planId 
createdAt updatedAt Relationships: Tenant → Users → Companies → Leads → Requirements → Candidates → 
Placements
plans Purpose: Subscription plans. Fields: id name maxUsers maxStorage maxCandidates features
users Purpose: Platform users. Fields: id tenantId roleId name email phone passwordHash status lastLoginAt 
Relationships: User → Role → Activities → Audit Logs Indexes: email UNIQUE tenantId + email UNIQUE
roles Purpose: Role management. Fields: id tenantId name description Examples: SUPER_ADMIN OWNER ADMIN 
MANAGER RECRUITER SCRAPER VIEWER
permissions Fields: id name module action Example: companies.create companies.read companies.update
role_permissions Purpose: Role mapping. Fields: roleId permissionId
CRM MODULE
companies Fields: id tenantId name industry website address status Relationships: Company → Contacts → Leads → 
Requirements → Placements Indexes: tenantId name status
contacts Fields: id tenantId companyId name email phone designation Relationships: Contact → Company
leads Fields: id tenantId companyId contactId assignedTo source status notes Status: NEW CONTACTED 
QUALIFIED PROPOSAL_SENT CONVERTED LOST Relationships: Lead → Company → Contact → User
ATS MODULE
requirements Fields: id tenantId companyId title skills experience budget location openings status Status: OPEN 
IN_PROGRESS ON_HOLD CLOSED Relationships: Requirement → Company → Applications
candidates Fields: id tenantId firstName lastName email phone experience currentCompany currentCTC expectedCTC 
Relationships: Candidate → Documents → Applications → Interviews Indexes: email phone
candidate_documents Fields: id tenantId candidateId fileName fileUrl version Types: RESUME OFFER OTHER
applications Fields: id tenantId candidateId requirementId status assignedRecruiter Pipeline: SOURCED SCREENED 
SUBMITTED INTERVIEW OFFERED JOINED REJECTED

## Page 2

interviews Fields: id tenantId candidateId applicationId interviewer scheduledAt status feedback Status: SCHEDULED 
COMPLETED RESCHEDULED CANCELLED
OPERATIONS MODULE
placements Fields: id tenantId candidateId requirementId joiningDate billingAmount Relationships: Placement → 
Invoice
timesheets Fields: id tenantId placementId employeeId hoursWorked weekStart weekEnd status Status: SUBMITTED 
APPROVED REJECTED
invoices Fields: id tenantId placementId invoiceNumber amount dueDate status Status: DRAFT SENT PAID 
OVERDUE
AUTOMATION MODULE
templates Fields: id tenantId name type subject content Types: EMAIL NOTIFICATION WORKFLOW
workflows Fields: id tenantId name trigger conditions actions status
workflow_runs Fields: id workflowId status startedAt completedAt logs
notifications Fields: id tenantId userId title message type readAt
jobs Purpose: Queue system. Fields: id tenantId type payload status scheduledAt processedAt Status: PENDING 
PROCESSING COMPLETED FAILED No Redis required initially. Database queue only.
REPORTING MODULE
reports Fields: id tenantId name type filters generatedBy generatedAt
analytics_events Fields: id tenantId eventType entityType entityId metadata createdAt Used for: Dashboards Analytics 
Future AI
ADMINISTRATION MODULE
audit_logs Fields: id tenantId userId action entity entityId oldValue newValue createdAt
api_keys Fields: id tenantId name keyHash status
webhooks Fields: id tenantId name url events status
webhook_deliveries Fields: id webhookId status requestPayload responsePayload attemptCount
WHITE LABEL MODULE
tenant_branding Fields: id tenantId logo primaryColor secondaryColor domain
tenant_settings Fields: id tenantId timezone currency dateFormat language
INDEX STRATEGY
Always Index: tenantId status createdAt Foreign Keys
Additional Indexes: users(email) companies(name) candidates(email) candidates(phone) requirements(status) 
placements(joiningDate)
SOFT DELETE STRATEGY
Do not delete business records. Use: deletedAt deletedBy Restore capability required.
AUDIT STRATEGY

## Page 3

Track: Create Update Delete Login Logout Permission Changes Role Changes Store in: audit_logs
FUTURE TABLES
subscription_usage billing_transactions client_portal_users candidate_portal_users resume_parsing_results 
ai_recommendations conversation_history knowledge_base
DATABASE GROWTH STRATEGY
Phase 1 Single PostgreSQL Instance ↓ Phase 2 Read Replicas ↓ Phase 3 Partition Large Tables ↓ Phase 4 Data 
Warehouse Analytics Database
This design supports: 10 Tenants 100 Tenants 1000 Tenants 10000 Tenants without redesigning the database.
