/**
 * The closing section.
 *
 * Every claim below is checkable in the open-source repository: the licence,
 * the audit reports and the audited-through commits. Nothing here is a claim
 * about Mesub's own funding, customers or volume.
 */

import { PLACEHOLDER } from './nav'

const REPO = 'https://github.com/solana-foundation/subscriptions'

export const closing = {
  title: 'Start today. Collect on the next cycle.',
  subhead: 'Wire the subscribe flow, add the guard, and let the processor take the calendar from there.',
  primary: { label: 'Join waitlist', href: PLACEHOLDER },
  secondary: { label: 'Talk to us', href: PLACEHOLDER },
  trustTitle: 'Built on audited, open-source foundations',
  trust: [
    {
      icon: 'foundation',
      title: 'Published by the Solana Foundation',
      body: 'The Subscriptions program is open source under the MIT licence. Read it, fork it, run it yourself.',
      link: { label: 'View the program', href: REPO },
    },
    {
      icon: 'shield',
      title: 'Three security reviews by Cantina',
      body: 'The latest review landed in July 2026. The audited commit, the fixes and the delta since are tracked in the open.',
      link: { label: 'Read the audit status', href: `${REPO}/blob/main/audits/AUDIT_STATUS.md` },
    },
    {
      icon: 'key',
      title: 'Non-custodial by construction',
      body: 'Subscribers authorize a pull capped per period and revoke it whenever they want. We never hold keys or funds.',
      link: { label: 'How delegation works', href: `${REPO}#overview` },
    },
  ],
}
