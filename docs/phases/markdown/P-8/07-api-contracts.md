# 07-api-contracts

Source PDF: P-8/07-api-contracts.pdf

## Page 1

MMD V2 - API Contracts
1. API Architecture
Style:
REST API
Versioning:
/api/v1
Format:
JSON
Authentication:
JWT Session (Auth.js)
Authorization:
RBAC Middleware
Validation:
Zod
2. Standard Response Format
Success
{ "success": true, "message": "Operation successful", "data": {} }
Error
{ "success": false, "message": "Validation failed", "errors": [] }
1

## Page 2

3. Authentication APIs
Base Route:
/api/v1/auth
POST /login
POST /logout
POST /forgot-password
POST /reset-password
GET /session
4. User APIs
Base Route:
/api/v1/users
GET /
POST /
GET /:id
PATCH /:id
DELETE /:id
POST /:id/reset-password
POST /:id/activate
POST /:id/deactivate
5. Role APIs
Base Route:
2

## Page 3

/api/v1/roles
GET /
POST /
PATCH /:id
DELETE /:id
GET /:id/permissions
POST /:id/permissions
6. Company APIs
Base Route:
/api/v1/companies
GET /
POST /
GET /:id
PATCH /:id
DELETE /:id
GET /:id/contacts
GET /:id/leads
GET /:id/requirements
GET /:id/placements
7. Contact APIs
Base Route:
3

## Page 4

/api/v1/contacts
GET /
POST /
GET /:id
PATCH /:id
DELETE /:id
8. Lead APIs
Base Route:
/api/v1/leads
GET /
POST /
GET /:id
PATCH /:id
DELETE /:id
POST /:id/assign
POST /:id/convert
POST /:id/archive
9. Requirement APIs
Base Route:
/api/v1/requirements
GET /
4

## Page 5

POST /
GET /:id
PATCH /:id
DELETE /:id
POST /:id/assign-recruiter
POST /:id/close
10. Candidate APIs
Base Route:
/api/v1/candidates
GET /
POST /
GET /:id
PATCH /:id
DELETE /:id
POST /:id/upload-resume
GET /:id/resume
GET /:id/applications
GET /:id/interviews
11. Application APIs
Base Route:
/api/v1/applications
5

## Page 6

GET /
POST /
GET /:id
PATCH /:id
DELETE /:id
POST /:id/change-stage
POST /:id/assign
12. Interview APIs
Base Route:
/api/v1/interviews
GET /
POST /
GET /:id
PATCH /:id
DELETE /:id
POST /:id/reschedule
POST /:id/cancel
POST /:id/feedback
13. Placement APIs
Base Route:
/api/v1/placements
6

## Page 7

GET /
POST /
GET /:id
PATCH /:id
DELETE /:id
POST /:id/generate-invoice
14. Timesheet APIs
Base Route:
/api/v1/timesheets
GET /
POST /
GET /:id
PATCH /:id
POST /:id/approve
POST /:id/reject
15. Invoice APIs
Base Route:
/api/v1/invoices
GET /
POST /
GET /:id
7

## Page 8

PATCH /:id
POST /:id/send
POST /:id/mark-paid
16. Template APIs
Base Route:
/api/v1/templates
GET /
POST /
GET /:id
PATCH /:id
DELETE /:id
POST /:id/clone
17. Workflow APIs
Base Route:
/api/v1/workflows
GET /
POST /
GET /:id
PATCH /:id
DELETE /:id
POST /:id/activate
8

## Page 9

POST /:id/deactivate
18. Notification APIs
Base Route:
/api/v1/notifications
GET /
GET /:id
POST /:id/read
POST /mark-all-read
19. Report APIs
Base Route:
/api/v1/reports
GET /
POST /generate
GET /:id
GET /:id/download
20. Dashboard APIs
Base Route:
/api/v1/dashboard
GET /executive
GET /manager
9

## Page 10

GET /recruiter
GET /analytics
21. Audit APIs
Base Route:
/api/v1/audit-logs
GET /
GET /:id
22. API Key APIs
Base Route:
/api/v1/api-keys
GET /
POST /
DELETE /:id
23. Webhook APIs
Base Route:
/api/v1/webhooks
GET /
POST /
PATCH /:id
DELETE /:id
10

## Page 11

POST /:id/test
GET /:id/deliveries
24. Tenant APIs
Base Route:
/api/v1/tenant
GET /
PATCH /
GET /branding
PATCH /branding
25. Search APIs
Base Route:
/api/v1/search
GET /global
Search Across:
Companies
Contacts
Leads
Requirements
Candidates
Placements
11

## Page 12

26. API Middleware
Every API Request
↓
Authentication
↓
Tenant Validation
↓
Permission Validation
↓
Zod Validation
↓
Controller
↓
Service
↓
Repository
↓
Prisma
↓
Database
12

## Page 13

27. Pagination Standard
?page=1
&limit=25
&sort=createdAt
&order=desc
28. Filtering Standard
?status=OPEN
?assignedTo=userId
?companyId=id
29. API Security
Rate Limiting
Input Validation
Tenant Isolation
RBAC
Audit Logging
Soft Deletes
30. Future APIs
WhatsApp
AI Assistant
Resume Parser
13

## Page 14

Client Portal
Candidate Portal
Billing
Subscriptions
SSO
14
