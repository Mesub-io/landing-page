/**
 * The canonical list of referral sources.
 *
 * This module is the single source of truth and it lives on the server: the
 * form fetches it, and every submission is checked against it again. A client
 * can send any string it likes -  only an id present here is accepted.
 */

export interface ReferralSource {
  id: string
  label: string
}

export const referralSources: ReferralSource[] = [
  { id: 'x', label: 'X (Twitter)' },
  { id: 'search', label: 'Search engine' },
  { id: 'github', label: 'GitHub or the Solana Subscriptions repo' },
  { id: 'solana-ecosystem', label: 'Solana ecosystem (event, Discord, newsletter)' },
  { id: 'word-of-mouth', label: 'Someone told me about it' },
  { id: 'ai-assistant', label: 'An AI assistant recommended it' },
  { id: 'other', label: 'Something else' },
]

export const referralSourceIds = new Set(referralSources.map((source) => source.id))
