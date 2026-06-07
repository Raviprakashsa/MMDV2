# 02-module-breakdown

Source PDF: P-3/02-module-breakdown.pdf

## Page 1

MMD V2 - Module Breakdown
1. Module Architecture Overview
The platform is divided into six primary domains.
Core Platform
CRM
ATS
Operations
Automation
Analytics
Each domain owns its data and business rules.
2. Core Platform Module
Purpose
Manage platform-level functionality.
Sub Modules
Authentication
Responsibilities:
Login
Logout
Password Reset
Session Management
Owns:
Users
Sessions
1. 
2. 
3. 
4. 
5. 
6. 
• 
• 
• 
• 
• 
• 
1

## Page 2

Authorization
Responsibilities:
RBAC
Permissions
Access Control
Owns:
Roles
Permissions
Tenant Management
Responsibilities:
Multi Tenant Isolation
Branding
Subscription
Owns:
Tenants
Tenant Settings
User Management
Responsibilities:
User Lifecycle
Team Management
Owns:
Users
User Profiles
Settings
Responsibilities:
Organization Settings
System Preferences
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

Owns:
Settings
Configurations
3. CRM Module
Purpose
Manage customer acquisition and business development.
Company Management
Responsibilities:
Company Records
Client Management
Owns:
Companies
Company Metadata
Dependencies:
Contacts
Requirements
Placements
Contact Management
Responsibilities:
HR Contacts
Decision Makers
Owns:
Contacts
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

Dependencies:
Companies
Lead Management
Responsibilities:
Lead Tracking
Sales Pipeline
Owns:
Leads
Dependencies:
Companies
Contacts
4. ATS Module
Purpose
Manage recruitment lifecycle.
Requirement Management
Responsibilities:
Job Requisitions
Hiring Requests
Owns:
Requirements
Dependencies:
Companies
Recruiters
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
4

## Page 5

Candidate Management
Responsibilities:
Candidate Database
Resume Management
Owns:
Candidates
Candidate Documents
Dependencies:
Requirements
Application Management
Responsibilities:
Candidate Pipeline
Owns:
Applications
Dependencies:
Candidates
Requirements
Interview Management
Responsibilities:
Interview Scheduling
Feedback Tracking
Owns:
Interviews
Dependencies:
Candidates
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

Applications
5. Operations Module
Purpose
Manage revenue-generating activities.
Placement Management
Responsibilities:
Successful Placements
Owns:
Placements
Dependencies:
Candidates
Requirements
Timesheet Management
Responsibilities:
Work Tracking
Owns:
Timesheets
Dependencies:
Placements
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

Invoice Management
Responsibilities:
Billing
Owns:
Invoices
Dependencies:
Placements
Companies
6. Automation Module
Purpose
Reduce manual work.
Template Management
Responsibilities:
Email Templates
Notification Templates
Owns:
Templates
Workflow Engine
Responsibilities:
Trigger Based Automation
Owns:
Workflows
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

Dependencies:
All Modules
Notification Center
Responsibilities:
System Notifications
Owns:
Notifications
Dependencies:
Workflows
Job Scheduler
Responsibilities:
Scheduled Jobs
Owns:
Job Queue
Dependencies:
Workflows
7. Analytics Module
Purpose
Business Intelligence and Reporting.
• 
• 
• 
• 
• 
• 
• 
8

## Page 9

Dashboard Engine
Responsibilities:
KPI Visualization
Dependencies:
All Modules
Reports Engine
Responsibilities:
Reports
Exports
Dependencies:
All Modules
Analytics Engine
Responsibilities:
Metrics
Trends
Dependencies:
All Modules
8. Administration Module
Purpose
System Governance.
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

Audit Logs
Responsibilities:
Activity Tracking
Owns:
Audit Logs
API Keys
Responsibilities:
Integration Security
Owns:
API Keys
Webhooks
Responsibilities:
External Integrations
Owns:
Webhooks
9. White Label Module
Purpose
Tenant Customization.
• 
• 
• 
• 
• 
• 
10

## Page 11

Branding
Owns:
Logo
Theme
Colors
Domains
Owns:
Custom Domains
Plans
Owns:
Subscription Plans
10. Data Ownership Matrix
Authentication
Owns:
Users
Sessions
CRM
Owns:
Companies
Contacts
Leads
ATS
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
11

## Page 12

Owns:
Requirements
Candidates
Applications
Interviews
Operations
Owns:
Placements
Timesheets
Invoices
Automation
Owns:
Templates
Workflows
Notifications
Jobs
Administration
Owns:
Audit Logs
API Keys
Webhooks
White Label
Owns:
Tenants
Branding
Domains
11. Module Dependencies
Lowest Dependency:
Authentication Authorization Tenant
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

↓
CRM
↓
ATS
↓
Operations
↓
Automation
↓
Analytics
This order must be respected during development.
12. Build Order
Phase 1
Authentication Authorization Tenant Users
Phase 2
Companies Contacts Leads
Phase 3
Requirements Candidates Applications Interviews
Phase 4
Placements Timesheets Invoices
Phase 5
Templates Notifications Workflows
13

## Page 14

Phase 6
Reports Analytics Dashboards
Phase 7
White Label Webhooks API Keys
Phase 8
AI Features
14
