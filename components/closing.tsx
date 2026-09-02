import { closing } from '@/lib/closing'

import { Logo } from './logo'

const ICONS: Record<string, React.ReactNode> = {
  foundation: <path d="M2.6 15.4h12.8M4.4 15.4V8M9 15.4V8M13.6 15.4V8M9 2.4 15.4 6H2.6L9 2.4Z" />,
  key: <path d="M10.6 7.4a3 3 0 1 0-3.2 3l.6 1.6 1.4.5-.4 1.5 1.5.5-.5 1.5 1.6.6 1.4-1.4-2.4-7.8Z" />,
  shield: <path d="M9 1.8 15.2 4v4.6c0 3.6-2.5 6.3-6.2 7.6-3.7-1.3-6.2-4-6.2-7.6V4L9 1.8ZM6.6 8.8l1.7 1.7 3.3-3.4" />,
}

function Icon({ kind }: { kind: string }) {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[kind]}
    </svg>
  )
}

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
        <span className="closing-mark">
          <Logo />
        </span>

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

        <div className="trust">
          <p className="trust-title">{closing.trustTitle}</p>
          <div className="trust-grid">
            {closing.trust.map((item) => (
              <article className="trust-item" key={item.title}>
                <span className="trust-icon">
                  <Icon kind={item.icon} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <a href={item.link.href} rel="noreferrer" target="_blank">
                  {item.link.label}
                  <Arrow />
                </a>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
