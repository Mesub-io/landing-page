'use client'

import { useState } from 'react'

import { planShare, weekAhead } from '@/lib/dashboard/data'
import { formatCount, formatMoney, timeUntil } from '@/lib/dashboard/format'

/**
 * What the next seven days already have scheduled.
 *
 * Everything else on this screen reports what happened. This card is the only
 * one that looks forward, which is what earns it the space: a failure that has
 * already happened is a support ticket, while a failure that is three days out
 * is still an email.
 *
 * Nothing here is a prediction dressed up as a fact. Each line counts something
 * already on the books -  retries the policy fires by itself, subscriptions out
 * of attempts, and collections with no failure on record.
 *
 * Every line carries an amount, because a count alone does not tell a merchant
 * whether to care: three retries worth $27 and three worth $900 are the
 * same number and a completely different morning.
 */
export function Outlook({ planId }: { planId: string }) {
  const [warned, setWarned] = useState(false)

  /* Scoped by the plan's share of the subscriber base rather than by filtering
     the sample lists: those hold a handful of rows for a table to show, and
     counting them gave a forecast an order of magnitude too small. */
  const share = planId === 'all' ? 1 : planShare(planId)
  const scale = (value: number) => Math.max(0, Math.round(value * share))

  const retries = scale(weekAhead.retries)
  const retryAmount = scale(weekAhead.retryAmount)
  const lapsing = scale(weekAhead.lapsing)
  const lapsingAmount = scale(weekAhead.lapsingAmount)
  const clean = scale(weekAhead.clean)
  const cleanAmount = scale(weekAhead.cleanAmount)

  const rows = [
    {
      id: 'retry',
      tone: 'accent',
      value: retries,
      label: retries === 1 ? 'retry scheduled' : 'retries scheduled',
      note:
        retries === 0
          ? 'None queued'
          : `${formatMoney(retryAmount)}, first attempt ${timeUntil(weekAhead.nextRetryInHours)}`,
    },
    {
      id: 'lapse',
      tone: 'bad',
      value: lapsing,
      label: 'out of attempts',
      note:
        lapsing === 0
          ? 'Nobody has run out'
          : `${formatMoney(lapsingAmount)} at risk, access ends without you`,
    },
    {
      id: 'settle',
      tone: 'good',
      value: clean,
      label: 'clean collections',
      note:
        clean === 0
          ? 'None due this week'
          : `${formatMoney(cleanAmount)} due, never failed before`,
    },
  ]

  return (
    <div className="dash-outlook">
      <ul className="dash-outlook-rows">
        {rows.map((row) => (
          <li className="dash-outlook-row" data-tone={row.tone} key={row.id}>
            <span className="dash-outlook-value dash-num">{formatCount(row.value)}</span>
            <span className="dash-outlook-text">
              <span className="dash-outlook-label">{row.label}</span>
              <span className="dash-outlook-note">{row.note}</span>
            </span>
          </li>
        ))}
      </ul>

      {/* The one thing on this card a person can do. It queues intent and says
          so: there is no backend behind this build, and a button that claimed to
          have sent something would be the most dishonest pixel on the screen. */}
      <div className="dash-outlook-foot">
        {lapsing === 0 ? (
          <p className="dash-outlook-clear">Nothing needs you. Every retry runs on its own.</p>
        ) : warned ? (
          <p className="dash-outlook-done">
            Reminder queued for {formatCount(lapsing)}{' '}
            {lapsing === 1 ? 'subscriber' : 'subscribers'}.
          </p>
        ) : (
          <button className="dash-btn" onClick={() => setWarned(true)} type="button">
            Send a reminder to {formatCount(lapsing)}
          </button>
        )}
      </div>
    </div>
  )
}
