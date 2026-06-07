import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/admin/seed-postgres
 *
 * One-time endpoint to seed the admin user into PostgreSQL (Prisma).
 * This is required because lib/auth.ts now authenticates against PostgreSQL.
 *
 * Call from browser console on the live site:
 *
 *   fetch('/api/admin/seed-postgres', {
 *     method: 'POST',
 *     headers: { 'x-seed-token': 'MMD-SEED-2024-MAGNUSCOPO' }
 *   }).then(r => r.json()).then(console.log)
 */

const SEED_TOKEN = 'MMD-SEED-2024-MAGNUSCOPO'

const ADMIN_EMAIL = 'admin@magnuscopo.com'
const ADMIN_PASSWORD = 'Admin123!'

export async function POST(req: NextRequest) {
  const providedToken = req.headers.get('x-seed-token') ?? ''
  if (providedToken !== SEED_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results: string[] = []

    // 1. Ensure system plan exists
    const plan = await prisma.plan.upsert({
      where: { code: 'starter' },
      update: { isActive: true, deletedAt: null },
      create: {
        tenantId: 'system',
        code: 'starter',
        name: 'Starter',
        description: 'Starter plan',
      },
    })
    results.push(`Plan: ${plan.code}`)

    // 2. Ensure system tenant exists
    const tenant = await prisma.tenant.upsert({
      where: { tenantId: 'system' },
      update: { isActive: true, deletedAt: null },
      create: {
        tenantId: 'system',
        slug: 'system',
        name: 'System Tenant',
        planId: plan.id,
      },
    })
    results.push(`Tenant: ${tenant.slug}`)

    // 3. Ensure super_admin role exists
    const role = await prisma.role.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: 'super_admin' } },
      update: { isSystem: true, deletedAt: null },
      create: {
        tenantId: tenant.id,
        code: 'super_admin',
        name: 'Super Administrator',
        isSystem: true,
      },
    })
    results.push(`Role: ${role.code}`)

    // 4. Upsert admin user with fresh bcrypt hash
    const passwordHash = await hash(ADMIN_PASSWORD, 12)
    const user = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: ADMIN_EMAIL } },
      update: {
        passwordHash,
        status: 'ACTIVE',
        deletedAt: null,
        roleId: role.id,
        name: 'Super Administrator',
      },
      create: {
        tenantId: tenant.id,
        email: ADMIN_EMAIL,
        passwordHash,
        name: 'Super Administrator',
        roleId: role.id,
        status: 'ACTIVE',
      },
    })
    results.push(`User: ${user.email} (${user.status})`)

    return NextResponse.json({
      ok: true,
      message: 'PostgreSQL admin user seeded successfully',
      details: results,
      credentials: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        note: 'Delete this endpoint after confirming login works',
      },
    })
  } catch (err: unknown) {
    console.error('[seed-postgres] Error:', err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
