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
      art: 'tokens',
      title: 'Built for Solana',
      body: 'Charge in USDC or another compatible SPL Token or Token-2022 mint through the same subscription flow.',
    },
    {
      art: 'authority',
      title: 'One authority, many plans',
      body: 'Multiple subscriptions can share the same token account without competing for its single delegate slot.',
    },
  ],
} as const
