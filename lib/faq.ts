/**
 * The FAQ.
 *
 * One source of truth for both the visible section and the FAQPage schema —
 * search engines require the marked-up answer to match what a visitor reads.
 * Answers are kept to two sentences: long enough for a snippet to lift, short
 * enough to actually be read.
 */

export interface FaqItem {
  answer: string
  question: string
}

export const faq: FaqItem[] = [
  {
    question: 'What is Mesub?',
    answer:
      'A billing layer for Solana subscriptions. It collects the recurring payments a subscriber has authorized on-chain, retries the ones that fail, and turns each result into an access state your app can read.',
  },
  {
    question: 'How do subscriptions work on Solana?',
    answer:
      'A merchant publishes a plan on-chain — amount, token, billing period. The subscriber signs once, authorizing a transfer capped at that amount per period, and can revoke it at any time.',
  },
  {
    question: 'What happens when a Solana subscription payment fails?',
    answer:
      'The subscription moves into a grace period, retries run on your schedule, and the subscriber is notified. Access is kept while the window is open, then suspended, and restored once a later attempt settles.',
  },
  {
    question: 'Is Mesub non-custodial?',
    answer:
      'Yes. Subscribers sign a delegation from their own wallet and keep custody of their funds. Mesub never holds keys — it only submits pulls that were already authorized, within the signed cap.',
  },
  {
    question: 'What is the difference between an active and a collectable subscription?',
    answer:
      'Active means the authorization still exists on-chain. Collectable means a pull would settle right now — funded account, delegate in place, cap not exhausted. Access should follow the second, not the first.',
  },
  {
    question: 'How do I add recurring payments to my app on Solana?',
    answer:
      'Install the SDK, drop the subscribe component into your checkout, and put one guard in front of the routes you sell. The guard reads the state and returns HTTP 402 when it is not active.',
  },
]
