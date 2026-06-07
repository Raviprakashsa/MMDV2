import { NotFoundError } from '@/lib/core/app-error'
import { planRepository, type CreatePlanInput, type UpdatePlanInput } from '@/lib/foundation/repositories/plan.repository'

const SYSTEM_TENANT_ID = 'system'

export class PlanService {
  listActive() {
    return planRepository.listActive()
  }

  async getById(id: string) {
    const plan = await planRepository.findById(id)
    if (!plan) {
      throw new NotFoundError('Plan not found')
    }
    return plan
  }

  async getByCode(code: string) {
    const plan = await planRepository.findByCode(code)
    if (!plan) {
      throw new NotFoundError('Plan not found')
    }
    return plan
  }

  create(input: Omit<CreatePlanInput, 'tenantId'>) {
    return planRepository.create({
      tenantId: SYSTEM_TENANT_ID,
      ...input,
    })
  }

  async updateById(id: string, input: UpdatePlanInput) {
    const plan = await planRepository.findById(id)
    if (!plan) {
      throw new NotFoundError('Plan not found')
    }

    return planRepository.updateById(id, input)
  }

  async archiveById(id: string) {
    const plan = await planRepository.findById(id)
    if (!plan) {
      throw new NotFoundError('Plan not found')
    }

    await planRepository.updateById(id, { isActive: false })
    return planRepository.softDeleteById(id)
  }
}

export const planService = new PlanService()