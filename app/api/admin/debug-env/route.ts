import { NextRequest, NextResponse } from 'next/server'

const SEED_TOKEN = 'MMD-SEED-2024-MAGNUSCOPO'

export async function GET(req: NextRequest) {
  const providedToken = req.nextUrl.searchParams.get('token') ?? ''
  if (providedToken !== SEED_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Return environment variable keys (names only, no values for security)
  const envKeys = Object.keys(process.env).sort()

  return NextResponse.json({
    ok: true,
    message: 'Environment keys loaded',
    keys: envKeys,
    nodeEnv: process.env.NODE_ENV,
    postgresUrlLength: process.env.POSTGRES_DATABASE_URL ? process.env.POSTGRES_DATABASE_URL.length : 0,
    postgresUrlPreview: process.env.POSTGRES_DATABASE_URL ? process.env.POSTGRES_DATABASE_URL.substring(0, 15) + '...' : 'not set'
  })
}
