import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import connectDB from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'

/**
 * POST /api/admin/seed-admin-user
 *
 * One-time endpoint to seed the Super Admin user into MongoDB.
 * Protected by a hardcoded one-time token AND the CRON_SECRET env var.
 *
 * Call this once from your Azure-hosted app:
 *
 *   fetch('/api/admin/seed-admin-user', {
 *     method: 'POST',
 *     headers: { 'x-seed-token': 'MMD-SEED-2024-MAGNUSCOPO' }
 *   }).then(r => r.json()).then(console.log)
 */

// Hardcoded one-time token — safe because this route will be deleted after use
const SEED_TOKEN = 'MMD-SEED-2024-MAGNUSCOPO'

export async function POST(req: NextRequest) {
  // ----- Auth guard -----
  const providedToken = req.headers.get('x-seed-token') ?? ''

  // Also accept the CRON_SECRET as an alternative
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization') ?? ''
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  const isAuthorized =
    providedToken === SEED_TOKEN ||
    (cronSecret &&
      cronSecret !== 'replace-with-a-strong-random-bearer-token' &&
      bearerToken === cronSecret)

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    const email = 'admin@magnuscopo.com'
    const password = 'Admin123!'
    const hashedPassword = await hash(password, 12)

    const existing = await User.findOne({ email })

    if (existing) {
      // User already exists — reset password and ensure active
      existing.password = hashedPassword
      existing.isActive = true
      existing.deletedAt = null
      existing.role = 'SUPER_ADMIN'
      await existing.save()

      return NextResponse.json({
        ok: true,
        action: 'updated',
        email,
        message: `User ${email} already existed. Password has been reset to Admin123! and account is now active.`,
        next: 'You can now log in. Please delete /api/admin/seed-admin-user after use.',
      })
    }

    // Create fresh admin user
    await User.create({
      email,
      password: hashedPassword,
      name: 'Super Administrator',
      role: 'SUPER_ADMIN',
      isActive: true,
      deletedAt: null,
    })

    return NextResponse.json({
      ok: true,
      action: 'created',
      email,
      message: `User ${email} has been created with password Admin123!`,
      next: 'You can now log in. Please delete /api/admin/seed-admin-user after use.',
    })
  } catch (err: unknown) {
    console.error('[seed-admin-user] Error:', err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
