/** Footer content. */

import { PLACEHOLDER } from './nav'

/** A link with no destination yet keeps PLACEHOLDER. `soon` is for the ones we
 *  announce rather than link: the footer renders those as plain text, so they
 *  stay out of the tab order and out of the crawl. */
type FooterLink = { label: string; href: string } | { label: string; soon: true }

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: PLACEHOLDER },
      { label: 'Payment processor', href: PLACEHOLDER },
      { label: 'Failed payment recovery', href: PLACEHOLDER },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'Documentation', soon: true },
      { label: 'API reference', soon: true },
      { label: 'SDKs', soon: true },
      { label: 'GitHub', soon: true },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Solana Subscriptions', href: 'https://github.com/solana-foundation/subscriptions' },
      { label: 'Changelog', soon: true },
      { label: 'Support', soon: true },
      { label: 'Status', soon: true },
    ],
  },
]

export const footer = {
  claim: 'Recurring payments, connected to the product they unlock.',
  cta: { label: 'Join waitlist', href: '/waitlist' },
  columns,
  note: 'Built on the open-source-audited Solana Subscriptions program.',
}
