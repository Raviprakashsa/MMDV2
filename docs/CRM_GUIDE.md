# MMD V2 — CRM User Guide

**Date:** 2026-06-07  
**Scope:** CRM Workflows (Companies, Contacts, Leads Pipeline, FSM)  

---

## 1. Overview
The CRM module manages accounts, contacts, and opportunities (Leads). 

*Note: CRM operations require `COORDINATOR`, `ADMIN`, or `SUPER_ADMIN` privileges. `RECRUITER` roles have read-only access.*

---

## 2. Companies & Contacts

### Companies
1. Navigate to `/dashboard/companies/new` to create an organization profile.
2. Company names must be unique within your tenant.
3. Deactivating a company automatically cascades and deactivates its associated contacts.

### Contacts
1. Create a contact via `/contacts/new` or from a Company details page.
2. Select a target Company association.
3. Contacts must have a unique email address within the tenant.

---

## 3. Lead Management & FSM Pipeline
Leads track business opportunities and follow a strict **Finite State Machine (FSM)**.

### Allowed Status Transitions
The status transitions are validated at the service layer database interface. Invalid status jumps will result in an error.

```
┌──────┐
│  NEW │
└──┬───┘
   │
   ▼ (CONTACTED)
┌──────────┐
│ CONTACTED├──────┐
└────┬─────┘      │
     │            │
     ▼ (QUALIFIED)│
┌──────────┐      │
│ QUALIFIED├────┐ │
└────┬─────┘    │ │
     │          │ │ (LOST)
     ▼ (PROPOSAL│ │
┌──────────┐    │ │
│ PROPOSAL │    │ │
└────┬─────┘    │ │
    / \         ▼ ▼
   /   \ ──────► ┌────┐
  ▼     ▼        │LOST│
 ┌───┐ ┌────┐    └────┘
 │WON│ │LOST│
 └───┘ └────┘
```

### Transition Matrix Rules:
- **`NEW`:** Can only transition to `CONTACTED`.
- **`CONTACTED`:** Can transition to `QUALIFIED` or `LOST`.
- **`QUALIFIED`:** Can transition to `PROPOSAL` or `LOST`.
- **`PROPOSAL`:** Can transition to `WON` or `LOST`.
- **`WON`:** Terminal state (no further transitions allowed).
- **`LOST`:** Terminal state (no further transitions allowed).

### Updating a Lead
1. Navigate to `/dashboard/leads`.
2. Click on a Lead card to edit.
3. Update the stage dropdown. If the transition is valid, the update commits. If invalid (e.g. attempting `PROPOSAL` -> `NEW`), the system displays a `409 Conflict` error explaining the allowed next steps.
