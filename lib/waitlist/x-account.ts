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

export type HandleCheck = 'exists' | 'missing' | 'unknown'

export async function checkXHandle(handle: string): Promise<HandleCheck> {
  const url = `https://publish.twitter.com/oembed?url=${encodeURIComponent(`https://twitter.com/${handle}`)}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      headers: { accept: 'application/json' },
      redirect: 'follow',
      signal: controller.signal,
    })
    if (response.status === 404) return 'missing'
    if (response.ok) return 'exists'
    return 'unknown'
  } catch {
    return 'unknown'
  } finally {
    clearTimeout(timer)
  }
}
