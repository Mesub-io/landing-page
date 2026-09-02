/** Hero copy. Placeholder wording — meant to be argued with. */

import { PLACEHOLDER } from './nav'

export const hero = {
  eyebrow: 'Billing layer for Solana Subscriptions',
  headline: 'Recurring revenue on Solana, without building the billing.',
  subhead: 'Collect on schedule, recover failed payments, and gate access from one subscription state.',
  detail:
    'Mesub watches the due dates, executes the pulls your subscribers already authorized on-chain, and retries the ones that fail. The result reaches your app through an API, an SDK, middleware and webhooks — so memberships, SaaS plans and paid features can branch on active, grace_period, past_due or suspended.',
  primary: { label: 'Join waitlist', href: PLACEHOLDER },
  secondary: { label: 'See how it works', href: PLACEHOLDER },
  note: {
    text: 'Built on the open-source Solana Subscriptions program.',
    linkLabel: 'Solana Subscriptions',
    href: 'https://github.com/solana-foundation/subscriptions',
  },
}
