/** Footer content. */

import { PLACEHOLDER } from './nav'

export const footer = {
  claim: 'Recurring payments, connected to the product they unlock.',
  cta: { label: 'Join waitlist', href: PLACEHOLDER },
  columns: [
    {
      title: 'Product',
      links: [
        { label: 'How it works', href: PLACEHOLDER },
        { label: 'Payment processor', href: PLACEHOLDER },
        { label: 'Entitlements', href: PLACEHOLDER },
        { label: 'Failed payment recovery', href: PLACEHOLDER },
      ],
    },
    {
      title: 'Developers',
      links: [
        { label: 'Documentation', href: PLACEHOLDER },
        { label: 'API reference', href: PLACEHOLDER },
        { label: 'SDKs', href: PLACEHOLDER },
        { label: 'GitHub', href: 'https://github.com/Mesub-io' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Solana Subscriptions', href: 'https://github.com/solana-foundation/subscriptions' },
        { label: 'Changelog', href: PLACEHOLDER },
        { label: 'Support', href: PLACEHOLDER },
        { label: 'Status', href: PLACEHOLDER },
      ],
    },
  ],
  legal: [
    { label: 'Privacy', href: PLACEHOLDER },
    { label: 'Terms', href: PLACEHOLDER },
  ],
  note: 'Built on the open-source-audited Solana Subscriptions program.',
}
