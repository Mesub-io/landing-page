/**
 * Persistence for waitlist entries.
 *
 * Talks to Supabase over PostgREST with plain fetch — no SDK, no dependency.
 *
 * The table has RLS enabled and no policy, so nothing can read or write it from
 * a browser. Only the service role key can, and that key is read from the
 * environment on the server. It must never be prefixed NEXT_PUBLIC_, which
 * would ship it to every visitor.
 */

export interface WaitlistEntry {
  email: string | null
  handle: string | null
  note: string | null
  source: string
}

export type StoreResult = 'stored' | 'already-listed' | 'not-configured' | 'failed'

const TIMEOUT_MS = 5_000

export function isStoreConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export async function store(entry: WaitlistEntry): Promise<StoreResult> {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return 'not-configured'

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/waitlist`, {
      body: JSON.stringify(entry),
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        'content-type': 'application/json',
        prefer: 'return=minimal',
      },
      method: 'POST',
      signal: controller.signal,
    })

    if (response.ok) return 'stored'

    // 23505 is Postgres' unique violation: they signed up before. From the
    // visitor's side that is the same outcome, not an error.
    if (response.status === 409) return 'already-listed'

    const detail = await response.text().catch(() => '')
    if (detail.includes('23505')) return 'already-listed'

    console.error('[waitlist] store failed', response.status, detail.slice(0, 200))
    return 'failed'
  } catch (error) {
    console.error('[waitlist] store threw', error instanceof Error ? error.message : 'unknown')
    return 'failed'
  } finally {
    clearTimeout(timer)
  }
}
