import { faq } from '@/lib/faq'
import { site } from '@/lib/site'

/**
 * Structured data for search and answer engines.
 *
 * The FAQ entries are generated from the same source as the visible section:
 * marked-up answers that do not match the page are a manual-action risk.
 */
export function JsonLd() {
  const graph = [
    {
      '@type': 'Organization',
      '@id': `${site.url}#organization`,
      name: site.name,
      url: site.url,
      logo: `${site.url}/icon.png`,
      email: site.email,
      description: site.definition,
      sameAs: [site.x, site.github],
    },
    {
      '@type': 'WebSite',
      '@id': `${site.url}#website`,
      url: site.url,
      name: site.name,
      description: site.description,
      publisher: { '@id': `${site.url}#organization` },
      inLanguage: 'en',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${site.url}#software`,
      name: site.name,
      description: site.definition,
      applicationCategory: 'DeveloperApplication',
      applicationSubCategory: 'Subscription billing',
      operatingSystem: 'Web',
      url: site.url,
      publisher: { '@id': `${site.url}#organization` },
      featureList: [
        'Automatic collection of authorized Solana subscription payments',
        'Configurable retries, grace periods and dunning',
        'Entitlements and access control through API, SDK, middleware and webhooks',
        'Email and Telegram notifications',
        'Suspension and reactivation of product access',
      ],
      isBasedOn: {
        '@type': 'SoftwareSourceCode',
        name: 'Solana Subscriptions',
        codeRepository: site.protocol,
        license: 'https://opensource.org/licenses/MIT',
        programmingLanguage: 'Rust',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${site.url}#faq`,
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
  ]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }) }}
    />
  )
}
