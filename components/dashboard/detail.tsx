'use client'

import { useEffect } from 'react'

import {
  causeLabel,
  causeOwner,
  chainForPull,
  chainForSubscription,
  entitlementState,
  eventLabel,
  events,
  planById,
  pulls,
  ruleLabel,
  subscriptionById,
} from '@/lib/dashboard/data'
import { formatSeconds, formatMoney, shortAddress, timeAgo, timeUntil } from '@/lib/dashboard/format'

import {
  Cause,
  EntitlementTag,
  Icon,
  ResultTag,
  Signature,
  StatusPill,
  Wallet,
} from './bits'
import { Chain } from './chain'
import type { Detail } from './tables'

/**
 * The detail panel for one subscription or one pull.
 *
 * A panel rather than a route: the merchant is nearly always looking at a row
 * in a list they want to keep, and sending them to a full page means they lose
 * their filters and their scroll position to read six fields.
 *
 * It behaves like a dialog because it is one -  Escape closes it, the backdrop
 * closes it, and the panel takes focus when it opens.
 */
export function DetailPanel({ detail, onClose }: { detail: Detail; onClose: () => void }) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="dash-drawer" role="dialog" aria-modal="true" aria-label="Details">
      <button aria-label="Close details" className="dash-drawer-scrim" onClick={onClose} type="button" />
      <div className="dash-drawer-panel">
        <header className="dash-drawer-head">
          <h3>{detail.kind === 'subscription' ? 'Subscription' : 'Pull'}</h3>
          <button className="dash-icon-btn" onClick={onClose} type="button" aria-label="Close">
            <Icon kind="close" />
          </button>
        </header>

        <div className="dash-drawer-body">
          {detail.kind === 'subscription' ? (
            <SubscriptionDetail id={detail.id} />
          ) : (
            <PullDetail id={detail.id} />
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="dash-field">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function SubscriptionDetail({ id }: { id: string }) {
  const subscription = subscriptionById.get(id)
  if (!subscription) {
    return <p className="dash-muted">This subscription is not in the mock set.</p>
  }

  const plan = planById.get(subscription.planId)
  const history = pulls.filter((pull) => pull.subscriptionId === id)
  const timeline = events.filter((event) => event.subscriptionId === id)

  /* Access should follow payment. When it does not, the panel leads with it,
     because it is the only fact on this screen that is actively costing the
     merchant a customer. */
  const shouldHaveAccess = subscription.status === 'active' || subscription.status === 'past_due'
  const outOfSync = shouldHaveAccess !== (subscription.entitlement === 'granted')

  return (
    <>
      {outOfSync && (
        <p className="dash-callout">
          Billing and access disagree. This subscriber is <strong>{subscription.status}</strong> but
          their access is <strong>{subscription.entitlement}</strong>, which usually means a webhook
          was never accepted.
        </p>
      )}

      <dl className="dash-fields">
        <Field label="Subscriber"><Wallet address={subscription.wallet} /></Field>
        <Field label="Subscription">{subscription.id}</Field>
        <Field label="Plan">{plan ? `${plan.name} · ${formatMoney(plan.amount)} / ${plan.interval}` : '-'}</Field>
        <Field label="Status"><StatusPill status={subscription.status} /></Field>
        <Field label="Access">
          <EntitlementTag value={subscription.entitlement} />
        </Field>
        <Field label="Access rule">
          {entitlementState[subscription.id]
            ? ruleLabel[entitlementState[subscription.id].rule]
            : 'No rule recorded'}
        </Field>
        <Field label="Retries this cycle">{subscription.retries}</Field>
        <Field label="Last paid">
          {subscription.lastPaidHours === null ? 'never' : timeAgo(subscription.lastPaidHours)}
        </Field>
        <Field label="Next pull">
          {subscription.status === 'canceled' ? '-' : timeUntil(subscription.dueInHours)}
        </Field>
        <Field label="Age">{subscription.ageDays} days</Field>
      </dl>

      {/* The lifecycle, in the same six steps used everywhere else. This is
          the part a merchant reads to understand a customer in seconds. */}
      <section className="dash-drawer-section">
        <h4>Lifecycle</h4>
        <Chain steps={chainForSubscription(subscription.id)} />
      </section>

      <section className="dash-drawer-section">
        <h4>Collection history</h4>
        {history.length === 0 ? (
          <p className="dash-muted">No pull has run for this subscription yet.</p>
        ) : (
          <ul className="dash-mini">
            {history.map((pull) => (
              <li key={pull.id}>
                <ResultTag result={pull.result} />
                <span className="dash-num">{formatMoney(pull.amount)}</span>
                <span className="dash-muted">try {pull.try}</span>
                <span className="dash-muted dash-num">{timeAgo(pull.hoursAgo)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dash-drawer-section">
        <h4>Events</h4>
        {timeline.length === 0 ? (
          <p className="dash-muted">Nothing recorded for this subscription.</p>
        ) : (
          <ul className="dash-mini">
            {timeline.map((event) => (
              <li data-tone={event.status} key={event.id}>
                <span className="dash-feed-dot" aria-hidden="true" />
                <span>{eventLabel[event.type]}</span>
                <span className="dash-muted">{event.detail}</span>
                <span className="dash-muted dash-num">{timeAgo(event.hoursAgo)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

function PullDetail({ id }: { id: string }) {
  const pull = pulls.find((entry) => entry.id === id)
  if (!pull) return <p className="dash-muted">This pull is not in the mock set.</p>

  const subscription = subscriptionById.get(pull.subscriptionId)
  const plan = planById.get(pull.planId)
  const siblings = pulls.filter((entry) => entry.subscriptionId === pull.subscriptionId)

  return (
    <>
      {pull.webhook === 'failed' && (
        <p className="dash-callout">
          The transaction settled but the webhook was refused, so your app was never told. Until it
          is replayed, this subscriber has paid without getting access back.
        </p>
      )}

      <dl className="dash-fields">
        <Field label="Pull">{pull.id}</Field>
        <Field label="Subscriber">
          {subscription ? <Wallet address={subscription.wallet} /> : '-'}
        </Field>
        <Field label="Plan">{plan?.name ?? pull.planId}</Field>
        <Field label="Amount">{formatMoney(pull.amount)}</Field>
        <Field label="Result"><ResultTag result={pull.result} /></Field>
        <Field label="Attempt">try {pull.try}</Field>
        <Field label="Ran">{timeAgo(pull.hoursAgo)}</Field>
        <Field label="Confirmation">
          {pull.confirmSeconds === undefined ? '-' : formatSeconds(pull.confirmSeconds)}
        </Field>
        <Field label="Cause"><Cause cause={pull.cause} /></Field>
        {pull.cause && (
          <Field label="Owner">
            <span className="dash-cause-owner" data-owner={causeOwner[pull.cause]}>
              {causeOwner[pull.cause]}
            </span>
          </Field>
        )}
        <Field label="Transaction"><Signature value={pull.signature} /></Field>
        <Field label="Webhook">
          <span className="dash-webhook" data-state={pull.webhook}>
            {pull.webhook}
          </span>
        </Field>
      </dl>

      {pull.cause && (
        <p className="dash-drawer-note">
          {causeLabel[pull.cause]}. {causeOwner[pull.cause] === 'subscriber'
            ? 'The subscriber has to act; a reminder before the next retry is the cheapest fix.'
            : causeOwner[pull.cause] === 'merchant'
              ? 'This one is on your side, and replaying it costs nothing.'
              : 'This one was infrastructure, and the retry will most likely clear it.'}
        </p>
      )}

      <section className="dash-drawer-section">
        <h4>What happened, end to end</h4>
        <Chain steps={chainForPull(pull.id)} />
      </section>

      <section className="dash-drawer-section">
        <h4>Every attempt for this subscription</h4>
        <ul className="dash-mini">
          {siblings.map((entry) => (
            <li data-current={entry.id === pull.id || undefined} key={entry.id}>
              <ResultTag result={entry.result} />
              <span className="dash-muted">try {entry.try}</span>
              <span className="dash-muted dash-num">{timeAgo(entry.hoursAgo)}</span>
              <span className="dash-muted">{entry.signature ? shortAddress(entry.signature, 4, 4) : '-'}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
