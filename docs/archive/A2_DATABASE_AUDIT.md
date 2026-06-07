# A2 Database Audit

Date: 2026-06-01

Requested: show the complete Prisma models for `User`, `Role`, `Permission`, `RolePermission`, `Session` (verbatim), then verify the RBAC & tenant ownership checks.

---

## Complete Prisma Models (verbatim)

### Role

model Role {
  id          String   @id @default(cuid())
  tenantId    String
  code        String
  name        String
  description String?
  isSystem    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  tenant          Tenant           @relation(fields: [tenantId], references: [id])
  users           User[]
  rolePermissions RolePermission[]

  @@unique([tenantId, code])
  @@index([tenantId])
  @@index([deletedAt])
}

### Permission

model Permission {
  id          String   @id @default(cuid())
  code        String   @unique
  module      String
  action      String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  rolePermissions RolePermission[]
  @@index([deletedAt])
}

### RolePermission

model RolePermission {
  id           String   @id @default(cuid())
  roleId       String
  permissionId String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  deletedAt    DateTime?
  role       Role       @relation(fields: [roleId], references: [id])
  permission Permission @relation(fields: [permissionId], references: [id])
  @@unique([roleId, permissionId])
  @@index([roleId])
  @@index([deletedAt])
}

### User

model User {
  id             String     @id @default(cuid())
  tenantId       String
  email          String
  passwordHash   String
  name           String
  roleId         String
  status         UserStatus @default(ACTIVE)
  lastLoginAt    DateTime?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  deletedAt      DateTime?

  tenant         Tenant     @relation(fields: [tenantId], references: [id])
  role           Role       @relation(fields: [roleId], references: [id])
  sessions       Session[]

  @@unique([tenantId, email])
  @@index([tenantId])
  @@index([deletedAt])
}

### Session

model Session {
  id               String   @id @default(cuid())
  userId           String
  tenantId         String
  refreshTokenHash String?
  createdAt        DateTime @default(now())
  expiresAt        DateTime
  lastActiveAt     DateTime?

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([tenantId])
  @@index([expiresAt])
}

---

## Verification Checklist & Findings

1. Permission is global.

- Check: `Permission` model has no `tenantId` field and uses `@@index([deletedAt])` only.
- Result: PASS — `Permission` is modeled as a global/catalog entity.

2. Role is tenant scoped.

- Check: `Role` model contains `tenantId` and `tenant Tenant @relation(fields: [tenantId], references: [id])`.
- Result: PASS — `Role` is tenant-scoped.

3. RolePermission has no tenantId.

- Check: `RolePermission` model contains `roleId` and `permissionId` only; no `tenantId` field or tenant relation.
- Result: PASS — `RolePermission` is not directly tenant-scoped; tenant ownership is implied via `roleId -> Role(tenantId)`.

4. User has single role assignment.

- Check: `User` model contains `roleId` and `role Role @relation(fields: [roleId], references: [id])` and no `UserRole` join table.
- Result: PASS — `User` currently supports a single role assignment.

5. Session references User correctly.

- Check: `Session` has `userId` and `user User @relation(fields: [userId], references: [id])`.
- Result: PASS — `Session` references `User` with a proper relation.

6. Session references Tenant correctly.

- Check: `Session` includes a `tenantId` field and an index on it (`@@index([tenantId])`) but there is NO Prisma relation defined linking `Session.tenantId` to `Tenant.id`.
- Result: FAIL — `Session` does not have a declared foreign key relation to `Tenant` in the Prisma schema. The `tenantId` column exists but is not enforced by a relation.

  - Impact: lack of an explicit FK allows the `tenantId` value in `Session` to diverge from existing `Tenant.id` values, risking referential inconsistency.
  - Recommendation: add a Prisma relation `tenant Tenant @relation(fields: [tenantId], references: [id])` to `Session` (and ensure `tenantId` type matches `Tenant.id`) or document intentional denormalization if this was deliberate.

7. No conflicting foreign keys exist.

