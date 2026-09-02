/**
 * The dashboard's shared vocabulary: icons, pills, and the handful of ways a
 * value is printed. Kept in one file because each piece is a few lines, and
 * seeing them together is what keeps the language consistent across views.
 */

import type {
  Entitlement,
  EventType,
  FailureCause,
  PullResult,
  RiskLevel,
  SubscriptionStatus,
} from '@/lib/dashboard/data'
import { causeLabel, entitlementLabel, resultLabel, statusLabel } from '@/lib/dashboard/data'
import { formatDelta, shortAddress } from '@/lib/dashboard/format'

const PATHS: Record<string, string> = {
  overview: 'M2.6 2.6h5v5h-5zM10.4 2.6h5v5h-5zM2.6 10.4h5v5h-5zM10.4 10.4h5v5h-5z',
  subscriptions: 'M2.6 4.6h12.8M2.6 9h12.8M2.6 13.4h8',
  plans: 'M3 5.4 9 2.4l6 3-6 3zM3 9l6 3 6-3M3 12.6l6 3 6-3',
  pulls: 'M2.2 9h3l2-5 3 10 2.2-5h3.4',
  failed: 'M9 2.4 16.2 15H1.8L9 2.4ZM9 7v3.4M9 12.6v.1',
  entitlements: 'M4.6 8.2V6a4.4 4.4 0 0 1 8.8 0v2.2M3.4 8.2h11.2v7H3.4z',
  events: 'M6 2.6h9.4v12.8H6M2.6 6h5M2.6 9h5M2.6 12h5',
  analytics: 'M3 15V7.4M7.6 15V3.4M12.2 15v-5M16.8 15V9',
  settings:
    'M9 11.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8ZM14.6 9a5.6 5.6 0 0 0-.1-1l1.4-1.1-1.4-2.4-1.7.6a5.6 5.6 0 0 0-1.7-1L10.3 2.4H7.7l-.3 1.7a5.6 5.6 0 0 0-1.7 1l-1.7-.6L2.6 6.9 4 8a5.6 5.6 0 0 0 0 2L2.6 11.1l1.4 2.4 1.7-.6a5.6 5.6 0 0 0 1.7 1l.3 1.7h2.6l.3-1.7a5.6 5.6 0 0 0 1.7-1l1.7.6 1.4-2.4-1.4-1.1c.06-.33.1-.66.1-1Z',
  arrow: 'M3.5 9h11M10 4.5 14.5 9 10 13.5',
  external: 'M7 4H4.4v9.6H14V11M10.4 3.6H14v3.6M14 3.6 8.6 9',
  search: 'M8.2 13.4a5.2 5.2 0 1 0 0-10.4 5.2 5.2 0 0 0 0 10.4ZM15.4 15.4l-3.5-3.5',
  close: 'M4.6 4.6l8.8 8.8M13.4 4.6l-8.8 8.8',
  chevron: 'M6.8 3.6 12.2 9l-5.4 5.4',
  /* The two-way chevron a select carries in this kind of breadcrumb. */
  updown: 'M6 7.2 9 4.2l3 3M6 10.8l3 3 3-3',
}

export function Icon({ kind, className }: { kind: string; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.4"
      viewBox="0 0 18 18"
    >
      <path d={PATHS[kind]} />
    </svg>
  )
}

/** The subscription's billing status. */
export function StatusPill({ status }: { status: SubscriptionStatus }) {
  return (
    <span className="dash-pill" data-status={status}>
      {statusLabel[status]}
    </span>
  )
}

/**
 * Whether the subscriber can currently use the product. Deliberately a
 * different shape from the status pill sitting next to it, because the two
 * answer different questions and the gap between them is the interesting part.
 */
export function EntitlementTag({ value }: { value: Entitlement }) {
  return (
    <span className="dash-ent" data-ent={value}>
      {entitlementLabel[value]}
    </span>
  )
}

/** What one pull did. A dot and a word, never a filled pill. */
export function ResultTag({ result }: { result: PullResult }) {
  return (
    <span className="dash-result" data-result={result}>
      <span className="dash-result-dot" aria-hidden="true" />
      {resultLabel[result]}
    </span>
  )
}

export function Cause({ cause }: { cause?: FailureCause }) {
  if (!cause) return <span className="dash-muted">-</span>
  return <span className="dash-cause">{causeLabel[cause]}</span>
}

export function RiskTag({ level, reason }: { level: RiskLevel; reason?: string }) {
  return (
    <span className="dash-risk" data-risk={level} title={reason}>
      {level}
    </span>
  )
}

/** A wallet. The full value stays in the title so it can be read and copied
 *  without the row losing its rhythm. */
export function Wallet({ address }: { address: string }) {
  return (
    <span className="dash-wallet" title={address}>
      {shortAddress(address)}
    </span>
  )
}

/** A transaction signature, linked out to an explorer. */
export function Signature({ value }: { value?: string }) {
  if (!value) return <span className="dash-muted">-</span>
  return (
    <a
      className="dash-sig"
      href={`https://solscan.io/tx/${value}`}
      rel="noreferrer"
      target="_blank"
      title={value}
    >
      {shortAddress(value, 6, 6)}
      <Icon kind="external" />
    </a>
  )
}

/**
 * A period-over-period change.
 *
 * Up is not automatically good: a rise in "amount failed" is bad news, so the
 * caller states which direction it wants read as an improvement.
 */
export function Delta({ value, invert = false }: { value: number | null; invert?: boolean }) {
  if (value === null) {
    return <span className="dash-delta" data-tone="none">no prior period</span>
  }
  const good = invert ? value < 0 : value > 0
  return (
    <span className="dash-delta" data-tone={value === 0 ? 'flat' : good ? 'up' : 'down'}>
      {formatDelta(value)}
    </span>
  )
}

const EVENT_TONE: Record<EventType, 'ok' | 'warn' | 'error'> = {
  subscription_created: 'ok',
  subscription_canceled: 'warn',
  pull_succeeded: 'ok',
  pull_failed: 'error',
  retry_executed: 'warn',
  webhook_sent: 'ok',
  entitlement_changed: 'warn',
  refund: 'warn',
  plan_changed: 'ok',
}

export function eventTone(type: EventType) {
  return EVENT_TONE[type]
}
