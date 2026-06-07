# 05-screen-inventory

Source PDF: P-6/05-screen-inventory.pdf

## Page 1

MMD V2 - Screen Inventory
1. Overview
This document defines every screen in the platform.
For every screen we define:
Route
Purpose
User Roles
Components
APIs
Database Entities
Actions
AUTHENTICATION
Login Screen
Route:
/login
Purpose:
Authenticate users.
Roles:
All Users
Components:
Email
Password
Login Button
Forgot Password
APIs:
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
1

## Page 2

POST /api/auth/login
Entities:
users
Actions:
Login
Forgot Password
Route:
/forgot-password
Purpose:
Reset password.
Roles:
All Users
Entities:
users
Actions:
Send Reset Link
DASHBOARD
Executive Dashboard
Route:
/dashboard
• 
• 
2

## Page 3

Purpose:
Business overview.
Roles:
SUPER_ADMIN TENANT_OWNER ADMIN
Components:
KPI Cards
Charts
Reports
APIs:
GET /api/dashboard
Entities:
companies leads requirements candidates placements
Actions:
View Metrics
Recruiter Dashboard
Route:
/dashboard/recruiter
Purpose:
Recruiter performance.
Roles:
RECRUITER
Entities:
requirements candidates applications
• 
• 
• 
• 
3

## Page 4

Actions:
View Assigned Work
CRM
Companies List
Route:
/companies
Purpose:
Manage client companies.
Roles:
ADMIN MANAGER SCRAPER
Entities:
companies
Actions:
Search
Create
Edit
Archive
Company Details
Route:
/companies/[id]
Purpose:
View company.
• 
• 
• 
• 
• 
4

## Page 5

Entities:
companies contacts leads requirements
Actions:
View
Edit
Create Company
Route:
/companies/new
Purpose:
Add company.
Entities:
companies
Actions:
Create
Contacts List
Route:
/contacts
Purpose:
Manage contacts.
Entities:
contacts
• 
• 
• 
5

## Page 6

Actions:
Create
Edit
Delete
Contact Details
Route:
/contacts/[id]
Purpose:
View contact.
Entities:
contacts
Leads List
Route:
/leads
Purpose:
Manage leads.
Entities:
leads
Actions:
Create
Assign
Convert
• 
• 
• 
• 
• 
• 
6

## Page 7

Lead Details
Route:
/leads/[id]
Purpose:
View lead.
Entities:
leads
Actions:
Update
Convert
ATS
Requirements List
Route:
/requirements
Purpose:
Manage requirements.
Entities:
requirements
Actions:
Create
Assign Recruiters
Close
• 
• 
• 
• 
• 
7

## Page 8

Requirement Details
Route:
/requirements/[id]
Entities:
requirements applications
Actions:
View Pipeline
Candidates List
Route:
/candidates
Purpose:
Candidate database.
Entities:
candidates
Actions:
Search
Import
Export
Candidate Details
Route:
/candidates/[id]
Entities:
• 
• 
• 
• 
8

## Page 9

candidates documents applications
Actions:
Resume Upload
Resume Download
Candidate Create
Route:
/candidates/new
Actions:
Create Candidate
Applications List
Route:
/applications
Entities:
applications
Actions:
Manage Pipeline
Interviews List
Route:
/interviews
Entities:
interviews
• 
• 
• 
• 
9

## Page 10

Actions:
Schedule
Reschedule
Cancel
Interview Details
Route:
/interviews/[id]
Entities:
interviews
Actions:
Feedback
OPERATIONS
Placements List
Route:
/placements
Entities:
placements
Actions:
Create
Edit
• 
• 
• 
• 
• 
• 
10

## Page 11

Placement Details
Route:
/placements/[id]
Entities:
placements
Actions:
Generate Invoice
Timesheets
Route:
/timesheets
Entities:
timesheets
Actions:
Submit
Approve
Timesheet Details
Route:
/timesheets/[id]
Entities:
timesheets
Actions:
Approve
• 
• 
• 
• 
11

## Page 12

Reject
Invoices
Route:
/invoices
Entities:
invoices
Actions:
Generate
Send
Invoice Details
Route:
/invoices/[id]
Entities:
invoices
Actions:
Mark Paid
AUTOMATION
Templates
Route:
/templates
• 
• 
• 
• 
12

## Page 13

Entities:
templates
Actions:
Create
Edit
Clone
Template Details
Route:
/templates/[id]
Entities:
templates
Actions:
Update
Workflows
Route:
/workflows
Entities:
workflows
Actions:
Create Automation
Workflow Builder
Route:
• 
• 
• 
• 
• 
13

## Page 14

/workflows/[id]
Entities:
workflows
Actions:
Configure Steps
Notifications
Route:
/notifications
Entities:
notifications
Actions:
View
Archive
ANALYTICS
Reports
Route:
/reports
Entities:
reports
Actions:
Export
• 
• 
• 
• 
14

## Page 15

Recruiter Reports
Route:
/reports/recruiters
Entities:
recruiters
Actions:
Analyze Performance
Placement Reports
Route:
/reports/placements
Entities:
placements
Actions:
Revenue Analysis
Revenue Reports
Route:
/reports/revenue
Entities:
invoices placements
Actions:
Financial Tracking
• 
• 
• 
15

## Page 16

ADMINISTRATION
Users
Route:
/users
Entities:
users
Actions:
Create
Edit
Disable
User Details
Route:
/users/[id]
Entities:
users
Actions:
Reset Password
Roles
Route:
/roles
Entities:
• 
• 
• 
• 
16

## Page 17

roles
Actions:
Assign Permissions
Audit Logs
Route:
/audit-logs
Entities:
audit_logs
Actions:
Search
API Keys
Route:
/api-keys
Entities:
api_keys
Actions:
Create
Revoke
Webhooks
Route:
/webhooks
• 
• 
• 
• 
17

## Page 18

Entities:
webhooks
Actions:
Create
Retry
SETTINGS
Organization Settings
Route:
/settings/organization
Entities:
tenant_settings
Actions:
Update
Branding
Route:
/settings/branding
Entities:
branding
Actions:
Upload Logo
• 
• 
• 
• 
18

## Page 19

Preferences
Route:
/settings/preferences
Entities:
preferences
Actions:
Configure
FUTURE MODULES
Client Portal
Route:
/portal/client
Candidate Portal
Route:
/portal/candidate
Job Board
Route:
/jobs
AI Assistant
Route:
• 
19

## Page 20

/assistant
TOTAL SCREEN COUNT
Core Screens: ~45+
Future Screens: ~15+
Expected Total: 60–70 Screens
20
