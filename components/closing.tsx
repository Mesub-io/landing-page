import { closing } from '@/lib/closing'

import { Logo } from './logo'

function Arrow({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Closing() {
  return (
    <section className="closing">
      <div className="closing-inner">
        <Logo className="closing-mark" />

        <h2>{closing.title}</h2>
        <p className="closing-sub">{closing.subhead}</p>

        <div className="closing-actions">
          <a className="cta" href={closing.primary.href}>
            {closing.primary.label}
            <Arrow className="cta-arrow" />
          </a>
          <a className="pill" href={closing.secondary.href}>
            {closing.secondary.label}
          </a>
        </div>
      </div>

      {/* An artifact rather than a table: chrome on top, identifiers in the
          middle, and the signatories stamped along the bottom. */}
      <div className="attest">
        <div className="attest-card">
          <div className="attest-bar">
            <span className="attest-bar-left">
              <Logo className="attest-logo" />
              {closing.attestTitle}
            </span>
            <span className="attest-badge">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.8 7.4 5.6 10.2 11.2 4.2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Verifiable
            </span>
          </div>

          <dl className="attest-rows">
            {closing.rows.map((row) => (
              <div className="attest-row" key={row.label}>
                <dt>{row.label}</dt>
                <dd className={row.mono ? 'attest-value is-mono' : 'attest-value'}>{row.value}</dd>
                <a href={row.link.href} rel="noreferrer" target="_blank">
                  {row.link.label}
                  <Arrow />
                </a>
              </div>
            ))}
          </dl>

          <p className="attest-seal">{closing.attestNote}</p>
        </div>
      </div>
    </section>
  )
}
