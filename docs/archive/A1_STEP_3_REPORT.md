# A1 Step 3 Report

Date: 2026-05-31
Scope: Service layer for Tenant, TenantSettings, TenantBranding, TenantFeature, Plan, Feature
Authority: `docs/MVP_LOCKDOWN.md`, `docs/A1_IMPLEMENTATION_PLAN.md`

## Files Created
- `lib/foundation/services/tenant.service.ts`
- `lib/foundation/services/plan.service.ts`
- `lib/foundation/services/feature.service.ts`
- `lib/foundation/services/tenant-feature.service.ts`
- `lib/foundation/services/tenant-settings.service.ts`
- `lib/foundation/services/tenant-branding.service.ts`

## Files Modified
- `lib/foundation/repositories/plan.repository.ts` — tightened `CreatePlanInput` to require `tenantId`, removed defaulting to `'system'`.
- `lib/foundation/repositories/feature.repository.ts` — tightened `CreateFeatureInput` to require `tenantId`, removed defaulting to `'system'`.
- `lib/foundation/repositories/tenant-feature.repository.ts` — tightened `UpsertTenantFeatureInput` to require explicit fields; removed repository-level defaults.
- `lib/foundation/repositories/tenant-settings.repository.ts` — tightened `UpsertTenantSettingsInput` to require explicit fields; removed repository-level defaults.
- `lib/foundation/repositories/tenant.repository.ts` — normalized `softDelete` to reuse `softDeleteById` and removed `isActive` toggle in soft-delete data payload.

## Business Rules Added
- `TenantService.create`: validates `planId` exists; creates tenant; ensures default settings and branding via `tenantSettingsService.ensureForTenant` and `tenantBrandingService.ensureForTenant`.
- `TenantService.updateById`: validates `planId` when present.
- `TenantService.archiveById`: marks `isActive=false` and performs soft-delete.
- `PlanService.create`: writes plans under `system` tenant id constant.
- `PlanService.updateById` / `archiveById`: validation and lifecycle handling.
- `FeatureService.create`: writes features under `system` tenant id constant.
- `FeatureService.updateById` / `archiveById`: validation and lifecycle handling.
- `TenantFeatureService.upsert`: validates tenant and feature existence; applies service-level defaults for `isEnabled` and `source`.
- `TenantSettingsService.ensureForTenant`: creates default settings with service-level defaults.
- `TenantBrandingService.ensureForTenant`: creates blank branding record with null defaults.

## Validation Results
- `npm run typecheck`: passed
- `npm run build`: `next build` succeeded; production build compiled successfully

## Risks
- Moving defaults from repositories to services changes call contract — callers must use service methods or include default fields when they call repositories directly.
- Tightening repository input shapes to require explicit `tenantId` or locale fields may break any callers outside A1 scope that depended on implicit defaults.
- Service-level defaults are constants in service files; if these need to be configurable, they should be promoted to a configuration layer before A2.
- No RBAC enforcement in services; ensure route-layer enforces RBAC per `docs/A1_IMPLEMENTATION_PLAN.md`.

## Rollback Notes
- Revert changes by restoring previous repository files from git history.
- If breakage occurs due to callers assuming repository defaults, revert repository input type changes first and re-run `npm run typecheck`.
- To undo service creation, remove `lib/foundation/services/*` and restore references.

## Next Steps
- Review and approve service behaviors and defaults.
- After approval, implement API route handlers that call these services (A1 Step 4).


Status: Step 3 complete — awaiting review and approval.
