import type { Metadata } from 'next'

import { Logo } from '@/components/logo'
import { SiteFooter } from '@/components/site-footer'
import { SiteNav } from '@/components/site-nav'
import { links } from '@/lib/nav'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'That page does not exist on mesub.io.',
  // A missing page has nothing to rank for, and shouldn't dilute the site.
  robots: { index: false, follow: true },
}

function Arrow() {
  return (
    <svg className="cta-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main className="missing" id="main">
        <div className="missing-inner">
          <Logo className="missing-mark" />

          <p className="missing-code">404</p>
          <h1>This page has been revoked.</h1>
          <p className="missing-sub">
            The address you followed does not exist on {site.name}. The links below still do.
          </p>

          <div className="missing-actions">
            <a className="cta" href="/">
              Back to the homepage
              <Arrow />
            </a>
          </div>

          <ul className="missing-links">
            {links.map((link) => (
              <li key={link.label}>
                <a href={`/${link.href}`}>{link.label}</a>
              </li>
            ))}
            <li>
              <a href={site.github} rel="noreferrer" target="_blank">
                GitHub
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`}>Email us</a>
            </li>
          </ul>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
