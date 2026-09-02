import { NextResponse } from 'next/server'

import { validate } from '@/lib/waitlist/validate'

/** Bodies larger than this are refused before they are parsed. */
const MAX_BODY_BYTES = 4_000

export async function POST(request: Request) {
  const length = Number(request.headers.get('content-length') ?? 0)
  if (length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload too large.' }, { status: 413 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body.' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Expected a JSON object.' }, { status: 400 })
  }

  const payload = body as Record<string, unknown>
  const read = (key: string) => (typeof payload[key] === 'string' ? (payload[key] as string) : undefined)

  // A field no human sees; anything filling it is a bot. Answer 201 so the bot
  // believes it succeeded and does not retry with a different shape.
  if (read('company')) {
    return NextResponse.json({ ok: true }, { status: 201 })
  }

  const result = validate({
    email: read('email'),
    handle: read('handle'),
    note: read('note'),
    source: read('source'),
  })

  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 422 })
  }

  // TODO(supabase): insert result.value into the waitlist table, with a unique
  // index on lower(email) and on handle so a second submission updates rather
  // than duplicates. Until then the entry is accepted and not stored.
  console.info('[waitlist] accepted', {
    handle: result.value.handle,
    hasEmail: Boolean(result.value.email),
    source: result.value.source,
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
