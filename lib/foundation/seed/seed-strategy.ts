import { PrismaClient } from '@prisma/client'

export class SeedStrategy {
  constructor(private readonly prisma: PrismaClient) {}

  async runFoundationSeed() {
    await this.seedPlansAndFeatures()
  }

  private async seedPlansAndFeatures() {
    const plans = [
      { code: 'starter', name: 'Starter' },
      { code: 'growth', name: 'Growth' },
      { code: 'enterprise', name: 'Enterprise' },
    ]

    const features = [
      { code: 'companies.read', module: 'companies', action: 'read' },
      { code: 'companies.create', module: 'companies', action: 'create' },
      { code: 'contacts.read', module: 'contacts', action: 'read' },
      { code: 'contacts.create', module: 'contacts', action: 'create' },
      { code: 'leads.read', module: 'leads', action: 'read' },
      { code: 'leads.create', module: 'leads', action: 'create' },
    ]

    for (const plan of plans) {
      await this.prisma.plan.upsert({
        where: { code: plan.code },
        update: { name: plan.name, deletedAt: null },
        create: { tenantId: 'system', code: plan.code, name: plan.name },
      })
    }

    for (const feature of features) {
      await this.prisma.feature.upsert({
        where: { code: feature.code },
        update: { name: feature.code, deletedAt: null },
        create: {
          tenantId: 'system',
          code: feature.code,
          name: feature.code,
          description: `${feature.module}.${feature.action}`,
        },
      })

      await this.prisma.permission.upsert({
        where: { code: feature.code },
        update: { module: feature.module, action: feature.action, deletedAt: null },
        create: {
          code: feature.code,
          module: feature.module,
          action: feature.action,
        },
      })
    }
  }
}
