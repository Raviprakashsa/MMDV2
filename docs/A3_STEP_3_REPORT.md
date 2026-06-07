A3 Step 3 — Service Layer Report

Services Created

- `lib/foundation/services/company.service.ts`
- `lib/foundation/services/contact.service.ts`
- `lib/foundation/services/lead.service.ts`

Business Rules Implemented

Company
- `create(ctx, input)`: ensures `name` is unique per tenant before creating.
- `update(ctx, id, input)`: verifies existence and enforces unique `name` on change.
- `deactivate(ctx, id)`: sets `isActive: false` via repository update.

Contact
- `create(ctx, input)`: ensures `company` exists in the same tenant and `email` is unique per tenant.
- `update(ctx, id, input)`: validates company changes and email uniqueness before updating.
- `deactivate(ctx, id)`: soft-deletes the contact via repository `softDelete`.

Lead
- `create(ctx, input)`: validates referenced `company`, `contact`, and `owner` exist in the same tenant (if provided); defaults `status` to `NEW`.
- `update(ctx, id, input)`: validates changed relations (company/contact/owner) remain in tenant.
- `changeStatus(ctx, id, newStatus)`: enforces allowed status transitions:
  - `NEW` → `CONTACTED`
  - `CONTACTED` → `QUALIFIED` | `LOST`
  - `QUALIFIED` → `PROPOSAL` | `LOST`
  - `PROPOSAL` → `WON` | `LOST`
  - `WON`/`LOST` → (terminal)

Repository Dependencies

- `company.service.ts` depends on `companyRepository`.
- `contact.service.ts` depends on `contactRepository` and `companyRepository`.
- `lead.service.ts` depends on `leadRepository`, `companyRepository`, `contactRepository`, and `userRepository`.

Validation Results

- `npm run typecheck` — passed.
- `npm run build` — passed (Next.js compiled successfully with temporary `NEXTAUTH_SECRET`).

Risks

- Status transition rules are enforced in memory in the service; future changes to allowed transitions require updating the service.
- `deactivate` for `contact` uses repository `softDelete` which currently returns a `BatchPayload`; services and callers should be aware of return type (count) for soft-delete operations.
- No transactional guarantees when multiple repository calls are needed (e.g., validating existence of related entities then creating); consider transactions in future iterations for atomicity.

Rollback Notes

- To rollback this step, remove the three service files:
  - `lib/foundation/services/company.service.ts`
  - `lib/foundation/services/contact.service.ts`
  - `lib/foundation/services/lead.service.ts`
- Re-run `npm run typecheck` and `npm run build` to ensure workspace health.

Status

A3 Step 4 Ready for service-layer review
