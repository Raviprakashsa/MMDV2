import { prisma } from '@/lib/prisma'

export interface FeatureFlagContext {
  tenantId: string
}

export class FeatureFlagService {
  async isEnabled(context: FeatureFlagContext, key: string, fallback = false): Promise<boolean> {
    const dbFlag = await prisma.featureFlag.findUnique({
      where: {
        tenantId_key: {
          tenantId: context.tenantId,
          key,
        },
      },
    })

    if (dbFlag && dbFlag.deletedAt === null) {
      return dbFlag.isEnabled
    }

    const envValue = process.env[`FEATURE_${key.toUpperCase().replace(/\./g, '_')}`]
    if (envValue === undefined) {
      return fallback
    }

    const normalized = envValue.trim().toLowerCase()
    return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on'
  }
}

export const featureFlagService = new FeatureFlagService()
