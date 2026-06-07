# 09 — Authentication & Authorization

## Executive Summary
Assess current auth and recommend modern, secure patterns.

## Authentication Recommendations
- Use JWTs for API authentication with short-lived access tokens and refresh tokens.
- Store refresh tokens with secure rotation and revocation lists.
- Password policy: complexity, rate-limiting, breach checks.
- Recommend MFA (TOTP) for admin users.

## Authorization
- Implement RBAC (roles + permissions) and resource-based ACLs where needed.

## Action Items
- Inventory existing auth endpoints under `app/api`.
- Plan migration steps and backward-compatibility for sessions.
