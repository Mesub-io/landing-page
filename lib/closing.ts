/**
 * The closing section.
 *
 * The attestation rows are identifiers anyone can check: the program address,
 * the licence, the audit reports and the commit they were run against. None of
 * it is a claim about Mesub's own funding, customers or volume.
 */

import { PLACEHOLDER } from './nav'

const REPO = 'https://github.com/solana-foundation/subscriptions'
const AUDITED_COMMIT = 'd6b3a5dc7ab18c4168441af733c81ab0a599d414'

export const closing = {
  title: 'Start today. Collect on the next cycle.',
  subhead: 'Wire the subscribe flow, add the guard, and let the processor take the calendar from there.',
  primary: { label: 'Join waitlist', href: PLACEHOLDER },
  secondary: { label: 'Talk to us', href: PLACEHOLDER },
  attestTitle: 'Open-source foundations',
  attestNote: 'Published by the Solana Foundation · Reviewed by Cantina · MIT licensed',
  rows: [
    {
      label: 'program',
      value: 'De1egAFMkMWZSN5rYXRj9CAdheBamobVNubTsi9avR44',
      mono: true,
      link: { label: 'Source', href: REPO },
    },
    {
      label: 'licence',
      value: 'MIT — Solana Foundation',
      link: { label: 'Read', href: `${REPO}/blob/main/LICENSE` },
    },
    {
      label: 'audits',
      value: 'Cantina × 3 — latest 2026-07-30',
      link: { label: 'Status', href: `${REPO}/blob/main/audits/AUDIT_STATUS.md` },
    },
    {
      label: 'audited through',
      value: AUDITED_COMMIT,
      mono: true,
      link: { label: 'Diff since', href: `${REPO}/compare/${AUDITED_COMMIT}...main` },
    },
    {
      label: 'custody',
      value: 'None — capped, revocable delegation',
      link: { label: 'How it works', href: `${REPO}#overview` },
    },
  ],
}
