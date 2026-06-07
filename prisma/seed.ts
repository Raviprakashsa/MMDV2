import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const PLAN_SEEDS = [
  { code: 'starter', name: 'Starter', description: 'Starter plan for small teams' },
  { code: 'growth', name: 'Growth', description: 'Growth plan for scaling agencies' },
  { code: 'enterprise', name: 'Enterprise', description: 'Enterprise plan for large operations' },
] as const

const FEATURE_SEEDS = [
  { code: 'plans.read', module: 'plans', action: 'read' },
  { code: 'features.read', module: 'features', action: 'read' },
  { code: 'tenant-settings.read', module: 'tenant-settings', action: 'read' },
  { code: 'tenant-settings.update', module: 'tenant-settings', action: 'update' },
  { code: 'tenant-branding.read', module: 'tenant-branding', action: 'read' },
  { code: 'tenant-branding.update', module: 'tenant-branding', action: 'update' },
  { code: 'tenants.read', module: 'tenants', action: 'read' },
  { code: 'tenants.create', module: 'tenants', action: 'create' },
  { code: 'tenants.update', module: 'tenants', action: 'update' },
] as const

const DEFAULT_TENANT = {
  tenantId: 'system',
  slug: 'system',
  name: 'System Tenant',
} as const

async function upsertPlans() {
  for (const plan of PLAN_SEEDS) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      update: {
        name: plan.name,
        description: plan.description,
        isActive: true,
        deletedAt: null,
      },
      create: {
        tenantId: 'system',
        code: plan.code,
        name: plan.name,
        description: plan.description,
      },
    })
  }
}

async function upsertFeatures() {
  for (const feature of FEATURE_SEEDS) {
    await prisma.feature.upsert({
      where: { code: feature.code },
      update: {
        name: feature.code,
        description: `${feature.module}.${feature.action}`,
        isActive: true,
        deletedAt: null,
      },
      create: {
        tenantId: 'system',
        code: feature.code,
        name: feature.code,
        description: `${feature.module}.${feature.action}`,
      },
    })
  }
}

async function bindPlanFeatures() {
  const plans = await prisma.plan.findMany({ where: { deletedAt: null } })
  const features = await prisma.feature.findMany({ where: { deletedAt: null } })

  for (const plan of plans) {
    for (const feature of features) {
      await prisma.planFeature.upsert({
        where: {
          planId_featureId: {
            planId: plan.id,
            featureId: feature.id,
          },
        },
        update: { deletedAt: null },
        create: {
          tenantId: 'system',
          planId: plan.id,
          featureId: feature.id,
        },
      })
    }
  }
}

async function upsertTenant() {
  const starterPlan = await prisma.plan.findUniqueOrThrow({ where: { code: 'starter' } })

  const tenant = await prisma.tenant.upsert({
    where: { tenantId: DEFAULT_TENANT.tenantId },
    update: {
      slug: DEFAULT_TENANT.slug,
      name: DEFAULT_TENANT.name,
      planId: starterPlan.id,
      isActive: true,
      deletedAt: null,
    },
    create: {
      tenantId: DEFAULT_TENANT.tenantId,
      slug: DEFAULT_TENANT.slug,
      name: DEFAULT_TENANT.name,
      planId: starterPlan.id,
    },
  })

  await prisma.tenantSettings.upsert({
    where: { tenantId: tenant.id },
    update: {
      timezone: 'UTC',
      locale: 'en-IN',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      weekStartDay: 1,
      deletedAt: null,
    },
    create: {
      tenantId: tenant.id,
      timezone: 'UTC',
      locale: 'en-IN',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      weekStartDay: 1,
    },
  })

  await prisma.tenantBranding.upsert({
    where: { tenantId: tenant.id },
    update: {
      displayName: DEFAULT_TENANT.name,
      logoUrl: null,
      faviconUrl: null,
      primaryColor: '#0f172a',
      secondaryColor: '#38bdf8',
      accentColor: '#22c55e',
      supportEmail: null,
      deletedAt: null,
    },
    create: {
      tenantId: tenant.id,
      displayName: DEFAULT_TENANT.name,
      logoUrl: null,
      faviconUrl: null,
      primaryColor: '#0f172a',
      secondaryColor: '#38bdf8',
      accentColor: '#22c55e',
      supportEmail: null,
    },
  })

  const starterFeatures = await prisma.feature.findMany({
    where: {
      code: {
        in: ['plans.read', 'features.read', 'tenant-settings.read', 'tenant-settings.update', 'tenant-branding.read', 'tenant-branding.update', 'tenants.read', 'tenants.create', 'tenants.update'],
      },
      deletedAt: null,
    },
  })

  for (const feature of starterFeatures) {
    await prisma.tenantFeature.upsert({
      where: {
        tenantId_featureId: {
          tenantId: tenant.id,
          featureId: feature.id,
        },
      },
      update: {
        isEnabled: true,
        source: 'seed',
        overrideValue: null,
        deletedAt: null,
      },
      create: {
        tenantId: tenant.id,
        featureId: feature.id,
        isEnabled: true,
        source: 'seed',
      },
    })
  }

  // Seed Super Admin Role
  const adminRole = await prisma.role.upsert({
    where: {
      tenantId_code: {
        tenantId: tenant.id,
        code: 'super_admin',
      },
    },
    update: {
      name: 'Super Administrator',
      isSystem: true,
      deletedAt: null,
    },
    create: {
      tenantId: tenant.id,
      code: 'super_admin',
      name: 'Super Administrator',
      isSystem: true,
    },
  })

  // Seed admin@magnuscopo.com User
  const hashedPassword = await hash('Admin123!', 12)
  await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: 'admin@magnuscopo.com',
      },
    },
    update: {
      name: 'Super Administrator',
      passwordHash: hashedPassword,
      roleId: adminRole.id,
      status: 'ACTIVE',
      deletedAt: null,
    },
    create: {
      tenantId: tenant.id,
      email: 'admin@magnuscopo.com',
      passwordHash: hashedPassword,
      name: 'Super Administrator',
      roleId: adminRole.id,
      status: 'ACTIVE',
    },
  })
}

async function main() {
  await upsertPlans()
  await upsertFeatures()
  await bindPlanFeatures()
  await upsertTenant()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('Prisma seed failed', error)
    await prisma.$disconnect()
    process.exit(1)
  })
