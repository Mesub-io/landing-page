import type { MetadataRoute } from 'next'

import { site } from '@/lib/site'

/** The public surface: / redirects to /landing, plus the waitlist and the legal pages.
 *  Everything under /api answers requests, never pages, so it is kept out of the index. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/api/' },
      // Answer engines crawl with their own agents; none of them are blocked.
      {
        userAgent: ['GPTBot', 'OAI-SearchBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended'],
        allow: '/',
        disallow: '/api/',
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  }
}
