'use client'

import type { Period } from '@/lib/dashboard/data'
import {
  planMetrics,
  planMetricsById,
  planShare,
  recoveryQueue,
  subscriptions,
  weekAhead,
  weekAheadAmount,
  weekAheadTotal,
  windowFor,
} from '@/lib/dashboard/data'
import { formatCount, formatPercent, formatMoney } from '@/lib/dashboard/format'

import { ActivityCalendar } from './activity'
import { Delta, Icon } from './bits'
import { PullGauge } from './gauge'
import { Outlook } from './outlook'
import { SeriesChart } from './series-chart'
import type { Detail } from './tables'
import { EventsTable } from './tables'

/**
 * The overview, read through the selected plan.
 *
 * The plan is the object a merchant reasons about, so it scopes the screen
 * rather than sitting in a list somewhere else. With "All plans" chosen this is
 * the account; with one chosen it answers a narrower and more useful question:
 * does *this* plan turn payment into access reliably?
 *
 * The order is the order of the lifecycle, not a layout: what came in, what the
 * plan is carrying, how collection is behaving, and what actually happened.
 */
export function Overview({
  onOpenDetail,
  onPeriodChange,
  period,
  planId,
}: {
  onOpenDetail: (detail: Detail) => void
  onPeriodChange: (period: Period) => void
  period: Period
  planId: string
}) {
  const { current, previous } = windowFor(period)
  const scoped = planId !== 'all'
  const metrics = scoped ? planMetricsById.get(planId) : undefined

  const totals = planMetrics.reduce(
    (sum, entry) => ({
      activeSubs: sum.activeSubs + entry.activeSubs,
      expected: sum.expected + entry.expected,
    }),
    { activeSubs: 0, expected: 0 },
  )

  const activeSubs = metrics ? metrics.activeSubs : totals.activeSubs
  const expected = metrics ? metrics.expected : totals.expected

  /* Weighted by subscriber count, not a flat mean: a plan with 18 subscribers
     must not outvote one with 706. */
  const renewalRate = metrics
    ? metrics.renewalRate
    : totals.activeSubs === 0
      ? 0
      : planMetrics.reduce((sum, entry) => sum + entry.renewalRate * entry.activeSubs, 0) /
        totals.activeSubs

  const sum = (days: typeof current, key: keyof (typeof current)[number]) =>
    days.reduce((total, day) => total + (day[key] as number), 0)

  const collected = sum(current, 'collected')
  const attempted = sum(current, 'attempted')
  const shortfall = attempted - collected
  const settled = sum(current, 'pullsSettled')
  const failed = sum(current, 'pullsFailed')
  const retried = sum(current, 'pullsRetried')
  const newSubs = sum(current, 'newSubs')
  const canceled = sum(current, 'canceled')

  const prevCollected = sum(previous, 'collected')
  const delta =
    prevCollected === 0 ? null : Math.round(((collected - prevCollected) / prevCollected) * 100)

  const recovery = failed === 0 ? 100 : (retried / failed) * 100

  /* Account-scale, not the length of the sample list: `upcomingPulls` holds the
     handful of rows a table shows, and counting it reported seven collections a
     week for a base of over a thousand subscriptions. */
  const share = scoped ? planShare(planId) : 1
  const upcomingCount = Math.round(weekAheadTotal * share)
  const upcomingAmount = Math.round(weekAheadAmount * share)
  const upcomingClean = Math.round(weekAhead.clean * share)

  const atRisk = subscriptions.filter(
    (s) =>
      (s.status === 'past_due' || s.status === 'delinquent') && (!scoped || s.planId === planId),
  )
  const delinquent = atRisk.filter((s) => s.status === 'delinquent').length

  /* Each card carries a proportion it can actually justify, so the bar under
     the figure means something rather than decorating it. */
  const cards = [
    {
      id: 'active',
      icon: 'subscriptions',
      label: 'Active subscriptions',
      value: formatCount(activeSubs),
      share: renewalRate,
      tone: 'good' as const,
      foot: `${formatPercent(renewalRate, 1)} renewed`,
    },
    {
      id: 'upcoming',
      icon: 'pulls',
      label: 'Upcoming pulls',
      value: formatCount(upcomingCount),
      share: upcomingCount === 0 ? 0 : (upcomingClean / upcomingCount) * 100,
      tone: 'good' as const,
      foot:
        upcomingCount === 0
          ? 'Nothing due this week'
          : `${formatMoney(upcomingAmount)} due · ${upcomingCount - upcomingClean} flagged`,
    },
    {
      id: 'expected',
      icon: 'plans',
      label: 'Expected this cycle',
      value: formatMoney(expected),
      /* How much of what the plans should bill has actually arrived. */
      share: expected === 0 ? 0 : Math.min(100, (collected / expected) * 100),
      tone: 'accent' as const,
      foot: `${formatMoney(collected)} collected so far`,
    },
    {
      id: 'risk',
      icon: 'failed',
      label: 'Subscriptions at risk',
      value: formatCount(atRisk.length),
      /* Of the ones at risk, how many are past saving on their own. */
      share: atRisk.length === 0 ? 0 : (delinquent / atRisk.length) * 100,
      tone: 'bad' as const,
      foot:
        atRisk.length === 0
          ? 'Everyone is current'
          : `${delinquent} out of attempts · ${atRisk.length - delinquent} still retrying`,
    },
  ]

  return (
    <>
      {/* One grid, two rows, so the right-hand cards line up with the
          left-hand ones rather than merely sitting beside them: the counts and
          the collection split share the chart's row, and the outlook matches
          the calendar's. */}
      <div className="dash-grid">
          {/* Collected is the one number the whole product exists to produce, so
              it gets the room -  and it never appears without the attempted
              figure beside it, because on-chain volume is not revenue. */}
          <section className="dash-card dash-headline-card">
            <div className="dash-headline-top">
              <div className="dash-headline-value">
                <span className="dash-label">Collected, last {period} days</span>
                <span className="dash-headline-number dash-num">{formatMoney(collected)}</span>
                <span className="dash-headline-delta">
                  <Delta value={delta} />
                  <span className="dash-muted">against the previous {period} days</span>
                </span>
              </div>

              <dl className="dash-headline-stats">
                <div>
                  <dt>Attempted</dt>
                  <dd className="dash-num">{formatMoney(attempted)}</dd>
                </div>
                <div>
                  <dt>Not collected</dt>
                  <dd className="dash-num dash-late">{formatMoney(shortfall)}</dd>
                </div>
                <div>
                  <dt>Pulls settled</dt>
                  <dd className="dash-num">{formatCount(settled)}</dd>
                </div>
                <div>
                  <dt>Recovery rate</dt>
                  <dd className="dash-num">{formatPercent(recovery)}</dd>
                </div>
                <div>
                  <dt>Net growth</dt>
                  <dd className="dash-num">
                    {newSubs - canceled > 0 ? '+' : ''}
                    {formatCount(newSubs - canceled)}
                  </dd>
                </div>
              </dl>
            </div>

            <SeriesChart
              days={current}
              onPeriodChange={onPeriodChange}
              onPickDay={() => undefined}
              period={period}
              tall
            />
          </section>

        {/* Two cards stacked in half a row each. */}
        <div className="dash-pair">
            {/* Four readings, not four links. Each one is meant to open the
                list behind it, but those views are not built yet and a button
                that goes nowhere is worse than a plain number.

                Each carries a proportion it can actually justify -  how much of
                the cycle has been collected, how many of the upcoming pulls are
                flagged -  so the bar under the figure means something instead of
                decorating it. */}
            <ul className="dash-kpis dash-kpis-4">
              {cards.map((card) => (
                <li className="dash-kpi" data-tone={card.tone} key={card.id}>
                  <span className="dash-kpi-head">
                    <span className="dash-kpi-icon" aria-hidden="true">
                      <Icon kind={card.icon} />
                    </span>
                    <span className="dash-kpi-label">{card.label}</span>
                  </span>

                  <span className="dash-kpi-value dash-num">{card.value}</span>

                  <span className="dash-kpi-track" aria-hidden="true">
                    <span
                      className="dash-kpi-fill"
                      style={{ width: `${card.share.toFixed(1)}%` }}
                    />
                  </span>

                  <span className="dash-kpi-sub">{card.foot}</span>
                </li>
              ))}
            </ul>

            <section className="dash-card">
              <div className="dash-card-head">
                <h3>Collection</h3>
                <span className="dash-card-note">how every pull ended</span>
              </div>
              <div className="dash-card-body">
                <PullGauge days={current} />
              </div>
            </section>
        </div>

          <section className="dash-card">
            <div className="dash-card-head">
              <h3>Activity</h3>
              <span className="dash-card-note">pulls per day, last 12 months</span>
            </div>
            <div className="dash-card-body">
              <ActivityCalendar />
            </div>
          </section>

          <section className="dash-card">
            <div className="dash-card-head">
              <h3>Next 7 days</h3>
              <span className="dash-card-note">already scheduled, not predicted</span>
            </div>
            <div className="dash-card-body">
              <Outlook planId={planId} />
            </div>
          </section>
      </div>

      <section className="dash-card">
        <div className="dash-card-head">
          <h3>Recent events</h3>
          <span className="dash-card-note">click a row to open the subscription</span>
        </div>
        <EventsTable limit={10} onOpen={onOpenDetail} />
      </section>
    </>
  )
}
