/**
 * A small sliding-window limiter, keyed by IP.
 *
 * It lives in memory, so each serverless instance keeps its own counters: this
 * raises the cost of hammering the endpoint, it does not make it impossible.
 * Move the window into the datastore once there is one.
 */

const WINDOW_MS = 60_000
const MAX_HITS = 8

const hits = new Map<string, number[]>()

export interface RateLimitResult {
  ok: boolean
  retryAfterSeconds: number
}

export function rateLimit(key: string): RateLimitResult {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((at) => now - at < WINDOW_MS)

  if (recent.length >= MAX_HITS) {
    hits.set(key, recent)
    return { ok: false, retryAfterSeconds: Math.ceil((WINDOW_MS - (now - recent[0])) / 1000) }
  }

  recent.push(now)
  hits.set(key, recent)

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 5_000) {
    for (const [entry, times] of hits) {
      if (times.every((at) => now - at >= WINDOW_MS)) hits.delete(entry)
    }
  }

  return { ok: true, retryAfterSeconds: 0 }
}

/** The client address, as far as the platform will tell us. */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}
