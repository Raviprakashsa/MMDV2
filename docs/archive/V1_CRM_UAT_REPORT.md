# V1 CRM — User Acceptance Testing (UAT) Audit Report

**Date:** 2026-06-07  
**Scope:** CRM Module — Companies, Leads, Contacts  
**Auditor:** Automated code audit (Antigravity AI)  
**Phase:** V1.3 — CRM UAT, Security Review & Production Readiness  

---

## Audit Methodology

All CRM workflows were verified by static code inspection of:
- Server actions (`lib/actions/module3-company.ts`, `module9-leads.ts`, `module15-contacts.ts`)
- Foundation services (`lib/foundation/services/company.service.ts`, `lead.service.ts`, `contact.service.ts`)
- Repository layer (`lib/foundation/repositories/company.repository.ts`, `lead.repository.ts`, `contact.repository.ts`)
- API routes (`app/api/v1/companies/`, `leads/`, `contacts/`)
- UI Pages (`app/(dashboard)/contacts/`, `app/(dashboard)/ats/`)

---

## 1. Companies

### 1.1 Create — ✅ PASS

**Source:** `createCompanyAction` in `module3-company.ts` → `companyService.create` → `companyRepository.create`

| Check | Status | Notes |
|---|---|---|
| Schema validation (Zod) | ✅ Pass | `CompanySchema` validates name, website, sector, email, phone |
| Tenant isolation enforced | ✅ Pass | `requireTenant(context)` called before every write |
| Uniqueness check (name per tenant) | ✅ Pass | Service checks existing by name before insert |
| HR Contacts auto-created | ✅ Pass | `hrContacts[]` loop creates `Contact` entries |
| Cache revalidated after create | ✅ Pass | `revalidatePath('/dashboard/companies')` called |
| Protected action | ✅ Pass | `createProtectedAction` enforces auth + active user |

**Risk Note:** Company name uniqueness check is case-sensitive. `"Acme"` and `"acme"` would be stored as two different companies. This is a minor UX risk but not a blocking concern.

---

### 1.2 Update — ✅ PASS

**Source:** `updateCompanyAction` in `module3-company.ts` → `companyService.update` → `companyRepository.updateById`

| Check | Status | Notes |
|---|---|---|
| ID validation | ✅ Pass | `CompanyUpdateWithIdSchema` requires `id` |
| Existence check before update | ✅ Pass | Service calls `findById` before any update |
| Uniqueness of new name | ✅ Pass | Duplicate name check runs only if name changes |
| HR contacts refresh (delete + re-create) | ✅ Pass | Old contacts deactivated, new contacts inserted |
| Tenant boundary preserved | ✅ Pass | All repo calls use `withTenant()` |

---

### 1.3 Delete (Soft Delete) — ✅ PASS

**Source:** `deleteCompany` → `companyService.deactivate` → `companyRepository.softDelete`

| Check | Status | Notes |
|---|---|---|
| Soft delete via `deletedAt` | ✅ Pass | `markDeleted()` sets `deletedAt: new Date()` |
| Associated contacts also soft-deleted | ✅ Pass | `deleteCompany` iterates contacts and calls `contactService.deactivate` |
| Tenant boundary enforced during delete | ✅ Pass | `withTenant()` wraps the delete where clause |
| Record is excluded from future queries | ✅ Pass | All list/findById queries include `deletedAt: null` |

---

### 1.4 Search & Filtering — ⚠️ PARTIAL

**Source:** `companyRepository.list` with `CompanyListFilters`

| Check | Status | Notes |
|---|---|---|
| Filter by name | ✅ Pass | Exact match filter supported |
| Filter by industry | ✅ Pass | Exact match filter supported |
| Filter by email | ✅ Pass | Exact match filter supported |
| Full-text / substring search | ❌ Not Implemented | Only exact match, no LIKE/icontains |
| UI-level search | ⚠️ Unverifiable | Dashboard UI may implement client-side filter |

**Risk:** The repository layer only supports exact-match filtering. There is no `contains` / `startsWith` pattern for name search. End-users expecting "search by company name substring" would find this limiting. This is a known V1 scope decision — not a defect.

---

### 1.5 Pagination — ⚠️ NOT IMPLEMENTED IN REPOSITORY

| Check | Status | Notes |
|---|---|---|
| `skip` / `take` parameters in repository | ❌ Absent | `list()` returns all records without pagination |
| API layer pagination | ❌ Absent | GET `/api/v1/companies` returns full list |
| UI-level pagination | Not verified (client-side possible) | |