- Check: scan relations—`Role.tenantId -> Tenant.id`, `User.tenantId -> Tenant.id`, `RolePermission` references `Role.id` and `Permission.id`, `Permission` has no tenant FK, `Session.userId -> User.id`.
- Result: PASS (with caveat): there are no obvious conflicting FK definitions (no two FKs pointing inconsistently at the same purpose). The main caveat is the missing Session->Tenant FK noted above.

8. No redundant ownership fields exist.

- Check: `RolePermission` previously had `tenantId` but has been removed — redundancy reduced. `Permission` no longer contains `tenantId` so no redundancy there. `User`, `Role` retain `tenantId` as expected.
- Result: PASS — no remaining redundant tenant ownership fields detected in the RBAC models under review.

---

## Entity Inventory

- Tenant: existing tenant model with `id` (PK) and `tenantId` (business key).
- Role: tenant-scoped roles with `tenantId` FK to `Tenant.id`.
- Permission: global catalog of permissions (no tenant FK).
- RolePermission: mapping table `roleId <-> permissionId` (no tenant FK).
- User: tenant-scoped users with single `roleId` reference.
- Session: new session table with `userId` relation but no `tenant` relation.

---

## Relationship Audit

- Role → Tenant: FK present (tenantId references Tenant.id).
- User → Tenant: FK present (tenantId references Tenant.id).
- User → Role: FK present (roleId references Role.id).
- RolePermission → Role: FK present (roleId references Role.id).
- RolePermission → Permission: FK present (permissionId references Permission.id).
- Session → User: FK present (userId references User.id).
- Session → Tenant: NO FK present (tenantId exists but not linked).

---

## Tenant Ownership Audit

- Roles: owned by Tenant via `Role.tenantId` (correct).
- Users: owned by Tenant via `User.tenantId` (correct).
- RolePermission: tenant ownership inferred through Role — acceptable and non-redundant.
- Permission: global (no tenant ownership) — acceptable per approved decision.
- Session: tenant ownership is currently recorded via `tenantId` field but not enforced with FK — this is inconsistent and should be fixed.

---

## RBAC Compliance

- The current schema matches approved RBAC decisions with one exception (Session tenant FK):
  - Permission = Global Catalog: implemented ✅
  - Role = Tenant Scoped: implemented ✅
  - RolePermission = No tenantId: implemented ✅
  - User = Single Role: implemented ✅
  - Session model required: implemented (model exists) but tenant relation missing ❌

---

## Risks

- Sessions lacking an enforced Tenant FK can contain invalid tenant IDs, leading to incorrect authorization decisions or logs that do not map to real tenants.
- If Session.tenantId is used in authorization checks while not validated against `Tenant.id`, it opens a risk of stale or forged tenant context.
- If a future optimization reintroduces denormalized tenantId in RolePermission, there is risk of divergence unless strict DB checks are introduced.

---

## Keep / Refactor / Remove

- Keep:
  - `Permission` as global catalog.
  - `Role` tenant-scoped design.
  - `RolePermission` as mapping table without tenantId (no redundancy).
  - `User` single-role for A2.

- Refactor:
  - `Session` — add an explicit Prisma relation to `Tenant` (`tenant Tenant @relation(fields: [tenantId], references: [id])`) and ensure type alignment. Alternatively, justify deliberate denormalization in design docs.

- Remove:
  - Nothing else in the RBAC models requires removal; `tenantId` was already removed from RolePermission and Permission.

---

## Conclusion and State

- One outstanding schema issue blocks a fully clean DB-layer acceptance for A2 Step 2: `Session` must explicitly reference `Tenant` (Prisma relation) or be documented as intentionally denormalized.

State: A2 Step 2 Blocked

Reason: `Session` model lacks a declared foreign key relation to `Tenant`. This prevents enforcement of referential integrity for session tenant context and must be addressed before proceeding to the Repository layer.

Recommended immediate action:
- Update `prisma/schema.prisma` to add `tenant Tenant @relation(fields: [tenantId], references: [id])` in the `Session` model and generate a dev migration. Re-run `npx prisma validate`, `npx prisma generate`, `npm run typecheck`, and `npm run build`. After validation passes, A2 Step 2 can be approved.

(Review-only. No schema or code changes were made by this audit.)
