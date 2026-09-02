/**
 * Mock data for the dashboard.
 *
 * Everything here describes a *merchant's* account inside Mesub. None of it is
 * a claim about Mesub's own traction, and none of it is fetched: this is the
 * shape the real API will have to return, written out ahead of the backend so
 * the screens can be built and argued about first.
 *
 * Two rules govern this file.
 *
 * It is deterministic. No `Date.now()`, no `Math.random()` -  the server and the
 * browser have to produce the same characters or React reports a hydration
 * mismatch, and relative timestamps are the usual way that goes wrong. The one
 * generator below is a 32-bit xorshift with a fixed seed, which is exact and
 * identical on both sides. Everything is measured against the fixed `NOW`.
 *
 * It separates attempted from collected. A billing product that reports
 * on-chain volume as revenue is lying to its customer: a pull that was sent,
 * confirmed and then failed still moved bytes on a chain, and it still did not
 * pay anybody. `attempted` and `collected` are two different columns for that
 * reason, and no view is allowed to blur them.
 */

/** The instant the mock account is frozen at. */
export const NOW = new Date('2026-09-02T14:20:00.000Z')

/* ==========================================================================
   Vocabulary
   ========================================================================== */

/**
 * A subscription's billing status.
 *
 * `past_due` is a first miss and still inside the retry window. `delinquent` is
 * out of retries: the merchant has to decide, not the processor.
 */
export type SubscriptionStatus = 'active' | 'past_due' | 'delinquent' | 'canceled'

/**
 * Whether the subscriber currently has product access.
 *
 * Kept separate from the billing status on purpose. Whether someone paid and
 * whether they can still log in are two different questions, and the gap
 * between them is exactly what a merchant needs to see: a `past_due`
 * subscription with `granted` access is revenue at risk, while a `past_due`
 * subscription with `revoked` access is a support ticket already happening.
 */
export type Entitlement = 'granted' | 'revoked'

/** What one collection attempt did. */
export type PullResult = 'settled' | 'retrying' | 'failed' | 'scheduled'

/** Why a pull did not settle. Only ever set when it did not. */
export type FailureCause =
  | 'insufficient_funds'
  | 'subscription_expired'
  | 'invalid_authorization'
  | 'transaction_rejected'
  | 'rpc_unavailable'
  | 'webhook_error'

export type EventType =
  | 'subscription_created'
  | 'subscription_canceled'
  | 'pull_succeeded'
  | 'pull_failed'
  | 'retry_executed'
  | 'webhook_sent'
  | 'entitlement_changed'
  | 'refund'
  | 'plan_changed'

export type RiskLevel = 'low' | 'medium' | 'high'

export const statusLabel: Record<SubscriptionStatus, string> = {
  active: 'active',
  past_due: 'past due',
  delinquent: 'delinquent',
  canceled: 'canceled',
}

export const entitlementLabel: Record<Entitlement, string> = {
  granted: 'access on',
  revoked: 'access off',
}

export const resultLabel: Record<PullResult, string> = {
  settled: 'Settled',
  retrying: 'Retry scheduled',
  failed: 'Failed',
  scheduled: 'Scheduled',
}

/** Causes, in words a support person can paste to a customer. */
export const causeLabel: Record<FailureCause, string> = {
  insufficient_funds: 'Not enough USDC in the wallet',
  subscription_expired: 'Subscription period expired',
  invalid_authorization: 'Delegation revoked or over its cap',
  transaction_rejected: 'Transaction rejected on-chain',
  rpc_unavailable: 'RPC unavailable at the scheduled time',
  webhook_error: 'Webhook endpoint returned an error',
}

/**
 * Who owns a failure. It decides which button a merchant is offered: there is
 * no point telling someone to email a customer about an RPC outage.
 */
export const causeOwner: Record<FailureCause, 'subscriber' | 'merchant' | 'infrastructure'> = {
  insufficient_funds: 'subscriber',
  subscription_expired: 'subscriber',
  invalid_authorization: 'subscriber',
  transaction_rejected: 'infrastructure',
  rpc_unavailable: 'infrastructure',
  webhook_error: 'merchant',
}

export const eventLabel: Record<EventType, string> = {
  subscription_created: 'Subscription created',
  subscription_canceled: 'Subscription canceled',
  pull_succeeded: 'Pull succeeded',
  pull_failed: 'Pull failed',
  retry_executed: 'Retry executed',
  webhook_sent: 'Webhook sent',
  entitlement_changed: 'Entitlement changed',
  refund: 'Refund',
  plan_changed: 'Plan changed',
}

/* ==========================================================================
   Plans
   ========================================================================== */

export interface Plan {
  amount: number
  id: string
  interval: 'month' | 'year'
  name: string
  subscribers: number
  token: 'USDC' | 'USDT'
}

export const plans: Plan[] = [
  { id: 'starter', name: 'Starter', amount: 9, token: 'USDC', interval: 'month', subscribers: 412 },
  { id: 'pro', name: 'Pro', amount: 29, token: 'USDC', interval: 'month', subscribers: 706 },
  { id: 'team', name: 'Team', amount: 99, token: 'USDC', interval: 'month', subscribers: 148 },
  { id: 'scale', name: 'Scale', amount: 299, token: 'USDC', interval: 'month', subscribers: 18 },
  { id: 'legacy', name: 'Legacy annual', amount: 290, token: 'USDT', interval: 'year', subscribers: 0 },
]

export const planById = new Map(plans.map((plan) => [plan.id, plan]))

/* ==========================================================================
   The daily series
   ========================================================================== */

export interface DayRecord {
  /** USDC that actually settled. This is revenue. */
  collected: number
  /** USDC the processor tried to move, failures included. This is not revenue. */
  attempted: number
  canceled: number
  /** 0 is the oldest day held, the last index is today. */
  index: number
  newSubs: number
  pullsFailed: number
  pullsRetried: number
  pullsSettled: number
}

/** 32-bit xorshift. Exact integer arithmetic, so server and client agree. */
function makeRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state ^= state << 13
    state >>>= 0
    state ^= state >>> 17
    state ^= state << 5
    state >>>= 0
    return state / 4294967296
  }
}

/* 52 weeks. The calendar below reads as a year, the way a contribution graph
   does, and the 90-day period still has a full 90 days behind it to compare
   against. */
export const HISTORY_DAYS = 364

/**
 * The shape is not noise. Weekends are quieter, the month turn is loud: monthly
 * cycles all renew within a day or two of each other, so the first of the month
 * is a spike in both pulls and failures. A billing chart without that spike
 * does not look like billing.
 */
export const series: DayRecord[] = (() => {
  const random = makeRandom(0x5eed_1234)
  const days: DayRecord[] = []

  for (let index = 0; index < HISTORY_DAYS; index += 1) {
    const daysAgo = HISTORY_DAYS - 1 - index
    const date = new Date(NOW)
    date.setUTCDate(date.getUTCDate() - daysAgo)

    const weekday = date.getUTCDay()
    const isWeekend = weekday === 0 || weekday === 6
    const dayOfMonth = date.getUTCDate()
    const isCycleTurn = dayOfMonth <= 2

    /* A slow climb across the year, so the period comparison has something
       real to compare. */
    const growth = 1 + index / HISTORY_DAYS / 2

    const base = isCycleTurn ? 62 : isWeekend ? 14 : 26
    const pulls = Math.round((base + random() * 8) * growth)
    /* Failures cluster on the cycle turn, when everyone is billed at once. */
    const failureRate = isCycleTurn ? 0.14 : 0.06 + random() * 0.04
    const pullsFailed = Math.round(pulls * failureRate)
    const pullsSettled = pulls - pullsFailed
    const pullsRetried = Math.round(pullsFailed * (0.55 + random() * 0.25))

    /* Average ticket drifts with the plan mix rather than being a constant. */
    const ticket = 24 + random() * 14
    const collected = Math.round(pullsSettled * ticket)
    const attempted = Math.round((pullsSettled + pullsFailed) * ticket)

    days.push({
      index,
      collected,
      attempted,
      pullsSettled,
      pullsFailed,
      pullsRetried,
      newSubs: Math.round((isWeekend ? 3 : 9) * growth + random() * 5),
      canceled: Math.round((isWeekend ? 1 : 3) + random() * 3),
    })
  }

  return days
})()

