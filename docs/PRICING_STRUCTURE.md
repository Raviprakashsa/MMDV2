# MMD Recruit CRM V1 — Pricing Structure

**Date:** 2026-06-07  

---

## 1. Subscription Tiers

| Tier | Target Audience | Price | Core Inclusion |
|---|---|---|---|
| **Starter** | Small agencies / Boutique teams | **$79** / user / month | 1 Tenant Workspace, up to 5 Recruiters, ATS Core module, Local storage backend. |
| **Growth** | Scaling search firms | **$129** / user / month | 1 Tenant Workspace, unlimited users, Full CRM & ATS modules, S3 document storage, Redis rate-limiting. |
| **Enterprise** | Large corporate teams / Multi-brand | **Custom Quote** | Multi-tenant setup, dedicated VPS orchestration, Sentry monitoring access, custom DB backup schedule, custom SLA. |

---

## 2. Feature Comparison Matrix

| Feature | Starter | Growth | Enterprise |
|---|---|---|---|
| **Multi-Tenancy** | ✅ (Single) | ✅ (Single) | ✅ (Multiple Tenant Workspaces) |
| **ATS Module** | ✅ | ✅ | ✅ |
| **CRM Module** | Read-Only | ✅ Full CRUD | ✅ Full CRUD |
| **Document Uploads** | ✅ Local storage | ✅ AWS S3 integration | ✅ Dedicated / Isolated S3 |
| **API Keys Management** | ❌ | ✅ | ✅ |
| **Sentry Monitoring** | ❌ | ❌ | ✅ Dedicated DSN |
| **Backup Strategy** | Weekly | Daily | Custom Retention & Frequency |
| **Support** | Email | Priority Email | Dedicated Slack + SLA |
