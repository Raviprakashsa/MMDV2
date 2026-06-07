import { NextResponse } from 'next/server'
import { AppError } from '@/lib/core/app-error'
import { captureException } from '@/lib/sentry'
import { z } from 'zod'

export async function runApi<T>(handler: () => Promise<T>) {
  try {
    const result = await handler()
    // If handler returned a NextResponse, return it directly
    if (result instanceof NextResponse) return result as unknown as NextResponse
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    // Unexpected error — report to Sentry and return a generic 500
    captureException(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export { getAuthenticatedTenantContext } from '@/lib/core/tenant-context'
export default runApi
