/** Hero copy. Placeholder wording — meant to be argued with. */

import { PLACEHOLDER } from './nav'

export const hero = {
  eyebrow: 'Billing layer for Solana Subscriptions',
  headline: 'Recurring subscriptions for Solana products',
  subhead: 'Collect recurring payments and gate access without building billing infrastructure.',
  detail:
    'Mesub gives Solana apps scheduled collections, failed-payment retries, webhooks, and API/SDK access states. Build memberships, SaaS plans, and paid features around states like active, past_due, and grace_period.',
  primary: { label: 'Join waitlist', href: PLACEHOLDER },
  secondary: { label: 'See how it works', href: PLACEHOLDER },
  note: {
    text: 'Built on the open-source Solana Subscriptions program.',
    linkLabel: 'Solana Subscriptions',
    href: 'https://github.com/solana-foundation/subscriptions',
  },
}
