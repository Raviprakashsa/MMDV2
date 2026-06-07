import { prisma } from '@/lib/prisma'

export async function checkPostgresConnection() {
  await prisma.$queryRaw`SELECT 1`
  return true
}

export async function disconnectPostgres() {
  await prisma.$disconnect()
}