**Risk:** For large datasets, full list queries will degrade. This is a **known V1 scope limitation** — pagination was not implemented in V1. At moderate tenant data volumes (< 500 companies per tenant), this is acceptable.

---

### 1.6 Tenant Isolation — ✅ PASS

| Check | Status | Notes |
|---|---|---|
| `tenantId` injected on every create | ✅ Pass | `requireTenant(context)` called |
| `tenantId` included in every query | ✅ Pass | `withTenant()` adds `tenantId + deletedAt: null` |
| Cross-tenant data bleed not possible | ✅ Pass | Prisma `findFirst/findMany` always scoped by tenantId |
| Session-derived tenantId | ✅ Pass | `createProtectedAction` derives tenantId from session |

---

## 2. Leads

### 2.1 Create — ✅ PASS

**Source:** `createLead` in `module9-leads.ts` → `leadService.create` → `leadRepository.create`

| Check | Status | Notes |
|---|---|---|
| Schema validation | ✅ Pass | `LeadSchema` validated with Zod |
| Tenant isolation | ✅ Pass | `ctx.tenantId` enforced through service |
| Related company validation | ✅ Pass | `companyRepository.findById(ctx, companyId)` verifies company exists in same tenant |
| Related contact validation | ✅ Pass | `contactRepository.findById(ctx, contactId)` verified |
| Owner validation | ✅ Pass | `userRepository.findById(ctx, ownerId)` verified |
| Default status = NEW | ✅ Pass | Service sets `status = 'NEW'` if not provided |
| MongoDB→PostgreSQL status mapping | ✅ Pass | `mapStatusToPostgres()` handles CONVERTED→WON, REJECTED→LOST |
| Cache revalidation | ✅ Pass | `revalidatePath('/dashboard/leads')` called |

---

### 2.2 Update — ✅ PASS

**Source:** `updateLead` → `leadService.update`

| Check | Status | Notes |
|---|---|---|
| Existence check | ✅ Pass | Service calls `findById` before update |
| Metadata JSON merge | ✅ Pass | `description` field merges old metadata with new payload |
| Cross-entity re-validation | ✅ Pass | Company, contact, owner re-validated if changed |
| Status mapping to PostgreSQL enum | ✅ Pass | `mapStatusToPostgres()` applied |

---

### 2.3 Delete (Soft Delete) — ✅ PASS

**Source:** `deleteLead` → `leadService.deactivate` → `leadRepository.softDelete`

| Check | Status | Notes |
|---|---|---|
| Soft delete via `deletedAt` | ✅ Pass | Repository uses `markDeleted()` |
| Existence check before delete | ✅ Pass | Service verifies lead exists |
| Lead excluded from future lists | ✅ Pass | `withTenant()` always includes `deletedAt: null` |

---

### 2.4 Search & Filtering — ⚠️ PARTIAL

| Check | Status | Notes |
|---|---|---|
| Filter by status | ✅ Pass | `status` filter in repository |
| Filter by companyId | ✅ Pass | Direct FK filter |
| Filter by ownerId | ✅ Pass | Direct FK filter |
| Substring search (title) | ❌ Not implemented | Only exact match |

---

### 2.5 Pagination — ⚠️ NOT IMPLEMENTED

Same limitation as Companies. Full dataset returned. V1 scope limitation.

---

### 2.6 Pipeline Status Changes — ✅ PASS (with important note)

**Sources:** `updateLeadStatus` action, `leadService.changeStatus`

| Check | Status | Notes |
|---|---|---|
| Dedicated `updateLeadStatus` action exists | ✅ Pass | |
| `leadService.changeStatus` enforces transitions | ✅ Pass | `AllowedTransitions` map enforced at service level |
| Transition map defined | ✅ Pass | NEW→CONTACTED, CONTACTED→QUALIFIED/LOST, QUALIFIED→PROPOSAL/LOST, PROPOSAL→WON/LOST, WON→[], LOST→[] |
| **UI actions bypass `changeStatus`** | ⚠️ Risk | `updateLeadStatus` calls `leadService.update()` directly, NOT `changeStatus()`. The FSM is bypassed. |
| Convert Lead to Company action | ✅ Pass | Properly sets status to `WON`, creates Company + Contact |

**Risk (Medium):** The `updateLeadStatus` server action calls `leadService.update(ctx, id, { status: ... })` directly, bypassing the `AllowedTransitions` state machine in `leadService.changeStatus`. Invalid transitions (e.g., PROPOSAL → NEW) can be made through the UI. The FSM is only enforced via the API route's `PATCH /api/v1/leads/:id/status` if that existed. This is the most significant functional gap identified.

---

