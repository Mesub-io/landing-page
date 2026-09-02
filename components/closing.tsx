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

      {/* One identifier, its credentials, one footnote. The dark card echoes
          the editor upstairs, so the two read as the same product. */}
      <div className="attest">
        <div className="program-card">
          <div className="program-head">
            <span className="program-label">
              <Logo className="program-logo" />
              {closing.program.label}
            </span>
            <span className="program-badge">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.8 7.4 5.6 10.2 11.2 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {closing.program.badge}
            </span>
          </div>

          <p className="program-address">
            <span className="program-prefix">{closing.program.prefix}</span>
            {closing.program.rest}
          </p>

          <p className="program-note">{closing.program.note}</p>

          <ul className="program-credentials">
            {closing.program.credentials.map((credential) => (
              <li key={credential.name}>
                <a href={credential.href} rel="noreferrer" target="_blank">
                  <span className="credential-name">{credential.name}</span>
                  <span className="credential-role">{credential.role}</span>
                </a>
              </li>
            ))}
          </ul>

          <p className="program-foot">
            <span>{closing.program.foot.label}</span>
            <code>{closing.program.foot.value.slice(0, 12)}…</code>
            <a href={closing.program.foot.link.href} rel="noreferrer" target="_blank">
              {closing.program.foot.link.label}
              <Arrow />
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
