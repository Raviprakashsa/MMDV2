# V1 — Lead FSM Remediation Report

**Date:** 2026-06-07  
**Blocker:** B-3 (Lead FSM bypass via UI action)  
**Status:** ✅ REMEDIATED  

---

## 1. Problem Statement

The audit identified that `updateLeadStatus` server action called `leadService.update()` directly, bypassing the `AllowedTransitions` state machine in `leadService.changeStatus()`. This allowed any status transition from the UI (including invalid ones such as `PROPOSAL → NEW`) without FSM validation.

---

## 2. Design: Single Transition Engine

The V1.3A directive requires: **"Lead FSM must have a single transition engine (no duplicated FSM paths)."**

### Solution Architecture

```
           ┌─────────────────────────────────────────┐
           │          LeadService (internal)          │
           │                                          │
           │  validateStatusTransition(from, to)      │
           │  ┌─────────────────────────────────────┐ │
           │  │ AllowedTransitions map (single copy) │ │
           │  │   NEW → [CONTACTED]                  │ │
           │  │   CONTACTED → [QUALIFIED, LOST]      │ │
           │  │   QUALIFIED → [PROPOSAL, LOST]       │ │
           │  │   PROPOSAL → [WON, LOST]             │ │
           │  │   WON → []                           │ │
           │  │   LOST → []                          │ │
           │  └─────────────────────────────────────┘ │
           └──────────────┬──────────────────────────┘
                          │ called by
               ┌──────────┼────────────────┐
               ▼          ▼                ▼
      update()       updateStatusWithMeta()   changeStatus()
      (when status   (primary UI path)        (thin wrapper,
       field changes)                          delegates here)
```

The `validateStatusTransition()` private method is the **single engine**. `AllowedTransitions` is defined exactly once and read by exactly one method.

---

## 3. Files Modified

| File | Change |
|---|---|
| `lib/foundation/services/lead.service.ts` | Full rewrite: added `validateStatusTransition()` private engine, `updateStatusWithMeta()` primary method, refactored `changeStatus()` as thin wrapper, wired FSM into `update()` |
| `lib/actions/module9-leads.ts` | `updateLeadStatus` now calls `leadService.updateStatusWithMeta()` instead of `leadService.update()` |

---

## 4. State Diagram

```
         ┌──────┐
   ───►  │  NEW │
         └──┬───┘
            │ CONTACTED
            ▼
      ┌──────────┐
      │ CONTACTED│
      └────┬─────┘
           │ QUALIFIED
           ▼
      ┌──────────┐
      │ QUALIFIED│
      └────┬─────┘
           │ PROPOSAL
           ▼
      ┌──────────┐
      │ PROPOSAL │
      └────┬─────┘
          / \
    WON  /   \ LOST
        ▼     ▼
      ┌───┐ ┌────┐
      │WON│ │LOST│
      └───┘ └────┘
```

From any state, `LOST` is a terminal exit (except from NEW, which can only go to CONTACTED first).

---

## 5. Allowed Transitions Table

| From | To | Valid? |
|---|---|---|
| NEW | CONTACTED | ✅ |
| NEW | QUALIFIED | ❌ Rejected |
| NEW | PROPOSAL | ❌ Rejected |
| NEW | WON | ❌ Rejected |
| NEW | LOST | ❌ Rejected |
| CONTACTED | QUALIFIED | ✅ |
| CONTACTED | LOST | ✅ |
| CONTACTED | NEW | ❌ Rejected |
| CONTACTED | PROPOSAL | ❌ Rejected |
| QUALIFIED | PROPOSAL | ✅ |
| QUALIFIED | LOST | ✅ |
| QUALIFIED | NEW | ❌ Rejected |
| QUALIFIED | CONTACTED | ❌ Rejected |
| PROPOSAL | WON | ✅ |
| PROPOSAL | LOST | ✅ |
| PROPOSAL | NEW | ❌ Rejected |
| PROPOSAL | CONTACTED | ❌ Rejected |
| WON | (anything) | ❌ Terminal state |
| LOST | (anything) | ❌ Terminal state |
| Any | Same state | ✅ No-op (not rejected, FSM skipped) |

---

## 6. Code Changes

### LeadService — Single FSM Engine

```typescript
// Private engine — used by ALL status-change paths
private validateStatusTransition(from: LeadStatus, to: LeadStatus): void {
  if (from === to) return // status unchanged — always valid
  const allowed = AllowedTransitions[from] ?? []
  if (!allowed.includes(to)) {
    throw new ConflictError(
      `Invalid status transition: ${from} → ${to}. Allowed from ${from}: [${allowed.join(', ') || 'none'}]`
    )
  }
}

// Primary UI method — validates FSM + updates status + description atomically
async updateStatusWithMeta(ctx, id, newStatus, metaJson?) {
  requireCrmPermission(ctx.userRole, 'crm:update')
  const existing = await leadRepository.findById(ctx, id)
  if (!existing) throw new NotFoundError('Lead not found')
  this.validateStatusTransition(existing.status as LeadStatus, newStatus) // single engine
  return leadRepository.updateById(ctx, id, {
    status: newStatus,
    ...(metaJson !== undefined ? { description: metaJson } : {}),
  })
}

// Thin wrapper (backward compat) — no FSM logic, delegates to engine
async changeStatus(ctx, id, newStatus) {
  return this.updateStatusWithMeta(ctx, id, newStatus)
}

// update() also validates FSM when status changes
async update(ctx, id, input) {
  requireCrmPermission(ctx.userRole, 'crm:update')
  const existing = await leadRepository.findById(ctx, id)
  if (!existing) throw new NotFoundError('Lead not found')
  if (input.status && input.status !== existing.status) {
    this.validateStatusTransition(existing.status as LeadStatus, input.status) // single engine
  }
  // ... cross-entity validations
  return leadRepository.updateById(ctx, id, input)
}
```

### updateLeadStatus Action — Before / After

**Before (bypassed FSM):**
```typescript
const updatedLead = await leadService.update(ctx, payload.leadId, {
  status: statusVal,
  description: JSON.stringify(meta),
})
```

**After (routes through single FSM engine):**
```typescript
const updatedLead = await leadService.updateStatusWithMeta(
  ctx,
  payload.leadId,
  statusVal,        // validated by validateStatusTransition
  JSON.stringify(meta),  // description updated atomically
)
```

---

## 7. What Was NOT Changed

- `addLeadActivity` — already used `leadService.update()`, which now validates FSM internally. No separate change needed.
- `convertLeadToCompany` — calls `leadService.update()` with `status: 'WON'`. The FSM is validated by `update()` (PROPOSAL → WON is valid). No separate change needed.
- API route `PATCH /api/v1/leads/:id/status` — already called `leadService.changeStatus()`, which now delegates to `updateStatusWithMeta()`. No change needed.

---

## 8. Error Behaviour

An invalid transition now throws:
```json
{
  "error": "Invalid status transition: PROPOSAL → NEW. Allowed from PROPOSAL: [WON, LOST]"
}
```

HTTP status: `409 Conflict` (mapped from `ConflictError` by `runApi()`).

---

*Report generated: 2026-06-07*
