/**
 * Display helpers for the dashboard.
 *
 * Every one of these is a pure function of its arguments, so a server render and
 * a client render produce the same string. Nothing here reads the clock or the
 * machine's locale: `Intl` is pinned to en-US rather than left to the visitor,
 * which would otherwise print "18,240" on one side and "18 240" on the other
 * and break hydration on the first paint.
 */

const whole = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const oneDecimal = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
})

export function formatCount(value: number): string {
  return whole.format(value)
}

/**
 * Money, written the way a merchant reads a total.
 *
 * The dashboard prices everything in dollars because every token it settles in
 * is dollar-pegged, and a column of "1,196 USDC" reads as a quantity of
 * something rather than as an amount of money. Where the token itself matters -
 * a plan billed in something other than the default -  `formatAmount` names it.
 */
export function formatMoney(value: number): string {
  return `$${whole.format(Math.round(value))}`
}

/**
 * The same, for a value whose token has to be named.
 *
 * A plan can be billed in another token, and printing its price with a
 * hard-coded unit is not a cosmetic slip -  it misstates what the subscriber
 * is charged.
 */
export function formatAmount(value: number, token: string): string {
  return `${whole.format(Math.round(value))} ${token}`
}

/** Compact form for axes and dense cells, where the unit is stated once. */
export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${oneDecimal.format(value / 1_000_000)}M`
  if (value >= 1_000) return `${oneDecimal.format(value / 1_000)}k`
  return whole.format(value)
}

export function formatPercent(value: number, decimals = 0): string {
  return `${decimals ? oneDecimal.format(value) : whole.format(value)}%`
}

/** A period-over-period change. `null` means there was nothing to compare to,
 *  which is printed as such rather than as a confident zero. */
export function formatDelta(delta: number | null): string {
  if (delta === null) return 'no prior period'
  return `${delta > 0 ? '+' : ''}${whole.format(delta)}%`
}

/** Net growth reads better with its sign always shown. */
export function formatSigned(value: number): string {
  return `${value > 0 ? '+' : ''}${whole.format(value)}`
}

/**
 * A wallet address: short enough to scan, long enough to recognise. Both ends
 * are kept because the middle is the part nobody reads.
 */
export function shortAddress(address: string, lead = 4, tail = 4): string {
  if (address.length <= lead + tail + 1) return address
  return `${address.slice(0, lead)}…${address.slice(-tail)}`
}

/** Rounds to the nearest sensible unit rather than printing "0.2 hours". */
function coarse(hours: number): string {
  const minutes = Math.round(hours * 60)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes} min`
  const wholeHours = Math.round(hours)
  if (wholeHours < 24) return `${wholeHours} h`
  const days = Math.round(hours / 24)
  if (days < 14) return `${days} d`
  const weeks = Math.round(days / 7)
  if (weeks < 9) return `${weeks} w`
  return `${Math.round(days / 30)} mo`
}

/** "3 h ago", for something that already happened. */
export function timeAgo(hours: number): string {
  const label = coarse(hours)
  return label === 'now' ? 'just now' : `${label} ago`
}

/**
 * "in 12 d" when it is scheduled, "38 h late" when it is not.
 *
 * The two read differently on purpose: an overdue collection is the thing the
 * merchant is here to act on, and it should not look like a countdown.
 */
export function timeUntil(hours: number): string {
  if (hours < 0) return `${coarse(Math.abs(hours))} late`
  if (hours === 0) return '-'
  return `in ${coarse(hours)}`
}

export function formatSeconds(value: number): string {
  return `${oneDecimal.format(value)} s`
}

export function formatHours(value: number): string {
  return `${whole.format(value)} h`
}

/** The date a bar or a row stands for. */
export function dayLabel(daysAgo: number, now: Date): string {
  const day = new Date(now)
  day.setUTCDate(day.getUTCDate() - daysAgo)
  return day.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

/** "09:00", for the heatmap's hour axis. */
export function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`
}
