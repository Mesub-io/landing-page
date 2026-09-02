/**
 * The closing section.
 *
 * The claims in `foundations` are checkable in the open-source repository:
 * the publisher, the licence, the audits and the delegation model. None of it
 * is a claim about Mesub's own funding, customers or volume.
 */

import { contact, PLACEHOLDER } from './nav'

const REPO = 'https://github.com/solana-foundation/subscriptions'
const AUDITED_COMMIT = 'd6b3a5dc7ab18c4168441af733c81ab0a599d414'

export const closing = {
  title: 'Start today. Collect on the next cycle.',
  subhead: 'Wire the subscribe flow, add the guard, and let the processor take the calendar from there.',
  primary: { label: 'Join waitlist', href: PLACEHOLDER },
  secondary: {
    label: 'Talk to us',
    options: [
      { icon: 'mail', label: contact.email.label, detail: contact.email.address, href: contact.email.href, copy: contact.email.address },
      { icon: 'x', label: 'Message us on X', detail: contact.x.handle, href: contact.x.href },
    ],
  },
  tableTitle: 'The ground it stands on',
  tableNote: 'Every line is checkable in the open-source repository.',
  rows: [
    {
      label: 'program',
      value: 'De1egAFMkMWZSN5rYXRj9CAdheBamobVNubTsi9avR44',
      mono: true,
      link: { label: 'Source', href: REPO },
    },
    {
      label: 'licence',
      value: 'MIT -  Solana Foundation',
      link: { label: 'Read', href: `${REPO}/blob/main/LICENSE` },
    },
    {
      label: 'audits',
      value: 'Cantina × 3 -  latest 2026-07-30',
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
      value: 'None -  capped, revocable delegation',
      link: { label: 'How it works', href: `${REPO}#overview` },
    },
  ],
}
