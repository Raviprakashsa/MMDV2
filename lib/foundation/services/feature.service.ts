import { NotFoundError } from '@/lib/core/app-error'
import { featureRepository, type CreateFeatureInput, type UpdateFeatureInput } from '@/lib/foundation/repositories/feature.repository'

const SYSTEM_TENANT_ID = 'system'

export class FeatureService {
  listActive() {
    return featureRepository.listActive()
  }

  async getById(id: string) {
    const feature = await featureRepository.findById(id)
    if (!feature) {
      throw new NotFoundError('Feature not found')
    }
    return feature
  }

  async getByCode(code: string) {
    const feature = await featureRepository.findByCode(code)
    if (!feature) {
      throw new NotFoundError('Feature not found')
    }
    return feature
  }

  create(input: Omit<CreateFeatureInput, 'tenantId'>) {
    return featureRepository.create({
      tenantId: SYSTEM_TENANT_ID,
      ...input,
    })
  }

  async updateById(id: string, input: UpdateFeatureInput) {
    const feature = await featureRepository.findById(id)
    if (!feature) {
      throw new NotFoundError('Feature not found')
    }

    return featureRepository.updateById(id, input)
  }

  async archiveById(id: string) {
    const feature = await featureRepository.findById(id)
    if (!feature) {
      throw new NotFoundError('Feature not found')
    }

    await featureRepository.updateById(id, { isActive: false })
    return featureRepository.softDeleteById(id)
  }
}

export const featureService = new FeatureService()