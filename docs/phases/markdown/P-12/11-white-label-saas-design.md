# 11-white-label-saas-design

Source PDF: P-12/11-white-label-saas-design.pdf

## Page 1

MMD V2 - White Label SaaS Design
Goal
Allow multiple recruitment companies to use the same platform while appearing as completely
independent products.
Multi Tenant Strategy
Architecture:
Shared Database
Shared Schema
Tenant Isolation
Every business record contains:
tenantId
Tenant Structure
Tenant
├ Users
├ Companies
├ Leads
├ Requirements
├ Candidates
├ Placements
├ Branding
1

## Page 2

├ Settings
└ Subscription
Tenant Branding
Customizable:
Logo
Favicon
Primary Color
Secondary Color
Email Templates
Custom Domain
Login Page Branding
Dashboard Branding
Domain Strategy
Primary
tenant.mmd.com
Custom
ats.company.com
jobs.company.com
recruit.company.com
2

## Page 3

Tenant Settings
Timezone
Currency
Language
Date Format
Recruitment Workflow
Notification Preferences
Subscription Plans
Starter
Growth
Professional
Enterprise
Feature Flags
Enable/Disable:
Automation
API Access
Webhooks
Advanced Reports
AI Features
Client Portal
Candidate Portal
3

## Page 4

Usage Limits
Users
Storage
Candidates
Requirements
API Requests
Reports
Tenant Lifecycle
Create
↓
Trial
↓
Active
↓
Suspended
↓
Cancelled
Future Enterprise
SAML
OIDC
4

## Page 5

Custom Compliance
Custom Data Retention
Dedicated Infrastructure
5
