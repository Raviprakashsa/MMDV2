import { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { NotFoundError } from '@/lib/core/app-error'

export abstract class BaseRepository {
  protected readonly prisma: PrismaClient

  protected constructor(prismaClient: PrismaClient = prisma) {
    this.prisma = prismaClient
  }

  protected now() {
    return new Date()
  }

  protected markDeleted() {
    return { deletedAt: this.now() }
  }

  protected assertFound<T>(record: T | null, notFoundMessage: string): T {
    if (!record) {
      throw new NotFoundError(notFoundMessage)
    }
    return record
  }
}
