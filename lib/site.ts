/** Canonical identity of the site, used by metadata, schema and the sitemap. */

export const site = {
  name: 'Mesub',
  /** Override per environment; the canonical host must be absolute for OG and schema. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mesub.io',
  /** The one-sentence definition. Answer engines quote this; keep it factual. */
  definition:
    'Mesub is a billing layer for Solana subscriptions: it collects authorized recurring payments on schedule, retries the ones that fail, and turns the result into the access state your product reads.',
  description:
    'Billing layer for Solana subscriptions. Automate authorized collections, retry failed payments, and connect payment status to real product access.',
  keywords: [
    'Solana subscriptions',
    'recurring payments on Solana',
    'crypto subscription billing',
    'Solana Subscriptions program',
    'subscription payment processor',
    'entitlements and access control',
    'failed payment recovery',
    'dunning',
    'USDC subscriptions',
    'web3 billing infrastructure',
  ],
  x: 'https://x.com/mesub_io',
  github: 'https://github.com/Mesub-io',
  email: 'contact@mesub.io',
  protocol: 'https://github.com/solana-foundation/subscriptions',
}
