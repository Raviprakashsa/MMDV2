# A1 Plan and Feature Ownership Decision

Date: 2026-05-31
Status: Approved decision for A1 Step 2
Authority: `docs/MVP_LOCKDOWN.md`

## Recommendation

**Recommendation: A. Global catalog entities**

`Plan` and `Feature` should be treated as global catalog entities, not tenant-owned entities.

## Why this is the preferred model

- Plans represent subscription/product tiers that must be reusable across tenants.
- Features represent capability catalog entries that can be enabled globally and then assigned per tenant.
- Tenant ownership would duplicate catalog rows and fragment the entitlement model.
- A global catalog keeps A1 focused on tenant setup and entitlement wiring, not catalog administration.

## Tradeoffs

### Global catalog entities
**Pros**
- Single source of truth for plan and feature definitions.
- Cleaner seed and migration story.
- Lower duplication and simpler entitlement evaluation.
- Easier to reference from tenant-specific records like `TenantFeature`.

**Cons**
- Plan and feature administration is centralized rather than tenant-specific.
- Later SaaS management screens may be needed if product teams want editable catalogs.

### Tenant-owned entities
**Pros**
- Each tenant could theoretically customize its own plans and features.
- Better fit only if the product is intended to be fully white-labeled per tenant.

**Cons**
- Duplicates catalog data.
- Complicates seed data, upgrades, and entitlement rules.
- Increases risk of inconsistent plan/feature definitions across tenants.
- Conflicts with the current A1 foundation design and the current MVP contract.

## Impact on schema

- `Plan` should remain a global catalog table.
- `Feature` should remain a global catalog table.
- `PlanFeature` should remain a global join table.
- `TenantFeature` remains tenant-owned and continues to reference `Tenant.id`.
- `TenantSettings` and `TenantBranding` remain tenant-owned and continue to reference `Tenant.id`.
- No schema change is required for `Plan` or `Feature` ownership as part of this decision.

## Impact on future SaaS plans

- Future SaaS plan management can add admin screens for global catalog maintenance without changing tenant data ownership.
- Feature enablement can continue to be resolved through tenant-specific entitlements.
- Future billing or SaaS packaging work can reuse the global catalog without migrating per-tenant copies.
- This preserves a clean separation between platform catalog data and tenant configuration data.
