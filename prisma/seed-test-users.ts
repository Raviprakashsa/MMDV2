import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import connectDB from '../lib/db/mongodb'
import User from '../lib/db/models/User'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await hash('Admin123!', 12)

  // 1. PostgreSQL Seeding
  // Find Starter plan
  let plan = await prisma.plan.findFirst({ where: { code: 'starter', deletedAt: null } })
  if (!plan) {
    plan = await prisma.plan.create({
      data: {
        code: 'starter',
        name: 'Starter Plan',
        tenantId: 'system',
      },
    })
  }
  const planId = plan.id

  // Create Tenant A
  const tenantA = await prisma.tenant.upsert({
    where: { tenantId: 'tenant-A' },
    update: { deletedAt: null },
    create: {
      tenantId: 'tenant-A',
      slug: 'tenant-a',
      name: 'Tenant A',
      planId,
    },
  })

  // Create Tenant B
  const tenantB = await prisma.tenant.upsert({
    where: { tenantId: 'tenant-B' },
    update: { deletedAt: null },
    create: {
      tenantId: 'tenant-B',
      slug: 'tenant-b',
      name: 'Tenant B',
      planId,
    },
  })

  // Clean up any test users that were accidentally seeded under the 'system' tenant
  const systemTenant = await prisma.tenant.findUnique({
    where: { tenantId: 'system' },
  })
  if (systemTenant) {
    await prisma.user.deleteMany({
      where: {
        tenantId: systemTenant.id,
        email: {
          in: [
            'interviewer-a@example.com',
            'interviewer-b@example.com',
            'recruiter-a@example.com',
            'recruiter-b@example.com'
          ]
        }
      }
    })
    console.log('  Cleaned up conflicting test users under system tenant')
  }

  // Create Roles under Tenant A and Tenant B
  const roleA = await prisma.role.upsert({
    where: { tenantId_code: { tenantId: tenantA.id, code: 'interviewer' } },
    update: { deletedAt: null },
    create: {
      tenantId: tenantA.id,
      code: 'interviewer',
      name: 'Interviewer',
    },
  })

  const roleB = await prisma.role.upsert({
    where: { tenantId_code: { tenantId: tenantB.id, code: 'interviewer' } },
    update: { deletedAt: null },
    create: {
      tenantId: tenantB.id,
      code: 'interviewer',
      name: 'Interviewer',
    },
  })

  const recruiterRoleA = await prisma.role.upsert({
    where: { tenantId_code: { tenantId: tenantA.id, code: 'recruiter' } },
    update: { deletedAt: null },
    create: {
      tenantId: tenantA.id,
      code: 'recruiter',
      name: 'Recruiter',
    },
  })

  const recruiterRoleB = await prisma.role.upsert({
    where: { tenantId_code: { tenantId: tenantB.id, code: 'recruiter' } },
    update: { deletedAt: null },
    create: {
      tenantId: tenantB.id,
      code: 'recruiter',
      name: 'Recruiter',
    },
  })

  const pgTestUsers = [
    { email: 'interviewer-a@example.com', name: 'Interviewer A', tenantId: tenantA.id, roleId: roleA.id },
    { email: 'interviewer-b@example.com', name: 'Interviewer B', tenantId: tenantB.id, roleId: roleB.id },
    { email: 'recruiter-a@example.com', name: 'Recruiter A', tenantId: tenantA.id, roleId: recruiterRoleA.id },
    { email: 'recruiter-b@example.com', name: 'Recruiter B', tenantId: tenantB.id, roleId: recruiterRoleB.id },
  ]

  console.log('Seeding PostgreSQL test users...')
  for (const u of pgTestUsers) {
    const upserted = await prisma.user.upsert({
      where: {
        tenantId_email: {
          tenantId: u.tenantId,
          email: u.email,
        },
      },
      update: {
        name: u.name,
        passwordHash: hashedPassword,
        roleId: u.roleId,
        status: 'ACTIVE',
        deletedAt: null,
      },
      create: {
        tenantId: u.tenantId,
        email: u.email,
        passwordHash: hashedPassword,
        name: u.name,
        roleId: u.roleId,
        status: 'ACTIVE',
      },
    })
    console.log(`  Upserted PG user: ${upserted.email} (Tenant: ${u.tenantId})`)
  }

  // 2. MongoDB Seeding
  console.log('Seeding MongoDB test users...')
  await connectDB()

  const mongoTestUsers = [
    { email: 'interviewer-a@example.com', name: 'Interviewer A', role: 'RECRUITER' as const },
    { email: 'interviewer-b@example.com', name: 'Interviewer B', role: 'RECRUITER' as const },
    { email: 'recruiter-a@example.com', name: 'Recruiter A', role: 'RECRUITER' as const },
    { email: 'recruiter-b@example.com', name: 'Recruiter B', role: 'RECRUITER' as const },
  ]

  for (const u of mongoTestUsers) {
    const existing = await User.findOne({ email: u.email })
    if (existing) {
      existing.set({
        password: hashedPassword,
        name: u.name,
        role: u.role,
        isActive: true,
        deletedAt: null,
      })
      await existing.save()
      console.log(`  Updated MongoDB user: ${u.email}`)
    } else {
      await User.create({
        email: u.email,
        password: hashedPassword,
        name: u.name,
        role: u.role,
        isActive: true,
        deletedAt: null,
      })
      console.log(`  Created MongoDB user: ${u.email}`)
    }
  }

  console.log('Test users seeding complete.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (error) => {
    console.error('Test users seeding failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
