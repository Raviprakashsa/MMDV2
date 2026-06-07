-- A1 foundation migration

ALTER TABLE "TenantFeature" DROP CONSTRAINT IF EXISTS "TenantFeature_tenantId_fkey";

CREATE TABLE "TenantSettings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "locale" TEXT NOT NULL DEFAULT 'en-IN',
    "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "timeFormat" TEXT NOT NULL DEFAULT '24h',
    "weekStartDay" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TenantSettings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TenantSettings_tenantId_key" UNIQUE ("tenantId")
);

CREATE TABLE "TenantBranding" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "displayName" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "accentColor" TEXT,
    "supportEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TenantBranding_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TenantBranding_tenantId_key" UNIQUE ("tenantId")
);

CREATE INDEX "TenantSettings_deletedAt_idx" ON "TenantSettings"("deletedAt");
CREATE INDEX "TenantBranding_deletedAt_idx" ON "TenantBranding"("deletedAt");

ALTER TABLE "TenantFeature"
    ADD CONSTRAINT "TenantFeature_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TenantSettings"
    ADD CONSTRAINT "TenantSettings_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TenantBranding"
    ADD CONSTRAINT "TenantBranding_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
