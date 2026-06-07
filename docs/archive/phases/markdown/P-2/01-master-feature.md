# 01-master-feature

Source PDF: P-2/01-master-feature.pdf

## Page 1

MMD V2 - Master Feature Blueprint
1. Overview
MMD V2 is a White Label Multi-Tenant Recruitment Operations Platform.
The platform combines:
CRM
ATS
Recruitment Operations
Automation
Analytics
Administration
into a single system.
2. System Modules
Module Categories
Core Platform
Authentication
User Management
Role Management
Tenant Management
Settings
CRM
Companies
Contacts
Leads
ATS
Requirements
Candidates
Applications
Interviews
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
• 
• 
• 
• 
• 
• 
• 
1

## Page 2

Recruitment Operations
Placements
Timesheets
Invoices
Automation
Templates
Workflows
Notifications
Scheduled Jobs
Analytics
Dashboards
Reports
KPI Tracking
Administration
Audit Logs
API Keys
Webhooks
System Settings
3. Authentication Module
Features
Login
Users can login using:
Email
Password
Forgot Password
Send reset link
Token expiry
Password reset
Session Management
Active sessions
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
• 
• 
• 
• 
• 
• 
• 
• 
• 
2

## Page 3

Device tracking
Logout all devices
Future
MFA
SSO
Google Login
Microsoft Login
4. User Management Module
Features
User Creation
Create user
Fields:
Name
Email
Phone
Designation
Department
Role
User Status
Active
Inactive
Suspended
User Actions
Create
Edit
Delete
Deactivate
Reset Password
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
• 
• 
• 
• 
• 
• 
• 
• 
• 
3

## Page 4

5. Role Management Module
Roles
SUPER_ADMIN
Platform owner
TENANT_OWNER
Company owner
ADMIN
Organization administrator
MANAGER
Team manager
RECRUITER
Recruitment user
SCRAPER
Lead collection user
VIEWER
Read-only access
6. Company Management Module
Features
Company Creation
Fields:
Company Name
Industry
Website
• 
• 
• 
4

## Page 5

Address
Status
Company Actions
Create
Edit
Archive
Delete
Relationships
Company has:
Contacts
Leads
Requirements
Placements
7. Contact Management Module
Features
Store HR contacts.
Fields:
Name
Designation
Email
Phone
Company
Actions:
Create
Edit
Delete
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
• 
• 
• 
• 
• 
• 
• 
5

## Page 6

8. Lead Management Module
Features
Lead Creation
Fields:
Lead Name
Company
Contact
Source
Status
Assigned User
Lead Status
New
Contacted
Qualified
Proposal Sent
Converted
Lost
Lead Actions
Assign
Reassign
Convert
Archive
9. Requirement Management Module
Features
Requirement Creation
Fields:
Job Title
Client
Openings
Experience
Skills
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
6

## Page 7

Budget
Location
Requirement Status
Open
In Progress
On Hold
Closed
Actions
Create
Assign Recruiters
Track Progress
Close Requirement
10. Candidate Management Module
Features
Candidate Profile
Fields:
Name
Email
Phone
Skills
Experience
Resume
Candidate Actions
Create
Edit
Archive
Delete
Resume Management
Upload Resume
Download Resume
Version Tracking
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
• 
7

## Page 8

11. Application Pipeline
Stages
Sourced
Screened
Submitted
Interview Scheduled
Interview Completed
Offered
Joined
Rejected
Track movement between stages.
12. Interview Management
Features
Schedule Interview
Fields:
Candidate
Requirement
Date
Time
Interviewer
Status
Scheduled
Completed
Rescheduled
Cancelled
13. Placement Management
Features
Track successful placements.
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
• 
• 
• 
• 
• 
• 
8

## Page 9

Fields:
Candidate
Client
Position
Joining Date
Billing Amount
Actions:
Create
Edit
Invoice Generation
14. Timesheet Management
Features
Track consultant working hours.
Fields:
Employee
Client
Hours
Period
Actions:
Submit
Approve
Reject
15. Invoice Management
Features
Generate billing records.
Fields:
Client
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
• 
• 
• 
• 
• 
9

## Page 10

Placement
Amount
Due Date
Status:
Draft
Sent
Paid
Overdue
16. Notification Module
Channels
In-App
Email
Future:
WhatsApp
SMS
17. Template Module
Template Types
Email
Notification
Workflow
Actions:
Create
Edit
Clone
Archive
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
• 
• 
• 
• 
• 
• 
• 
10

## Page 11

18. Automation Module
Workflow Engine
Trigger
↓
Condition
↓
Action
Examples:
Lead Created
↓
Assign Recruiter
↓
Send Notification
19. Reporting Module
Reports
Lead Reports
Requirement Reports
Candidate Reports
Placement Reports
Revenue Reports
Recruiter Reports
11

## Page 12

20. Dashboard Module
Executive Dashboard
Metrics:
Leads
Requirements
Candidates
Placements
Revenue
Recruiter Dashboard
Metrics:
Assigned Requirements
Submissions
Interviews
Placements
21. Audit Module
Track:
Login
Logout
Record Changes
Permission Changes
Data Access
22. Webhook Module
Events:
Lead Created
Candidate Created
Placement Created
Actions:
Retry
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
• 
• 
• 
• 
• 
• 
• 
12

## Page 13

Reprocess
Monitor
23. API Key Module
Create API keys for:
Integrations
External Applications
Automation Systems
24. White Label Module
Tenant Branding
Fields:
Logo
Theme
Colors
Domain
25. Future AI Module
Resume Parser
Candidate Matching
Requirement Matching
AI Insights
AI Recruiter Assistant
• 
• 
• 
• 
• 
• 
• 
• 
• 
13

## Page 14

Feature Priority
Phase 1
Authentication Users Roles Companies Contacts Leads Requirements Candidates Placements Reports
Phase 2
Automation Templates Notifications Timesheets Invoices
Phase 3
White Label Webhooks API Keys
Phase 4
AI Features Advanced Analytics Client Portal Candidate Portal
14
