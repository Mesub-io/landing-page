import { NextResponse } from 'next/server'

import { clientKey, rateLimit } from '@/lib/waitlist/rate-limit'
import { isStoreConfigured, store } from '@/lib/waitlist/store'
import { validate } from '@/lib/waitlist/validate'
import { checkXHandle } from '@/lib/waitlist/x-account'

/** Bodies larger than this are refused. */
const MAX_BODY_BYTES = 4_000

/** One shape for every failure, so the client only has one thing to read. */
function fail(status: number, errors: Record<string, string>, headers?: HeadersInit) {
  return NextResponse.json({ errors }, { headers, status })
}

export async function POST(request: Request) {
  // Before any parsing, any validation, and above all before any outbound call.
  const limit = rateLimit(clientKey(request))
  if (!limit.ok) {
    return fail(
      429,
      { form: 'Too many attempts. Try again in a minute.' },
      { 'retry-after': String(limit.retryAfterSeconds) },
    )
  }

  // Read as text and measure what actually arrived: content-length is absent on
  // a chunked request and can be forged, so it cannot be the only check.
  let raw: string
  try {
    raw = await request.text()
  } catch {
    return fail(400, { form: 'Could not read the request.' })
  }
  if (raw.length > MAX_BODY_BYTES) {
    return fail(413, { form: 'That request is too large.' })
  }

  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return fail(400, { form: 'Expected a JSON body.' })
  }

  if (typeof body !== 'object' || body === null) {
    return fail(400, { form: 'Expected a JSON object.' })
  }

  const payload = body as Record<string, unknown>
  const read = (key: string) => (typeof payload[key] === 'string' ? (payload[key] as string) : undefined)

  // A field no human sees; anything filling it is a bot. Answer 201 so the bot
  // believes it succeeded and does not retry with a different shape.
  if (read('company')?.trim()) {
    return NextResponse.json({ ok: true }, { status: 201 })
  }

  const result = validate({
    email: read('email'),
    handle: read('handle'),
    note: read('note'),
    source: read('source'),
  })

  if (!result.ok) {
    return fail(422, result.errors as Record<string, string>)
  }

  // Refuse rather than pretend: claiming success while storing nothing is worse
  // than telling the visitor to email us.
  if (!isStoreConfigured()) {
    console.error('[waitlist] refused: SUPABASE_URL / SUPABASE_SECRET_KEY are not set')
    return fail(503, {
      form: 'The waitlist is not accepting signups right now. Email contact@mesub.io and we will add you.',
    })
  }

  // The format was valid; now check the account is real. Only an explicit
  // "missing" rejects - see checkXHandle for why this fails open.
  if (result.value.handle) {
    const status = await checkXHandle(result.value.handle)
    if (status === 'missing') {
      return fail(422, { handle: 'We could not find that account on X. Check the spelling.' })
    }
  }

  const stored = await store(result.value)

  if (stored === 'failed' || stored === 'not-configured') {
    return fail(503, { form: 'We could not save that. Try again in a moment.' })
  }

  // Log the shape of the signup, never the person: the source is analytics, the
  // address and the handle are not ours to scatter through log files.
  console.info('[waitlist]', stored, { hasEmail: Boolean(result.value.email), source: result.value.source })

  return NextResponse.json({ ok: true }, { status: 201 })
}
