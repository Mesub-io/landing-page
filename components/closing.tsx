import { closing } from '@/lib/closing'

import { Logo } from './logo'
import { TalkToUs } from './talk-to-us'

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
          <TalkToUs />
        </div>
      </div>

      <div className="record">
        <div className="record-head">
          <h3>{closing.tableTitle}</h3>
          <p>{closing.tableNote}</p>
        </div>

        <dl className="record-rows">
          {closing.rows.map((row) => (
            <div className="record-row" key={row.label}>
              <dt>{row.label}</dt>
              <dd className={row.mono ? 'record-value is-mono' : 'record-value'}>{row.value}</dd>
              <a href={row.link.href} rel="noreferrer" target="_blank">
                {row.link.label}
                <Arrow />
              </a>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
