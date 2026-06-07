import { userRepository } from '@/lib/foundation/repositories/user.repository'
import connectDB from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import { type TenantContext } from '@/lib/foundation/repositories/tenant-aware.repository'

export class UserResolutionService {
  async resolveMongoUserIds(context: TenantContext): Promise<string[]> {
    if (!context.tenantId) {
      return []
    }

    // 1. Fetch active PostgreSQL users scoped to this tenant
    const pgUsers = await userRepository.listByTenant(context)
    if (pgUsers.length === 0) {
      return []
    }

    // 2. Extract and normalize active user emails
    const emails = pgUsers.map((u) => u.email.toLowerCase().trim())

    // 3. Connect to MongoDB and find active MongoDB users
    await connectDB()
    const mongoUsers = await User.find({
      email: { $in: emails },
      deletedAt: null,
    })
      .select('_id')
      .lean()

    // 4. Return string-serialized legacy MongoDB user IDs
    return mongoUsers.map((u) => u._id.toString())
  }
}

export const userResolutionService = new UserResolutionService()
