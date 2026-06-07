# RC-3 Seed Update Report

## Roles Seeded
* **Role Code**: `super_admin`
* **Role Name**: `Super Administrator`
* **Tenant Scoped**: Yes, scoped to the `system` tenant.
* **Metadata**: `isSystem = true`

## Users Seeded
* **Email**: `admin@magnuscopo.com`
* **Name**: `Super Administrator`
* **Password Hash**: Hashed version of `Admin123!` using `bcryptjs` with salt round of 12.
* **Role Association**: `super_admin` role.
* **Status**: `ACTIVE`

## Tenant Associations
* The `admin@magnuscopo.com` user is mapped directly to the `system` tenant (slug: `system`, tenantId: `system`) in PostgreSQL.

## Idempotency Verification
* Upsert operation `prisma.role.upsert` and `prisma.user.upsert` are utilized with database unique constraints (`tenantId_code` and `tenantId_email` respectively).
* Successive execution of `npm run db:seed:prisma` completes without generating duplicate records or throwing database constraint violations.
