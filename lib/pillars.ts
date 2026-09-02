/** The three-card section under the hero. */

import { PLACEHOLDER } from './nav'

export const pillars = {
  title: 'Everything after the signature.',
  subhead:
    'The protocol settles the money. Mesub runs the subscription around it — so a payment result becomes something your product can act on.',
  action: { label: 'See how it works', href: PLACEHOLDER },
  cards: [
    {
      art: 'cycle',
      title: 'Collection on schedule',
      body: 'Due dates watched off-chain, authorized pulls executed on time, every attempt recorded.',
    },
    {
      art: 'state',
      title: 'Access follows payment',
      body: 'Each result becomes a subscription state your app reads through an API, an SDK or a webhook.',
    },
    {
      art: 'recovery',
      title: 'Recovery, not churn',
      body: 'Configurable retries, reminders, suspension after repeated failures, reactivation once settled.',
    },
  ],
} as const
