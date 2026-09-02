import { NextResponse } from 'next/server'

import { clientKey, rateLimit } from '@/lib/waitlist/rate-limit'
import { validate } from '@/lib/waitlist/validate'
import { checkXHandle } from '@/lib/waitlist/x-account'

/** Bodies larger than this are refused. */
const MAX_BODY_BYTES = 4_000

/** One shape for every failure, so the client only has one branch to read. */
function fail(errors: Record<string, string>, status: number, headers?: HeadersInit) {
  return NextResponse.json({ errors }, { headers, status })
}

export async function POST(request: Request) {
  // Before any work: an unauthenticated caller must not be able to spend our
  // request budget, nor use us to hammer X.
  const limit = rateLimit(clientKey(request))
  if (!limit.ok) {
    return fail({ form: 'Too many attempts. Try again in a minute.' }, 429, {
      'retry-after': String(limit.retryAfterSeconds),
    })
  }

  // The content-length header is absent on a chunked body and can be forged,
  // so the real cap is measured on what actually arrived.
  const raw = await request.text()
  if (raw.length > MAX_BODY_BYTES) {
    return fail({ form: 'That payload is too large.' }, 413)
  }

  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return fail({ form: 'Expected a JSON body.' }, 400)
  }

  if (typeof body !== 'object' || body === null) {
    return fail({ form: 'Expected a JSON object.' }, 400)
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
    return fail(result.errors as Record<string, string>, 422)
  }

  // The format was valid; now check the account is real. Only an explicit
  // "missing" rejects — see checkXHandle for why this fails open.
  if (result.value.handle) {
    const status = await checkXHandle(result.value.handle)
    if (status === 'missing') {
      return fail({ handle: 'We could not find that account on X. Check the spelling.' }, 422)
    }
  }

  // TODO(supabase): insert result.value, with a unique index on lower(email)
  // and lower(handle) so a second submission updates rather than duplicates.
  // Nothing is persisted until then.
  console.info('[waitlist] accepted', {
    // No personal data in the logs: the source is enough to read the funnel.
    hasEmail: Boolean(result.value.email),
    hasHandle: Boolean(result.value.handle),
    source: result.value.source,
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