export const PERIODS = [7, 30, 90] as const
export type Period = (typeof PERIODS)[number]

/** The window itself, and the window of equal length before it. */
export function windowFor(period: Period): { current: DayRecord[]; previous: DayRecord[] } {
  const current = series.slice(series.length - period)
  const previous = series.slice(Math.max(0, series.length - period * 2), series.length - period)
  return { current, previous }
}

function sum(days: DayRecord[], key: keyof DayRecord): number {
  return days.reduce((total, day) => total + (day[key] as number), 0)
}

/** Percentage change, rounded. Guards the divide so an empty prior window
 *  reports "no comparison" rather than Infinity. */
function change(current: number, previous: number): number | null {
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

/* ==========================================================================
   KPIs
   ========================================================================== */

/**
 * Where a KPI leads. Every one of them points at a list: a number a merchant
 * cannot open is a number they cannot act on.
 */
export interface KpiTarget {
  filter?: string
  view: 'subscriptions' | 'pulls' | 'failed' | 'events' | 'entitlements' | 'plans' | 'collection' | 'recovery'
}

export interface Kpi {
  /** Change against the previous window of the same length, or null when
   *  there is not enough history to compare honestly. */
  delta: number | null
  format: 'count' | 'currency' | 'percent' | 'signed'
  hint: string
  id: string
  /** Whether a rise is good news. "Failed amount" rising is not. */
  invert?: boolean
  label: string
  sub: string
  target: KpiTarget
  value: number
}

export function kpisFor(period: Period): Kpi[] {
  const { current, previous } = windowFor(period)

  const collected = sum(current, 'collected')
  const attempted = sum(current, 'attempted')
  const failedAmount = attempted - collected
  const settled = sum(current, 'pullsSettled')
  const failed = sum(current, 'pullsFailed')
  const retried = sum(current, 'pullsRetried')
  const newSubs = sum(current, 'newSubs')
  const canceled = sum(current, 'canceled')

  const prevCollected = sum(previous, 'collected')
  const prevFailedAmount = sum(previous, 'attempted') - prevCollected
  const prevRetried = sum(previous, 'pullsRetried')
  const prevFailed = sum(previous, 'pullsFailed')

  const recovery = failed === 0 ? 100 : Math.round((retried / failed) * 100)
  const prevRecovery = prevFailed === 0 ? 100 : Math.round((prevRetried / prevFailed) * 100)

  const upcomingAmount = upcomingPulls.reduce((total, pull) => total + pull.amount, 0)

  return [
    {
      id: 'active',
      label: 'Active subscriptions',
      value: subscriptions.filter((s) => s.status === 'active').length + 1270,
      delta: change(newSubs - canceled, sum(previous, 'newSubs') - sum(previous, 'canceled')),
      format: 'count',
      sub: 'delegation in place, paid up',
      hint: 'Counted now, not over the period. The change compares net growth.',
      target: { view: 'subscriptions', filter: 'active' },
    },
    {
      id: 'collected',
      label: 'Collected',
      value: collected,
      delta: change(collected, prevCollected),
      format: 'currency',
      sub: `of ${Math.round(attempted).toLocaleString('en-US')} USDC attempted`,
      hint: 'What settled. Attempted volume is shown beside it and is never counted as revenue.',
      target: { view: 'pulls', filter: 'settled' },
    },
    {
      id: 'upcoming',
      label: 'Upcoming pulls',
      value: upcomingPulls.length,
      delta: null,
      format: 'count',
      sub: `${Math.round(upcomingAmount).toLocaleString('en-US')} USDC due in 7 days`,
      hint: 'Scheduled collections in the next seven days, worst risk first.',
      target: { view: 'pulls', filter: 'scheduled' },
    },
    {
      id: 'failed-amount',
      label: 'Amount failed',
      value: failedAmount,
      delta: change(failedAmount, prevFailedAmount),
      format: 'currency',
      invert: true,
      sub: `${failed} pulls did not settle`,
      hint: 'Attempted minus collected. This is the money the retries are chasing.',
      target: { view: 'failed' },
    },
    {
      id: 'recovery',
      label: 'Recovery rate',
      value: recovery,
      delta: change(recovery, prevRecovery),
      format: 'percent',
      sub: `${retried} of ${failed} recovered`,
      hint: 'Failed once, settled on a later attempt within the same cycle.',
      target: { view: 'pulls', filter: 'retrying' },
    },
    {
      id: 'net',
      label: 'Net growth',
      value: newSubs - canceled,
      delta: change(newSubs - canceled, sum(previous, 'newSubs') - sum(previous, 'canceled')),
      format: 'signed',
      sub: `${newSubs} new, ${canceled} canceled`,
      hint: 'New subscriptions minus cancellations over the period.',
      target: { view: 'events', filter: 'subscription_created' },
    },
  ]
}

/* ==========================================================================
   Subscribers
   ========================================================================== */

/**
 * Wallets are written out in full because that is what the product stores; the
 * UI truncates them for display. A handful is reused across subscriptions,
 * pulls and events on purpose -  every row has to join back to a subscriber.
 */
const wallets = [
  '7Ykd2mQ8vFHs4LbXnR3pWcAe9TgUj6ZoMxKvNbQrDsEt',
  'ArV9nKp2LmXd6TbHs8YcQw3EfZjU7RgNvBkMtPxDoWuF',
  '3QxLbN7vRmT9dKcHy2WsEaZpU8fGjXo4MtBvNrQiDeYk',
  'JkP4wRt8YnVc2LbXm9QsHd6ZeAfU3ToGvBkNrMxWiDpQ',
  '9WmXk3RpLvT7bNcHy4QsEd2ZfAjU8RgToBvMkNxWiDqP',
  'Fq2NbXm8RvTk4LcHy9WsEd3ZpAjU6RgToBvMkNxWiDrS',
  'Bt7KpLm3RvXn9dCcHy2WsEq4ZfAjU8RgToBvMkNxWiDuG',
  'Xn5QbLm9RvTk2LcHy7WsEd8ZpAjU3RgToBvMkNxWiDvA',
  'Ld8RbXm2RvTk6LcHy4WsEd9ZpAjU5RgToBvMkNxWiDwB',
  'Pm3QbXn7RvTk9LcHy2WsEd4ZpAjU8RgToBvMkNxWiDxC',
  'Rt6NbXk4RvTm8LcHy3WsEd7ZpAjU2RgToBvMkNxWiDyD',
  'Vw9LbXn5RvTk3LcHy8WsEd6ZpAjU4RgToBvMkNxWiDzE',
]

export interface Subscription {
  /** Days since the subscription was created, counted back from NOW. */
  ageDays: number
  /** Hours until the next scheduled pull. Negative means overdue. */
  dueInHours: number
  entitlement: Entitlement
  id: string
  /** Hours since the last settled pull, or null if none ever settled. */
  lastPaidHours: number | null
  planId: string
  /** Consecutive retries spent on the current cycle. */
  retries: number
  status: SubscriptionStatus
  wallet: string
}

export const subscriptions: Subscription[] = [
  { id: 'sub_8f2a', wallet: wallets[0], planId: 'pro', status: 'active', entitlement: 'granted', dueInHours: 288, ageDays: 214, retries: 0, lastPaidHours: 432 },
  { id: 'sub_4c71', wallet: wallets[1], planId: 'team', status: 'past_due', entitlement: 'granted', dueInHours: 4, ageDays: 96, retries: 2, lastPaidHours: 748 },
  { id: 'sub_1b93', wallet: wallets[2], planId: 'pro', status: 'active', entitlement: 'granted', dueInHours: 72, ageDays: 41, retries: 0, lastPaidHours: 648 },
  { id: 'sub_d05e', wallet: wallets[3], planId: 'starter', status: 'delinquent', entitlement: 'revoked', dueInHours: -38, ageDays: 168, retries: 4, lastPaidHours: 1_490 },
  { id: 'sub_9a4f', wallet: wallets[4], planId: 'scale', status: 'active', entitlement: 'granted', dueInHours: 504, ageDays: 302, retries: 0, lastPaidHours: 216 },
  { id: 'sub_66c2', wallet: wallets[5], planId: 'pro', status: 'active', entitlement: 'granted', dueInHours: 192, ageDays: 27, retries: 0, lastPaidHours: 528 },
  { id: 'sub_37bd', wallet: wallets[6], planId: 'team', status: 'active', entitlement: 'granted', dueInHours: 15, ageDays: 133, retries: 0, lastPaidHours: 705 },
  { id: 'sub_b8e1', wallet: wallets[7], planId: 'starter', status: 'past_due', entitlement: 'granted', dueInHours: 20, ageDays: 58, retries: 1, lastPaidHours: 736 },
  { id: 'sub_2f60', wallet: wallets[8], planId: 'pro', status: 'canceled', entitlement: 'revoked', dueInHours: 0, ageDays: 389, retries: 0, lastPaidHours: 1_104 },
  { id: 'sub_c194', wallet: wallets[9], planId: 'team', status: 'active', entitlement: 'granted', dueInHours: 360, ageDays: 74, retries: 0, lastPaidHours: 384 },
  { id: 'sub_5e7a', wallet: wallets[2], planId: 'starter', status: 'active', entitlement: 'granted', dueInHours: 96, ageDays: 12, retries: 0, lastPaidHours: 624 },
  { id: 'sub_a3d8', wallet: wallets[5], planId: 'scale', status: 'active', entitlement: 'granted', dueInHours: 648, ageDays: 251, retries: 0, lastPaidHours: 72 },
  /* Delinquent but still getting in: the retries are spent and the merchant
     has not decided yet. This is the row the recovery queue leads with. */
  { id: 'sub_70bf', wallet: wallets[1], planId: 'starter', status: 'delinquent', entitlement: 'granted', dueInHours: -110, ageDays: 145, retries: 4, lastPaidHours: 1_820 },
  { id: 'sub_e52c', wallet: wallets[3], planId: 'pro', status: 'active', entitlement: 'granted', dueInHours: 240, ageDays: 63, retries: 0, lastPaidHours: 480 },
  /* The row that makes the entitlement column worth having: paid up, but the
     merchant's own webhook failed, so access was never switched back on. */
  { id: 'sub_11ac', wallet: wallets[10], planId: 'team', status: 'active', entitlement: 'revoked', dueInHours: 420, ageDays: 187, retries: 0, lastPaidHours: 26 },
  { id: 'sub_c7d3', wallet: wallets[11], planId: 'pro', status: 'past_due', entitlement: 'granted', dueInHours: 9, ageDays: 88, retries: 1, lastPaidHours: 742 },
]

export const subscriptionById = new Map(subscriptions.map((s) => [s.id, s]))

/* ==========================================================================
   Pulls
   ========================================================================== */

export interface Pull {
  amount: number
  cause?: FailureCause
  /** Seconds between the due time and the transaction being confirmed. */
  confirmSeconds?: number
  /** Hours before NOW. Negative for a pull that has not run yet. */
  hoursAgo: number
  id: string
  planId: string
  result: PullResult
  signature?: string
  subscriptionId: string
  /** Which try this was for the current cycle. 1 is the scheduled one. */
  try: number
  /** Whether the webhook for this pull was accepted by the merchant. */
  webhook: 'delivered' | 'failed' | 'pending'
}

export const pulls: Pull[] = [
  { id: 'pull_9d21', subscriptionId: 'sub_37bd', planId: 'team', amount: 99, hoursAgo: 0.2, result: 'settled', try: 1, confirmSeconds: 2.1, webhook: 'delivered', signature: '5xKq2mNvR8tLbXcHy4WsEd9ZpAjU3RgToBvMkNxWiDqPfT7nLm2RvXk9dCcHy4Ws' },
  { id: 'pull_7c04', subscriptionId: 'sub_4c71', planId: 'team', amount: 99, hoursAgo: 1.1, result: 'retrying', try: 2, cause: 'insufficient_funds', webhook: 'delivered' },
  { id: 'pull_3b88', subscriptionId: 'sub_8f2a', planId: 'pro', amount: 29, hoursAgo: 2.6, result: 'settled', try: 1, confirmSeconds: 1.8, webhook: 'delivered', signature: '2mQ8vFHs4LbXnR3pWcAe9TgUj6ZoMxKvNbQrDsEt7Ykd5xKq2mNvR8tLbXcHy4Ws' },
  { id: 'pull_1f5e', subscriptionId: 'sub_d05e', planId: 'starter', amount: 9, hoursAgo: 4.0, result: 'failed', try: 4, cause: 'invalid_authorization', webhook: 'delivered' },
  { id: 'pull_c672', subscriptionId: 'sub_9a4f', planId: 'scale', amount: 299, hoursAgo: 5.4, result: 'settled', try: 1, confirmSeconds: 3.4, webhook: 'delivered', signature: '9WmXk3RpLvT7bNcHy4QsEd2ZfAjU8RgToBvMkNxWiDqP3QxLbN7vRmT9dKcHy2Ws' },
  { id: 'pull_82a9', subscriptionId: 'sub_b8e1', planId: 'starter', amount: 9, hoursAgo: 7.9, result: 'retrying', try: 1, cause: 'insufficient_funds', webhook: 'delivered' },
  { id: 'pull_4e13', subscriptionId: 'sub_1b93', planId: 'pro', amount: 29, hoursAgo: 11.2, result: 'settled', try: 2, confirmSeconds: 2.6, webhook: 'delivered', signature: 'ArV9nKp2LmXd6TbHs8YcQw3EfZjU7RgNvBkMtPxDoWuFBt7KpLm3RvXn9dCcHy2W' },
  { id: 'pull_d940', subscriptionId: 'sub_c194', planId: 'team', amount: 99, hoursAgo: 14.6, result: 'settled', try: 1, confirmSeconds: 1.9, webhook: 'delivered', signature: 'Pm3QbXn7RvTk9LcHy2WsEd4ZpAjU8RgToBvMkNxWiDxCLd8RbXm2RvTk6LcHy4Ws' },
  { id: 'pull_5a27', subscriptionId: 'sub_2f60', planId: 'pro', amount: 29, hoursAgo: 19.3, result: 'failed', try: 3, cause: 'subscription_expired', webhook: 'delivered' },
  { id: 'pull_b31c', subscriptionId: 'sub_66c2', planId: 'pro', amount: 29, hoursAgo: 23.8, result: 'settled', try: 1, confirmSeconds: 2.2, webhook: 'delivered', signature: 'Fq2NbXm8RvTk4LcHy9WsEd3ZpAjU6RgToBvMkNxWiDrSXn5QbLm9RvTk2LcHy7Ws' },
  { id: 'pull_e708', subscriptionId: 'sub_c7d3', planId: 'pro', amount: 29, hoursAgo: 27.5, result: 'retrying', try: 1, cause: 'insufficient_funds', webhook: 'delivered' },
  /* Settled on-chain, but the merchant's endpoint never accepted the callback,
     which is why sub_11ac still shows access revoked. */
  { id: 'pull_6f45', subscriptionId: 'sub_11ac', planId: 'team', amount: 99, hoursAgo: 26, result: 'settled', try: 1, confirmSeconds: 2.0, webhook: 'failed', signature: 'Bt7KpLm3RvXn9dCcHy2WsEq4ZfAjU8RgToBvMkNxWiDuJkP4wRt8YnVc2LbXm9Qs' },
  { id: 'pull_0c8b', subscriptionId: 'sub_a3d8', planId: 'scale', amount: 299, hoursAgo: 38.2, result: 'settled', try: 1, confirmSeconds: 4.1, webhook: 'delivered', signature: '7Ykd2mQ8vFHs4LbXnR3pWcAe9TgUj6ZoMxKvNbQrDsEt9WmXk3RpLvT7bNcHy4Qs' },
  { id: 'pull_a1d6', subscriptionId: 'sub_70bf', planId: 'starter', amount: 9, hoursAgo: 44.7, result: 'failed', try: 3, cause: 'transaction_rejected', webhook: 'delivered' },
  { id: 'pull_29e0', subscriptionId: 'sub_e52c', planId: 'pro', amount: 29, hoursAgo: 51.4, result: 'settled', try: 1, confirmSeconds: 2.3, webhook: 'delivered', signature: 'Xn5QbLm9RvTk2LcHy7WsEd8ZpAjU3RgToBvMkNxWiDvALd8RbXm2RvTk6LcHy4Ws' },
  { id: 'pull_f3b7', subscriptionId: 'sub_5e7a', planId: 'starter', amount: 9, hoursAgo: 58.9, result: 'settled', try: 2, confirmSeconds: 2.8, webhook: 'delivered', signature: 'Ld8RbXm2RvTk6LcHy4WsEd9ZpAjU5RgToBvMkNxWiDwBPm3QbXn7RvTk9LcHy2Ws' },
  { id: 'pull_44b0', subscriptionId: 'sub_d05e', planId: 'starter', amount: 9, hoursAgo: 66.0, result: 'failed', try: 2, cause: 'rpc_unavailable', webhook: 'pending' },
  { id: 'pull_2ac9', subscriptionId: 'sub_4c71', planId: 'team', amount: 99, hoursAgo: 72.4, result: 'failed', try: 1, cause: 'insufficient_funds', webhook: 'delivered' },
]

/**
 * What is scheduled next, worst risk first.
 *
 * This is the view the merchant can actually act on: a failure that has already
 * happened is a support ticket, while a failure that is three days out is still
 * an email. `risk` is a read of the subscriber's history, not a promise.
 */
export interface UpcomingPull {
  amount: number
  id: string
  planId: string
  /** Hours until the pull is due. */
  inHours: number
  /** Why this one is flagged, when it is. */
  reason?: string
  risk: RiskLevel
  subscriptionId: string
  token: 'USDC' | 'USDT'
}

export const upcomingPulls: UpcomingPull[] = [
  { id: 'up_01', subscriptionId: 'sub_4c71', planId: 'team', amount: 99, token: 'USDC', inHours: 4, risk: 'high', reason: 'Failed twice this cycle, wallet still short' },
  { id: 'up_02', subscriptionId: 'sub_c7d3', planId: 'pro', amount: 29, token: 'USDC', inHours: 9, risk: 'high', reason: 'Balance below the amount due' },
  { id: 'up_03', subscriptionId: 'sub_37bd', planId: 'team', amount: 99, token: 'USDC', inHours: 15, risk: 'low' },
  { id: 'up_04', subscriptionId: 'sub_b8e1', planId: 'starter', amount: 9, token: 'USDC', inHours: 20, risk: 'medium', reason: 'One retry already spent this cycle' },
  { id: 'up_05', subscriptionId: 'sub_1b93', planId: 'pro', amount: 29, token: 'USDC', inHours: 72, risk: 'low' },
  { id: 'up_06', subscriptionId: 'sub_5e7a', planId: 'starter', amount: 9, token: 'USDC', inHours: 96, risk: 'low' },
  { id: 'up_07', subscriptionId: 'sub_66c2', planId: 'pro', amount: 29, token: 'USDC', inHours: 192, risk: 'medium', reason: 'Delegation cap expires before the next cycle' },
]

/* ==========================================================================
   Collection health
   ========================================================================== */

/**
 * The health score and, beside it, what is dragging it down.
 *
 * The components are published individually because a single number is not
 * actionable: "87" tells a merchant nothing, "webhooks delivered 96.2%" tells
 * them where to look. The gauge is never shown without this list.
 */
export interface HealthComponent {
  /** How much of the score this component accounts for. */
  weight: number
  format: 'percent' | 'seconds' | 'hours'
  id: string
  label: string
  /** 0-100, already normalised. */
  score: number
  value: number
}

export const health: { components: HealthComponent[]; score: number } = {
  score: 87,
  components: [
    { id: 'success', label: 'Pulls settled first try', value: 91.4, score: 91, weight: 0.3, format: 'percent' },
    { id: 'latency', label: 'Median confirmation', value: 2.4, score: 94, weight: 0.15, format: 'seconds' },
    { id: 'recovered', label: 'Retries recovered', value: 68.0, score: 68, weight: 0.2, format: 'percent' },
    { id: 'resolution', label: 'Median time to resolve a failure', value: 19.0, score: 74, weight: 0.1, format: 'hours' },
    { id: 'webhooks', label: 'Webhooks delivered', value: 96.2, score: 96, weight: 0.15, format: 'percent' },
    { id: 'sync', label: 'Chain sync', value: 99.8, score: 100, weight: 0.1, format: 'percent' },
  ],
}

/** Failure causes over the trailing 30 days, largest first. */
export const failureCauses: { cause: FailureCause; amount: number; count: number }[] = [
  { cause: 'insufficient_funds', count: 148, amount: 4_290 },
  { cause: 'invalid_authorization', count: 41, amount: 1_820 },
  { cause: 'subscription_expired', count: 22, amount: 638 },
  { cause: 'rpc_unavailable', count: 14, amount: 406 },
  { cause: 'transaction_rejected', count: 9, amount: 261 },
  { cause: 'webhook_error', count: 7, amount: 0 },
]

/* ==========================================================================
   Alerts
   ========================================================================== */

/**
 * The action centre.
 *
 * Every alert carries at least one thing the merchant can do about it, and
 * every action names a real destination. An alert with no action is a
 * notification, and notifications belong somewhere else.
 */
export interface AlertAction {
  kind: 'primary' | 'quiet'
  label: string
  /** Where it goes: a view in this dashboard, plus an optional filter. */
  target?: KpiTarget
}

export interface Alert {
  actions: AlertAction[]
  body: string
  id: string
  severity: 'high' | 'medium' | 'low'
  title: string
}

export const alerts: Alert[] = [
  {
    id: 'alert_retry',
    severity: 'high',
    title: '12 payments failed more than 24 hours ago',
    body: 'They are out of automatic retries. Each one keeps its access until you decide otherwise.',
    actions: [
      { kind: 'primary', label: 'Review failures', target: { view: 'failed' } },
      { kind: 'quiet', label: 'Dismiss' },
    ],
  },
  {
    id: 'alert_webhook',
    severity: 'high',
    title: '5 webhooks were never delivered',
    body: 'Your endpoint returned 5xx. One subscriber paid and still has access revoked because of it.',
    actions: [
      { kind: 'primary', label: 'See affected subscriptions', target: { view: 'subscriptions', filter: 'mismatch' } },
      { kind: 'quiet', label: 'Open delivery log', target: { view: 'events', filter: 'webhook_sent' } },
    ],
  },
  {
    id: 'alert_funds',
    severity: 'medium',
    title: '37 subscriptions need a retry this cycle',
    body: 'Mostly wallets short of USDC. A reminder before the next attempt is the cheapest fix.',
    actions: [
      { kind: 'primary', label: 'See the list', target: { view: 'pulls', filter: 'retrying' } },
      { kind: 'quiet', label: 'Dismiss' },
    ],
  },
  {
    id: 'alert_plan',
    severity: 'low',
    title: 'Legacy annual has no active subscriber',
    body: 'It has been empty for 90 days. Archiving it keeps the checkout honest.',
    actions: [{ kind: 'quiet', label: 'Dismiss' }],
  },
]

/* ==========================================================================
   Events
   ========================================================================== */

export interface DashEvent {
  amount?: number
  hoursAgo: number
  id: string
  /** Present when the event has an on-chain transaction behind it. */
  signature?: string
  status: 'ok' | 'warn' | 'error'
  subscriptionId: string
  type: EventType
  /** Free text, already written for a human. */
  detail: string
}

export const events: DashEvent[] = [
  { id: 'ev_01', hoursAgo: 0.2, type: 'pull_succeeded', subscriptionId: 'sub_37bd', amount: 99, status: 'ok', detail: 'Settled on the first attempt', signature: '5xKq2mNvR8tLbXcHy4WsEd9ZpAjU3RgToBvMkNxWiDqPfT7nLm2RvXk9dCcHy4Ws' },
  { id: 'ev_02', hoursAgo: 0.3, type: 'webhook_sent', subscriptionId: 'sub_37bd', status: 'ok', detail: 'invoice.paid accepted in 180 ms' },
  { id: 'ev_03', hoursAgo: 1.1, type: 'pull_failed', subscriptionId: 'sub_4c71', amount: 99, status: 'error', detail: 'Not enough USDC in the wallet' },
  { id: 'ev_04', hoursAgo: 1.1, type: 'retry_executed', subscriptionId: 'sub_4c71', status: 'warn', detail: 'Retry 2 of 4 scheduled for tomorrow 09:00' },
  { id: 'ev_05', hoursAgo: 2.6, type: 'pull_succeeded', subscriptionId: 'sub_8f2a', amount: 29, status: 'ok', detail: 'Settled on the first attempt', signature: '2mQ8vFHs4LbXnR3pWcAe9TgUj6ZoMxKvNbQrDsEt7Ykd5xKq2mNvR8tLbXcHy4Ws' },
  { id: 'ev_06', hoursAgo: 3.4, type: 'subscription_created', subscriptionId: 'sub_5e7a', amount: 9, status: 'ok', detail: 'Starter, monthly, delegation capped at 12 cycles' },
  { id: 'ev_07', hoursAgo: 4.0, type: 'pull_failed', subscriptionId: 'sub_d05e', amount: 9, status: 'error', detail: 'Delegation revoked by the subscriber' },
  { id: 'ev_08', hoursAgo: 4.0, type: 'entitlement_changed', subscriptionId: 'sub_d05e', status: 'warn', detail: 'Access revoked after the fourth failure' },
  { id: 'ev_09', hoursAgo: 5.4, type: 'pull_succeeded', subscriptionId: 'sub_9a4f', amount: 299, status: 'ok', detail: 'Settled on the first attempt', signature: '9WmXk3RpLvT7bNcHy4QsEd2ZfAjU8RgToBvMkNxWiDqP3QxLbN7vRmT9dKcHy2Ws' },
  { id: 'ev_10', hoursAgo: 9.2, type: 'plan_changed', subscriptionId: 'sub_c194', status: 'ok', detail: 'Pro to Team, prorated from the next cycle' },
  { id: 'ev_11', hoursAgo: 12.8, type: 'refund', subscriptionId: 'sub_2f60', amount: 29, status: 'warn', detail: 'Refunded in full after a duplicate charge' },
  { id: 'ev_12', hoursAgo: 19.3, type: 'subscription_canceled', subscriptionId: 'sub_2f60', status: 'warn', detail: 'Canceled by the subscriber, access ends at the cycle end' },
  { id: 'ev_13', hoursAgo: 26.0, type: 'webhook_sent', subscriptionId: 'sub_11ac', status: 'error', detail: 'invoice.paid returned 503, 4 attempts exhausted' },
  { id: 'ev_14', hoursAgo: 26.1, type: 'entitlement_changed', subscriptionId: 'sub_11ac', status: 'error', detail: 'Paid, but access never restored -  webhook was not accepted' },
  { id: 'ev_15', hoursAgo: 31.5, type: 'subscription_created', subscriptionId: 'sub_c7d3', amount: 29, status: 'ok', detail: 'Pro, monthly, from the hosted checkout' },
  { id: 'ev_16', hoursAgo: 44.7, type: 'pull_failed', subscriptionId: 'sub_70bf', amount: 9, status: 'error', detail: 'Transaction rejected on-chain' },
  { id: 'ev_17', hoursAgo: 51.4, type: 'pull_succeeded', subscriptionId: 'sub_e52c', amount: 29, status: 'ok', detail: 'Settled on the first attempt', signature: 'Xn5QbLm9RvTk2LcHy7WsEd8ZpAjU3RgToBvMkNxWiDvALd8RbXm2RvTk6LcHy4Ws' },
  { id: 'ev_18', hoursAgo: 66.0, type: 'pull_failed', subscriptionId: 'sub_d05e', amount: 9, status: 'error', detail: 'RPC unavailable at the scheduled time' },
]

/** The merchant whose account this is. */
export const account = {
  name: 'Northwind Labs',
  plan: 'Growth',
  network: 'mainnet-beta',
}

/* ==========================================================================
   Pull heatmap
   ========================================================================== */

/**
 * Pulls by weekday and hour.
 *
 * Volume and failure rate are stored separately and rendered separately, which
 * is the whole point of the block. A cell that is dark because it holds four
 * hundred pulls says something completely different from a cell that is dark
 * because a third of its twelve pulls failed, and a heatmap that folds the two
 * into one colour will send a merchant chasing the wrong hour.
 */
export interface HeatCell {
  failed: number
  hour: number
  pulls: number
  /** 0 (Sunday) to 6, matching Date#getUTCDay. */
  weekday: number
}

export const heatmap: HeatCell[] = (() => {
  const random = makeRandom(0xbeef_4321)
  const cells: HeatCell[] = []

  for (let weekday = 0; weekday < 7; weekday += 1) {
    for (let hour = 0; hour < 24; hour += 1) {
      const isWeekend = weekday === 0 || weekday === 6

      /* Scheduling is not uniform: subscriptions are created during working
         hours, so their cycles come due during working hours a month later.
         Two humps, one per side of the Atlantic. */
      const europe = Math.exp(-(((hour - 9) / 3.2) ** 2))
      const americas = Math.exp(-(((hour - 17) / 3.6) ** 2))
      const shape = europe + americas * 0.85

      const pulls = Math.round((isWeekend ? 9 : 34) * shape + random() * 4)

      /* The failure rate is highest in the small hours, when a retry lands on a
         wallet nobody has topped up, and it is deliberately not correlated with
         volume -  otherwise the block would just be the volume map twice. */
      const nightPenalty = hour >= 1 && hour <= 5 ? 0.11 : 0
      const rate = 0.04 + nightPenalty + random() * 0.05
      cells.push({ weekday, hour, pulls, failed: Math.round(pulls * rate) })
    }
  }

  return cells
})()

export const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/* ==========================================================================
   Payment funnel
   ========================================================================== */

/**
 * Where subscriptions are lost, over the trailing 30 days.
 *
 * The stages are deliberately the five places a subscription can die, and they
 * are different kinds of problem: a drop between "created" and "scheduled" is a
 * planning bug, between "sent" and "confirmed" is the chain, and between
 * "confirmed" and "access granted" is the merchant's own webhook. Collapsing
 * them into one conversion number would hide which team has to fix it.
 */
export interface FunnelStage {
  /** What a drop at this step means, in one line. */
  diagnosis: string
  id: string
  label: string
  target: KpiTarget
  value: number
}

export const funnel: FunnelStage[] = [
  {
    id: 'created',
    label: 'Subscriptions created',
    value: 1_418,
    diagnosis: 'Checkout completed and the delegation signed.',
    target: { view: 'events', filter: 'subscription_created' },
  },
  {
    id: 'scheduled',
    label: 'Pulls scheduled',
    value: 1_402,
    diagnosis: 'A drop here is a scheduling bug, not a customer problem.',
    target: { view: 'pulls', filter: 'scheduled' },
  },
  {
    id: 'sent',
    label: 'Transactions sent',
    value: 1_361,
    diagnosis: 'A drop here is the collector: RPC, fees, or a revoked delegation caught at send time.',
    target: { view: 'pulls' },
  },
  {
    id: 'confirmed',
    label: 'Transactions confirmed',
    value: 1_268,
    diagnosis: 'A drop here is on-chain: rejected, or never landed.',
    target: { view: 'pulls', filter: 'settled' },
  },
  {
    id: 'granted',
    label: 'Access granted',
    value: 1_249,
    diagnosis: 'A drop here is your own webhook. They paid and cannot get in.',
    target: { view: 'entitlements' },
  },
]

/* ==========================================================================
   The lifecycle

   Everything below exists so the dashboard can tell one story rather than
   report three features. A plan turns a subscription into an automatic
   collection, and a collection into product access. Every view is a window on
   some segment of that chain, and the chain is the thing being modelled here.
   ========================================================================== */

export const environments = ['mainnet-beta', 'devnet'] as const
export type Environment = (typeof environments)[number]

export const tokens = ['USDC', 'USDT'] as const
export type Token = (typeof tokens)[number]

/**
 * Where a pull is in the collection pipeline.
 *
 * These are stages, not outcomes: a pull moves scheduled → queued → sent →
 * confirmed, and can fall out at any point. The control centre is a view of
 * this column, which is why the processor's state has to be modelled and not
 * just its result.
 */
export type PullStage = 'scheduled' | 'queued' | 'sent' | 'confirmed' | 'failed' | 'retrying'

export const stageLabel: Record<PullStage, string> = {
  scheduled: 'Scheduled',
  queued: 'Queued',
  sent: 'Sent',
  confirmed: 'Confirmed',
  failed: 'Failed',
  retrying: 'Retry pending',
}

/** How many pulls sit at each stage of the processor right now. */
export const pipeline: { stage: PullStage; count: number; note: string }[] = [
  { stage: 'scheduled', count: 168, note: 'Due in the next 7 days' },
  { stage: 'queued', count: 12, note: 'Waiting on the next scheduler tick' },
  { stage: 'sent', count: 3, note: 'Broadcast, awaiting confirmation' },
  { stage: 'confirmed', count: 1_268, note: 'Settled in the last 30 days' },
  { stage: 'retrying', count: 37, note: 'Failed once, retry still scheduled' },
  { stage: 'failed', count: 12, note: 'Out of retries, needs a decision' },
]

/** The processor's own state, as opposed to its output. */
export const scheduler = {
  lastTickHoursAgo: 0.05,
  tickMinutes: 5,
  queueDepth: 12,
  rpcHealthy: true,
  rpcNote: 'Primary RPC healthy, one failover in the last 24 h',
  medianConfirmSeconds: 2.4,
}

/* --- Entitlement policy ---------------------------------------------------- */

/**
 * How access follows payment.
 *
 * This is configuration, not a hard-coded consequence of `past_due`. A merchant
 * selling a community forum revokes access the moment a payment misses; one
 * selling an API gives a week of grace. The dashboard has to show which rule
 * produced a given state, otherwise "access off" looks like a bug.
 */
export interface EntitlementPolicy {
  graceHours: number
  onCancel: 'end_of_cycle' | 'immediate'
  onRefund: 'revoke' | 'keep'
  /** Access is degraded rather than cut when the grace period lapses. */
  partialAccess: boolean
  revokeAfterRetries: number
}

export const entitlementPolicy: EntitlementPolicy = {
  graceHours: 72,
  revokeAfterRetries: 4,
  onCancel: 'end_of_cycle',
  onRefund: 'revoke',
  partialAccess: false,
}

/** The rule that put a subscription in its current access state. */
export type EntitlementRule =
  | 'paid_current'
  | 'within_grace'
  | 'retries_exhausted'
  | 'canceled_cycle_end'
  | 'webhook_not_accepted'
  | 'refunded'

export const ruleLabel: Record<EntitlementRule, string> = {
  paid_current: 'Paid and current',
  within_grace: `Inside the ${entitlementPolicy.graceHours} h grace window`,
  retries_exhausted: `Revoked after ${entitlementPolicy.revokeAfterRetries} retries`,
  canceled_cycle_end: 'Canceled, access runs to the end of the cycle',
  webhook_not_accepted: 'Your endpoint never accepted the update',
  refunded: 'Refunded, access revoked by policy',
}

/**
 * Why each subscription's access is what it is, when it was last reconciled
 * with the merchant's app, and which event carried it there.
 *
 * Without this the entitlements view can only show a disagreement. With it, the
 * view can say whose fault the disagreement is.
 */
export const entitlementState: Record<
  string,
  { rule: EntitlementRule; syncedHoursAgo: number | null; sourceEventId?: string }
> = {
  sub_8f2a: { rule: 'paid_current', syncedHoursAgo: 2.6, sourceEventId: 'ev_05' },
  sub_4c71: { rule: 'within_grace', syncedHoursAgo: 1.1, sourceEventId: 'ev_04' },
  sub_1b93: { rule: 'paid_current', syncedHoursAgo: 11.2 },
  sub_d05e: { rule: 'retries_exhausted', syncedHoursAgo: 4.0, sourceEventId: 'ev_08' },
  sub_9a4f: { rule: 'paid_current', syncedHoursAgo: 5.4 },
  sub_66c2: { rule: 'paid_current', syncedHoursAgo: 23.8 },
  sub_37bd: { rule: 'paid_current', syncedHoursAgo: 0.3, sourceEventId: 'ev_02' },
  sub_b8e1: { rule: 'within_grace', syncedHoursAgo: 7.9 },
  sub_2f60: { rule: 'refunded', syncedHoursAgo: 12.8, sourceEventId: 'ev_11' },
  sub_c194: { rule: 'paid_current', syncedHoursAgo: 14.6 },
  sub_5e7a: { rule: 'paid_current', syncedHoursAgo: 58.9 },
  sub_a3d8: { rule: 'paid_current', syncedHoursAgo: 38.2 },
  sub_70bf: { rule: 'retries_exhausted', syncedHoursAgo: 44.7 },  /* rule says revoke, access still on */
  sub_e52c: { rule: 'paid_current', syncedHoursAgo: 51.4 },
  /* Never reconciled: the webhook was refused four times, so the merchant's app
     still believes this subscriber is unpaid. */
  sub_11ac: { rule: 'webhook_not_accepted', syncedHoursAgo: null, sourceEventId: 'ev_13' },
  sub_c7d3: { rule: 'within_grace', syncedHoursAgo: 27.5 },
}

/* --- Per-plan metrics ------------------------------------------------------ */

/**
 * A plan is the unit the merchant actually reasons about.
 *
 * The question is not "how many transactions did this plan produce" but
 * "does this plan turn payment into access reliably" -  so expected, collected
 * and entitlement drift sit on the same row.
 */
export interface PlanMetrics {
  activeSubs: number
  canceledThisCycle: number
  collected: number
  entitlementsGranted: number
  entitlementsOutOfSync: number
  /** What the plan should collect this cycle if nothing fails. */
  expected: number
  failedPayments: number
  nextCycleInHours: number
  planId: string
  /** Share of subscriptions that renewed rather than lapsing. */
  renewalRate: number
}

export const planMetrics: PlanMetrics[] = [
  { planId: 'starter', activeSubs: 412, expected: 3_708, collected: 3_402, nextCycleInHours: 62, renewalRate: 91.2, canceledThisCycle: 21, failedPayments: 34, entitlementsGranted: 401, entitlementsOutOfSync: 2 },
  { planId: 'pro', activeSubs: 706, expected: 20_474, collected: 19_386, nextCycleInHours: 62, renewalRate: 94.6, canceledThisCycle: 24, failedPayments: 41, entitlementsGranted: 699, entitlementsOutOfSync: 3 },
  { planId: 'team', activeSubs: 148, expected: 14_652, collected: 13_662, nextCycleInHours: 62, renewalRate: 96.1, canceledThisCycle: 4, failedPayments: 11, entitlementsGranted: 146, entitlementsOutOfSync: 1 },
  { planId: 'scale', activeSubs: 18, expected: 5_382, collected: 5_382, nextCycleInHours: 62, renewalRate: 100, canceledThisCycle: 0, failedPayments: 0, entitlementsGranted: 18, entitlementsOutOfSync: 0 },
  { planId: 'legacy', activeSubs: 0, expected: 0, collected: 0, nextCycleInHours: 0, renewalRate: 0, canceledThisCycle: 0, failedPayments: 0, entitlementsGranted: 0, entitlementsOutOfSync: 0 },
]

export const planMetricsById = new Map(planMetrics.map((entry) => [entry.planId, entry]))

/* --- Recovery inbox -------------------------------------------------------- */

/**
 * The exception queue.
 *
 * Not a list of unpaid invoices: a prioritised set of situations that each need
 * a decision, with the decision attached. The retry button is deliberately
 * described as policy-bound and idempotent -  firing a transaction because
 * somebody double-clicked is how a billing product loses a customer's trust for
 * good.
 */
export type RecoveryKind =
  | 'retry_pending'
  | 'retries_exhausted'
  | 'access_without_payment'
  | 'paid_without_access'
  | 'webhook_undelivered'

export const recoveryKindLabel: Record<RecoveryKind, string> = {
  retry_pending: 'Retry scheduled',
  retries_exhausted: 'Out of retries',
  access_without_payment: 'Access on, payment not recovered',
  paid_without_access: 'Paid, access still off',
  webhook_undelivered: 'Webhook never delivered',
}

export interface RecoveryAction {
  /** Whether firing it changes money or access. Those get a confirmation. */
  consequential?: boolean
  id: 'retry' | 'view_tx' | 'revoke' | 'keep' | 'contact' | 'replay_webhook' | 'mark_delinquent'
  label: string
}

export interface RecoveryItem {
  actions: RecoveryAction[]
  amount: number
  /** How long the situation has been open. */
  ageHours: number
  cause?: FailureCause
  id: string
  kind: RecoveryKind
  /** 1 is the most urgent. Sorted on this, not on amount. */
  priority: number
  /** Past attempts, so the operator can see the retry is not blind. */
  history: { hoursAgo: number; result: PullResult; try: number }[]
  nextRetryInHours: number | null
  retriesLeft: number
  subscriptionId: string
}

export const recoveryQueue: RecoveryItem[] = [
  {
    id: 'rec_01',
    subscriptionId: 'sub_11ac',
    kind: 'paid_without_access',
    priority: 1,
    amount: 99,
    ageHours: 26,
    retriesLeft: 0,
    nextRetryInHours: null,
    history: [{ try: 1, result: 'settled', hoursAgo: 26 }],
    actions: [
      { id: 'replay_webhook', label: 'Replay webhook', consequential: true },
      { id: 'keep', label: 'Grant access now', consequential: true },
      { id: 'view_tx', label: 'View transaction' },
    ],
  },
  {
    id: 'rec_02',
    subscriptionId: 'sub_d05e',
    kind: 'retries_exhausted',
    priority: 2,
    amount: 9,
    ageHours: 4,
    cause: 'invalid_authorization',
    retriesLeft: 0,
    nextRetryInHours: null,
    history: [
      { try: 4, result: 'failed', hoursAgo: 4 },
      { try: 3, result: 'failed', hoursAgo: 28 },
      { try: 2, result: 'failed', hoursAgo: 66 },
    ],
    actions: [
      { id: 'contact', label: 'Contact subscriber' },
      { id: 'mark_delinquent', label: 'Keep delinquent', consequential: true },
      { id: 'view_tx', label: 'View last attempt' },
    ],
  },
  {
    id: 'rec_03',
    subscriptionId: 'sub_70bf',
    kind: 'access_without_payment',
    priority: 3,
    amount: 9,
    ageHours: 44.7,
    cause: 'transaction_rejected',
    retriesLeft: 0,
    nextRetryInHours: null,
    history: [
      { try: 3, result: 'failed', hoursAgo: 44.7 },
      { try: 2, result: 'failed', hoursAgo: 92 },
    ],
    actions: [
      { id: 'revoke', label: 'Revoke access', consequential: true },
      { id: 'retry', label: 'Retry now', consequential: true },
      { id: 'contact', label: 'Contact subscriber' },
    ],
  },
  {
    id: 'rec_04',
    subscriptionId: 'sub_4c71',
    kind: 'retry_pending',
    priority: 4,
    amount: 99,
    ageHours: 1.1,
    cause: 'insufficient_funds',
    retriesLeft: 2,
    nextRetryInHours: 19,
    history: [
      { try: 2, result: 'failed', hoursAgo: 1.1 },
      { try: 1, result: 'failed', hoursAgo: 72.4 },
    ],
    actions: [
      { id: 'contact', label: 'Ask them to top up' },
      { id: 'retry', label: 'Retry now', consequential: true },
    ],
  },
  {
    id: 'rec_05',
    subscriptionId: 'sub_b8e1',
    kind: 'retry_pending',
    priority: 5,
    amount: 9,
    ageHours: 7.9,
    cause: 'insufficient_funds',
    retriesLeft: 3,
    nextRetryInHours: 12,
    history: [{ try: 1, result: 'failed', hoursAgo: 7.9 }],
    actions: [
      { id: 'contact', label: 'Ask them to top up' },
      { id: 'retry', label: 'Retry now', consequential: true },
    ],
  },
  {
    id: 'rec_06',
    subscriptionId: 'sub_c7d3',
    kind: 'retry_pending',
    priority: 6,
    amount: 29,
    ageHours: 27.5,
    cause: 'insufficient_funds',
    retriesLeft: 3,
    nextRetryInHours: 4,
    history: [{ try: 1, result: 'failed', hoursAgo: 27.5 }],
    actions: [
      { id: 'contact', label: 'Ask them to top up' },
      { id: 'retry', label: 'Retry now', consequential: true },
    ],
  },
]

/* --- Lifecycle ------------------------------------------------------------- */

/**
 * One step of the chain, as shown on a subscription or a pull.
 *
 * The chain is always the same shape -  due, attempt, transaction,
 * confirmation, webhook, entitlement -  so a reader learns it once and can then
 * read any case in the product at a glance.
 */
export interface ChainStep {
  detail: string
  hoursAgo?: number
  label: string
  state: 'done' | 'failed' | 'pending' | 'skipped'
}

/** The full chain behind a single pull. */
export function chainForPull(pullId: string): ChainStep[] {
  const pull = pulls.find((entry) => entry.id === pullId)
  if (!pull) return []

  const subscription = subscriptionById.get(pull.subscriptionId)
  const settled = pull.result === 'settled'
  const ent = subscription ? entitlementState[subscription.id] : undefined

  return [
    {
      label: 'Due date reached',
      state: 'done',
      detail: `Cycle came due for ${subscription?.id ?? 'the subscription'}`,
      hoursAgo: pull.hoursAgo,
    },
    {
      label: `Pull attempted (try ${pull.try})`,
      state: 'done',
      detail: `${pull.amount} USDC requested against the delegation`,
      hoursAgo: pull.hoursAgo,
    },
    {
      label: 'Transaction sent',
      state: pull.cause === 'rpc_unavailable' ? 'failed' : 'done',
      detail:
        pull.cause === 'rpc_unavailable'
          ? 'Could not reach an RPC at the scheduled time'
          : pull.signature
            ? `Signature ${pull.signature.slice(0, 12)}…`
            : 'Broadcast without a recorded signature',
    },
    {
      label: 'Confirmation',
      state: settled ? 'done' : pull.result === 'retrying' ? 'pending' : 'failed',
      detail: settled
        ? `Confirmed in ${pull.confirmSeconds ?? 0} s`
        : pull.cause
          ? causeLabel[pull.cause]
          : 'Not confirmed',
    },
    {
      label: 'Webhook',
      state: pull.webhook === 'delivered' ? 'done' : pull.webhook === 'failed' ? 'failed' : 'pending',
      detail:
        pull.webhook === 'delivered'
          ? 'invoice.paid accepted by your endpoint'
          : pull.webhook === 'failed'
            ? 'Your endpoint refused it after 4 attempts'
            : 'Queued for delivery',
    },
    {
      label: 'Entitlement',
      state:
        pull.webhook === 'failed'
          ? 'failed'
          : settled
            ? 'done'
            : subscription?.entitlement === 'granted'
              ? 'pending'
              : 'failed',
      detail: ent ? ruleLabel[ent.rule] : 'No rule recorded',
    },
  ]
}

/** The chain as it stands for a subscription, newest cycle first. */
export function chainForSubscription(subscriptionId: string): ChainStep[] {
  const latest = pulls.find((pull) => pull.subscriptionId === subscriptionId)
  const subscription = subscriptionById.get(subscriptionId)
  if (!subscription) return []

  const created: ChainStep = {
    label: 'Subscription created',
    state: 'done',
    detail: `Delegation signed ${subscription.ageDays} days ago`,
  }

  if (!latest) {
    return [
      created,
      {
        label: 'First pull',
        state: 'pending',
        detail: `Scheduled ${subscription.dueInHours > 0 ? `in ${Math.round(subscription.dueInHours)} h` : 'now'}`,
      },
    ]
  }

  return [created, ...chainForPull(latest.id)]
}

/* ==========================================================================
   Projects

   A merchant runs more than one thing: a production app, its staging twin,
   sometimes a second product entirely. Each carries its own network and its own
   plans, which is why the network is a property of the project rather than a
   switch of its own -  picking "staging" and leaving the network on mainnet is
   a mistake the UI should not make possible.
   ========================================================================== */

export interface Project {
  environment: Environment
  id: string
  name: string
  /** Plans that belong to this project. */
  planIds: string[]
}

export const projects: Project[] = [
  {
    id: 'northwind',
    name: 'Northwind Labs',
    environment: 'mainnet-beta',
    planIds: ['starter', 'pro', 'team', 'scale', 'legacy'],
  },
  {
    id: 'northwind-staging',
    name: 'Northwind Staging',
    environment: 'devnet',
    planIds: ['starter', 'pro'],
  },
  {
    id: 'aperture',
    name: 'Aperture API',
    environment: 'mainnet-beta',
    planIds: ['pro', 'scale'],
  },
]

export const projectById = new Map(projects.map((project) => [project.id, project]))

/* ==========================================================================
   The week ahead

   These are account-scale figures, not the length of the sample lists above.

   `upcomingPulls` and `recoveryQueue` hold a handful of rows each because a
   table only ever shows a handful; reading a forecast off `.length` gave "3
   retries, 2 lapsing, 3 clean" for an account with 1,284 subscribers, which is
   the kind of quiet inconsistency that makes a demo look like a toy.

   The arithmetic is what a monthly cycle over that base actually produces:
   1,284 subscriptions spread across 30 days is roughly 300 collections in any
   given week, and the three lines below partition that week exactly.
   ========================================================================== */

export interface WeekAhead {
  /** Failed, out of automatic attempts, and now needing a person. */
  lapsing: number
  lapsingAmount: number
  /** Scheduled with no failure on record. */
  clean: number
  cleanAmount: number
  /** Failed once and already queued for another go. */
  retries: number
  retryAmount: number
  /** Hours until the first retry fires. */
  nextRetryInHours: number
}

export const weekAhead: WeekAhead = {
  clean: 247,
  cleanAmount: 7_842,
  retries: 41,
  retryAmount: 1_186,
  lapsing: 12,
  lapsingAmount: 437,
  nextRetryInHours: 4,
}

/** Everything due in the next seven days: the three lines add up to it. */
export const weekAheadTotal = weekAhead.clean + weekAhead.retries + weekAhead.lapsing
export const weekAheadAmount =
  weekAhead.cleanAmount + weekAhead.retryAmount + weekAhead.lapsingAmount

/**
 * A plan's share of the base, used to scope the week ahead when one plan is
 * selected. Rounding each line separately can drift a unit from the total; that
 * is preferable to inventing a fractional subscription.
 */
export function planShare(planId: string): number {
  const total = planMetrics.reduce((sum, entry) => sum + entry.activeSubs, 0)
  const plan = planMetricsById.get(planId)
  if (!plan || total === 0) return 1
  return plan.activeSubs / total
}
