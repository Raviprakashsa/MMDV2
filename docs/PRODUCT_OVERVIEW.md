# MMD Recruit CRM V1 — Product Overview

**Date:** 2026-06-07  
**Status:** Release Candidate V1  

---

## 1. Product Vision
MMD Recruit CRM V1 is a unified, secure, multi-tenant recruitment operating platform. It bridges the gap between hiring systems (ATS) and sales pipeline management (CRM) into a single, cohesive workflow. The goal is to replace fragmented systems with a fast, type-safe, and isolated software suite, giving boutique agencies and internal recruiting departments total control over candidate pipelines and client accounts.

---

## 2. Modules Included
- **Applicant Tracking System (ATS):** Fully-featured candidate tracking system including job postings, candidate profiles, visual resume parsing, unified application pipelines, and interview schedules.
- **Customer Relationship Management (CRM):** Enterprise account management with client company directory, contact records with cascading deactivations, and a structured opportunities/leads tracker governed by a rigid Finite State Machine (FSM).
- **Identity & Access Management (IAM):** Core role-based access control engine mapping user credentials to specific capability gates (`SUPER_ADMIN`, `ADMIN`, `COORDINATOR`, `RECRUITER`, `SCRAPER`).

---

## 3. Key Benefits
- **Unified Pipeline:** Transition from a sourced lead to a hired candidate within the same interface.
- **Tenant Isolation:** Absolute database-level data partitioning, ensuring no cross-organization data leakage.
- **Enterprise-Grade Security:** Hardened authorization policies, secure password hashing, CSRF protection, and SQL injection safety.
- **Observability & Reliability:** Integrated Sentry logging for unhandled route crashes and persistent database storage volume attachments.

---

## 4. Target Customers
- **Boutique Recruiting Agencies:** Agencies managing 10-100 recruiters who require a custom-branded database for tracking customer pipelines and talent pools.
- **Corporate HR Teams:** Mid-market internal talent departments searching for an isolated workspace containing strict role hierarchies.
- **Executive Search Firms:** Agencies managing high-value candidate placements that demand secure document storage and strict data privacy boundaries.