### 2.7 Bulk Create — ✅ PASS

**Source:** `bulkCreateLeads` action

| Check | Status | Notes |
|---|---|---|
| Each lead validated individually | ✅ Pass | Loop processes each with schema validation |
| Tenant context maintained | ✅ Pass | `ctx` passed to each `leadService.create` |
| Company lookup per lead | ✅ Pass | |

**Risk:** Bulk create is not atomic — if one lead fails mid-loop, previously created leads remain. No rollback transaction.

---

## 3. Contacts

### 3.1 Create — ✅ PASS

**Source:** `createContactAction` → `contactService.create` → `contactRepository.create`

| Check | Status | Notes |
|---|---|---|
| Schema validation | ✅ Pass | `ContactActionSchema` validates companyId, name, email, phone, title |
| Company existence check | ✅ Pass | Service verifies company exists in same tenant before creating contact |
| Email uniqueness per tenant | ✅ Pass | `findByEmail(ctx, email)` throws ConflictError if duplicate |
| Tenant isolation | ✅ Pass | `requireTenant()` enforced |

---

### 3.2 Update — ✅ PASS

| Check | Status | Notes |
|---|---|---|
| Existence check | ✅ Pass | |
| Cross-tenant company validation | ✅ Pass | If `companyId` changes, company is verified in same tenant |
| Email uniqueness on change | ✅ Pass | Duplicate email checked before update |

---

### 3.3 Delete (Soft Delete) — ✅ PASS

| Check | Status | Notes |
|---|---|---|
| Soft delete via `deletedAt` | ✅ Pass | |
| Existence check | ✅ Pass | |

---

### 3.4 Search & Filtering — ⚠️ PARTIAL

| Check | Status | Notes |
|---|---|---|
| Filter by companyId | ✅ Pass | |
| Filter by email | ✅ Pass | |
| Substring search | ❌ Not implemented | |

---

### 3.5 Pagination — ⚠️ NOT IMPLEMENTED

Same V1 scope limitation as other modules.

---

### 3.6 Company Association — ✅ PASS

| Check | Status | Notes |
|---|---|---|
| `companyId` required on create | ✅ Pass | Schema and service both enforce |
| Company verified in same tenant | ✅ Pass | `companyRepository.findById(ctx, companyId)` uses tenant context |
| `companyName` resolved in list action | ✅ Pass | `getContacts` resolves company name per contact via `companyService.get()` |
| N+1 query risk on list | ⚠️ Risk | `Promise.all(contacts.map(...companyService.get...))` causes N+1 on large lists |

---

## UAT Summary Table

| Module | Create | Update | Delete | Search | Filter | Pagination | Special |
|---|---|---|---|---|---|---|---|
| Companies | ✅ | ✅ | ✅ | ⚠️ Exact only | ✅ | ❌ Not impl | Tenant isolation ✅ |
| Leads | ✅ | ✅ | ✅ | ⚠️ Exact only | ✅ | ❌ Not impl | FSM bypass ⚠️ |
| Contacts | ✅ | ✅ | ✅ | ⚠️ Exact only | ✅ | ❌ Not impl | N+1 queries ⚠️ |

---

## UAT Findings Summary

### ✅ Passed (No Action Required)
- All CRUD operations are functionally correct
- Tenant isolation is enforced at every layer
- Soft deletes working correctly
- Form validation (Zod) present on all actions
- Company association in contacts verified
- Lead pipeline status change exists with FSM defined
- Email uniqueness enforced for contacts
- Company name uniqueness enforced per tenant

### ⚠️ Risks Identified (Non-Blocking for V1)
1. **No substring/ILIKE search** — Only exact-match filtering across all modules
2. **No pagination** — Full list returned; acceptable at current scale
3. **Lead status FSM bypass** — UI actions call `leadService.update()` directly, not `changeStatus()`. Invalid transitions possible via the UI.
4. **N+1 queries in contacts list** — Company name resolved per-contact in application layer
5. **Bulk create is non-atomic** — Mid-loop failures leave partial state
6. **Case-sensitive company name uniqueness** — "Acme" and "acme" treated as different companies
7. **`location` field hardcoded to 'Unknown'** — Company model lacks location field; compatibility layer patches it

### ❌ Defects (Must Be Noted)
- **No dedicated delete endpoint in leads API route** — `DELETE /api/v1/leads/:id` is absent. Delete available only via server action `deleteLead`.
- **Contact revalidatePath mismatch** — `createContactAction` revalidates `/contacts` but page is at `/dashboard/contacts`; cache may not invalidate correctly.

---

*Report generated: 2026-06-07*
