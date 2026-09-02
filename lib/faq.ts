/**
 * The FAQ.
 *
 * One source of truth for both the visible section and the FAQPage schema —
 * search engines require the marked-up answer to match what a visitor reads.
 * Answers are kept to 40-60 words: the length a featured snippet will lift.
 */

export interface FaqItem {
  answer: string
  question: string
}

export const faq: FaqItem[] = [
  {
    question: 'What is Mesub?',
    answer:
      'Mesub is a billing layer for Solana subscriptions. It watches due dates, executes the recurring payments a subscriber has already authorized on-chain, retries the ones that fail, and turns each result into a subscription state your application can read to grant or revoke access.',
  },
  {
    question: 'How do subscriptions work on Solana?',
    answer:
      'A merchant publishes a plan on-chain with an amount, a token and a billing period. The subscriber signs once, authorizing a transfer capped at that amount for each period. Whitelisted pullers can then execute that authorization when a period comes due. The subscriber can revoke it at any time.',
  },
  {
    question: 'What happens when a Solana subscription payment fails?',
    answer:
      'The attempt is recorded as failed and the subscription moves into a grace period. Retries run on a schedule you configure and the subscriber is notified by email or Telegram. Access is kept while the grace window is open, then suspended, and restored automatically once a later attempt settles.',
  },
  {
    question: 'Is Mesub non-custodial?',
    answer:
      'Yes. Subscribers sign a delegation from their own wallet and keep custody of their funds. The authorization is capped per billing period and revocable at any time. Mesub never holds keys or funds — it only submits pulls the subscriber already authorized.',
  },
  {
    question: 'What is the difference between an active and a collectable subscription?',
    answer:
      'Active means the authorization still exists on-chain. Collectable means a pull would settle right now: funded token account, delegate still in place, cap not exhausted. A subscription can be active and not collectable, which is why access should follow the collection result.',
  },
  {
    question: 'How do I add recurring payments to my app on Solana?',
    answer:
      'Install the SDK, drop the subscribe component into your checkout, and put one guard in front of the routes you sell. The guard reads the subscription state and returns HTTP 402 when it is not active. Accounts, delegations and pull execution stay on our side.',
  },
]
