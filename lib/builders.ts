/**
 * The builder section.
 *
 * The figures below belong to the *merchant's* dashboard in the mock -  they
 * illustrate the product UI. They are not claims about Mesub's own traction.
 */

import { PLACEHOLDER } from './nav'

export interface Stat {
  delta: string
  label: string
  /** Currency mark, printed before the number. */
  prefix?: string
  value: number
}

export interface MobileView {
  action: string
  amount: string
  nextLabel: string
  nextValue: string
  plan: string
  state: 'active' | 'grace_period' | 'past_due'
  title: string
}

export interface Row {
  amount: string
  next: string
  plan: string
  state: 'active' | 'grace_period' | 'past_due'
}

export const builders: {
  body: string
  bullets: { icon: string; label: string }[]
  link: { href: string; label: string }
  mobile: MobileView
  rows: Row[]
  stats: Stat[]
  title: string
} = {
  title: 'A dashboard for the team that ships it.',
  body: 'Wire the subscribe flow once and watch the rest from one place: what is due, what settled, what failed, and who came back after a retry. The same data your app reads through the API, in a view your team can act on.',
  bullets: [
    { icon: 'shield', label: 'One guard in front of your routes' },
    { icon: 'webhook', label: 'Webhooks on every state change' },
    { icon: 'retry', label: 'Retries and dunning you configure' },
    { icon: 'history', label: 'Attempt history for every subscriber' },
  ],
  link: { label: 'Read the docs', href: PLACEHOLDER },
  /* The same subscription, seen from the subscriber's side. */
  mobile: {
    title: 'Your plan',
    plan: 'Pro monthly',
    amount: '29 USDC / month',
    state: 'active',
    nextLabel: 'Next payment',
    nextValue: 'in 12 days',
    action: 'Manage subscription',
  },
  stats: [
    { label: 'Active subscriptions', value: 1284, delta: '+6%' },
    { label: 'Collected this period', value: 18240, prefix: '$', delta: '+12%' },
    { label: 'Recovered after retry', value: 37, delta: '+9%' },
  ],
  rows: [
    { plan: 'Pro monthly', amount: '29 USDC', state: 'active', next: 'in 12 days' },
    { plan: 'Pro monthly', amount: '29 USDC', state: 'active', next: 'in 3 days' },
    { plan: 'Team monthly', amount: '99 USDC', state: 'grace_period', next: 'retry today' },
    { plan: 'Pro monthly', amount: '29 USDC', state: 'active', next: 'in 21 days' },
    { plan: 'Starter monthly', amount: '9 USDC', state: 'past_due', next: 'retry in 2 days' },
    { plan: 'Team monthly', amount: '99 USDC', state: 'active', next: 'in 8 days' },
  ],
}
