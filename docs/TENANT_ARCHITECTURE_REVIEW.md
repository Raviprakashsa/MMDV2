# Tenant Architecture Review

Status: Review only. No implementation changes.

## 1) Tenant Isolation
Current assessment:
- Design intent is shared database/shared schema with tenantId on business records.
- Foundation schema includes tenantId across current entities.

Gaps:
- Tenant enforcement middleware is not yet uniformly applied across all modules.
- Cross-tenant query proof checklist is not yet documented per repository method.

Recommendation:
- Enforce a hard rule: every repository method receives tenant context and always injects tenantId + deletedAt null by default.
- Add architecture test checklist for cross-tenant denial per module before implementation.

## 2) Subscription Model
Current assessment:
- Plan, Feature, PlanFeature, TenantFeature are present at conceptual level.

Gaps:
- Subscription lifecycle entity missing (trial, active, suspended, cancelled).
- Billing and usage tracking are not yet explicitly modeled.

Recommendation:
- Introduce Subscriptions and SubscriptionUsage in architecture design before module implementation.

## 3) Feature Flags
Current assessment:
- Feature flag service exists with env fallback and per-tenant DB lookup concept.

Gaps:
- No governance for flag ownership, expiry, and rollout strategy.
- No precedence contract defined among plan features, tenant features, and runtime overrides.

Recommendation:
- Define precedence: Tenant override > TenantFeature > PlanFeature > Env fallback.
- Add flag lifecycle states: draft, active, deprecated, removed.

## 4) Usage Limits
Current assessment:
- Limits are mentioned in phase docs (users, storage, candidates, requirements, api requests).

Gaps:
- Limit enforcement model and counters are not yet formalized.

Recommendation:
- Add UsageCounter and UsagePolicy concepts in architecture review before build.

## 5) Branding
Current assessment:
- White-label requirements call for logo, colors, domain, template theming.

Gaps:
- tenant_branding and tenant_settings not yet modeled in Prisma foundation.

Recommendation:
- Add one-to-one tenant settings/branding architecture with versioned branding assets.

## 6) White Label
Current assessment:
- Requirement is explicit in phase docs and approved direction.

Gaps:
- No final strategy for asset storage tenancy and cache invalidation.

Recommendation:
- Define per-tenant asset namespace and CDN invalidation strategy in design.

## 7) Custom Domains
Current assessment:
- Phase docs require custom domains.

Gaps:
- DNS verification, SSL issuance, and fallback route architecture not documented.

Recommendation:
- Add domain ownership validation and certificate lifecycle architecture before implementation.

## 8) Storage Separation
Current assessment:
- Local and S3 abstraction direction exists.

Gaps:
- No finalized tenant-key naming convention and bucket policy constraints.

Recommendation:
- Standardize key pattern tenantId/module/entityId/filename and least-privilege IAM.

## 9) Future Enterprise Support
Current assessment:
- Future requirements include SAML, OIDC, custom compliance, dedicated infrastructure.

Gaps:
- No architecture decisions recorded for enterprise isolation modes.

Recommendation:
- Define enterprise modes now:
  - shared schema multi-tenant
  - dedicated schema per tenant
  - dedicated database per tenant

## Final Tenant Review Verdict
- Direction is valid but incomplete.
- Architecture approval should require explicit closure of:
  - subscription lifecycle model
  - tenant settings and branding model
  - custom domain security model
  - usage limits enforcement model
