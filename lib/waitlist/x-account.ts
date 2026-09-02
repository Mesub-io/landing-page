/**
 * Existence check for an X handle.
 *
 * X's own API needs a paid key, but its public oEmbed endpoint answers 200 for
 * a real account and 404 for one that does not exist — enough to reject a made
 * up handle without a subscription.
 *
 * It fails open on purpose: a timeout or an outage on X's side must not cost us
 * a real signup. Only an explicit 404 rejects.
 */

const TIMEOUT_MS = 3_500
const CACHE_TTL_MS = 15 * 60_000

/** Handle -> result, so the same handle costs one outbound call per window. */
const cache = new Map<string, { at: number; result: HandleCheck }>()

export type HandleCheck = 'exists' | 'missing' | 'unknown'

export async function checkXHandle(handle: string): Promise<HandleCheck> {
  const cached = cache.get(handle)
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.result

  const url = `https://publish.twitter.com/oembed?url=${encodeURIComponent(`https://twitter.com/${handle}`)}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      headers: { accept: 'application/json' },
      redirect: 'follow',
      signal: controller.signal,
    })
    const result: HandleCheck = response.status === 404 ? 'missing' : response.ok ? 'exists' : 'unknown'
    // An inconclusive answer is not cached: it would freeze the check off for
    // fifteen minutes exactly when X is rate-limiting us.
    if (result !== 'unknown') cache.set(handle, { at: Date.now(), result })
    return result
  } catch {
    return 'unknown'
  } finally {
    clearTimeout(timer)
  }
}
