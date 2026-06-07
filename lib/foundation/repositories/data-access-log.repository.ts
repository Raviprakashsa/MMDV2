import connectDB from '@/lib/db/mongodb'
import DataAccessLog from '@/lib/db/models/DataAccessLog'
import mongoose from 'mongoose'

export class DataAccessLogRepository {
  async listByUsers(userIds: string[], limit: number = 100) {
    await connectDB()
    const objectIds = userIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id))

    const logs = await DataAccessLog.find({
      userId: { $in: objectIds },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return logs.map((log) => ({
      id: log._id ? log._id.toString() : '',
      userId: log.userId ? log.userId.toString() : '',
      entity: log.entity || '',
      entityId: log.entityId || '',
      action: log.action || '',
      createdAt: log.createdAt ? log.createdAt.toISOString() : '',
    }))
  }

  async createLog(
    userId: string,
    entity: string,
    entityId: string,
    action: 'VIEW' | 'EXPORT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE'
  ) {
    await connectDB()
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid User ID for log creation')
    }

    const log = await DataAccessLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      entity,
      entityId,
      action,
    })

    return {
      id: log._id ? log._id.toString() : '',
      userId: log.userId ? log.userId.toString() : '',
      entity: log.entity || '',
      entityId: log.entityId || '',
      action: log.action || '',
      createdAt: log.createdAt ? log.createdAt.toISOString() : '',
    }
  }
}

export const dataAccessLogRepository = new DataAccessLogRepository()
