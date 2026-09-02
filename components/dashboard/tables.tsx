'use client'

import type { Pull, Subscription } from '@/lib/dashboard/data'
import {
  entitlementState,
  eventLabel,
  events,
  planById,
  plans,
  pulls,
  ruleLabel,
  subscriptionById,
  subscriptions,
  upcomingPulls,
} from '@/lib/dashboard/data'
import {
  formatCount,
  formatPercent,
  formatMoney,
  timeAgo,
  timeUntil,
} from '@/lib/dashboard/format'

import {
  Cause,
  EntitlementTag,
  Icon,
  ResultTag,
  RiskTag,
  Signature,
  StatusPill,
  Wallet,
  eventTone,
} from './bits'

/**
 * Every list in the dashboard.
 *
 * Two rules hold across all of them. A row is a link: clicking it opens the
 * subscription or the pull behind it, because a list that cannot be drilled
 * into is a report, not a tool. And a payment row always carries the product
 * consequence next to the payment status -  "past due" and "access still on"
 * is a different situation from "past due" and "access off", and only one of
 * them is losing money quietly.
 */

export type Detail = { id: string; kind: 'subscription' | 'pull' }

function planName(planId: string): string {
  return planById.get(planId)?.name ?? planId
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="dash-empty">
      <strong>{title}</strong>
      {body}
    </div>
  )
}

/**
 * The same events as a table.
 *
 * The feed above reads well in a narrow column; a table reads better when the
 * events are the point of the screen rather than a footnote to it, because the
 * columns line up and a scan down "status" is instant.
 */
export function EventsTable({
  filter,
  limit,
  onOpen,
}: {
  filter?: string
  limit?: number
  onOpen: (detail: Detail) => void
}) {
  let rows = events
  if (filter && filter !== 'all') rows = rows.filter((event) => event.type === filter)
  if (limit) rows = rows.slice(0, limit)

  if (rows.length === 0) {
    return <Empty title="No event here" body="Nothing of this kind happened in the period held." />
  }

  return (
    <div className="dash-table-wrap">
      <table className="dash-table">
        <thead>
          <tr>
            <th>When</th>
            <th>Event</th>
            <th>Subscriber</th>
            <th>Plan</th>
            <th>Amount</th>
            <th>Detail</th>
            <th>Transaction</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((event) => {
            const subscription = subscriptionById.get(event.subscriptionId)
            return (
              <tr key={event.id} onClick={() => onOpen({ kind: 'subscription', id: event.subscriptionId })}>
                <td className="dash-num dash-muted">{timeAgo(event.hoursAgo)}</td>
                <td>
                  <span className="dash-event" data-tone={event.status}>
                    <span className="dash-feed-dot" aria-hidden="true" />
                    {eventLabel[event.type]}
                  </span>
                </td>
                <td>{subscription ? <Wallet address={subscription.wallet} /> : '-'}</td>
                <td>{subscription ? planName(subscription.planId) : '-'}</td>
                <td className="dash-num">
                  {event.amount === undefined ? (
                    <span className="dash-muted">-</span>
                  ) : (
                    formatMoney(event.amount)
                  )}
                </td>
                <td className="dash-cause dash-event-detail">{event.detail}</td>
                <td onClick={(click) => click.stopPropagation()}>
                  <Signature value={event.signature} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export type { Subscription }
