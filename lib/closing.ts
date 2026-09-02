/**
 * The closing section.
 *
 * Every figure below is checkable in the open-source repository: the program
 * address, the licence, the audit reports and the commit they ran against.
 * None of it is a claim about Mesub's own funding, customers or volume.
 */

import { PLACEHOLDER } from './nav'

const REPO = 'https://github.com/solana-foundation/subscriptions'
const AUDITED_COMMIT = 'd6b3a5dc7ab18c4168441af733c81ab0a599d414'

export const closing = {
  title: 'Start today. Collect on the next cycle.',
  subhead: 'Wire the subscribe flow, add the guard, and let the processor take the calendar from there.',
  primary: { label: 'Join waitlist', href: PLACEHOLDER },
  secondary: {
    label: 'Talk to us',
    options: [
      { icon: 'mail', label: 'Email us', detail: 'contact@mesub.io', href: 'mailto:contact@mesub.io', copy: 'contact@mesub.io' },
      { icon: 'x', label: 'Message us on X', detail: '@mesub_io', href: 'https://x.com/mesub_io' },
    ],
  },

  program: {
    icon: 'code',
    label: 'Open source',
    title: 'One program, published in the open.',
    address: 'De1egAFMkMWZSN5rYXRj9CAdheBamobVNubTsi9avR44',
    meta: [
      { term: 'licence', value: 'MIT' },
      { term: 'publisher', value: 'Solana Foundation' },
    ],
    link: { label: 'Read the source', href: REPO },
  },

  audits: {
    icon: 'shield',
    label: 'Audited',
    title: 'Three reviews by Cantina, and an honest delta.',
    /** The audit baseline is a commit, and what landed after it is public too. */
    baseline: `${AUDITED_COMMIT.slice(0, 10)}…`,
    head: 'main',
    note: 'Audit scope is commit-based. The reviewed commit is published, and so is everything that has landed since.',
    meta: [
      { term: 'reviews', value: 'Cantina × 3' },
      { term: 'latest', value: '2026-07-30' },
    ],
    link: { label: 'See the diff since', href: `${REPO}/compare/${AUDITED_COMMIT}...main` },
  },

  custody: {
    statement: 'Non-custodial by construction: the cap is enforced on-chain, and the subscriber can revoke it at any time.',
    gauge: {
      capLabel: 'Authorized cap — per period',
      pullLabel: 'What a pull can take',
      rejectLabel: 'Rejected by the program',
      /** Illustrative proportion: the pull sits inside the signed cap. */
      fill: 42,
    },
    facts: [
      'The subscriber signs the cap once.',
      'Every pull is checked against it on-chain.',
      'Revoking ends it, with no one to ask.',
    ],
    link: { label: 'How delegation works', href: `${REPO}#overview` },
  },
} as const
