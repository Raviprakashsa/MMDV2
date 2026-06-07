# MMD V2 — Administrator Guide

**Date:** 2026-06-07  
**Scope:** Tenant Management, IAM, Platform Settings  

---

## 1. Overview
The Admin Console provides `SUPER_ADMIN` and `ADMIN` users with controls to configure tenant settings, manage user accounts, assign roles, and audit sessions.

---

## 2. Tenant Management
MMD V2 operates on a strict multi-tenant architecture. All database transactions are automatically filtered by `tenantId`.

### Creating a Tenant
1. Navigate to `/dashboard/tenants/new` (restricted to `SUPER_ADMIN`).
2. Input the tenant details (Company name, domain, custom branding).
3. Save to initialize the tenant workspace.

### Custom Branding
Admins can customize:
- Logo URL
- Primary theme color
- Subdomain config

---

## 3. Identity & Access Management (IAM)

### Role Model Definitions
- **SUPER_ADMIN:** Complete platform control, multi-tenant creation, access to raw telemetry.
- **ADMIN:** Full control over a single tenant workspace (create users, override roles).
- **COORDINATOR (Manager):** Full CRUD control over CRM and ATS operational flows.
- **RECRUITER:** Full CRUD over ATS module, read-only access to CRM contacts and companies.
- **SCRAPER:** Read-only access to pipeline endpoints (no UI write actions permitted).

### User Management
- **User Creation:** Access `/dashboard/users` and click **Create User**. Enter name, email, starting password, and assign the appropriate role.
- **Role Editing:** Navigate to a user's detail page (`/a2/users/[id]/edit`) to elevate or downgrade role permissions.

---

## 4. Platform Settings
Navigate to `/dashboard/settings` to:
- Configure S3 upload storage buckets.
- Retrieve the webhook processing secret.
- Rotate internal application integration keys.
