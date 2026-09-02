/**
 * The closing section.
 *
 * The program address, the reviews and the licence are all checkable in the
 * open-source repository. None of it is a claim about Mesub's own funding,
 * customers or volume.
 */

import { PLACEHOLDER } from './nav'

const REPO = 'https://github.com/solana-foundation/subscriptions'
const AUDITED_COMMIT = 'd6b3a5dc7ab18c4168441af733c81ab0a599d414'

export const closing = {
  title: 'Start today. Collect on the next cycle.',
  subhead: 'Wire the subscribe flow, add the guard, and let the processor take the calendar from there.',
  primary: { label: 'Join waitlist', href: PLACEHOLDER },
  secondary: { label: 'Talk to us', href: PLACEHOLDER },

  /** The card under the fold: one identifier, its credentials, one footnote. */
  program: {
    label: 'Solana program',
    badge: 'Audited',
    /** The address is a vanity key: it opens on `De1eg`. */
    prefix: 'De1eg',
    rest: 'AFMkMWZSN5rYXRj9CAdheBamobVNubTsi9avR44',
    note: 'Capped, revocable delegation. Subscribers keep custody of their funds — we never hold keys.',
    credentials: [
      { name: 'Solana Foundation', role: 'publisher', href: REPO },
      { name: 'Cantina × 3', role: 'security reviews', href: `${REPO}/blob/main/audits/AUDIT_STATUS.md` },
      { name: 'MIT', role: 'licence', href: `${REPO}/blob/main/LICENSE` },
    ],
    foot: {
      label: 'Audited through',
      value: AUDITED_COMMIT,
      link: { label: 'See the diff since', href: `${REPO}/compare/${AUDITED_COMMIT}...main` },
    },
  },
}
