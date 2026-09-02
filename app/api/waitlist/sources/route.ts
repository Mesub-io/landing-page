import { NextResponse } from 'next/server'

import { referralSources } from '@/lib/waitlist/sources'

/**
 * The options the form is allowed to offer.
 *
 * Served so there is exactly one list, and the same one the submission is
 * validated against. (It is a compiled constant, so changing it still needs a
 * deploy — the point is the single source, not hot reloading.)
 */
export function GET() {
  return NextResponse.json(
    { sources: referralSources },
    { headers: { 'cache-control': 'public, max-age=300, stale-while-revalidate=3600' } },
  )
}
