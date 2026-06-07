interface ThrottleBucket {
  count: number
  resetAt: number
}

interface RequestThrottleConfig {
  keyPrefix: string
  limit: number
  windowMs: number
}

export interface RequestThrottleResult {
  allowed: boolean
  limit: number
  remaining: number
  retryAfterSeconds: number
  backend: 'redis' | 'memory'
}

interface UpstashRedisResult<T = unknown> {
  result?: T
  error?: string
}

declare global {
  var __requestThrottleBuckets: Map<string, ThrottleBucket> | undefined
}

function getThrottleStore(): Map<string, ThrottleBucket> {
  if (!globalThis.__requestThrottleBuckets) {
    globalThis.__requestThrottleBuckets = new Map<string, ThrottleBucket>()
  }

  return globalThis.__requestThrottleBuckets
}

function cleanupExpiredBuckets(store: Map<string, ThrottleBucket>, now: number): void {
  if (store.size < 2000) {
    return
  }

  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= now) {
      store.delete(key)
    }
  }
}

function getRedisConfig() {
  const backend = (process.env.THROTTLE_BACKEND || '').trim().toLowerCase()
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()

  if (backend === 'redis' && (!url || !token)) {
    throw new Error('THROTTLE_BACKEND=redis requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN')
  }

  if (url && token) {
    return { url: url.replace(/\/$/, ''), token }
  }

  return null
}

async function runUpstashPipeline<T extends unknown[]>(commands: unknown[][]): Promise<{ [K in keyof T]: UpstashRedisResult<T[K]> }> {
  const config = getRedisConfig()
  if (!config) {
    throw new Error('Redis throttle backend is not configured')
  }

  const response = await fetch(`${config.url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Redis throttle request failed with status ${response.status}`)
  }

  const payload = await response.json()
  if (!Array.isArray(payload)) {
    throw new Error('Redis throttle returned an unexpected response')
  }

  return payload as { [K in keyof T]: UpstashRedisResult<T[K]> }
}

async function throttleWithRedis(bucketKey: string, config: RequestThrottleConfig): Promise<RequestThrottleResult> {
  const pipeline = await runUpstashPipeline<[number, number]>([
    ['INCR', bucketKey],
    ['PTTL', bucketKey],
  ])

  const count = Number(pipeline[0]?.result ?? 0)
  let ttlMs = Number(pipeline[1]?.result ?? -1)

  if (pipeline[0]?.error || pipeline[1]?.error || !Number.isFinite(count)) {
    throw new Error(pipeline[0]?.error || pipeline[1]?.error || 'Redis throttle increment failed')
  }

  if (count === 1 || ttlMs < 0) {
    await runUpstashPipeline<[number]>([['PEXPIRE', bucketKey, config.windowMs]])
    ttlMs = config.windowMs
  }

  return {
    allowed: count <= config.limit,
    limit: config.limit,
    remaining: Math.max(0, config.limit - count),
    retryAfterSeconds: Math.max(1, Math.ceil(ttlMs / 1000)),
    backend: 'redis',
  }
}

function throttleWithMemory(bucketKey: string, config: RequestThrottleConfig): RequestThrottleResult {
  const now = Date.now()
  const store = getThrottleStore()
  cleanupExpiredBuckets(store, now)

  const currentBucket = store.get(bucketKey)
  let bucket: ThrottleBucket

  if (!currentBucket || currentBucket.resetAt <= now) {
    bucket = {
      count: 0,
      resetAt: now + config.windowMs,
    }
  } else {
    bucket = currentBucket
  }

  if (bucket.count >= config.limit) {
    store.set(bucketKey, bucket)

    return {
      allowed: false,
      limit: config.limit,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      backend: 'memory',
    }
  }

  bucket.count += 1
  store.set(bucketKey, bucket)

  return {
    allowed: true,
    limit: config.limit,
    remaining: Math.max(0, config.limit - bucket.count),
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    backend: 'memory',
  }
}

export function getRequestClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (forwardedFor) {
    return forwardedFor
  }

  const realIp = request.headers.get('x-real-ip')?.trim()
  if (realIp) {
    return realIp
  }

  const cloudflareIp = request.headers.get('cf-connecting-ip')?.trim()
  if (cloudflareIp) {
    return cloudflareIp
  }

  return 'unknown'
}

export async function throttleRequest(request: Request, config: RequestThrottleConfig): Promise<RequestThrottleResult> {
  const ipAddress = getRequestClientIp(request)
  const bucketKey = `${config.keyPrefix}:${ipAddress}`
  const redisConfig = getRedisConfig()

  if (redisConfig) {
    return throttleWithRedis(bucketKey, config)
  }

  return throttleWithMemory(bucketKey, config)
}
