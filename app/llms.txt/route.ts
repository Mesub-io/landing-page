import { site } from '@/lib/site'

/** No request is ever read, so the file can be prerendered like the sitemap. */
export const dynamic = 'force-static'

/**
 * /llms.txt, the convention for telling a language model what this site is and
 * where its canonical pages live. Generated rather than static so the links
 * follow `site.url` across environments and stay in one source of truth.
 */
export async function GET() {
  const body = `# ${site.name}

> ${site.definition}

Mesub is pre-launch: there is no public product, no pricing and no documentation yet. This site is a landing page and a waitlist. The subscription itself is settled on-chain by the open-source, audited Solana Subscriptions program; Mesub runs everything around it, so a payment result becomes something a product can act on. Subscribers sign a delegation from their own wallet and keep custody of their funds, so the model is non-custodial, and charges can be made in USDC or another compatible SPL Token or Token-2022 mint.

## Pages

- [Landing](${site.url}${site.home}): what Mesub does after the signature, how it is integrated, and the FAQ. The site root redirects here.
- [Waitlist](${site.url}/waitlist): the only sign-up that exists today, for early access.

## Related

- [Solana Subscriptions](${site.protocol}): the open-source, audited on-chain program Mesub builds on.
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
