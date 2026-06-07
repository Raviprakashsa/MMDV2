import connectDB from '@/lib/db/mongodb'
import ExportJob from '@/lib/db/models/ExportJob'
import mongoose from 'mongoose'

export class ExportJobRepository {
  async listByUsers(userIds: string[], limit: number = 25) {
    await connectDB()
    const objectIds = userIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id))

    const jobs = await ExportJob.find({
      requestedBy: { $in: objectIds },
      entityType: 'GDPR_PORTABILITY',
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('requestedBy', 'name email')
      .lean()

    return jobs.map((job) => {
      const requester = job.requestedBy as any
      let requestedBy = 'Unknown User'

      if (requester && typeof requester === 'object') {
        requestedBy = requester.name || requester.email || String(requester._id || 'Unknown User')
      }

      return {
        id: job._id ? job._id.toString() : '',
        requestedBy,
        format: job.format,
        status: job.status,
        createdAt: job.createdAt ? job.createdAt.toISOString() : '',
        completedAt: job.completedAt ? job.completedAt.toISOString() : '',
        fileUrl: job.fileUrl || '',
        errorMessage: job.errorMessage || '',
      }
    })
  }
}

export const exportJobRepository = new ExportJobRepository()
