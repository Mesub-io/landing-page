import { NextResponse } from 'next/server'

import { referralSources } from '@/lib/waitlist/sources'

/**
 * The options the form is allowed to offer.
 *
 * Served rather than hard-coded in the client so the list can change without a
 * deploy of the form, and so there is one list to validate against.
 */
export function GET() {
  return NextResponse.json(
    { sources: referralSources },
    { headers: { 'cache-control': 'public, max-age=300, stale-while-revalidate=3600' } },
  )
}
