import { footer } from '@/lib/footer'
import { brand } from '@/lib/nav'

import { Logo } from './logo'

function Arrow() {
  return (
    <svg className="cta-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function isExternal(href: string) {
  return href.startsWith('http')
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-glow" aria-hidden="true" />

      <div className="footer-inner">
        <div className="footer-top">
          <div>
            <a className="footer-brand" href="/">
              <Logo />
              {brand.name}
            </a>
            <p className="footer-claim">{footer.claim}</p>
          </div>

          <a className="cta footer-cta" href={footer.cta.href}>
            {footer.cta.label}
            <Arrow />
          </a>
        </div>

        <nav className="footer-columns" aria-label="Footer">
          {footer.columns.map((column) => (
            <div key={column.title}>
              <h3>{column.title}</h3>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      {...(isExternal(link.href) ? { rel: 'noreferrer', target: '_blank' } : {})}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} {brand.name}. {footer.note}
          </p>
          <ul>
            {footer.legal.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
